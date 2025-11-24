import request from 'supertest';
import { setupTestEnvironment } from './utils/setup.js'
//BD
import { initialDBData } from '../src/db/sampleDBData.js';
import { getDb, closeDbWatchers } from '../src/db/dbLoader.js';
import { saveCollectionToDisk } from '../src/db/dbUtils.js';

const app = setupTestEnvironment();

// 💡 Eliminamos la referencia global 'db' y la reemplazamos por llamadas a getDb()
const components = initialDBData.components;
// Usaremos estos componentes para garantizar que el servidor tenga un costo conocido.
const componentPrices = components.reduce((acc, c) => {
    acc[c.name] = { price: c.price || 0, maintenanceCost: c.maintenanceCost || 0 };
    return acc;
}, {});

// Componentes mínimos válidos para el test de Costo (asumiendo que estos nombres tienen costos en initialDBData)
const validServerComponentsForTest = [
    // Asumimos que estos tienen un costo de mantenimiento de 82.00 en total.
    { name: 'Intel Xeon E5-2690', type: 'CPU' }, // Costo de mantenimiento: 50.00
    { name: 'DDR4 32GB', type: 'RAM' },           // Costo de mantenimiento: 2.00
    { name: 'SSD 1TB', type: 'HardDisk' },       // Costo de mantenimiento: 10.00
    { name: 'Ubuntu Server 22.04 LTS', type: 'OS' }, // Costo de mantenimiento: 20.00
];
// Costo de mantenimiento esperado basado en sampleDBData.js (si existe)
// Calculamos el costo esperado dinámicamente:
const EXPECTED_MAINTENANCE_COST = validServerComponentsForTest.reduce((total, c) => {
    return total + (componentPrices[c.name]?.maintenanceCost || 0);
}, 0);
// Si usamos los valores de sampleDBData (50+2+10+20 = 82)
const expectedCost = 82.00;

const testNetwork = {
    name: 'WS_TestNet',
    ipAddress: '192.168.10.0',
    subnetMask: '255.255.255.0/24',
    gateway: '192.168.10.1',
};

// Datos base de Rack/Workspace
const testWorkspace = {
    name: 'Test Workspace',
    description: 'A test workspace',
    network: testNetwork.name,
};

beforeEach(() => {
    const db = getDb();

    db.networks = [testNetwork];
    saveCollectionToDisk(db.networks, 'networks');
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

    it('5. should calculate the maintenance cost of a rack', async () => {
        const rackName = 'Rack with Server';
        const serverName = 'Server 1';

        await request(app).post('/api/workspaces').send(testWorkspace);
        await request(app).post('/api/racks').send({ name: rackName, workspaceName: testWorkspace.name, units: 42 });
        await request(app).post('/api/servers').send({
            name: serverName,
            components: validServerComponentsForTest,
            rackName: rackName // Referencia al rack
        });

        const res1 = await request(app).post('/api/racks/add-server').send({
            rackName: rackName,
            serverName: serverName
        });

        // 5. Obtener el costo de mantenimiento del Rack
        const res = await request(app).get(`/api/racks/${encodeURIComponent(testWorkspace.name)}/${encodeURIComponent(rackName)}/maintenance-cost`);

        console.log(JSON.stringify(res1, null, 2));
        // La respuesta del endpoint debe ser el número calculado (82.00)
        expect(res.statusCode).toEqual(200);
        // Usamos toBeCloseTo para manejar posibles errores de coma flotante
        expect(parseFloat(res.body.totalMaintenanceCost)).toBeCloseTo(expectedCost, 2);
    });

    it('6. should successfully add a server to a rack', async () => {
        const newRack = {
            name: 'Rack A1',
            workspaceName: testWorkspace.name,
            units: 42
        };
        const newServer = {
            name: 'New Test Server',
            components: validServerComponentsForTest, // Usar componentes válidos
            rackName: newRack.name
        }

        // 1. Setup: Crear Workspace, Rack, Server
        await request(app).post('/api/workspaces').send(testWorkspace);
        await request(app).post('/api/racks').send(newRack);
        await request(app).post('/api/servers').send(newServer);

        // 2. Añadir Server al Rack
        const res = await request(app).post('/api/racks/add-server').send({
            rackName: newRack.name,
            serverName: newServer.name
        });

        // 💡 SINCRONIZACIÓN
        const db_updated = getDb();
        const updatedRack = db_updated.racks.find(r => r.name === newRack.name);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Servidor añadido al rack con éxito.');
        // Verificamos que el nombre del servidor esté en la lista de servidores del rack
        expect(updatedRack.servers).toContain(newServer.name);
    });
});