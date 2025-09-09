import { createUser, getUserByUsername } from './userController.js';


export const signUp = (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = createUser({ username, password });
    res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logIn = (req, res) => {
  const { username, password } = req.body;
  
  const user = getUserByUsername(username);
  
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  
  if (user.password !== password) {
    return res.status(401).json({ message: 'Contraseña incorrecta' }); 
  }
  
  res.status(200).json({ message: 'Inicio de sesión exitoso', user: user });
};

export const logOut = (req, res) => {
  res.status(200).json({ message: 'Sesión cerrada con éxito' });
};