import request from 'supertest';
import { db } from '../src/db/index.js';
import { setupTestEnvironment } from './utils/setup.js'

const app = setupTestEnvironment();

describe('Rack Service API', () => {
    it('should create a new rack in a workspace', async () => {
        // PASO CLAVE: Crear el workspace antes del test
        await request(app).post('/api/workspaces').send({
            name: 'Test Workspace',
            description: 'Temporary workspace for testing'
        });

        const newRack = {
            name: 'Rack A1',
            workspaceName: 'Test Workspace',
            units: 42
        };
        const res = await request(app).post('/api/racks').send(newRack);

        expect(res.statusCode).toEqual(201);
        expect(res.body.rack).toHaveProperty('name', 'Rack A1');
        expect(db.racks.length).toBe(1);
        // Verificar que el rack se añade al workspace correcto
        const testWorkspace = db.workspaces.find(ws => ws.name === 'Test Workspace');
        expect(testWorkspace.racks).toContain('Rack A1');
    });

    it('should get all racks for a workspace', async () => {
        db.racks.push({ name: 'Rack 1', workspaceName: 'Test Workspace' });
        db.racks.push({ name: 'Rack 2', workspaceName: 'Test Workspace' });
        db.racks.push({ name: 'Rack 3', workspaceName: 'Another Workspace' });

        const res = await request(app).get('/api/racks/Test%20Workspace');

        expect(res.statusCode).toEqual(200);
        expect(res.body.racks.length).toBe(2);
        expect(res.body.racks.some(r => r.name === 'Rack 3')).toBeFalsy();
    });

    it('should delete a rack by name', async () => {
    // 1. Create the workspace first
    await request(app).post('/api/workspaces').send({ 
        name: 'Test Workspace', 
        description: 'Temp workspace' 
    });

    // 2. Then, create the rack that you want to delete
    await request(app).post('/api/racks').send({
        name: 'Rack to Delete',
        workspaceName: 'Test Workspace',
        units: 42
    });

    // 3. Now, perform the delete operation
    const res = await request(app).delete('/api/racks/Test%20Workspace/Rack%20to%20Delete');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Rack eliminado con éxito.');
    expect(db.racks.length).toBe(0); // The array of racks should now be empty
    
    const workspace = db.workspaces.find(ws => ws.name === 'Test Workspace');
    expect(workspace.racks).not.toContain('Rack to Delete');
});

    it('should not delete a non-existent rack', async () => {
        const res = await request(app).delete('/api/racks/Test%20Workspace/Nonexistent%20Rack');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Rack no encontrado.');
    });
});