import { db } from '../db/index.js';
import { networkSchema } from '../schemas/networkSchema.js';

export const createNetwork = (req, res) => {
  const { error } = networkSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name } = req.body;
  const existingNetwork = db.networks.find(n => n.name === name);
  if (existingNetwork) {
    return res.status(409).json({ message: 'Ya existe una red con este nombre.' });
  }

  const newNetwork = {
    id: `net-${db.networks.length + 1}`,
    ...req.body,
  };

  db.networks.push(newNetwork);
  res.status(201).json({ message: 'Red creada con éxito', network: newNetwork });
};

export const deleteNetworkByName = (req, res) => {
  const { name } = req.params;
  const initialLength = db.networks.length;
  db.networks = db.networks.filter(n => n.name !== name);

  if (db.networks.length === initialLength) {
    return res.status(404).json({ message: 'Red no encontrada.' });
  }
  res.status(200).json({ message: 'Red eliminada con éxito.' });
};

export const getNetworkByName = (req, res) => {
  const { name } = req.params;
  const network = db.networks.find(n => n.name === name);
  if (!network) {
    return res.status(404).json({ message: 'Red no encontrada.' });
  }
  res.status(200).json({ network });
};

export const getAllNetworks = (req, res) => {
  res.status(200).json({ networks: db.networks });
};