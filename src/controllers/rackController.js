import { removeRackFromWorkspace, getWorkspaceByName } from './workspaceController.js';
// Simulación de la base de datos de racks
let racks = [];

// Importación para interactuar con los workspaces (simulado)

export const createRack = (req, res) => {
  const { name, description, units, workspaceName } = req.body;
  
  if (!name || !workspaceName) {
    return res.status(400).json({ message: 'El nombre del rack y el nombre del workspace son obligatorios.' });
  }

  const workspace = getWorkspaceByName(req, res); // Reutilizamos la función del workspaceController
  if (res.statusCode !== 200) return; // Si no se encuentra el workspace, getWorkspaceByName ya envió una respuesta de error

  const existingRack = racks.find(r => r.name === name && r.workspaceName === workspaceName);
  if (existingRack) {
    return res.status(409).json({ message: 'Ya existe un rack con este nombre en el workspace.' });
  }

  const newRack = { 
    id: `rack-${racks.length + 1}`,
    name, 
    description: description || '',
    units: units || 42,
    workspaceName,
    servers: [],
    fans: [], // Opcional, pero se puede incluir por defecto para la demo
    totalCost: 0,
    maintenanceCost: 0,
  };
  
  racks.push(newRack);
  workspace.racks.push(newRack.name); // Añadimos el rack al workspace
  
  res.status(201).json({ message: 'Rack creado con éxito', rack: newRack });
};

export const getRackByName = (req, res) => {
  const { name, workspaceName } = req.params;
  const rack = racks.find(r => r.name === name && r.workspaceName === workspaceName);

  if (!rack) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }

  res.status(200).json({ rack });
};

export const getAllRacks = (req, res) => {
  const { workspaceName } = req.params;
  const racksInWorkspace = racks.filter(r => r.workspaceName === workspaceName);
  
  res.status(200).json({ racks: racksInWorkspace });
};

export const deleteRackByName = (req, res) => {
  const { name, workspaceName } = req.params;
  
  const initialLength = racks.length;
  racks = racks.filter(r => !(r.name === name && r.workspaceName === workspaceName));

  if (racks.length === initialLength) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }

  // Eliminar el rack del array de racks del workspace
  removeRackFromWorkspace(workspaceName, name);

  res.status(200).json({ message: 'Rack eliminado con éxito.' });
};
