import request from 'supertest';
import { db } from '../src/db/index.js';
import { components as initialComponents } from '../src/db/componentData.js';
import { setupTestEnvironment } from './utils/setup.js';

const app = setupTestEnvironment();

// Restablecer la base de datos mock después de cada test
afterEach(() => {
    // La forma más segura es reasignar el array completo
    db.components = JSON.parse(JSON.stringify(initialComponents));
});

describe('Component API (Simplified)', () => {

    it('should successfully create a new component', async () => {
        // Los datos de prueba deben coincidir con el nuevo esquema
        const newComponent = {
            type: 'RAM',
            name: 'Test RAM',
            price: 100,
            compatibleList: [],
            maintenanceCost: 2.5,
            estimatedConsumption: 10,
            modelPath: './assets/models/ram.glb'
        };
        const res = await request(app).post('/api/components').send(newComponent);
        expect(res.statusCode).toBe(201);
        expect(res.body.component).toHaveProperty('name', 'Test RAM');
        // Validar que los nuevos campos también se guardan
        expect(res.body.component).toHaveProperty('maintenanceCost', 2.5);
    });

    it('should not create a component with a duplicate name', async () => {
        const originalComponent = { type: 'RAM', name: 'DDR4 32GB', price: 300 };
        // No es necesario crear el componente manualmente, el beforeEach lo hace.
        // Solo necesitamos que la BD tenga datos iniciales.
        const res = await request(app).post('/api/components').send(originalComponent);

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe('Ya existe un componente con este nombre.');
    });

    it('should get a component by name', async () => {
        const componentName = 'Intel Xeon E5-2690'; // Usar un componente de los datos iniciales
        const res = await request(app).get(`/api/components/${encodeURIComponent(componentName)}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.component).toHaveProperty('name', componentName);
    });

    it('should successfully update a component', async () => {
        const componentName = 'Intel Xeon E5-2690';
        const updatedDetails = { buyPrice: 1600, details: 'Precio y detalles actualizados' };
        const res = await request(app).put(`/api/components/${encodeURIComponent(componentName)}`).send(updatedDetails);

        expect(res.statusCode).toBe(200);
        expect(res.body.component.buyPrice).toBe(1600);
        expect(res.body.component.details).toBe('Precio y detalles actualizados');
    });

    it('should successfully delete a component', async () => {
        const componentName = 'Intel Xeon E5-2690';
        const initialCount = db.components.length;
        const res = await request(app).delete(`/api/components/${encodeURIComponent(componentName)}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Componente eliminado con éxito.');
        // Esperamos que la longitud del array sea uno menos
        expect(db.components.length).toBe(initialCount - 1);
    });

    it('should return all components in the database', async () => {
        const res = await request(app).get('/api/components');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.components)).toBe(true);
        expect(res.body.components.length).toBe(initialComponents.length);
        expect(res.body.components[0]).toHaveProperty('name');
    });

    it('should return 404 when trying to delete a non-existent component', async () => {
        const res = await request(app).delete('/api/components/NonExistentComponent');
        expect(res.statusCode).toBe(404);
    });

    // --- NUEVOS TESTS ---

    it('should get the maintenance cost of a component by name', async () => {
        const componentName = 'Intel Xeon E5-2690';
        const res = await request(app).get(`/api/components/${encodeURIComponent(componentName)}/maintenance-cost`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('maintenanceCost');
        expect(res.body.maintenanceCost).toBe(15.0); // Valor del mock
    });

    it('should get the 3D model path of a component by name', async () => {
        const componentName = 'DDR4 32GB';
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