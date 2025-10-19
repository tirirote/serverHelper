import { db } from '../db/index.js';
import { rackSchema } from '../schemas/rackSchema.js';
import { findWorkspaceByName } from './workspaceController.js';
import { findServerByName } from './serverController.js';

//AUX
export const findRackByName = (rackName, res) => {
  const rack = db.racks.find(r => r.name === rackName);
  if (!rack) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }
  return rack;
};

const findExistingRackByName = (name, workspaceName, res) => {
  const existingRack = db.racks.find(r => r.name === name && r.workspaceName === workspaceName);
  if (existingRack) {
    return res.status(409).json({ message: 'Ya existe un rack con este nombre en el workspace.' });
  }
  return existingRack;
};

const findRackIndexByWorkspace = (name, workspaceName, res) => {
  const rackIndex = db.racks.findIndex(r => r.name === name && r.workspaceName === workspaceName);

  if (rackIndex === -1) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }
  return rackIndex;
}

const findRackIndexByName = (name, res) => {
  const rackIndex = db.racks.findIndex(r => r.name === name);
  if (rackIndex === -1) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }
  return rackIndex;
}

const findExistingServerInRack = (serverName, rack, res) => {
  if (rack.servers.includes(serverName)) {
    return res.status(409).json({ message: 'El servidor ya está en este rack.' });
  }
};

const validateRack = (rack, res) => {

  const { error, value } = rackSchema.validate(rack, { abortEarly: false, stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: error.details.map(d => d.message) });
  }

  const { name, workspaceName } = value;

  if (!name || !workspaceName) {
    return res.status(400).json({ message: 'El nombre del rack y el nombre del workspace son obligatorios.' });
  }

  return value;
};

//API
export const createRack = (req, res) => {

  const { name, units, workspaceName, powerStatus, healthStatus } = validateRack(req.body, res);

  // Buscamos el workspace directamente en la base de datos simulada
  const workspace = findWorkspaceByName(workspaceName, res);

  findExistingRackByName(name, workspaceName, res);

  const newRack = {
    id: `rack-${db.racks.length + 1}`,
    name,
    units: units || 42,
    workspaceName,

    // Nuevos atributos con valores validados/por defecto
    powerStatus: powerStatus || 'Off',
    healthStatus: healthStatus || 'Unknown',

    servers: [],
    totalCost: 0,
    totalMaintenanceCost: 0,
  };

  db.racks.push(newRack);
  workspace.racks.push(newRack.name);

  res.status(201).json({ message: 'Rack creado con éxito', rack: newRack });
};

export const deleteRackByName = (req, res) => {
  const { name, workspaceName } = req.params;

  const rackIndex = findRackIndexByWorkspace(name, workspaceName, res);

  // Mutamos el array directamente
  db.racks.splice(rackIndex, 1);

  // Eliminar el rack del array de racks del workspace
  const workspace = db.workspaces.find(ws => ws.name === workspaceName);
  if (workspace) {
    const workspaceRackIndex = workspace.racks.indexOf(name);
    if (workspaceRackIndex > -1) {
      workspace.racks.splice(workspaceRackIndex, 1);
    }
  }

  res.status(200).json({ message: 'Rack eliminado con éxito.' });
};

export const updateRack = (req, res) => {
  const { name } = req.params;
  const updatedDetails = req.body;

  const rackIndex = findRackIndexByName(name, res);

  const updatedRack = { ...db.racks[rackIndex], ...updatedDetails };

  validateRack(updatedRack, res);

  db.racks[rackIndex] = updatedRack;

  res.status(200).json({
    message: 'Rack actualizado con éxito',
    rack: db.racks[rackIndex]
  });
};

export const getRackByName = (req, res) => {
  const { name, workspaceName } = req.params;

  const rack = findRackIndexByWorkspace(name, workspaceName, res)

  res.status(200).json({ rack });
};

export const getAllRacks = (req, res) => {
  const { workspaceName } = req.params;
  const racksInWorkspace = db.racks.filter(r => r.workspaceName === workspaceName);

  res.status(200).json({ racks: racksInWorkspace });
};

export const addServerToRack = (req, res) => {
  const { rackName, serverName } = req.body;

  // 1. Encontrar el rack
  const rack = findRackByName(rackName, res);

  // 2. Encontrar el servidor
  findServerByName(serverName, res);

  // 3. Verificar si el servidor ya está en el rack
  findExistingServerInRack(serverName, rack, res);

  // 4. Añadir el servidor al rack
  rack.servers.push(serverName);

  res.status(200).json({
    message: 'Servidor añadido al rack con éxito.',
    rack
  });
};

export const getRackMaintenanceCost = (req, res) => {
  const { name } = req.params;

  const rack = findRackByName(name, res)

  let totalMaintenanceCost = 0;

  // Iterar sobre los servidores en el rack
  rack.servers.forEach(serverName => {
    const server = db.servers.find(s => s.name === serverName);
    if (server && typeof server.totalMaintenanceCost === 'number') {
      totalMaintenanceCost += server.totalMaintenanceCost;
    }
  });

  res.status(200).json({ totalMaintenanceCost: totalMaintenanceCost.toFixed(2) });
};

export const toggleRackPower = (req, res) => {
  const { name } = req.params;

  const rack = findRackByName(name, res);

  // Cambiar el estado: 'On' si está 'Off', 'Off' si está 'On'.
  const newStatus = rack.powerStatus === 'On' ? 'Off' : 'On';
  rack.powerStatus = newStatus;

  // Aunque solo se cambia un campo, validamos por si acaso
  validateRack(rack, res);

  res.status(200).json({
    message: `Rack '${name}' encendido: ${newStatus}`,
    powerStatus: newStatus
  });
};