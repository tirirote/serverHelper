import { db } from '../db/index.js';
import { userSchema } from '../schemas/userSchema.js';

export const createUser = (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password } = req.body;
  const existingUser = db.users.find(user => user.username === username);

  if (existingUser) {
    return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
  }

  const newUser = { username, password };
  db.users.push(newUser);
  res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
};

export const deleteUser = (req, res) => {
  const { username } = req.params;
  const initialLength = db.users.length;
  
  db.users = db.users.filter(user => user.username !== username);

  if (db.users.length === initialLength) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  res.status(200).json({ message: 'Usuario eliminado con éxito.' });
};

export const updateUser = (req, res) => {
  const { username } = req.params;
  const { newPassword, newUsername } = req.body;

  const user = db.users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  const { error } = userSchema.validate({ username: newUsername || user.username, password: newPassword || user.password });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (newUsername) {
    user.username = newUsername;
  }
  if (newPassword) {
    user.password = newPassword;
  }

  res.status(200).json({ message: 'Usuario actualizado con éxito', user });
};

export const getAllUsers = (req, res) => {
  const usersWithoutPasswords = db.users.map(user => {
    const { password, ...rest } = user;
    return rest;
  });
  res.status(200).json(usersWithoutPasswords);
};

export const getUserByUsername = (req, res) => {
  const { username } = req.params;
  const user = db.users.find(u => u.username === username);
  
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  const { password, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
};