import request from 'supertest';
//BD
import { getDb, closeDbWatchers } from '../src/db/dbLoader.js';
import { resetTestDB } from '../src/db/dbUtils.js';
import { createApp } from '../src/app.js';
const app = createApp();

const testNetwork = {
    name: 'WS_TestNet',
    ipAddress: '192.168.10.0',
    subnetMask: '255.255.255.0/24',
    gateway: '192.168.10.1',
};

beforeEach(() => {
    const db = getDb();
    resetTestDB(db);
});

afterAll(() => {
    console.log('Cerrando watchers de la base de datos...');
    closeDbWatchers();
});

describe('Workspace Service API', () => {

    const newWorkspace = {
        name: 'Workspace 1',
        description: 'A test workspace',
        network: 'WS_TestNet',
    };

    it('should create a new workspace', async () => {
        //1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);

        const res = await request(app).post('/api/workspaces').send(newWorkspace);
        const db_updated = getDb();

        expect(res.statusCode).toEqual(201);
        expect(res.body.workspace).toHaveProperty('name', 'Workspace 1');
        expect(db_updated.workspaces.length).toBe(1);
    });

    it('should not create a workspace with a duplicate name', async () => {
        //1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        //2. Creamos el workspace
        await request(app).post('/api/workspaces').send({
            name: 'Existing Workspace',
            description: '',
            network: testNetwork.name
        });
        //3. Lo volvemos a crear
        const res = await request(app).post('/api/workspaces').send({
            name: 'Existing Workspace',
            description: '',
            network: testNetwork.name
        });

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'Ya existe un workspace con este nombre.');
    });

    it('should update a workspace', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 2. Crear el workspace inicial
        await request(app).post('/api/workspaces').send(newWorkspace);

        const res = await request(app).put(`/api/workspaces/${encodeURIComponent(newWorkspace.name)}`).send({ ...newWorkspace, name: 'Updated Workspace' });

        const db_updated = getDb();

        expect(res.statusCode).toEqual(200);
        expect(res.body.workspace).toHaveProperty('name', 'Updated Workspace');
        expect(db_updated.workspaces.length).toBe(1);
    });

    it('should get all workspaces', async () => {        
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 2. Creamos los workspaces
        await request(app).post('/api/workspaces').send({
            name: 'Workspace 1',
            description: '',
            network: testNetwork.name
        });
        await request(app).post('/api/workspaces').send({
            name: 'Workspace 2',
            description: '',
            network: testNetwork.name
        });

        const res = await request(app).get('/api/workspaces');

        expect(res.statusCode).toEqual(200);
        expect(res.body.workspaces.length).toBe(2);
    });

    it('should get a workspace by name', async () => {
        // 1. Creamos la red
        await request(app).post('/api/networks').send(testNetwork);
        // 2. Creamos el workspace
        await request(app).post('/api/workspaces').send({
            name: 'Target Workspace',
            description: 'This is the one.',
            network: testNetwork.name
        });

        const res = await request(app).get('/api/workspaces/Target%20Workspace');

        expect(res.statusCode).toEqual(200);
        expect(res.body.workspace).toHaveProperty('name', 'Target Workspace');
    });

    it('should return 404 for a non-existent workspace', async () => {
        const res = await request(app).get('/api/workspaces/Nonexistent');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Workspace no encontrado.');
    });

    it('should return 400 if the required network does not exist', async () => {
        const res = await request(app).post('/api/workspaces').send({
            name: 'Invalid Workspace',
            network: 'NonExistentNet'
        });

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Red no encontrada.');
    });
});