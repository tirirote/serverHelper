import request from 'supertest';
import { db } from '../src/db/index.js';
import { setupTestEnvironment } from './utils/setup.js';

const app = setupTestEnvironment();

beforeEach(() => {
  db.networks = [];
});

describe('Network Tests', () => {
  const newNetwork = {
    name: 'Test Network',
    ipAddress: '192.168.1.0',
    subnetMask: '255.255.255.0/24',
    gateway: '192.168.1.1',
  };

  it('should successfully create a new network', async () => {
    const res = await request(app).post('/api/networks').send(newNetwork);

    expect(res.statusCode).toBe(201);
    expect(res.body.network).toHaveProperty('name', 'Test Network');
    expect(db.networks.length).toBe(1);
  });

  it('should return 409 if a network with the same name already exists', async () => {
    await request(app).post('/api/networks').send(newNetwork);
    const res = await request(app).post('/api/networks').send(newNetwork);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Ya existe una red con este nombre.');
  });

  it('should get a network by name', async () => {
    await request(app).post('/api/networks').send(newNetwork);
    const res = await request(app).get('/api/networks/Test%20Network');

    expect(res.statusCode).toBe(200);
    expect(res.body.network).toHaveProperty('name', 'Test Network');
  });

  it('should successfully delete an existing network', async () => {
    await request(app).post('/api/networks').send(newNetwork);
    const res = await request(app).delete('/api/networks/Test%20Network');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Red eliminada con éxito.');
    expect(db.networks.length).toBe(0);
  });

  it('should return 404 if the network to delete is not found', async () => {
    const res = await request(app).delete('/api/networks/NonExistentNetwork');
    expect(res.statusCode).toBe(404);
  });
});