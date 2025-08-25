import request from 'supertest';
import { db } from '../db/index.js';
import { setupTestEnvironment } from '../utils/setup.js';

const app = setupTestEnvironment();

describe('Workspace Service API', () => {

    it('should create a new workspace', async () => {
        const newWorkspace = { name: 'My Test Workspace', description: 'A great place to build servers.' };
        const res = await request(app).post('/api/workspaces').send(newWorkspace);
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.workspace).toHaveProperty('name', 'My Test Workspace');
        expect(db.workspaces.length).toBe(1);
    });

    it('should not create a workspace with a duplicate name', async () => {
        // En este test, creamos el workspace directamente para el escenario
        await request(app).post('/api/workspaces').send({ name: 'Existing Workspace', description: '' });
        
        const res = await request(app).post('/api/workspaces').send({ name: 'Existing Workspace', description: '' });

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'Ya existe un workspace con este nombre.');
    });

    it('should get all workspaces', async () => {
        await request(app).post('/api/workspaces').send({ name: 'Workspace 1', description: '' });
        await request(app).post('/api/workspaces').send({ name: 'Workspace 2', description: '' });
        
        const res = await request(app).get('/api/workspaces');

        expect(res.statusCode).toEqual(200);
        expect(res.body.workspaces.length).toBe(2);
    });

    it('should get a workspace by name', async () => {
        await request(app).post('/api/workspaces').send({ name: 'Target Workspace', description: 'This is the one.' });
        
        const res = await request(app).get('/api/workspaces/Target%20Workspace');

        expect(res.statusCode).toEqual(200);
        expect(res.body.workspace).toHaveProperty('name', 'Target Workspace');
    });

    it('should return 404 for a non-existent workspace', async () => {
        const res = await request(app).get('/api/workspaces/Nonexistent');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Workspace no encontrado.');
    });
});