import { networkSchema } from '../schemas/networkSchema.js';
//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk } from '../db/dbUtils.js';


//AUX
export const findNetworkByName = async (name) => {
  const db = await getDb();
  const network = db.networks.find(n => n.name === name);
  if (!network) {
    const error = new Error('Red no encontrada.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }
  return network;
};

export const findExistingNetworkByName = async (name, res) => {
  const db = await getDb();
  const existingNetwork = db.networks.find(n => n.name === name);
  if (existingNetwork) {
    const error = new Error('Ya existe una red con este nombre.');
    error.status = 409; // 💡 Adjuntar status
    throw error;
  }
  return existingNetwork;
};

//API
export const createNetwork = async (req, res) => {
  try {
    const db = await getDb();
    const networks = [...db.networks];

    const { error } = networkSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name } = req.body;

    const existingError = await findExistingNetworkByName(name);
    if (existingError) {
      return existingError; // Detener la ejecución y devolver 409
    }

    const newNetwork = {
      id: `net-${networks.length + 1}`,
      ...req.body,
    };

    networks.push(newNetwork);
    await saveCollectionToDisk(networks, 'networks');
    res.status(201).json({ message: 'Red creada con éxito', network: newNetwork });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || 'Error interno del servidor.'
    });
  }

};

export const deleteNetworkByName = async (req, res) => {
  try {
    const db = await getDb();
    const networks = [...db.networks]; // Crear una copia para la modificación
    const { name } = req.params;

    const initialLength = networks.length;

    // Filtrar la copia
    const updatedNetworks = networks.filter(n => n.name !== name);

    if (updatedNetworks.length === initialLength) {
      return res.status(404).json({ message: 'Red no encontrada.' });
    }

    // 💡 PERSISTENCIA EN DISCO
    await saveCollectionToDisk(updatedNetworks, 'networks');

    res.status(200).json({ message: 'Red eliminada con éxito.' });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || 'Error interno del servidor.'
    });
  }
};

export const getNetworkByName = async (req, res) => {
  const { name } = req.params;

  const network = await findNetworkByName(name, res);

  if (network.statusCode) {
    return network;
  }

  return res.status(200).json({ network });
};

export const getAllNetworks = async (req, res) => {
  const db = await getDb();
  res.status(200).json({ networks: db.networks });
};