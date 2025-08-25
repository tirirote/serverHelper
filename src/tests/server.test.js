import request from 'supertest';
import { db } from '../db/index.js';
import { setupTestEnvironment } from '../utils/setup.js';

const app = setupTestEnvironment();

// Un conjunto de componentes válido para las pruebas
const validServerComponents = [
    { name: 'CPU Test', type: 'CPU' },
    { name: 'RAM Test', type: 'RAM' },
    { name: 'Chasis Test', type: 'Chasis' },
    { name: 'HD Test', type: 'HardDisk' },
    { name: 'BIOS Test', type: 'BiosConfig' },
    { name: 'Fan Test', type: 'Fan' },
    { name: 'PSU Test', type: 'PowerSupply' },
];

describe('Server Service API (Simplified)', () => {

    it('should successfully create a new server', async () => {
        const newServer = {
            name: 'Web Server',
            description: 'A basic web server',
            components: validServerComponents,
        };
        const res = await request(app).post('/api/servers').send(newServer);

        expect(res.statusCode).toEqual(201);
        expect(res.body.server).toHaveProperty('name', 'Web Server');
        expect(res.body.server.totalCost).toBeDefined();
        expect(db.servers.length).toBe(1);
    });

    it('should get a server by its name', async () => {
        // Primero, creamos un servidor para poder recuperarlo
        const newServer = {
            name: 'Database Server',
            description: 'A test database server',
            components: validServerComponents,
        };
        await request(app).post('/api/servers').send(newServer);

        const res = await request(app).get('/api/servers/Database%20Server');

        expect(res.statusCode).toEqual(200);
        expect(res.body.server).toHaveProperty('name', 'Database Server');
    });

    it('should successfully delete an existing server', async () => {
        // Primero, creamos un servidor para poder eliminarlo
        const newServer = {
            name: 'Server to Delete',
            description: 'A server to be deleted',
            components: validServerComponents,
        };
        await request(app).post('/api/servers').send(newServer);
        
        const res = await request(app).delete('/api/servers/Server%20to%20Delete');

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Servidor eliminado con éxito.');
        expect(db.servers.length).toBe(0);
    });
});