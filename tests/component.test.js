import request from 'supertest';
import { db } from '../src/db/index.js';
import { setupTestEnvironment } from './utils/setup.js';

const app = setupTestEnvironment();

describe('Component API (Simplified)', () => {

    it('should successfully create a new component', async () => {
        const newComponent = { type: 'RAM', name: 'DDR4 32GB', cost: 300, compatibleList: [] };
        const res = await request(app).post('/api/components').send(newComponent);


        expect(res.statusCode).toBe(201);
        expect(res.body.component).toHaveProperty('name', 'DDR4 32GB');
    });

    it('should not create a component with a duplicate name', async () => {
        // Step 1: Manually create a component that will serve as the duplicate.
        const originalComponent = { type: 'RAM', name: 'DDR4 32GB', cost: 300, compatibleList: [] };
        await request(app).post('/api/components').send(originalComponent);

        // Step 2: Attempt to create the same component again.
        const res = await request(app).post('/api/components').send(originalComponent);

        // Step 3: Verify the expected failure.
        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe('Ya existe un componente con este nombre.');
    });

    it('should get a component by name', async () => {
        const originalComponent = { type: 'CPU', name: 'Intel Xeon E-2434', cost: 360, compatibleList: [] };
        await request(app).post('/api/components').send(originalComponent);
        const res = await request(app).get('/api/components/Intel%20Xeon%20E-2434');

        expect(res.statusCode).toBe(200);
        expect(res.body.component).toHaveProperty('name', 'Intel Xeon E-2434');
    });

    it('should successfully update a component', async () => {
        const originalComponent = { type: 'CPU', name: 'Intel Xeon E-2434', cost: 360, compatibleList: [] };
        await request(app).post('/api/components').send(originalComponent);
        const updatedDetails = { cost: 1600, details: 'Precio actualizado' };
        const res = await request(app).put('/api/components/Intel%20Xeon%20E-2434').send(updatedDetails);

        expect(res.statusCode).toBe(200);
        expect(res.body.component.cost).toBe(1600);
        expect(res.body.component.details).toBe('Precio actualizado');
    });

    it('should successfully delete a component', async () => {        
        const originalComponent = { type: 'CPU', name: 'Intel Xeon E-2434', cost: 360, compatibleList: [] };
        await request(app).post('/api/components').send(originalComponent);
        
        const res = await request(app).delete('/api/components/Intel%20Xeon%20E-2434');

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Componente eliminado con éxito.');
        expect(db.components.length).toBe(11);
    });

    it('should return 404 when trying to delete a non-existent component', async () => {
        const res = await request(app).delete('/api/components/NonExistentComponent');

        expect(res.statusCode).toBe(404);
    });
});