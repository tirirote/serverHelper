import { rackSchema } from '../schemas/rackSchema.js';
import { findWorkspaceByName } from './workspaceController.js';
import { findServerByName, validateServer } from './serverController.js';

//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk } from '../db/dbUtils.js';

//AUX
const findRackByName = (rackName, res) => {
  const db = getDb();
  const rack = db.racks.find(r => r.name === rackName);
  if (!rack) {
    return res.status(404).json({ message: 'Rack no encontrado.' });
  }
  return rack;
};

const findRackByWorkspaceAndName = (workspaceName, rackName, res) => {
  const db = getDb();

  const rack = db.racks.find(r =>
    r.name === rackName && r.workspaceName === workspaceName
  );

  // 3. Manejo de error (Rack no encontrado o Rack/Workspace incorrecto)
  if (!rack) {
    // Usamos 404 para indicar que la combinación no existe.
    return res.status(404).json({ message: `Rack '${rackName}' no encontrado en el workspace '${workspaceName}'.` });
  }

  // 4. Devolver el objeto rack encontrado
  return rack;
};

const findExistingRackByName = (name, workspaceName, res) => {
  const db = getDb();
  const existingRack = db.racks.find(r => r.name === name && r.workspaceName === workspaceName);
  if (existingRack) {
    return res.status(409).json({ message: 'Ya existe un rack con este nombre en el workspace.' });
  }
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
};

const validateRack = (rackToValidate, res) => {

  const { error, value } = rackSchema.validate(rackToValidate, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  return value;
};

export const recalculateRackCosts = (rack) => {
  // 1. Obtener la DB dentro de la función (siempre la versión más reciente)
  const db = getDb();

  let newTotalCost = 0;
  let newTotalMaintenanceCost = 0;

  const servers = db.servers;

  // 2. Iterar sobre los nombres de los servidores en el rack
  rack.servers.forEach(serverName => {
    const server = servers.find(s => s.name === serverName);

    if (server) {
      // 💡 CRÍTICO: Usar el operador || 0 para manejar valores null o undefined
      const serverCost = server.totalPrice || 0;
      const serverMaintCost = server.totalMaintenanceCost || 0;

      // Sumar al total
      newTotalCost += serverCost;
      newTotalMaintenanceCost += serverMaintCost;
    }
  });

  // 3. Mutar el objeto rack con los nuevos totales
  rack.totalCost = newTotalCost;
  rack.totalMaintenanceCost = newTotalMaintenanceCost;
};

//API
export const createRack = (req, res) => {
  try {
    const db = getDb();
    const racks = [...db.racks];
    const workspaces = [...db.workspaces];

    const { name, units, workspaceName, powerStatus, healthStatus } = req.body;

    // 2. Buscar Workspace
    const workspaceErrorOrObject = findWorkspaceByName(workspaceName, res);
    if (workspaceErrorOrObject === res) return;

    // 3. Usar la copia del workspace
    const workspaceIndex = workspaces.findIndex(ws => ws.name === workspaceName);
    const workspace = workspaces[workspaceIndex];

    //4. Creamos el rack
    const newRack = {
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

    // 5. Validar y obtener datos
    const validatedRack = validateRack(newRack, res);
    if (validatedRack === res) return;

    // 5. Comprobar existencia
    const existingRackError = findExistingRackByName(name, workspaceName, res);
    if (existingRackError === res) return;

    if (!workspace.racks) {
      workspace.racks = [];
    }

    workspace.racks.push(validatedRack.name);
    racks.push(validatedRack);

    saveCollectionToDisk(racks, 'racks');
    saveCollectionToDisk(workspaces, 'workspaces'); // Es vital guardar el workspace actualizado

    res.status(201).json({ message: 'Rack creado con éxito', rack: validatedRack });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }

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
  const {
    id,
    workspaceName,
    servers,
    totalCost,
    totalMaintenanceCost,
    ...updatedDetails
  } = req.body;

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

  const rack = findRackByWorkspaceAndName(workspaceName, name, res)

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
  const { rackName, serverName } = req.body;

  // 1. Buscamos el servidor
  const serverToValidate = findServerByName(serverName, res);
  if (serverToValidate === res) return;

  // 2. Validamos el servidor encontrado
  const validatedServer = validateServer(serverToValidate, res);
  if (validatedServer === res) return;

  //3. Buscamos el rack
  const rackIndex = racks.findIndex(r => r.name === rackName);
  if (rackIndex === -1) {
    return res.status(404).json({ message: `Rack '${rackName}' no encontrado.` });
  }

  const rack = racks[rackIndex];

  // 3. Verificar si el servidor ya está en el rack (Error 409)
  if (rack.servers.includes(serverName)) {
    return res.status(409).json({ message: 'El servidor ya está en este rack.' });
  }

  // 4. Mutar el rack en la copia (rack es una referencia al elemento dentro de 'racks')
  rack.servers.push(serverName);

  recalculateRackCosts(rack);

  // 5. 💡 PERSISTENCIA
  saveCollectionToDisk(racks, 'racks'); // Guardar el array racks completo

  res.status(200).json({
    message: 'Servidor añadido al rack con éxito.',
    rack: rack
  });
};

export const getRackMaintenanceCost = (req, res) => {
  try {
    const { workspaceName, name } = req.params;

    // 1. Buscar el rack (maneja 404 si no existe)
    const rack = findRackByWorkspaceAndName(workspaceName, name, res);
    if (rack === res) return;

    // 2. 💡 Asegurar la existencia del coste y tomar el valor.
    // Usamos el operador || 0 para evitar fallos si el campo no existiera (aunque no debería).
    const maintenanceCost = rack.totalMaintenanceCost || 0;

    // 3. Retornar el resultado formateado
    res.status(200).json({
      // 💡 Aplicamos .toFixed(2) sobre el valor seguro (que ya está precalculado)
      totalMaintenanceCost: maintenanceCost.toFixed(2)
    });

  } catch (error) {
    // En caso de errores inesperados
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }
};
