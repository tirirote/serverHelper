import { userSchema } from '../schemas/userSchema.js';
//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk } from '../db/dbUtils.js';


//AUX
const findUserByName = async (name) => {
  const db = await getDb();

  const user = db.users.find(u => u.username === name);

  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }
  return user;
};

const findUserIndexByName = async (name) => {
  const db = await getDb();

  const userIndex = db.users.findIndex(u => u.username === name);

  if (userIndex === -1) {
    const error = new Error('Usuario no encontrado.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }
  return userIndex;
};

const findExistingUserByName = async (username) => {
  const db = await getDb();

  const existingUser = db.users.find(user => user.username === username);

  if (existingUser) {
    const error = new Error('El nombre de usuario ya existe.');
    error.status = 409; // 💡 Adjuntar status
    throw error;
  }
};

const validateUser = (user, res) => {
  const { error, value } = userSchema.validate(user, { stripUnknown: true });
  if (error) {
    const error = new Error(error.details[0].message);
    error.status = 400; // 💡 Adjuntar status
    throw error;
  }
  return value;
}

//API
export const createUser = async (req, res) => {
  try {

    const db = await getDb();
    const users = [...db.users];

    const { username, password } = req.body;
    //1. Validamos el esquema del usuario.
    const userToValidate = {
      username,
      password
    }

    const validUser = validateUser(userToValidate);

    //2. Comprobamos la existencia del usuario
    await findExistingUserByName(username);

    // 5. Creación del objeto final (ya validado)
    const newUser = {
      ...validUser
    };

    // 4. PERSISTENCIA EN DISCO
    users.push(newUser);
    await saveCollectionToDisk(users, 'users');

    const { password: _, ...userToReturn } = newUser;

    res.status(201).json({
      message: 'Usuario creado con éxito',
      user: userToReturn
    });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }


};

export const deleteUser = async (req, res) => {
  try {
    const db = await getDb();
    const users = [...db.users];
    const { username } = req.params;
    const initialLength = users.length;

    const updatedUsers = users.filter(user => user.username !== username);

    if (updatedUsers.length === initialLength) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await saveCollectionToDisk(updatedUsers, 'users');
    res.status(200).json({ message: 'Usuario eliminado con éxito.' });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const db = await getDb();
    const users = [...db.users];

    const { username } = req.params;
    const { newPassword, newUsername } = req.body;

    // 1. Buscar el usuario y su índice.
    // Asumimos que findUserByName devuelve el objeto 'user' o 'res' (si es 404).
    let userToUpdate = await findUserByName(username);
    if (userToUpdate === res) return; // Error 404 manejado por findUserByName

    // Asumimos que findUserIndexByName devuelve el índice o maneja el error internamente
    const userIndex = await findUserIndexByName(username);
    if (userIndex === res) return; // Error 404 manejado por findUserIndexByName (si es necesario)

    // 2. Aplicar las actualizaciones a una copia del usuario, manteniendo los campos originales.
    const updatedFields = {};
    if (newUsername) updatedFields.username = newUsername;
    if (newPassword) updatedFields.password = newPassword;

    // 3. Crear el objeto preliminar a validar, combinando el original con los cambios.
    const preliminaryUser = {
      ...userToUpdate,
      ...updatedFields
    };

    // 4. Validar el esquema del usuario final.
    // Asumimos que validateUser devuelve el objeto validado O 'res' (si es 400).
    const validatedUserResult = validateUser(preliminaryUser);

    if (validatedUserResult === res) return; // Error 400 manejado por validateUser

    // 💡 El resultado validado es el usuario final.
    const updatedUser = validatedUserResult;

    // 5. Mutar la copia de la colección 'users'.
    users[userIndex] = updatedUser;

    await saveCollectionToDisk(users, 'users');

    res.status(200).json({
      message: 'Usuario actualizado con éxito',
      user: updatedUser
    });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }
};

export const getAllUsers = async (req, res) => {
  const db = await getDb();

  const usersWithoutPasswords = db.users.map(user => {
    const { password, ...rest } = user;
    return rest;
  });

  res.status(200).json(usersWithoutPasswords);
};

export const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  const user = await findUserByName(username, res);

  const { password, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
};