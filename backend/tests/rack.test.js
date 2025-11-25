import request from 'supertest';
import { setupTestEnvironment } from './utils/setup.js'
//BD
import { initialDBData } from '../src/db/sampleDBData.js';
import { getDb, closeDbWatchers } from '../src/db/dbLoader.js';
import { saveCollectionToDisk } from '../src/db/dbUtils.js';

const app = setupTestEnvironment();

// Datos base de Rack/Workspace
const testNetwork = {
    name: 'WS_TestNet',
    ipAddress: '192.168.10.0',
    subnetMask: '255.255.255.0/24',
    gateway: '192.168.10.1',
};
const testWorkspace = {
    name: 'Test Workspace',
    description: 'A test workspace',
    network: testNetwork.name,
};
const testRack = {
    name: 'TestRack',
    workspaceName: testWorkspace.name,
    units: 42
};
const testServer = {
    name: 'BaseServer',
    components: initialDBData.components, // Asumimos que initialComponents tiene el 'OS' y otros obligatorios
    rackName: testRack.name,
    ipAddress: '10.0.0.100',
    healthStatus: 'Excellent'
};

beforeEach(() => {
    const db = getDb();
    db.workspaces = [testWorkspace];
    db.racks = [testRack];
    db.servers = [testServer];
    saveCollectionToDisk(db.networks, 'networks');
    saveCollectionToDisk(db.racks, 'racks');
    saveCollectionToDisk(db.servers, 'servers')
});

afterAll(() => {
    closeDbWatchers();
});

describe('Rack Service API', () => {

    it('1. should create a new rack in a workspace', async () => {
        // 1. Crear Workspace (necesario para la referencia)
        await request(app).post('/api/workspaces').send(testWorkspace);

        const newRack = {
            name: 'Rack A1',
            workspaceName: testWorkspace.name,
            units: 42,
        };
        const initialCount = getDb().racks.length;

        // 2. Crear Rack
        const res = await request(app).post('/api/racks').send(newRack);

        // 💡 SINCRONIZACIÓN
        const db_updated = getDb();
        const foundWorkspace = db_updated.workspaces.find(ws => ws.name === testWorkspace.name);

        expect(res.statusCode).toEqual(201);
        expect(res.body.rack).toHaveProperty('name', 'Rack A1');
        expect(db_updated.racks.length).toBe(initialCount + 1);
        expect(foundWorkspace.racks).toContain('Rack A1');
    });

    it('2. should get all racks for a workspace', async () => {
        // 1. Crear Workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        // 2. Crear Racks (usando la API para asegurar la persistencia en el controlador)
        await request(app).post('/api/racks').send({ name: 'Rack 1', workspaceName: testWorkspace.name, units: 42 });
        await request(app).post('/api/racks').send({ name: 'Rack 2', workspaceName: testWorkspace.name, units: 42 });
        await request(app).post('/api/racks').send({ name: 'Rack 3', workspaceName: testWorkspace.name, units: 42 });

        // 3. Obtener Racks
        const res = await request(app).get(`/api/racks/${encodeURIComponent(testWorkspace.name)}`);
        console.log(JSON.stringify(res, null, 2));

        // No se necesita sincronización aquí porque es una operación de lectura.
        expect(res.statusCode).toEqual(200);
        expect(res.body.racks.length).toBe(3);
    });

    it('3. should delete a rack by name', async () => {
        const rackToDeleteName = 'Rack to Delete';
        // 1. Crear Workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        // 2. Crear Rack (persiste en la DB)
        await request(app).post('/api/racks').send({
            name: rackToDeleteName,
            workspaceName: 'Test Workspace',
            units: 42
        });

        // 3. Obtener conteo inicial (debe ser 1)
        const initialCount = getDb().racks.length;

        // 4. Eliminar Rack
        const res = await request(app).delete(`/api/racks/${encodeURIComponent(testWorkspace.name)}/${encodeURIComponent(rackToDeleteName)}`);

        // 💡 SINCRONIZACIÓN
        const db_updated = getDb();
        const workspace = db_updated.workspaces.find(ws => ws.name === 'Test Workspace');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Rack eliminado con éxito.');
        expect(db_updated.racks.length).toBe(initialCount - 1);
        expect(workspace.racks).not.toContain(rackToDeleteName);
    });

    it('4. should not delete a non-existent rack', async () => {
        await request(app).post('/api/workspaces').send(testWorkspace);
        const res = await request(app).delete('/api/racks/Test%20Workspace/Nonexistent%20Rack');

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Rack no encontrado.');
    });

    // Test 5 reformulado para usar el setup y asegurar la referencia al servidor
    it('5. should calculate the maintenance cost of a rack (revisado)', async () => {
        // Setup: testRack ya tiene un servidor referenciado (TestServer)

        // 1. Añadir el servidor al rack (ya está en la DB, solo falta la referencia en el array)
        const resAddServer = await request(app).post('/api/racks/add-server').send({
            rackName: testRack.name,
            serverName: testServer.name
        });
        console.log(JSON.stringify(resAddServer));
        expect(resAddServer.statusCode).toEqual(200); // Sanity check

        // 2. Obtener el costo de mantenimiento del Rack
        // ASUMIMOS que el endpoint es /api/racks/maintenance-cost/:workspaceName/:rackName
        const res = await request(app).get(`/api/racks/${encodeURIComponent(testWorkspace.name)}/${encodeURIComponent(testRack.name)}/maintenance-cost`);

        expect(res.statusCode).toEqual(200);
        expect(parseFloat(res.body.totalMaintenanceCost)).toBeCloseTo(0, 2);
    });

    it('6. should successfully add a server to a rack (Happy Path)', async () => {
        const serverToAdd = {
            name: 'NewServer_HP',
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        // 1. Crear Servidor (Asegurar que existe en la DB)
        await request(app).post('/api/servers').send(serverToAdd);

        // 2. Añadir Server al Rack
        const res = await request(app).post('/api/racks/add-server').send({
            rackName: testRack.name,
            serverName: serverToAdd.name
        });

        const db_updated = getDb();
        const updatedRack = db_updated.racks.find(r => r.name === testRack.name);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Servidor añadido al rack con éxito.');
        expect(updatedRack.servers).toContain(serverToAdd.name);
        expect(updatedRack.servers.length).toBe(1);
    });

    it('7. should return 404 if the target rack does not exist', async () => {
        // El servidor 'TestServer' existe, pero el rack no.
        const res = await request(app).post('/api/racks/add-server').send({
            rackName: 'NonExistentRack',
            serverName: testServer.name
        });

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', "Rack con nombre 'NonExistentRack' no encontrado.");
    });

    it('8. should return 404 if the server does not exist in the database', async () => {
        // El rack 'TestRack' existe, pero el servidor no.
        // Nota: Asegurarse de que 'NonExistentServer' no haya sido creado en el setup.
        const res = await request(app).post('/api/racks/add-server').send({
            rackName: testRack.name,
            serverName: 'NonExistentServer'
        });

        // 💡 Esta es la prueba crítica de Integridad Referencial
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', "Servidor 'NonExistentServer' no existe en la base de datos.");
    });

    it('9. should return 409 if the server is already in the rack', async () => {
        const db = getDb();
        const racks = db.racks;
        const rackIndex = racks.findIndex(r => r.name === testRack.name);

        // Setup: Añadir el servidor al rack manualmente ANTES de la llamada a la API
        if (rackIndex > -1) {
            racks[rackIndex].servers.push(testServer.name);
            saveCollectionToDisk(racks, 'racks');
        }

        // Llamada a la API para añadir el mismo servidor de nuevo
        const res = await request(app).post('/api/racks/add-server').send({
            rackName: testRack.name,
            serverName: testServer.name
        });

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', `El servidor '${testServer.name}' ya está listado en el Rack '${testRack.name}'.`);
    });
});