import { serverSchema } from '../schemas/serverSchema.js';
import { mandatoryComponentTypes } from '../schemas/types.js';
import { findComponentByName } from './componentController.js';
import { findNetworkByName } from './networkController.js';
//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk, COLLECTION_NAMES } from '../db/dbUtils.js';

//AUX
const findExistingServer = (serverName, res) => {

  const db = getDb();
  const existingServer = db.servers.find(s => s.name === serverName);
  if (existingServer) {
    res.status(409).json({ message: 'Ya existe un servidor con este nombre.' });
    return res;
  }
};

export const findServerByName = (serverName, res) => {

  const db = getDb();
  const server = db.servers.find(s => s.name === serverName);
  if (!server) {
    res.status(404).json({ message: 'Servidor no encontrado.' });
    return res;
  }
  return server;
};

const findServerIndexByName = (serverName, res) => {

  const db = getDb();
  const serverIndex = db.servers.findIndex(s => s.name === serverName);
  if (serverIndex === -1) {
    res.status(404).json({ message: 'Servidor no encontrado.' });
    return res;
  }
  return serverIndex;
};

//Validation
export const preprocessAndValidateServerData = (rawServerData, network) => {
  const { name, components: rawComponents, ipAddress, operatingSystem, healthStatus } = rawServerData;

  // 1. Array Completo (con name y type) para CÁLCULO Y VALIDACIÓN MANUAL
  const componentsWithType = rawComponents.map(c => ({
    name: c.name,
    type: c.type
  }));

  // Determinar el nombre del OS
  const osComponent = componentsWithType.find(c => c.type === 'OS');
  const osName = osComponent ? osComponent.name : operatingSystem;

  // Calcular costos (Puros)
  const totalPrice = calculateTotalCost(componentsWithType);
  const totalMaintenanceCost = calculateTotalMaintenanceCost(componentsWithType);

  // 2. Validación de Componentes (LANZA ERROR 400 si faltan tipos o si no existen en DB)
  // Se usa el array completo aquí
  validateComponents(componentsWithType);

  // 3. Array Final (solo nombres) para la VALIDACIÓN JOI Y PERSISTENCIA
  // 💡 CAMBIO CLAVE: Transformar el array de objetos a array de nombres
  const componentNames = componentsWithType.map(c => c.name);

  // 4. Objeto Completo para la validación Joi
  const serverToValidate = {
    name,
    components: componentNames,
    totalPrice,
    totalMaintenanceCost,
    network, // Clave: debe estar definida aquí
    ipAddress,
    operatingSystem: osName,
    healthStatus: healthStatus || 'Unknown',
  };

  // 5. Validación Joi (Lanza 400 si los tipos/formatos son incorrectos)
  const validatedServerDetails = validateServer(serverToValidate); // Asumimos que ahora es pura

  // 6. Devolver el objeto final para la creación
  return {
    ...validatedServerDetails,
    totalPrice: totalPrice, // Aseguramos que los costos estén presentes
    totalMaintenanceCost: totalMaintenanceCost,
  };
};

const validateServer = (serverToValidate, res) => {
  const { error, value } = serverSchema.validate(serverToValidate, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  return value;
};

const validateServerDetails = (serverDetails, res) => {
  const { error, value } = serverSchema.optional().validate(serverDetails);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  return value;
};

const validateComponents = (serverComponents, res) => {

  const db = getDb();

  const serverComponentTypes = serverComponents.map(c => c.type);

  // 1. Validar componentes obligatorios
  // Usamos la lista mandatoryComponentTypes, asumiendo que incluye 'OS'
  // Filtramos 'HardDisk' y 'RAM' ya que son opcionales en el mínimo requerido.
  const requiredTypes = [
    'CPU',
    'RAM',
    'HardDisk',
    'BiosConfig',
    'Fan',
    'PowerSupply',
    'ServerChasis',
    'NetworkInterface',
    'OS'
  ]

  for (const type of requiredTypes) {
    if (!serverComponentTypes.includes(type)) {
      return res.status(400).json({ message: `Falta el componente obligatorio: ${type}.` });
    }
  }

  // 2. Validar compatibilidad (simulado)
  for (const component of serverComponents) {
    const dbComponent = db.components.find(c => c.name === component.name);
    if (!dbComponent) {
      return res.status(400).json({ message: `El componente "${component.name}" no existe en la base de datos.` });
    }
  }
};

//API
export const calculateTotalCost = (serverComponents) => {

  const db = getDb();
  return serverComponents.reduce((total, component) => {
    const dbComponent = db.components.find(c => c.name === component.name);
    return total + (dbComponent ? dbComponent.price : 0);
  }, 0);
};

export const calculateTotalMaintenanceCost = (serverComponents) => {

  const db = getDb();
  return serverComponents.reduce((total, component) => {
    const dbComponent = db.components.find(c => c.name === component.name);
    return total + (dbComponent && dbComponent.maintenanceCost ? dbComponent.maintenanceCost : 0);
  }, 0);
};

export const createServer = (req, res) => {

  const db = getDb();
  const servers = [...db.servers];
  const workspaces = [...db.workspaces];
  const { name, rackName } = req.body;

  // 1. Determinar Network (Se mantiene la respuesta rápida aquí, ya que interactúa con colecciones)
  let network;

  if (rackName) {
    const workspace = workspaces.find(w => w.racks.includes(rackName));
    if (workspace) {
      network = workspace.network;
    }
  }

  if (!network) {
    return res.status(400).json({ message: 'No se pudo determinar la red para el servidor.' });
  }

  // 2. Verificar existencia de la Network (respuesta rápida)
  const existingNetwork = findNetworkByName(network, res);
  if (existingNetwork === res) return;

  // 3. Verificar existencia de servidor (respuesta rápida 409)
  let response = findExistingServer(name, res);
  if (response) return response;

  // 4. Preprocesar y Validar todo (Costos, Componentes, Joi)
  // Lanza ValidationError (status 400) si hay algún problema
  const validatedServerData = preprocessAndValidateServerData(req.body, network);

  // 5. Creación del objeto final (ya validado)
  const newServer = {
    id: `server-${db.servers.length + 1}`,
    ...validatedServerData,
    network: existingNetwork.name,
    rackId: rackName
  };

  // 4. PERSISTENCIA EN DISCO
  servers.push(newServer);
  saveCollectionToDisk(servers, 'servers');
  res.status(201).json({ message: 'Servidor creado con éxito', server: newServer });
};

export const deleteServerByName = (req, res) => {

  const db = getDb();
  const servers = [...db.servers];
  const { name } = req.params;
  const updatedServers = servers.filter(s => s.name !== name);

  if (updatedServers.length === servers.length) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }
  saveCollectionToDisk(updatedServers, 'servers');
  res.status(200).json({ message: 'Servidor eliminado con éxito.' });
};

export const updateServer = (req, res) => {
  try {
    const db = getDb();
    const servers = [...db.servers];
    const { name } = req.params;
    const { id, components, rackName, ...newDetails } = req.body; // Extraer y descartar 'id'

    // 1. Encontrar el servidor (Aún usa la versión 'respuesta rápida' que devuelve el índice o 'res')
    const serverIndex = findServerIndexByName(name, res);
    if (serverIndex === res) return; // findServerIndexByName ya envió 404

    const currentServer = servers[serverIndex];

    // 2. Lógica si los COMPONENTES se están actualizando
    if (components) {
      const componentsWithType = components.map(c => ({
        name: c.name,
        type: c.type
      }));

      // Validación de Componentes (Pura, lanza 400 si falla)
      validateComponents(componentsWithType);

      // Recálculo y asignación de costos
      newDetails.totalPrice = calculateTotalCost(componentsWithType);
      newDetails.totalMaintenanceCost = calculateTotalMaintenanceCost(componentsWithType);

      // 💡 CORRECCIÓN CLAVE: Asignar el array de STRINGS (nombres) para el esquema Joi
      newDetails.components = componentsWithType.map(c => c.name);

      // Asegurar que el OperatingSystem se actualiza
      const osComponent = componentsWithType.find(c => c.type === 'OS');
      if (osComponent) {
        newDetails.operatingSystem = osComponent.name;
      } else {
        // Si se eliminó el OS, se establece un valor por defecto
        newDetails.operatingSystem = 'N/A';
      }
    }

    // 3. Verificación de Network (Mantiene el patrón de 'respuesta rápida')
    if (newDetails.network) {
      let existingNetwork = findNetworkByName(newDetails.network, res);
      if (existingNetwork === res) return;
    }

    // 4. Validación de los Detalles Restantes (Joi ahora recibe array de strings)
    const validatedDetails = validateServerDetails(newDetails);

    // 5. Actualizar el servidor en la copia y mantener la consistencia
    const updatedServer = { ...currentServer, ...validatedDetails };

    // El campo rackId debe mantenerse si no se proporciona
    if (rackName === undefined) {
      updatedServer.rackId = currentServer.rackId;
    }

    servers[serverIndex] = updatedServer;

    // 6. Persistencia
    saveCollectionToDisk(servers, 'servers');

    res.status(200).json({
      message: 'Servidor actualizado con éxito',
      server: updatedServer
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }


};

export const getAllServers = (req, res) => {

  const db = getDb();
  const servers = db.servers;
  res.status(200).json({ servers });
};

export const getServerByName = (req, res) => {

  const { name } = req.params;
  const server = findServerByName(name, res);
  res.status(200).json({ server });
};

export const getAllComponents = (req, res) => {

  const { name } = req.params;
  const server = findServerByName(name, res);
  res.status(200).json({ components: server.components });
};

export const addComponentToServer = (req, res) => {
  const db = getDb();
  const servers = [...db.servers]; // Copia mutable
  const { serverName, componentName } = req.body;

  // 1. Encontrar el servidor
  const serverIndex = findServerIndexByName(serverName, res);
  if (typeof serverIndex !== 'number') return serverIndex;

  // 2. Validar que el componente exista
  const component = findComponentByName(componentName, res);
  if (!component || component.statusCode) return component;

  // 3. Añadir el componente al servidor
  const server = servers[serverIndex];
  server.components.push({ name: component.name, type: component.type });

  // Si el componente es un OS, actualizar el campo 'operatingSystem'
  if (component.type === 'OS') {
    server.operatingSystem = component.name;
  }

  // 4. Recalcular costos
  server.totalPrice = calculateTotalCost(server.components);
  server.totalMaintenanceCost = calculateTotalMaintenanceCost(server.components);

  saveCollectionToDisk(servers, 'servers');

  res.status(200).json({
    message: 'Componente añadido al servidor con éxito.',
    server
  });
};

export const getMissingComponents = (req, res) => {
  const { name } = req.params;

  const server = findServerByName(name, res);

  // Usamos la lista mandatoryComponentTypes, asumiendo que incluye 'OS'
  const serverComponentTypes = server.components.map(c => c.type);
  const requiredTypes = mandatoryComponentTypes.filter(type => type !== 'HardDisk' && type !== 'RAM');

  const missingComponents = requiredTypes.filter(type => !serverComponentTypes.includes(type));

  res.status(200).json({ missing: missingComponents });
};

export const getServerTotalCost = (req, res) => {
  const { name } = req.params;

  const server = findServerByName(name, res);

  res.status(200).json({ totalPrice: server.totalPrice });
};

export const getServerMaintenanceCost = (req, res) => {
  const { name } = req.params;

  const server = findServerByName(name, res);

  res.status(200).json({ totalMaintenanceCost: server.totalMaintenanceCost });
};
