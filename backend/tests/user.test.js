import request from 'supertest';
import { db } from '../src/db/index.js';
import { setupTestEnvironment } from './utils/setup.js'
// Configuración de un servidor de prueba
const app = setupTestEnvironment();

describe('User Service API', () => {

    // Test para crear un usuario exitosamente
    it('should create a new user', async () => {
        const newUser = { username: 'testuser', password: 'password123' };
        const res = await request(app)
            .post('/api/users')
            .send(newUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe('testuser');
        expect(db.users.length).toBe(1);
    });

    // Test para evitar crear un usuario con un nombre de usuario duplicado
    it('should not create a user with a duplicate username', async () => {
        db.users.push({ username: 'existinguser', password: 'password123' });
        const res = await request(app)
            .post('/api/users')
            .send({ username: 'existinguser', password: 'password123' });

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'El nombre de usuario ya existe.');
    });

    // Test para obtener todos los usuarios
    it('should get all users', async () => {
        db.users.push({ username: 'user1', password: 'pass1' });
        db.users.push({ username: 'user2', password: 'pass2' });
        const res = await request(app).get('/api/users');

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).not.toHaveProperty('password'); // Asegura que la contraseña no se expone
    });

    // Test para actualizar un usuario
    it('should update an existing user', async () => {
        db.users.push({ username: 'userToUpdate', password: 'oldpassword' });
        const res = await request(app)
            .put('/api/users/userToUpdate')
            .send({ newPassword: 'newpassword' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.user.password).toBe('newpassword');
    });

    // Test para eliminar un usuario
    it('should delete an existing user', async () => {
        db.users.push({ username: 'userToDelete', password: 'pass' });
        const res = await request(app)
            .delete('/api/users/userToDelete');

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Usuario eliminado con éxito.');
        expect(db.users.length).toBe(0);
    });

    // Test para manejar la eliminación de un usuario no existente
    it('should return 404 when trying to delete a non-existent user', async () => {
        const res = await request(app)
            .delete('/api/users/nonexistentUser');

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Usuario no encontrado.');
    });
});