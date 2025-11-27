import request from 'supertest';
//BD
import { initialDBData } from '../src/db/sampleDBData.js';
import { getDb, closeDbWatchers } from '../src/db/dbLoader.js';
import { resetTestDB } from '../src/db/dbUtils.js';
import { createApp } from '../src/app.js';

const app = createApp();

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
    racks: []
};
const testRack = {
    name: 'TestRack',
    workspaceName: testWorkspace.name,
    units: 42
};

const testServer = {
    name: 'BaseServer',
    components: initialDBData.components,
    rackName: testRack.name,
    ipAddress: '10.0.0.100',
    healthStatus: 'Excellent'
};

beforeEach(async () => {
    const db = await getDb();
    await resetTestDB(db);
});

afterAll(() => {
    closeDbWatchers();
});

describe('Rack Service API', () => {

    it('1. should create a new rack in a workspace', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);

        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        const newRack = {
            name: 'Rack A1',
            workspaceName: testWorkspace.name,
            units: 42,
        };

        const db_initial = await getDb();
        const initialCount = db_initial.racks.length;

        // 2. Crear Rack
        const res = await request(app).post('/api/racks').send(newRack);

        const db_updated = await getDb();
        const foundWorkspace = db_updated.workspaces.find(ws => ws.name === testWorkspace.name);

        expect(res.statusCode).toEqual(201);
        expect(res.body.rack).toHaveProperty('name', 'Rack A1');
        expect(db_updated.racks.length).toBe(initialCount + 1);
        expect(foundWorkspace.racks).toContain('Rack A1');
    });

    it('2. should get all racks for a workspace', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        // 2. Crear Racks (usando la API para asegurar la persistencia en el controlador)
        await request(app).post('/api/racks').send({ name: 'Rack 1', workspaceName: testWorkspace.name, units: 42 });
        await request(app).post('/api/racks').send({ name: 'Rack 2', workspaceName: testWorkspace.name, units: 42 });
        await request(app).post('/api/racks').send({ name: 'Rack 3', workspaceName: testWorkspace.name, units: 42 });

        // 3. Obtener Racks
        const res = await request(app).get(`/api/racks/${encodeURIComponent(testWorkspace.name)}`);

        // No se necesita sincronización aquí porque es una operación de lectura.
        expect(res.statusCode).toEqual(200);
        expect(res.body.racks.length).toBe(3);
    });

    it('3. should delete a rack by name', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        const rackToDeleteName = 'Rack to Delete';
        // 1. Crear Workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        // 2. Crear Rack (persiste en la DB)
        await request(app).post('/api/racks').send({
            name: rackToDeleteName,
            workspaceName: testWorkspace.name,
            units: 42
        });

        // 3. Obtener conteo inicial (debe ser 1)
        const db_initial = await getDb();
        const initialCount = db_initial.racks.length;

        // 4. Eliminar Rack
        const res = await request(app).delete(`/api/racks/${encodeURIComponent(testWorkspace.name)}/${encodeURIComponent(rackToDeleteName)}`);

        // 💡 SINCRONIZACIÓN

        const db_updated = await getDb();
        const workspace = db_updated.workspaces.find(ws => ws.name === 'Test Workspace');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Rack eliminado con éxito.');
        expect(db_updated.racks.length).toBe(initialCount - 1);
        expect(workspace.racks).not.toContain(rackToDeleteName);
    });

    it('4. should not delete a non-existent rack', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        const res = await request(app).delete('/api/racks/Test%20Workspace/Nonexistent%20Rack');

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Rack no encontrado.');
    });

    it('5. should successfully add a server to a rack and recalculate costs)', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        // 1. Crear Rack
        const rackResponse = await request(app).post('/api/racks').send(testRack);
        expect(rackResponse.statusCode).toEqual(201);

        //2. Crear el servidor
        const serverRes = await request(app).post('/api/servers').send(testServer);
        expect(serverRes.statusCode).toEqual(201);

        // 3. Añadimos el servidor al rack
        const resAddServer = await request(app).post('/api/racks/add-server').send({
            rackName: testRack.name,
            serverName: testServer.name
        });
        expect(resAddServer.statusCode).toEqual(200);

        const res = await request(app).get(`/api/racks/${encodeURIComponent(testWorkspace.name)}/${encodeURIComponent(testRack.name)}/maintenance-cost`);

        expect(res.statusCode).toEqual(200);
        expect(parseFloat(res.body.totalMaintenanceCost)).toBeCloseTo(33, 2);
    });

    it('6. should return 404 if the server does not exist in the database', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        // 1. Crear Rack
        await request(app).post('/api/racks').send(testRack);



        const res = await request(app).post('/api/racks/add-server').send({
            rackName: testRack.name,
            serverName: 'NonExistentServer'
        });

        // 💡 Esta es la prueba crítica de Integridad Referencial
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', "Servidor no encontrado.");
    });

    it('7. should return 409 if the server is already in the rack', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        // 1. Crear Rack
        await request(app).post('/api/racks').send(testRack);
        //2. Crear el servidor
        await request(app).post('/api/servers').send(testServer);

        //Añadimos el servidor
        await request(app).post('/api/racks/add-server').send({
            rackName: testRack.name,
            serverName: testServer.name
        });

        //Lo añadimos otra vez
        const res = await request(app).post('/api/racks/add-server').send({
            rackName: testRack.name,
            serverName: testServer.name
        });

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', `El servidor ya está en este rack.`);
    });

    it('8. should successfully retrieve an existing rack by name and workspace', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        const expectedRack = {
            name: testRack.name,
            units: 42,
            workspaceName: testWorkspace.name,
            powerStatus: 'Off',
            healthStatus: 'Unknown',
            servers: [],
            totalCost: 0,
            totalMaintenanceCost: 0
        };

        await request(app).post('/api/racks').send(expectedRack);

        const res = await request(app).get(`/api/racks/${encodeURIComponent(testWorkspace.name)}/${encodeURIComponent(testRack.name)}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('rack');
        // Usamos toEqual/to.deep.equal para verificar el contenido del objeto
        expect(res.body.rack).toEqual(expectedRack);
    });

    it('9. should return 404 if the rack does not exist in the specified workspace', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 1. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);

        const expectedRack = {
            name: testRack.name,
            units: 42,
            workspaceName: testWorkspace.name,
            powerStatus: 'Off',
            healthStatus: 'Unknown',
            servers: [],
            totalCost: 0,
            totalMaintenanceCost: 0
        };

        await request(app).post('/api/racks').send(expectedRack);

        const res = await request(app).get(`/api/racks/${encodeURIComponent('WrongWorkspace')}/${encodeURIComponent(testRack.name)}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message');
    });

    it('13. should successfully update mutable rack properties (units, healthStatus)', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 2. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);
        // 3. Creamos el rack
        await request(app).post('/api/racks').send(testRack);

        const updateData = {
            units: 20,
            healthStatus: 'Excellent',
            // Intentar actualizar campos protegidos (deben ser ignorados por el controlador)
            workspaceName: 'ProtectedName',
            servers: ['ServerX'],
        };

        const res = await request(app).put(`/api/racks/${encodeURIComponent(testRack.name)}`).send(updateData);
        expect(res.statusCode).toEqual(200);

        // Verificar que los campos actualizables se modificaron
        expect(res.body.rack.units).toEqual(20);
        expect(res.body.rack.healthStatus).toEqual('Excellent');

        // Verificar que los campos protegidos NO se modificaron
        expect(res.body.rack.workspaceName).toEqual(testWorkspace.name);
        expect(res.body.rack.servers).toEqual([]);
    });

    it('14. should return 400 if validation fails on updated fields (e.g., units invalid type)', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 2. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);
        // 3. Creamos el rack
        await request(app).post('/api/racks').send(testRack);

        const updateData = {
            units: 'veinte' // Tipo de dato incorrecto
        };

        const res = await request(app).put(`/api/racks/${encodeURIComponent(testRack.name)}`).send(updateData);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message');
    });

    it('15. should return 404 if trying to update a non-existent rack', async () => {
        const res = await request(app).put(`/api/racks/${encodeURIComponent('NonExistentRack')}`).send({ units: 1 });
        expect(res.statusCode).toEqual(404);
    });
});