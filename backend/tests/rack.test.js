import request from 'supertest';
import { db } from '../src/db/index.js';
import { setupTestEnvironment } from './utils/setup.js'
import { components } from '../src/db/componentData.js';

const app = setupTestEnvironment();

const testNetwork = {
    name: 'WS_TestNet',
    ipAddress: '192.168.10.0',
    subnetMask: '255.255.255.0/24',
    gateway: '192.168.10.1',
};

beforeEach(() => {
    db.networks = [testNetwork];
    db.workspaces = [];
    db.racks = [];
});

describe('Rack Service API', () => {

    const testWorkspace = {
        name: 'Test Workspace',
        description: 'A test workspace',
        network: testNetwork.name,
    };

    it('should create a new rack in a workspace', async () => {
        await request(app).post('/api/workspaces').send(testWorkspace);

        const newRack = {
            name: 'Rack A1',
            workspaceName: testWorkspace.name,
            units: 42
        };
        const res = await request(app).post('/api/racks').send(newRack);

        expect(res.statusCode).toEqual(201);
        expect(res.body.rack).toHaveProperty('name', 'Rack A1');
        expect(db.racks.length).toBe(1);
        const foundWorkspace = db.workspaces.find(ws => ws.name === testWorkspace.name);
        expect(foundWorkspace.racks).toContain('Rack A1');
    });

    it('should get all racks for a workspace', async () => {
        await request(app).post('/api/workspaces').send(testWorkspace);
        db.racks.push({ name: 'Rack 1', workspaceName: testWorkspace.name });
        db.racks.push({ name: 'Rack 2', workspaceName: testWorkspace.name });
        db.racks.push({ name: 'Rack 3', workspaceName: testWorkspace.name });

        const res = await request(app).get('/api/racks/Test%20Workspace');

        expect(res.statusCode).toEqual(200);
        expect(res.body.racks.length).toBe(3);
    });

    it('should delete a rack by name', async () => {
        await request(app).post('/api/workspaces').send(testWorkspace);

        await request(app).post('/api/racks').send({
            name: 'Rack to Delete',
            workspaceName: 'Test Workspace',
            units: 42
        });

        const res = await request(app).delete('/api/racks/Test%20Workspace/Rack%20to%20Delete');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Rack eliminado con éxito.');
        expect(db.racks.length).toBe(0);

        const workspace = db.workspaces.find(ws => ws.name === 'Test Workspace');
        expect(workspace.racks).not.toContain('Rack to Delete');
    });

    it('should not delete a non-existent rack', async () => {
        await request(app).post('/api/workspaces').send(testWorkspace);
        const res = await request(app).delete('/api/racks/Test%20Workspace/Nonexistent%20Rack');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Rack no encontrado.');
    });

    it('should calculate the maintenance cost of a rack', async () => {
        await request(app).post('/api/workspaces').send(testWorkspace);
        await request(app).post('/api/racks').send({ name: 'Test Rack', workspaceName: 'Test Workspace', units: 42 });

        const validServerComponentsForTest = components
        await request(app).post('/api/servers').send({
            name: 'Server 1',
            components: validServerComponentsForTest,
            rackName: 'Test Rack'
        });

        const testRack = db.racks.find(r => r.name === 'Test Rack');
        testRack.servers.push('Server 1');

        const res = await request(app).get('/api/racks/Test%20Workspace/Test%20Rack/maintenance-cost');
        const expectedCost = 80.00;

        expect(res.statusCode).toEqual(200);
        expect(res.body.totalMaintenanceCost).toBe(expectedCost.toFixed(2));
    });

    it('should successfully add a server to a rack', async () => {
        const newRack = {
            name: 'Rack A1',
            workspaceName: testWorkspace.name,
            units: 42
        };
        const newServer = {
            name: 'New Test Server',
            components: [
                { name: 'Intel Xeon E5-2690', type: 'CPU' },
                { name: 'DDR4 32GB', type: 'RAM' },
                { name: 'SSD 1TB', type: 'HardDisk' },
                { name: 'BIOS Standard', type: 'BiosConfig' },
                { name: 'Ventilador 80mm', type: 'Fan' },
                { name: 'Fuente 500W', type: 'PowerSupply' },
                { name: 'NVIDIA A100', type: 'GPU' },
                { name: 'Placa Base 1', type: 'Placa Base' },
                { name: 'Chasis 1U', type: 'Chasis' }
            ],
            rackName: newRack.name
        }

        await request(app).post('/api/workspaces').send(testWorkspace);
        await request(app).post('/api/racks').send(newRack);
        await request(app).post('/api/servers').send(newServer);

        const res = await request(app).post('/api/racks/add-server').send({
            rackName: newRack.name,
            serverName: newServer.name
        });

        const updatedRack = db.racks.find(r => r.name === newRack.name);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Servidor añadido al rack con éxito.');
        expect(updatedRack.servers).toContain(newServer.name);
    });
});