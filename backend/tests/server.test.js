import request from 'supertest';
// BD
import { getDb, closeDbWatchers } from '../src/db/dbLoader.js';
import { initialDBData } from '../src/db/sampleDBData.js';
import { resetTestDB } from '../src/db/dbUtils.js'; // 💡 Asegúrate de importar esto
import { createApp } from '../src/app.js';

const app = createApp();
const initialComponents = initialDBData.components;

const testNetwork = { name: 'TestNet', ipAddress: '10.0.0.0', subnetMask: '255.255.255.0/24', gateway: '10.0.0.1' };
const testRack = { name: 'TestRack', workspaceName: 'TestWorkspace', units: 42 };
const testWorkspace = { name: 'TestWorkspace', network: 'TestNet', racks: ['TestRack'] };

// 💡 Datos de prueba que incluyen componentes obligatorios
const validServerBase = {
    name: 'BaseServer',
    components: initialComponents, // Asumimos que initialComponents tiene el 'OS' y otros obligatorios
    rackName: testRack.name,
    ipAddress: '10.0.0.100',
    healthStatus: 'Excellent'
};

beforeEach(() => {
    const db = getDb();
    resetTestDB(db);
});

afterAll(() => {
    console.log('Cerrando watchers de la base de datos...');
    closeDbWatchers();
});

// --- Test Suite ---

describe('Server Service API (CRUD & Logic)', () => {

    it('1. should successfully create a new server and infer the network', async () => {
        //1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        //2. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);
        //3. Creamos el rack
        await request(app).post('/api/racks').send(testRack);

        const newServerData = { ...validServerBase, name: 'Network Server' };
        const initialCount = getDb().servers.length;

        const res = await request(app).post('/api/servers').send(newServerData);

        // Forzar la sincronización para la aserción
        
        const db_updated = getDb();

        expect(res.statusCode).toEqual(201);
        expect(res.body.server).toHaveProperty('network', 'TestNet'); // Red se infiere del Workspace
        expect(res.body.server).toHaveProperty('rackId', testRack.name);
        expect(db_updated.servers.length).toBe(initialCount + 1); // 💡 Sincronización OK
        // 💡 NUEVAS ASERCIONES PARA COMPONENTES
        const componentsArray = res.body.server.components;
        expect(Array.isArray(componentsArray)).toBe(true);
        expect(typeof componentsArray[0]).toBe('string');
    });

    it('2. should not create a server with a duplicate name', async () => {
        //1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        //2. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);
        //3. Creamos el rack
        await request(app).post('/api/racks').send(testRack);

        // 1. Crear el primer servidor (persiste el cambio)
        await request(app).post('/api/servers').send(validServerBase);        

        // 2. Intentar crear duplicado
        const res = await request(app).post('/api/servers').send(validServerBase);

        expect(res.statusCode).toEqual(409);
        expect(res.body.message).toBe('Ya existe un servidor con este nombre.');
    });

    it('3. should return 400 if network cannot be inferred (no rack)', async () => {
        const invalidServer = { ...validServerBase, name: 'Invalid Server', rackName: undefined };

        const res = await request(app).post('/api/servers').send(invalidServer);        
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("No se pudo determinar la red para el servidor.");
    });

    it('4. should successfully update server components and recalculate costs', async () => {
        //1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        //2. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);
        const serverName = 'Server to Update';
        //3. Creamos el rack
        await request(app).post('/api/racks').send(testRack);

        // 1. Crear servidor inicial
        await request(app).post('/api/servers').send({ ...validServerBase, name: serverName });

        const res = await request(app).put(`/api/servers/${encodeURIComponent(serverName)}`).send({ ...validServerBase, name: 'UpdatedServer', healthStatus: 'Warning' });

        // Forzar sincronización para verificar el estado de la DB
        const db_updated = getDb();
        const updatedServer = db_updated.servers.find(s => s.name === 'UpdatedServer');

        expect(res.statusCode).toEqual(200);
        expect(updatedServer.components.length).toEqual(10);
        expect(updatedServer.totalPrice).toBeCloseTo(6425); // Verifica el recálculo
        expect(updatedServer.healthStatus).toBe('Warning');
    });

    it('5. should successfully add a component to a server and recalculate costs', async () => {
        //1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        //2. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);
        //3. Creamos el rack
        await request(app).post('/api/racks').send(testRack);

        const serverName = 'Server to Modify';
        await request(app).post('/api/servers').send({ ...validServerBase, name: serverName });

        const db_synced = getDb();
        const initialServer = db_synced.servers.find(s => s.name === serverName);

        const newComponentName = 'NVIDIA A100'; // Debe existir en initialDBData       

        const res = await request(app).post('/api/servers/add-component').send({
            serverName: serverName,
            componentName: newComponentName,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body.server.components).toHaveLength(initialServer.components.length + 1);
    });

    it('6. should successfully delete an existing server', async () => {
        //1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        //2. Creamos el workspace
        await request(app).post('/api/workspaces').send(testWorkspace);
        //3. Creamos el rack
        await request(app).post('/api/racks').send(testRack);

        const serverName = 'Server to Delete';
        // 1. Crear el servidor (persiste el cambio)
        await request(app).post('/api/servers').send({ ...validServerBase, name: serverName });

        // 2. Obtener el conteo inicial (debe ser 1)
        const db_before_delete = getDb();
        const initialCount = db_before_delete.servers.length;

        // 3. Ejecutar la eliminación
        const res = await request(app).delete(`/api/servers/${encodeURIComponent(serverName)}`);

        // 4. Forzar la sincronización y verificar
        const db_updated = getDb();

        expect(res.statusCode).toEqual(200);
        expect(db_updated.servers.length).toBe(initialCount - 1);
    });

    it('7. should return 404 when trying to get a non-existent server', async () => {
        const res = await request(app).get('/api/servers/NonExistentServer');
        expect(res.statusCode).toEqual(404);
    });
});