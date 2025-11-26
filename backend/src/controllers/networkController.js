import { networkSchema } from '../schemas/networkSchema.js';
//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk } from '../db/dbUtils.js';


//AUX
export const findNetworkByName = (name, res) => {
  const db = getDb();
  const network = db.networks.find(n => n.name === name);
  if (!network) {
    return res.status(404).json({ message: 'Red no encontrada.' });
  }
  return network;
};

export const findExistingNetworkByName = (name, res) => {
  const db = getDb();
  const existingNetwork = db.networks.find(n => n.name === name);
  if (existingNetwork) {
    return res.status(409).json({ message: 'Ya existe una red con este nombre.' });
  }
  return existingNetwork;
};

//API
export const createNetwork = (req, res) => {
  const db = getDb();
  const networks = [...db.networks];

  const { error } = networkSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name } = req.body;

  const existingError = findExistingNetworkByName(name, res);
  if (existingError) {
    return existingError; // Detener la ejecución y devolver 409
  }

  const newNetwork = {
    id: `net-${networks.length + 1}`,
    ...req.body,
  };

  networks.push(newNetwork);
  saveCollectionToDisk(networks, 'networks');
  res.status(201).json({ message: 'Red creada con éxito', network: newNetwork });
};

export const deleteNetworkByName = (req, res) => {
  const db = getDb();
  const networks = [...db.networks]; // Crear una copia para la modificación
  const { name } = req.params;

  const initialLength = networks.length;

  // Filtrar la copia
  const updatedNetworks = networks.filter(n => n.name !== name);

  if (updatedNetworks.length === initialLength) {
    return res.status(404).json({ message: 'Red no encontrada.' });
  }

  // 💡 PERSISTENCIA EN DISCO
  saveCollectionToDisk(updatedNetworks, 'networks');

  res.status(200).json({ message: 'Red eliminada con éxito.' });
};

export const getNetworkByName = (req, res) => {
  const { name } = req.params;

  const network = findNetworkByName(name, res);

  if (network.statusCode) {
    return network;
  }

  return res.status(200).json({ network });
};

export const getAllNetworks = (req, res) => {
  const db = getDb();
  res.status(200).json({ networks: db.networks });
};