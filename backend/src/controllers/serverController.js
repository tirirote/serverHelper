import { db } from '../db/index.js';
import { serverSchema } from '../schemas/serverSchema.js';
import { mandatoryComponentTypes } from '../schemas/types.js';
import { findComponentByName } from './componentController.js';
import { findNetworkByName } from './networkController.js';
//AUX
const findExistingServer = (name, res) => {
  const existingServer = db.servers.find(s => s.name === name);
  if (existingServer) {
    return res.status(409).json({ message: 'Ya existe un servidor con este nombre.' });
  }
};

export const findServerByName = (serverName, res) => {
  const server = db.servers.find(s => s.name === serverName);
  if (!server) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }
  return server;
};

const findServerIndexByName = (serverName, res) => {
  const serverIndex = db.servers.findIndex(s => s.name === serverName);
  if (serverIndex === -1) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }
  return serverIndex;
};

const validateServer = (server, res) => {
  const { error } = serverSchema.validate(server);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

const validateServerDetails = (details, res) => {
  const { error } = serverSchema.optional().validate(details);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
};

const validateComponents = (serverComponents, res) => {

  const serverComponentTypes = serverComponents.map(c => c.type);

  // 1. Validar componentes obligatorios
  // Usamos la lista mandatoryComponentTypes, asumiendo que incluye 'OS'
  // Filtramos 'HardDisk' y 'RAM' ya que son opcionales en el mínimo requerido.
  const requiredTypes = mandatoryComponentTypes.filter(type => type !== 'HardDisk' && type !== 'RAM');

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
  return serverComponents.reduce((total, component) => {
    const dbComponent = db.components.find(c => c.name === component.name);
    return total + (dbComponent ? dbComponent.price : 0);
  }, 0);
};

export const calculateTotalMaintenanceCost = (serverComponents) => {
  return serverComponents.reduce((total, component) => {
    const dbComponent = db.components.find(c => c.name === component.name);
    return total + (dbComponent && dbComponent.maintenanceCost ? dbComponent.maintenanceCost : 0);
  }, 0);
};

export const createServer = (req, res) => {
  const {
    name,
    components: rawComponents,
    rackName,
    ipAddress,
    operatingSystem,
    healthStatus // Permitir inicialización, aunque el default está en el esquema
  } = req.body;

  let network;

  // Determinar la red del servidor a partir del rack (si se proporciona)
  if (rackName) {
    const workspace = db.workspaces.find(w => w.racks.includes(rackName));
    if (workspace) {
      network = workspace.network;
    }
  }

  if (!network) {
    return res.status(400).json({ message: 'No se pudo determinar la red para el servidor.' });
  }

  const components = rawComponents.map(c => ({
    name: c.name,
    type: c.type
  }));

  // Encontrar el nombre del OS entre los componentes, usando el tipo 'OS'
  const osComponent = components.find(c => c.type === 'OS');
  const osName = osComponent ? osComponent.name : operatingSystem;


  const existingNetwork = findNetworkByName(network, res);

  const serverToValidate = {
    name,
    // description ya no existe en el esquema Server
    components,
    totalPrice: calculateTotalCost(components),
    totalMaintenanceCost: calculateTotalMaintenanceCost(components),
    network,
    ipAddress, // Nuevo campo
    operatingSystem: osName, // Nuevo campo
    healthStatus: healthStatus || 'Unknown', // Nuevo campo
  };


  validateServer(serverToValidate, res);

  findExistingServer(name, res);

  validateComponents(components, res);

  const newServer = {
    id: `server-${db.servers.length + 1}`,
    name,
    components: components,
    totalPrice: serverToValidate.totalPrice,
    totalMaintenanceCost: serverToValidate.totalMaintenanceCost,
    network: existingNetwork.name,

    // Inicialización de los nuevos campos
    ipAddress: ipAddress || 'N/A',
    operatingSystem: osName || 'N/A',
    healthStatus: healthStatus || 'Unknown',
    rackId: rackName // Mantenemos la referencia al rack, útil para la navegación
  };

  db.servers.push(newServer);
  res.status(201).json({ message: 'Servidor creado con éxito', server: newServer });
};

export const deleteServerByName = (req, res) => {
  const { name } = req.params;
  const initialLength = db.servers.length;
  db.servers = db.servers.filter(s => s.name !== name);

  if (db.servers.length === initialLength) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }
  res.status(200).json({ message: 'Servidor eliminado con éxito.' });
};

export const updateServer = (req, res) => {
  const { name } = req.params;
  const { id, components, ...newDetails } = req.body; // Extraer y descartar 'id'

  const serverIndex = findServerIndexByName(name, res);
  const currentServer = db.servers[serverIndex];

  if (components) {
    const filteredComponents = components.map(c => ({
      name: c.name,
      type: c.type
    }));

    validateComponents(filteredComponents, res);

    newDetails.totalPrice = calculateTotalCost(filteredComponents);
    newDetails.totalMaintenanceCost = calculateTotalMaintenanceCost(filteredComponents);
    newDetails.components = filteredComponents;

    // Asegurar que el OperatingSystem se actualiza si los componentes cambian, usando el tipo 'OS'
    const osComponent = filteredComponents.find(c => c.type === 'OS');
    if (osComponent) {
      newDetails.operatingSystem = osComponent.name;
    }
  }

  // Si la red se actualiza, verificar que existe (asumiendo que findExistingNetworkByName existe y usa findNetworkByName)
  if (newDetails.network) {
    findNetworkByName(newDetails.network, res);
  }

  // Actualizar el servidor con los nuevos detalles antes de validar
  const serverToValidate = { ...currentServer, ...newDetails };

  // Validar los detalles restantes de la solicitud con el esquema
  validateServerDetails(newDetails, res);

  // Actualizar el servidor en la base de datos (usando el objeto validado o newDetails)
  const updatedServer = { ...currentServer, ...newDetails };
  db.servers[serverIndex] = updatedServer;

  res.status(200).json({
    message: 'Servidor actualizado con éxito',
    server: updatedServer
  });
};

export const getAllServers = (req, res) => {
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
  const { serverName, componentName, componentType } = req.body;

  // 1. Encontrar el servidor
  const serverIndex = findServerIndexByName(serverName, res);

  // 2. Validar que el componente exista
  const component = findComponentByName(componentName, res);

  // 3. Añadir el componente al servidor
  const server = db.servers[serverIndex];
  server.components.push({ name: component.name, type: component.type });

  // Si el componente es un OS, actualizar el campo 'operatingSystem'
  if (component.type === 'OS') {
    server.operatingSystem = component.name;
  }


  // 4. Recalcular costos
  server.totalPrice = calculateTotalCost(server.components);
  server.totalMaintenanceCost = calculateTotalMaintenanceCost(server.components);

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
