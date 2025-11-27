import { workspaceSchema } from '../schemas/workspaceSchema.js';
import { findNetworkByName } from './networkController.js';
//BD
import { saveCollectionToDisk } from '../db/dbUtils.js';
import { getDb } from '../db/dbLoader.js';

//AUX
const validateWorkspace = (workspaceToValidate) => {
  const { error, value } = workspaceSchema.validate(workspaceToValidate, { stripUnknown: true });

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400; // 💡 Adjuntar status
    throw validationError;
  }

  if (!workspaceToValidate.name) {
    const validationError = new Error('El nombre del workspace es obligatorio.');
    validationError.status = 400; // 💡 Adjuntar status
    throw validationError;
  }
  return value;
};

const findExistingWorkspaceByName = async (name) => {
  const db = await getDb();

  const existingWorkspace = db.workspaces.find(ws => ws.name === name);

  if (existingWorkspace) {
    const error = new Error('Ya existe un workspace con este nombre.');
    error.status = 409; // 💡 Adjuntar status
    throw error;
  }
}

export const findWorkspaceByName = async (name) => {
  const db = await getDb();

  const workspace = db.workspaces.find(ws => ws.name === name);

  if (!workspace) {
    const error = new Error('Workspace no encontrado.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }

  return workspace;
}

const findWorkspaceIndexByName = async (name) => {
  const db = await getDb();

  const workspaceIndex = db.workspaces.findIndex(w => w.name === name);

  if (workspaceIndex === -1) {
    const error = new Error('Workspace no encontrado.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }
  return workspaceIndex;
};

//API
export const createWorkspace = async (req, res) => {
  try {
    const db = await getDb();
    const workspaces = [...db.workspaces];
    const { name, description, network } = req.body;

    // 1. Verificar existencia de la Network (respuesta rápida)
    const existingNetwork = await findNetworkByName(network);
    if (existingNetwork === res) return;


    //2. Creamos el workspace
    const newWorkspace = {
      name,
      description: description || '',
      racks: [],
      network
    };

    //3. Verificamos la validez del workspace
    const validWorkspace = validateWorkspace(newWorkspace);
    if (validWorkspace === res) return;

    //3. Verificar la existencia el workspace
    const existingWorkspace = await findExistingWorkspaceByName(validWorkspace.name);
    if (existingWorkspace === res) return;

    workspaces.push(validWorkspace);
    // 4. PERSISTENCIA EN DISCO
    await saveCollectionToDisk(workspaces, 'workspaces');
    res.status(201).json({ message: 'Workspace creado con éxito', workspace: newWorkspace });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const db = await getDb();
    const workspaces = [...db.workspaces];
    const { name } = req.params;
    const updatedDetails = req.body;

    //1. Encontrar el workspace
    const workspaceIndex = await findWorkspaceIndexByName(name);

    //2. Creamos la copia actualizada
    const currentWorkspace = workspaces[workspaceIndex];
    const updatedWorkspace = { ...currentWorkspace, ...updatedDetails };

    //3. Validamos el workspace actualizado
    const validatedWorkspace = await validateWorkspace(updatedWorkspace);

    //5. Sobreescribimos la copia con el original
    workspaces[workspaceIndex] = validatedWorkspace;

    // 6. Persistencia
    await saveCollectionToDisk(workspaces, 'workspaces');

    res.status(200).json({
      message: 'Workspace actualizado con éxito',
      workspace: validatedWorkspace
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }


};

export const deleteWorkspaceByName = async (req, res) => {
  try {
    const db = await getDb();

    const { name } = req.params;
    const initialLength = db.workspaces.length;

    db.workspaces = db.workspaces.filter(w => w.name !== name);

    if (db.workspaces.length === initialLength) {
      return res.status(404).json({ message: 'Workspace no encontrado.' });
    }

    res.status(200).json({ message: 'Workspace eliminado con éxito.' });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }

};

export const getWorkspaceByName = async (req, res) => {
  try {
    const { name } = req.params;

    const workspace = await findWorkspaceByName(name);

    res.status(200).json({ workspace });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }

};

export const getAllWorkspaces = async (req, res) => {
  const db = await getDb();
  const workspaces = [...db.workspaces];
  res.status(200).json({ workspaces });
};

export const addRackToWorkspace = async (req, res) => {
  try {
    const db = await getDb();
    const { workspaceName, rackName } = req.body;

    // 1. Encontrar el workspace
    const workspace = await findWorkspaceByName(workspaceName);

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

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }
};

export const getAllCurrentRacks = async (req, res) => {
  const db = await getDb();

  const { name } = req.params;
  const workspace = db.workspaces.find(ws => ws.name === name);

  if (!workspace) {
    return res.status(404).json({ message: 'Workspace no encontrado.' });
  }

  // En un proyecto real, aquí obtendrías los racks por su ID desde el servicio de Racks.
  res.status(200).json({ racks: workspace.racks });
};

export const removeRackFromWorkspace = async (workspaceName, rackName) => {
  const db = await getDb();

  const workspace = db.workspaces.find(ws => ws.name === workspaceName);
  if (workspace) {
    const initialRackCount = workspace.racks.length;
    workspace.racks = workspace.racks.filter(rack => rack !== rackName);
    return workspace.racks.length < initialRackCount; // Devuelve true si se eliminó algo
  }
  return false;
};