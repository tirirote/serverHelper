import { rackSchema } from '../schemas/rackSchema.js';
import { findWorkspaceByName } from './workspaceController.js';
import { findServerByName } from './serverController.js';

//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk } from '../db/dbUtils.js';

//AUX
export const findRackByName = (rackName, res) => {
  const db = getDb();
  const rack = db.racks.find(r => r.name === rackName);
  if (!rack) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }
  return rack;
};

const findExistingRackByName = (name, workspaceName, res) => {
  const db = getDb();
  const existingRack = db.racks.find(r => r.name === name && r.workspaceName === workspaceName);
  if (existingRack) {
    return res.status(409).json({ message: 'Ya existe un rack con este nombre en el workspace.' });
  }
  return null;
};

const findRackIndexByWorkspace = (name, workspaceName, res) => {
  const db = getDb();
  const rackIndex = db.racks.findIndex(r => r.name === name && r.workspaceName === workspaceName);

  if (rackIndex === -1) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }
  return rackIndex;
}

const findRackIndexByName = (name, res) => {
  const db = getDb();
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
  return null;
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
  const db = getDb();
  const racks = [...db.racks];
  const workspaces = [...db.workspaces];

  // 1. Validar y obtener datos (validateRack debe devolver un error o el valor)
  const validatedData = validateRack(req.body, res);
  if (validatedData.statusCode) return validatedData; // Devolver error 400

  const { name, units, workspaceName, powerStatus, healthStatus } = validatedData;

  // 2. 💡 CORRECCIÓN DE FLUJO: Buscar Workspace (findWorkspaceByName devuelve error 404 o el objeto)
  const workspaceErrorOrObject = findWorkspaceByName(workspaceName, res);
  if (workspaceErrorOrObject.statusCode) return workspaceErrorOrObject; // Devolver error 404

  // Usar la copia del workspace para la modificación
  const workspaceIndex = workspaces.findIndex(ws => ws.name === workspaceName);
  const workspace = workspaces[workspaceIndex];

  // 3. 💡 CORRECCIÓN DE FLUJO: Comprobar existencia (findExistingRackByName devuelve error 409 o null)
  const existingRackError = findExistingRackByName(name, workspaceName, res);
  if (existingRackError) return existingRackError; // Devolver error 409

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

  racks.push(newRack);
  workspace.racks.push(newRack.name);

  saveCollectionToDisk(racks, 'racks');
  saveCollectionToDisk(workspaces, 'workspaces'); // Es vital guardar el workspace actualizado

  res.status(201).json({ message: 'Rack creado con éxito', rack: newRack });
};

export const deleteRackByName = (req, res) => {
  const db = getDb();
  let racks = [...db.racks];
  let workspaces = [...db.workspaces];
  const { name, workspaceName } = req.params;

  // 1. Encontrar y validar el índice del rack (devuelve 404 o el índice)
  const rackIndex = findRackIndexByWorkspace(name, workspaceName, res);
  if (typeof rackIndex !== 'number') return rackIndex;

  // 2. Mutar la copia del array racks
  racks.splice(rackIndex, 1);

  // 3. Mutar la copia del array workspaces
  const workspaceIndex = workspaces.findIndex(ws => ws.name === workspaceName);
  if (workspaceIndex > -1) {
    const workspace = workspaces[workspaceIndex];
    const workspaceRackIndex = workspace.racks.indexOf(name);
    if (workspaceRackIndex > -1) {
      workspace.racks.splice(workspaceRackIndex, 1);
    }
    // No es necesario guardar aquí, se guarda al final.
  }

  // 4. 💡 PERSISTENCIA
  saveCollectionToDisk(racks, 'racks');
  saveCollectionToDisk(workspaces, 'workspaces');

  res.status(200).json({ message: 'Rack eliminado con éxito.' });
};

export const updateRack = (req, res) => {
  const db = getDb();
  const racks = [...db.racks];
  const { name } = req.params;

  // 💡 CORRECCIÓN: Descartar campos que no deben ser actualizados si se envían.
  const { id, workspaceName, ...updatedDetails } = req.body;

  // 1. Encontrar el índice (findRackIndexByName devuelve 404 o el índice)
  const rackIndex = findRackIndexByName(name, res);
  if (typeof rackIndex !== 'number') return rackIndex;

  const currentRack = racks[rackIndex];

  const updatedRack = { ...currentRack, ...updatedDetails };

  // 2. 💡 CORRECCIÓN DE FLUJO: Validar el rack completo actualizado
  const validatedRack = validateRack(updatedRack, res);
  if (validatedRack.statusCode) return validatedRack;

  // 3. Mutar la copia del array racks
  racks[rackIndex] = updatedRack;

  // 4. 💡 PERSISTENCIA
  saveCollectionToDisk(racks, 'racks');

  res.status(200).json({
    message: 'Rack actualizado con éxito',
    rack: updatedRack
  });
};

export const getRackByName = (req, res) => {
  const { name, workspaceName } = req.params;

  const rack = findRackIndexByWorkspace(name, workspaceName, res)

  res.status(200).json({ rack });
};

export const getAllRacks = (req, res) => {
  const db = getDb();

  const { workspaceName } = req.params;
  const racksInWorkspace = db.racks.filter(r => r.workspaceName === workspaceName);

  res.status(200).json({ racks: racksInWorkspace });
};

export const addServerToRack = (req, res) => {
  const db = getDb();
  const racks = [...db.racks];

  // 1. Objeto Completo para la validación Joi
    const serverToValidate = {
        name,
        components,
        network, // Clave: debe estar definida aquí
        ipAddress,
        operatingSystem: osName,
        healthStatus: healthStatus || 'Unknown',
    };

  // --- 1. Validar Joi de la Entrada ---
  const validatedData = validateServer(serverToValidate, res);
  if (validatedData === res) return; // Detiene el flujo si Joi falla (error 400)

  const { rackName, serverName } = validatedData;

  // 1. Encontrar el rack (findRackByName devuelve 404 o el objeto)
  const rack = findRackByName(rackName, res);
  if (rack === res) return;

  // 2. Encontrar el servidor (findServerByName devuelve 404 o el objeto)
  const serverErrorOrObject = findServerByName(serverName, res);
  if (serverErrorOrObject === res) return;

  // 3. Verificar si el servidor ya está en el rack (findExistingServerInRack devuelve 409 o null)
  const existingServerError = findExistingServerInRack(serverName, rack, res);
  if (existingServerError === res) return; // Error 409

  // 4. Mutar el rack en la copia (rack es una referencia al elemento dentro de 'racks')
  rack.servers.push(serverName);

  // 5. 💡 PERSISTENCIA
  saveCollectionToDisk(racks, 'racks'); // Guardar el array racks completo

  res.status(200).json({
    message: 'Servidor añadido al rack con éxito.',
    rack
  });
};

export const toggleRackPower = (req, res) => {
  const db = getDb();
  const racks = [...db.racks];
  const { name } = req.params;

  // 1. Encontrar el rack (findRackByName devuelve 404 o el objeto)
  const rack = findRackByName(name, res);
  if (rack.statusCode) return rack;

  // 2. Cambiar el estado
  const newStatus = rack.powerStatus === 'On' ? 'Off' : 'On';
  rack.powerStatus = newStatus;

  // 3. 💡 CORRECCIÓN DE FLUJO: Validar el rack (validateRack devuelve error 400 o el valor)
  const validatedRack = validateRack(rack, res);
  if (validatedRack.statusCode) return validatedRack;

  // 4. 💡 PERSISTENCIA
  saveCollectionToDisk(racks, 'racks');

  res.status(200).json({
    message: `Rack '${name}' encendido: ${newStatus}`,
    powerStatus: newStatus
  });
};

export const getRackMaintenanceCost = (req, res) => {
  const { name } = req.params;
  const db = getDb();
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
