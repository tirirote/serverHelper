import request from 'supertest';
import { initialDBData } from '../src/db/sampleDBData.js';
import { setupTestEnvironment } from './utils/setup.js';

//BD
import { getDb, closeDbWatchers } from '../src/db/dbLoader.js';
import { saveCollectionToDisk } from '../src/db/dbUtils.js';

const app = setupTestEnvironment();
afterAll(() => {
    closeDbWatchers();
});

describe('Component API (Simplified)', () => {

    it('should successfully create a new component', async () => {
        const newComponent = {
            type: 'RAM',
            name: 'Test RAM',
            price: 100,
            compatibleList: [],
            maintenanceCost: 2.5,
            estimatedConsumption: 10,
            modelPath: './assets/models/ram.glb'
        };

        // 2. Ejecutar la escritura (guarda en disco)
        const res = await request(app).post('/api/components').send(newComponent);

        // 3. Forzar la sincronización (obtener la nueva referencia)
        const db_updated = getDb();

        expect(res.statusCode).toBe(201);
        expect(res.body.component).toHaveProperty('name', 'Test RAM');

        // 4. Verificar la longitud con la nueva referencia
        expect(db_updated.components.length).toBe(initialDBData.components.length + 1);
    });

    it('should successfully delete a component', async () => {
        const componentName = 'Intel Xeon E5';

        // 1. Obtener la longitud inicial
        const db_initial = getDb();
        const initialCount = db_initial.components.length;

        // 2. Ejecutar la eliminación (guarda en disco)
        const res = await request(app).delete(`/api/components/${encodeURIComponent(componentName)}`);

        // 3. Forzar la sincronización
        const db_updated = getDb();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Componente eliminado con éxito.');

        // 4. Verificar la longitud con la nueva referencia
        expect(db_updated.components.length).toBe(initialDBData.components.length - 1);
    });

    it('should get a component by name', async () => {
        const componentName = 'Intel Xeon E5'; // Usar un componente de los datos iniciales
        const res = await request(app).get(`/api/components/${encodeURIComponent(componentName)}`);
        const db_updated = getDb();
        expect(res.statusCode).toBe(200);
        expect(res.body.component).toHaveProperty('name', componentName);
    });

    it('should successfully update a component', async () => {
        const componentName = 'Intel Xeon E5';
        const updatedDetails = { type: 'CPU', price: 1600, details: 'Precio y detalles actualizados' };
        const res = await request(app).put(`/api/components/${encodeURIComponent(componentName)}`).send(updatedDetails);

        expect(res.statusCode).toBe(200);
        expect(res.body.component.price).toBe(1600);
        expect(res.body.component.details).toBe('Precio y detalles actualizados');
    });

    it('should return all components in the database', async () => {
        const res = await request(app).get('/api/components');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.components)).toBe(true);
        expect(res.body.components.length).toBe(initialDBData.components.length);
        expect(res.body.components[0]).toHaveProperty('name');
    });

    it('should return 404 when trying to delete a non-existent component', async () => {
        const res = await request(app).delete('/api/components/NonExistentComponent');
        expect(res.statusCode).toBe(404);
    });

    it('should get the maintenance cost of a component by name', async () => {
        const componentName = 'Intel Xeon E5';
        const res = await request(app).get(`/api/components/${encodeURIComponent(componentName)}/maintenance-cost`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('maintenanceCost');
        expect(res.body.maintenanceCost).toBe(5); // Valor del mock
    });

    it('should get the 3D model path of a component by name', async () => {
        const componentName = 'DDR4 ECC 32GB';
        const res = await request(app).get(`/api/components/${encodeURIComponent(componentName)}/model-path`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('modelPath');
        expect(res.body.modelPath).toBe('/assets/models/ram.glb'); // Valor del mock
    });

    it('should return 404 for a non-existent component when getting model path', async () => {
        const res = await request(app).get('/api/components/NonExistentComponent/model-path');
        expect(res.statusCode).toBe(404);
    });
});