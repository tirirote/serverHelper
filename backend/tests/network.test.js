import request from 'supertest';
// BD
import { getDb, closeDbWatchers, reloadDbCache } from '../src/db/dbLoader.js';
import { resetTestDB } from '../src/db/dbUtils.js';
import { createApp } from '../src/app.js';

const app = createApp();

// Datos de prueba
const newNetwork = {
    name: 'Test Network',
    ipAddress: '192.168.1.0',
    subnetMask: '255.255.255.0/24',
    gateway: '192.168.1.1',
};
const networkToDelete = {
    name: 'Network To Delete',
    ipAddress: '10.0.0.0',
    subnetMask: '255.255.255.0/24',
    gateway: '10.0.0.1',
};

beforeEach(() => {
    const db = getDb();
    resetTestDB(db);
});

afterAll(() => {
    console.log('Cerrando watchers de la base de datos...');
    closeDbWatchers();
});

describe('Network Tests', () => {

    it('1. should successfully create a new network', async () => {
        // Obtener el estado inicial (debe ser 0)
        const initialCount = getDb().networks.length;

        const res = await request(app).post('/api/networks').send(newNetwork);

        // 💡 SINCRONIZACIÓN: Forzar la recarga de la DB después de la escritura
        reloadDbCache();
        const db_updated = getDb();

        expect(res.statusCode).toBe(201);
        expect(res.body.network).toHaveProperty('name', 'Test Network');
        expect(db_updated.networks.length).toBe(initialCount + 1); // Verificar la longitud actualizada
    });

    it('2. should return 409 if a network with the same name already exists', async () => {
        // 1. Crear la red (persiste el cambio)
        await request(app).post('/api/networks').send(newNetwork);
        reloadDbCache();

        // 2. Intentar crear duplicado
        const res = await request(app).post('/api/networks').send(newNetwork);

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe('Ya existe una red con este nombre.');
    });

    it('3. should get a network by name', async () => {
        // Crear la red para la búsqueda
        await request(app).post('/api/networks').send(newNetwork);
        reloadDbCache();

        const res = await request(app).get('/api/networks/Test%20Network');
        expect(res.statusCode).toBe(200);
        expect(res.body.network).toHaveProperty('name', 'Test Network');
    });

    it('4. should successfully delete an existing network', async () => {
        // 1. Crear la red que se va a eliminar
        await request(app).post('/api/networks').send(networkToDelete);

        // Obtener el conteo inicial (debe ser 1, ya que beforeEach limpia antes)
        reloadDbCache();
        const db_initial = getDb();
        const initialCount = db_initial.networks.length;

        // 2. Ejecutar la eliminación
        const res = await request(app).delete(`/api/networks/${encodeURIComponent(networkToDelete.name)}`);

        // 💡 SINCRONIZACIÓN: Forzar la recarga después de la eliminación
        reloadDbCache();
        const db_updated = getDb();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Red eliminada con éxito.');
        expect(db_updated.networks.length).toBe(initialCount - 1); // Verificar la nueva longitud
    });

    it('5. should return 404 if the network to delete is not found', async () => {
        const res = await request(app).delete('/api/networks/NonExistentNetwork');
        expect(res.statusCode).toBe(404);
    });
});