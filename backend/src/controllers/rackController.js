import { removeRackFromWorkspace, getWorkspaceByName } from './workspaceController.js';
import { getServerByName } from './serverController.js'
import { db } from '../db/index.js';
import { rackSchema } from '../schemas/rackSchema.js';
import { getServerMaintenanceCost } from './serverController.js';

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
    maintenanceCost: 0,
  };

  db.racks.push(newRack);
  workspace.racks.push(newRack.name);

  res.status(201).json({ message: 'Rack creado con éxito', rack: newRack });
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

export const addServerToRack = (req, res) => {
  const { workspaceName, rackName, serverName } = req.body;

  // 1. Validar si el rack existe en el workspace
  const workspace = getWorkspaceByName(req, res);
  if (res.statusCode !== 200) return;

  const rack = db.racks.find(r => r.name === rackName && r.workspaceName === workspaceName);
  if (!rack) {
    return res.status(404).json({ message: 'Rack no encontrado en el workspace.' });
  }

  // 2. Validar si el servidor existe
  const server = getServerByName(req, res);
  if (res.statusCode !== 200) return;

  // 3. Validar si hay suficiente espacio en el rack para el servidor (asumiendo que los servidores tienen una altura en U)
  const serverUnits = server.units || 1; // Asumimos 1U por defecto para la demo
  const usedUnits = rack.servers.reduce((sum, s) => sum + (s.units || 1), 0);
  const remainingUnits = rack.units - usedUnits;

  if (serverUnits > remainingUnits) {
    return res.status(400).json({ message: 'No hay suficiente espacio en el rack para este servidor.' });
  }

  // 4. Agregar el servidor al rack
  rack.servers.push({ name: server.name, units: serverUnits });

  // 5. Recalcular el coste total del rack
  rack.totalCost += server.totalCost;

  res.status(200).json({
    message: 'Servidor añadido al rack con éxito.',
    rack: rack
  });
};

export const getMaintenanceCost = (req, res) => {
    const { workspaceName, rackName } = req.params;

    const rack = db.racks.find(r => r.name === rackName && r.workspaceName === workspaceName);
    if (!rack) {
        return res.status(404).json({ message: 'Rack no encontrado.' });
    }

    let totalMaintenanceCost = 0;

    // Iterar sobre los servidores del rack
    rack.servers.forEach(serverName => {
        const server = db.servers.find(s => s.name === serverName);
        if (server) {
            // Usamos el método auxiliar para obtener el coste de cada servidor
            totalMaintenanceCost += getServerMaintenanceCost(server);
        }
    });

    res.status(200).json({ totalMaintenanceCost: totalMaintenanceCost.toFixed(2) });
};