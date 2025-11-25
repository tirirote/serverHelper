import { userSchema } from '../schemas/userSchema.js';
//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk } from '../db/dbUtils.js';


//AUX
const findUserByName = (username, res) => {

  const db = getDb();
  const user = db.users.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  return user;
};

const findUserIndexByName = (username, res) => {

  const db = getDb();
  const userIndex = db.users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }
  return userIndex;
};

const findExistingUserByName = (username, res) => {

  const db = getDb();
  const existingUser = db.users.find(user => user.username === username);

  if (existingUser) {
    return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
  }
};

const validateUser = (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  return value;
}

//API
export const createUser = (req, res) => {
  try {

    const db = getDb();
    const users = [...db.users];

    //1. Validamos el esquema del usuario.
    const validUser = validateUser(req, res);

    const { username, password } = validUser;

    //2. Comprobamos la existencia del usuario
    const existingUser = findExistingUserByName(username, res);
    if (existingUser == res) return;

    // 5. Creación del objeto final (ya validado)
    const newUser = {
      username,
      password
    };

    // 4. PERSISTENCIA EN DISCO
    users.push(newUser);
    saveCollectionToDisk(users, 'users');
    res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }


};

export const deleteUser = (req, res) => {

  const db = getDb();
  const { username } = req.params;
  const initialLength = db.users.length;

  db.users = db.users.filter(user => user.username !== username);

  if (db.users.length === initialLength) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  res.status(200).json({ message: 'Usuario eliminado con éxito.' });
};

export const updateUser = (req, res) => {

  try {
    const db = getDb();
    const users = [...db.users];
    const { userName } = req.params;
    const { newPassword, newUsername } = req.body;
    //1. Validamos el esquema del usuario.
    const foundUser = findUserByName(userName, res);

    if (newUsername && newPassword) foundUser = { username: newUsername, password: newPassword }

    const updatedUser = validateUser(foundUser, res);

    users[userIndex] = updatedUser;

    res.status(200).json({ message: 'Usuario actualizado con éxito', user });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }


};

export const getAllUsers = (req, res) => {

  const db = getDb();
  const usersWithoutPasswords = db.users.map(user => {
    const { password, ...rest } = user;
    return rest;
  });
  res.status(200).json(usersWithoutPasswords);
};

export const getUserByUsername = (req, res) => {

  const { username } = req.params;

  const user = findUserByName(username, res);

  const { password, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
};