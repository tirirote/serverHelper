import request from 'supertest';

//DB
import { getDb, closeDbWatchers } from '../src/db/dbLoader.js';
import { resetTestDB } from '../src/db/dbUtils.js';
import { createApp } from '../src/app.js';

// Configuración de un servidor de prueba
const app = createApp();

beforeEach(() => {
    const db = getDb();
    resetTestDB(db);
});

afterAll(() => {    
    closeDbWatchers();
});

describe('User Service API', () => {

    // Test para crear un usuario exitosamente
    it('should create a new user', async () => {
        const newUser = { username: 'testuser', password: 'password123' };
        const res = await request(app)
            .post('/api/users')
            .send(newUser);
        const db_updated = getDb();

        expect(res.statusCode).toEqual(201);
        expect(res.body.user).toHaveProperty('username');
        expect(res.body.user.username).toBe('testuser');
        expect(db_updated.users.length).toBe(1);
    });

    // Test para evitar crear un usuario con un nombre de usuario duplicado
    it('should not create a user with a duplicate username', async () => {
        const db = getDb();
        const sameUser = { username: 'sameUser', password: 'password123' };
        //1. Creamos el usuario
        await request(app).post('/api/users').send(sameUser);
        //2. Lo creamos otra vez
        const res = await request(app).post('/api/users').send(sameUser);

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'El nombre de usuario ya existe.');
    });

    // Test para obtener todos los usuarios
    it('should get all users', async () => {
        await request(app).post('/api/users').send({ username: 'user1', password: 'password123' });
        await request(app).post('/api/users').send({ username: 'user2', password: 'password123' });
        const res = await request(app).get('/api/users');

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).not.toHaveProperty('password'); // Asegura que la contraseña no se expone
    });

    // Test para actualizar un usuario
    it('should update an existing user', async () => {
        const newUser = { username: 'userToUpdate', password: 'password123' };
        await request(app).post('/api/users').send(newUser);
        const res = await request(app).put('/api/users/userToUpdate').send({ newPassword: 'newpassword' });


        expect(res.statusCode).toEqual(200);
        expect(res.body.user.password).toBe('newpassword');
    });

    // Test para eliminar un usuario
    it('should delete an existing user', async () => {
        const newUser = { username: 'userToDelete', password: 'password123' };
        await request(app).post('/api/users').send(newUser);

        const res = await request(app)
            .delete('/api/users/userToDelete');

        const db_updated = getDb();

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Usuario eliminado con éxito.');
        expect(db_updated.users.length).toBe(0);
    });

    // Test para manejar la eliminación de un usuario no existente
    it('should return 404 when trying to delete a non-existent user', async () => {
        const res = await request(app)
            .delete('/api/users/nonexistentUser');

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Usuario no encontrado.');
    });
});