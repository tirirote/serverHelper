import request from 'supertest';
import { db } from '../src/db/index.js';
import { setupTestEnvironment } from './utils/setup.js';
import { components as initialComponents } from '../src/db/componentData.js';
import { racks } from '../src/db/rackData.js';

const app = setupTestEnvironment();

const validServerComponentsForTest = initialComponents;

const testNetwork = {
    name: 'TestNet',
    ipAddress: '10.0.0.0',
    subnetMask: '255.255.255.0/24',
    gateway: '10.0.0.1',
};
const testRack = { name: 'TestRack', workspaceName: 'TestWorkspace', units: 42 };
const testWorkspace = { name: 'TestWorkspace', network: testNetwork.name, racks: [testRack.name] };

beforeEach(() => {
    db.servers = [];
    db.components = JSON.parse(JSON.stringify(initialComponents));
    db.networks = [testNetwork];
    db.workspaces = [testWorkspace];
    db.racks = [testRack];

});

describe('Server Service API', () => {

    it('should successfully create a new server and infer the network from the rack/workspace', async () => {
        const newServer = {
            name: 'Network Server',
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        const res = await request(app).post('/api/servers').send(newServer);

        expect(res.statusCode).toEqual(201);
        expect(res.body.server).toHaveProperty('network', testNetwork.name);
    });

    it('should return 400 if network cannot be inferred', async () => {
        const invalidServer = {
            name: 'Invalid Server',
            components: validServerComponentsForTest
        };
        const res = await request(app).post('/api/servers').send(invalidServer);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("No se pudo determinar la red para el servidor.");
    });

    it('should successfully update an existing server', async () => {
        const serverName = 'Server to Update';
        await request(app).post('/api/servers').send({
            name: serverName,
            components: validServerComponentsForTest,
            rackName: testRack.name
        });

        const updatedDetails = { name: serverName, description: 'Updated description', components: validServerComponentsForTest, network: testNetwork.name };
        const res = await request(app).put(`/api/servers/${encodeURIComponent(serverName)}`).send(updatedDetails);

        expect(res.statusCode).toEqual(200);
        expect(res.body.server).toHaveProperty('description', 'Updated description');
        expect(res.body.server).toHaveProperty('network', testNetwork.name);
    });

    it('should return 400 if required fields are missing', async () => {
        const invalidServer = {
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        const res = await request(app).post('/api/servers').send(invalidServer);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBeDefined();
    });

    it('should return 409 if a server with the same name already exists', async () => {
        const server = {
            name: 'Duplicate Server',
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        await request(app).post('/api/servers').send(server);

        const res = await request(app).post('/api/servers').send(server);

        expect(res.statusCode).toEqual(409);
        expect(res.body.message).toBe('Ya existe un servidor con este nombre.');
    });

    it('should get a server by its name', async () => {
        const serverName = 'Database Server';
        const newServer = {
            name: serverName,
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        await request(app).post('/api/servers').send(newServer);

        const res = await request(app).get(`/api/servers/${encodeURIComponent(serverName)}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.server).toHaveProperty('name', serverName);
    });

    it('should successfully add a component to a server and recalculate costs', async () => {
        // Primero, creamos un servidor
        const serverName = 'Server to Modify';
        await request(app).post('/api/servers').send({
            name: serverName,
            components: validServerComponentsForTest,
            rackName: testRack.name
        });

        // Obtenemos el costo inicial para verificar el cambio
        const initialServer = db.servers.find(s => s.name === serverName);
        const initialCost = initialServer.totalPrice;

        // Añadir un nuevo componente (una GPU, por ejemplo)
        const newComponent = { name: 'NVIDIA A100', type: 'GPU' };
        const res = await request(app).post('/api/servers/add-component').send({
            serverName: serverName,
            componentName: newComponent.name,
            componentType: newComponent.type
        });

        const addedComponent = db.components.find(c => c.name === newComponent.name);
        const expectedNewCost = initialCost + (addedComponent ? addedComponent.price : 0);

        expect(res.statusCode).toEqual(200);
        expect(res.body.server.components).toHaveLength(validServerComponentsForTest.length + 1);
        expect(res.body.server.totalPrice).toBeCloseTo(expectedNewCost);
    });

    it('should return 404 if the server is not found', async () => {
        const res = await request(app).post('/api/servers/add-component').send({
            serverName: 'NonExistentServer',
            componentName: 'NVIDIA A100',
            componentType: 'GPU'
        });
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Servidor no encontrado.');
    });

    it('should return 404 if the component is not found', async () => {
        const serverName = 'Server to Modify';
        await request(app).post('/api/servers').send({
            name: serverName,
            components: validServerComponentsForTest,
            rackName: testRack.name
        });

        const res = await request(app).post('/api/servers/add-component').send({
            serverName: serverName,
            componentName: 'NonExistentComponent',
            componentType: 'GPU'
        });
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Componente no encontrado.');
    });

    it('should successfully delete an existing server', async () => {
        const serverName = 'Server to Delete';
        const newServer = {
            name: serverName,
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        await request(app).post('/api/servers').send(newServer);

        const res = await request(app).delete(`/api/servers/${encodeURIComponent(serverName)}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Servidor eliminado con éxito.');
        expect(db.servers.length).toBe(0);
    });

    it('should update server components and recalculate costs', async () => {
        const serverName = 'Server with Components';
        // Crear un servidor inicial con todos los componentes obligatorios
        const initialServer = {
            name: serverName,
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        await request(app).post('/api/servers').send(initialServer);

        // Definir una lista de componentes de actualización que también es válida
        const updatedComponents = [
            { name: 'Intel Xeon E5-2690', type: 'CPU' }, // Componente existente
            { name: 'DDR4 32GB', type: 'RAM' },          // Componente existente
            { name: 'SSD 1TB', type: 'HardDisk' },       // Componente existente
            { name: 'BIOS Standard', type: 'BiosConfig' }, // Componente existente
            { name: 'Ventilador 80mm', type: 'Fan' },    // Componente existente
            { name: 'Fuente 500W', type: 'PowerSupply' }, // Componente existente
            { name: 'NVIDIA A100', type: 'GPU' },        // Nuevo componente
            { name: 'Placa Base 1', type: 'Placa Base' }, // Nuevo componente
            { name: 'Chasis 1U', type: 'Chasis' }
        ];

        const res = await request(app).put(`/api/servers/${encodeURIComponent(serverName)}`).send({ name: serverName, components: updatedComponents });

        expect(res.statusCode).toEqual(200);
        expect(res.body.server.components.length).toEqual(updatedComponents.length);
        expect(res.body.server).toHaveProperty('totalPrice');
        expect(res.body.server).toHaveProperty('totalMaintenanceCost');
    });

    it('should return 404 when trying to delete a non-existent server', async () => {
        const res = await request(app).delete('/api/servers/NonExistentServer');
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Servidor no encontrado.');
    });

    it('should get the total buy price of an existing server', async () => {
        const serverName = 'Cost Test Server';
        const newServer = {
            name: serverName,
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        await request(app).post('/api/servers').send(newServer);

        const res = await request(app).get(`/api/servers/${encodeURIComponent(serverName)}/total-cost`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('totalPrice');
        // Calculate the expected cost from our mock data to verify the result
        const expectedPrice = validServerComponentsForTest.reduce((total, comp) => {
            const dbComp = db.components.find(c => c.name === comp.name);
            return total + (dbComp ? dbComp.price : 0);
        }, 0);
        expect(res.body.totalPrice).toEqual(expectedPrice);
    });

    it('should get the total maintenance cost of an existing server', async () => {
        const serverName = 'Maintenance Test Server';
        const newServer = {
            name: serverName,
            components: validServerComponentsForTest,
            rackName: testRack.name
        };
        await request(app).post('/api/servers').send(newServer);

        const res = await request(app).get(`/api/servers/${encodeURIComponent(serverName)}/maintenance-cost`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('totalMaintenanceCost');
        // Calculate the expected maintenance cost from our mock data
        const expectedMaintenanceCost = validServerComponentsForTest.reduce((total, comp) => {
            const dbComp = db.components.find(c => c.name === comp.name);
            return total + (dbComp ? dbComp.maintenanceCost : 0);
        }, 0);
        expect(res.body.totalMaintenanceCost).toEqual(expectedMaintenanceCost);
    });

    it('should return 404 for total cost if server is not found', async () => {
        const res = await request(app).get('/api/servers/NonExistentServer/total-cost');
        expect(res.statusCode).toEqual(404);
    });

    it('should return 404 for maintenance cost if server is not found', async () => {
        const res = await request(app).get('/api/servers/NonExistentServer/maintenance-cost');
        expect(res.statusCode).toEqual(404);
    });
});