import { db } from '../db/index.js';

export const createUser = (userData) => {
  const { username, password } = userData;
  
  if (!username || !password) {
    throw new Error('Username y password son obligatorios.');
  }

  const existingUser = db.users.find(user => user.username === username);
  if (existingUser) {
    throw new Error('El nombre de usuario ya existe.');
  }

  const newUser = { username, password }; // En un proyecto real, se encriptaría la contraseña aquí.
  db.users.push(newUser);
  return newUser;
};

export const deleteUser = (username) => {
  const initialLength = db.users.length;
  db.users = db.users.filter(user => user.username !== username);
  
  if (db.users.length === initialLength) {
    return false; // Usuario no encontrado
  }
  return true; // Usuario eliminado
};

export const updateUser = (username, newPassword, newUsername) => {
  const user = db.users.find(u => u.username === username);
  if (user) {
    user.password = newPassword; // O el campo que se quiera actualizar
    user.username = newUsername;
    return user;
  }
  return null; // Usuario no encontrado
};

export const getAllusers = () => {
  return db.users.map(user => {
    const { password, ...rest } = user;
    return rest;
  });
};

export const getUserByUsername = (username) => {
  return db.users.find(user => user.username === username);
};