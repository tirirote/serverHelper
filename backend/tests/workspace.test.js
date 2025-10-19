import request from 'supertest';
import { db } from '../src/db/index.js';
import { setupTestEnvironment } from './utils/setup.js';

const app = setupTestEnvironment();

const testNetwork = {
    name: 'WS_TestNet',
    ipAddress: '192.168.10.0',
    subnetMask: '255.255.255.0/24',
    gateway: '192.168.10.1',
};

beforeEach(() => {
    db.workspaces = [];
    db.racks = [];
    db.networks = [testNetwork];
});

describe('Workspace Service API', () => {

    const newWorkspace = {
        name: 'Workspace 1',
        description: 'A test workspace',
        network: testNetwork.name,
    };

    it('should create a new workspace', async () => {
        const res = await request(app).post('/api/workspaces').send(newWorkspace);

        expect(res.statusCode).toEqual(201);
        expect(res.body.workspace).toHaveProperty('name', 'Workspace 1');
        expect(db.workspaces.length).toBe(1);
    });

    it('should not create a workspace with a duplicate name', async () => {
        // En este test, creamos el workspace directamente para el escenario
        await request(app).post('/api/workspaces').send({
            name: 'Existing Workspace',
            description: '',
            network: testNetwork.name
        });

        const res = await request(app).post('/api/workspaces').send({
            name: 'Existing Workspace',
            description: '',
            network: testNetwork.name
        });

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'Ya existe un workspace con este nombre.');
    });

    it('should get all workspaces', async () => {
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