import { db } from '../db/index.js';
import { workspaceSchema } from '../schemas/workspaceSchema.js';

export const createWorkspace = (req, res) => {

  const { name, description, network } = req.body;

  const existingNetwork = db.networks.find(n => n.name === network);
  if (!existingNetwork) {
    return res.status(400).json({ message: `La red "${network}" no existe.` });
  }

  const { error } = workspaceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (!name) {
    return res.status(400).json({ message: 'El nombre del workspace es obligatorio.' });
  }

  const existingWorkspace = db.workspaces.find(ws => ws.name === name);
  if (existingWorkspace) {
    return res.status(409).json({ message: 'Ya existe un workspace con este nombre.' });
  }

  const newWorkspace = {
    name,
    description: description || '',
    racks: [],
    network
  };
  db.workspaces.push(newWorkspace);
  res.status(201).json({ message: 'Workspace creado con éxito', workspace: newWorkspace });
};

export const updateWorkspace = (req, res) => {
  const { name } = req.params;
  const updatedDetails = req.body;

  const workspaceIndex = db.workspaces.findIndex(w => w.name === name);
  if (workspaceIndex === -1) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }

  const updatedWorkspace = { ...db.workspaces[workspaceIndex], ...updatedDetails };

  const { error } = workspaceSchema.validate(updatedWorkspace);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  db.workspaces[workspaceIndex] = updatedWorkspace;

  res.status(200).json({
    message: 'Workspace actualizado con éxito',
    workspace: db.workspaces[workspaceIndex]
  });
};

export const deleteWorkspaceByName = (req, res) => {
  const { name } = req.params;
  const initialLength = db.workspaces.length;

  db.workspaces = db.workspaces.filter(w => w.name !== name);

  if (db.workspaces.length === initialLength) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }

  res.status(200).json({ message: 'Workspace eliminado con éxito.' });
};

export const getWorkspaceByName = (req, res) => {
  const { name } = req.params;
  const workspace = db.workspaces.find(ws => ws.name === name);

  if (!workspace) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }

  res.status(200).json({ workspace });
};

export const getAllWorkspaces = (req, res) => {
  const workspaces = db.workspaces
  res.status(200).json({ workspaces });
};

export const addRackToWorkspace = (req, res) => {
  const { workspaceName, rackName } = req.body;

  // 1. Encontrar el workspace
  const workspace = db.workspaces.find(w => w.name === workspaceName);
  if (!workspace) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }

  // 2. Encontrar el rack
  const rack = db.racks.find(r => r.name === rackName);
  if (!rack) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }

  // 3. Verificar que el rack no esté ya en el workspace
  if (workspace.racks.includes(rackName)) {
    return res.status(409).json({ message: 'El rack ya está en este workspace.' });
  }

  // 4. Añadir el rack al workspace
  workspace.racks.push(rackName);

  res.status(200).json({
    message: 'Rack añadido al workspace con éxito.',
    workspace
  });
};

export const getAllCurrentRacks = (req, res) => {
  const { name } = req.params;
  const workspace = db.workspaces.find(ws => ws.name === name);

  if (!workspace) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }

  // En un proyecto real, aquí obtendrías los racks por su ID desde el servicio de Racks.
  res.status(200).json({ racks: workspace.racks });
};

export const removeRackFromWorkspace = (workspaceName, rackName) => {
  const workspace = db.workspaces.find(ws => ws.name === workspaceName);
  if (workspace) {
    const initialRackCount = workspace.racks.length;
    workspace.racks = workspace.racks.filter(rack => rack !== rackName);
    return workspace.racks.length < initialRackCount; // Devuelve true si se eliminó algo
  }
  return false;
};