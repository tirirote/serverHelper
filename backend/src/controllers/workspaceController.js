import { workspaceSchema } from '../schemas/workspaceSchema.js';
import { findNetworkByName } from './networkController.js';
//BD
import { saveCollectionToDisk } from '../db/dbUtils.js';
import { getDb } from '../db/dbLoader.js';

//AUX
const validateWorkspace = (workspaceToValidate, res) => {
  const { error, value } = workspaceSchema.validate(workspaceToValidate, { stripUnknown: true });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (!workspaceToValidate.name) {
    return res.status(400).json({ message: 'El nombre del workspace es obligatorio.' });
  }
  return value;
};

const findExistingWorkspaceByName = (name, res) => {

  const db = getDb();
  const existingWorkspace = db.workspaces.find(ws => ws.name === name);
  if (existingWorkspace) {
    return res.status(409).json({ message: 'Ya existe un workspace con este nombre.' });
  }
}

export const findWorkspaceByName = (name, res) => {
  const db = getDb();

  const workspace = db.workspaces.find(ws => ws.name === name);

  if (!workspace) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }
  return workspace;
}

const findWorkspaceIndexByName = (name, res) => {

  const db = getDb();
  const workspaceIndex = db.workspaces.findIndex(w => w.name === name);

  if (workspaceIndex === -1) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }
  return workspaceIndex;
};

//API
export const createWorkspace = (req, res) => {

  try {
    const db = getDb();
    const workspaces = [...db.workspaces];
    const { name, description, network } = req.body;

    // 1. Verificar existencia de la Network (respuesta rápida)
    const existingNetwork = findNetworkByName(network, res);
    if (existingNetwork === res) return;


    //2. Creamos el workspace
    const newWorkspace = {
      name,
      description: description || '',
      racks: [],
      network
    };

    //3. Verificamos la validez del workspace
    const validWorkspace = validateWorkspace(newWorkspace, res);
    if (validWorkspace === res) return;

    //3. Verificar la existencia el workspace
    const existingWorkspace = findExistingWorkspaceByName(validWorkspace.name, res);
    if (existingWorkspace === res) return;

    workspaces.push(validWorkspace);
    // 4. PERSISTENCIA EN DISCO
    saveCollectionToDisk(workspaces, 'workspaces');
    res.status(201).json({ message: 'Workspace creado con éxito', workspace: newWorkspace });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }
};

export const updateWorkspace = (req, res) => {
  try {
    const db = getDb();
    const workspaces = [...db.workspaces];
    const { name } = req.params;
    const updatedDetails = req.body;

    //1. Encontrar el workspace
    const workspaceIndex = findWorkspaceIndexByName(name, res);
    if(workspaceIndex === res) return;
    
    //2. Creamos la copia actualizada
    const currentWorkspace = workspaces[workspaceIndex];
    const updatedWorkspace = { ...currentWorkspace, ...updatedDetails };

    //3. Validamos el workspace actualizado
    const validatedWorkspace = validateWorkspace(updatedWorkspace, res);
    if (validatedWorkspace === res) return;

    //5. Sobreescribimos la copia con el original
    workspaces[workspaceIndex] = updatedWorkspace;

    // 6. Persistencia
    saveCollectionToDisk(workspaces, 'workspaces');

    res.status(200).json({
      message: 'Workspace actualizado con éxito',
      workspace: updatedWorkspace
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }


};

export const deleteWorkspaceByName = (req, res) => {

  const db = getDb();
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

  const workspace = findWorkspaceByName(name, res);

  res.status(200).json({ workspace });
};

export const getAllWorkspaces = (req, res) => {
  const db = getDb();
  const workspaces = [...db.workspaces];
  res.status(200).json({ workspaces });
};

export const addRackToWorkspace = (req, res) => {

  const db = getDb();
  const { workspaceName, rackName } = req.body;

  // 1. Encontrar el workspace
  const workspace = findWorkspaceByName(workspaceName, res);

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

  const db = getDb();
  const { name } = req.params;
  const workspace = db.workspaces.find(ws => ws.name === name);

  if (!workspace) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }

  // En un proyecto real, aquí obtendrías los racks por su ID desde el servicio de Racks.
  res.status(200).json({ racks: workspace.racks });
};

export const removeRackFromWorkspace = (workspaceName, rackName) => {

  const db = getDb();
  const workspace = db.workspaces.find(ws => ws.name === workspaceName);
  if (workspace) {
    const initialRackCount = workspace.racks.length;
    workspace.racks = workspace.racks.filter(rack => rack !== rackName);
    return workspace.racks.length < initialRackCount; // Devuelve true si se eliminó algo
  }
  return false;
};