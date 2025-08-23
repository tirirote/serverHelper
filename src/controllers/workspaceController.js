import { db } from '../db/index.js';

export const createWorkspace = (req, res) => {
  const { name, description } = req.body;
  
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
    racks: []
  };
  db.workspaces.push(newWorkspace);
  
  res.status(201).json({ message: 'Workspace creado con éxito', workspace: newWorkspace });
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