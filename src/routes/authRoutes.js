import { Router } from 'express';
import { signUp, logIn } from '../controllers/authorizationController.js';

const router = Router();

// Ruta para el registro de usuarios
router.post('/signup', signUp);

// Ruta para el inicio de sesión
router.post('/login', logIn);

export default router;