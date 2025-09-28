import { removeRackFromWorkspace, getWorkspaceByName } from './workspaceController.js';
import { getServerByName } from './serverController.js'
import { db } from '../db/index.js';
import { rackSchema } from '../schemas/rackSchema.js';

export const createRack = (req, res) => {
  const { error } = rackSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, description, units, workspaceName } = req.body;

  if (!name || !workspaceName) {
    return res.status(400).json({ message: 'El nombre del rack y el nombre del workspace son obligatorios.' });
  }

  // Buscamos el workspace directamente en la base de datos simulada
  const workspace = db.workspaces.find(ws => ws.name === workspaceName);
  if (!workspace) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }

  const existingRack = db.racks.find(r => r.name === name && r.workspaceName === workspaceName);
  if (existingRack) {
    return res.status(409).json({ message: 'Ya existe un rack con este nombre en el workspace.' });
  }

  const newRack = {
    id: `rack-${db.racks.length + 1}`,
    name,
    description: description || '',
    units: units || 42,
    workspaceName,
    servers: [],
    fans: [],
    totalCost: 0,
    totalMaintenanceCost: 0,
  };

  db.racks.push(newRack);
  workspace.racks.push(newRack.name);

  res.status(201).json({ message: 'Rack creado con éxito', rack: newRack });
};

export const deleteRackByName = (req, res) => {
  const { name, workspaceName } = req.params;

  const rackIndex = db.racks.findIndex(r => r.name === name && r.workspaceName === workspaceName);

  if (rackIndex === -1) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }

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

  const rackIndex = db.racks.findIndex(r => r.name === name);
  if (rackIndex === -1) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }

  const updatedRack = { ...db.racks[rackIndex], ...updatedDetails };

  const { error } = rackSchema.validate(updatedRack);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  db.racks[rackIndex] = updatedRack;

  res.status(200).json({
    message: 'Rack actualizado con éxito',
    rack: db.racks[rackIndex]
  });
};

export const getRackByName = (req, res) => {
  const { name, workspaceName } = req.params;
  const rack = db.racks.find(r => r.name === name && r.workspaceName === workspaceName);

  if (!rack) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }

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
    const rack = db.racks.find(r => r.name === rackName);
    if (!rack) {
        return res.status(404).json({ message: 'Rack no encontrado.' });
    }

    // 2. Encontrar el servidor
    const server = db.servers.find(s => s.name === serverName);
    if (!server) {
        return res.status(404).json({ message: 'Servidor no encontrado.' });
    }

    // 3. Verificar si el servidor ya está en el rack
    if (rack.servers.includes(serverName)) {
        return res.status(409).json({ message: 'El servidor ya está en este rack.' });
    }
    
    // 4. Añadir el servidor al rack
    rack.servers.push(serverName);

    res.status(200).json({ 
        message: 'Servidor añadido al rack con éxito.', 
        rack 
    });
};

export const getRackMaintenanceCost = (req, res) => {
  const { name } = req.params;
  
  const rack = db.racks.find(r => r.name === name);
  if (!rack) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }

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