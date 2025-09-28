import { db } from '../db/index.js';
import { serverSchema } from '../schemas/serverSchema.js';

const validateComponents = (serverComponents) => {
  const mandatoryTypes = ['Chasis', 'CPU', 'RAM', 'HardDisk', 'BiosConfig', 'Fan', 'PowerSupply'];
  const serverComponentTypes = serverComponents.map(c => c.type);

  // 1. Validar componentes obligatorios
  for (const type of mandatoryTypes) {
    if (!serverComponentTypes.includes(type) && type !== 'HardDisk' && type !== 'RAM') {
      return { valid: false, message: `Falta el componente obligatorio: ${type}.` };
    }
  }

  // 2. Validar compatibilidad (simulado)
  for (const component of serverComponents) {
    const dbComponent = db.components.find(c => c.name === component.name);
    if (!dbComponent) {
      return { valid: false, message: `El componente "${component.name}" no existe en la base de datos.` };
    }
  }

  return { valid: true };
};

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
  const { name, description, components: rawComponents, rackName } = req.body;
  let network;

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

  const existingNetwork = db.networks.find(n => n.name === network);
  if (!existingNetwork) {
    return res.status(400).json({ message: `La red "${network}" no existe.` });
  }

  const serverToValidate = {
    name,
    description,
    components,
    totalPrice: calculateTotalCost(components),
    totalMaintenanceCost: calculateTotalMaintenanceCost(components),
    network
  };

  const { error } = serverSchema.validate(serverToValidate);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const existingServer = db.servers.find(s => s.name === name);
  if (existingServer) {
    return res.status(409).json({ message: 'Ya existe un servidor con este nombre.' });
  }

  const validation = validateComponents(components);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  const newServer = {
    id: `server-${db.servers.length + 1}`,
    name,
    description: description || '',
    components: components,
    totalPrice: serverToValidate.totalPrice,
    totalMaintenanceCost: serverToValidate.totalMaintenanceCost,
    network: existingNetwork.name
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

  const serverIndex = db.servers.findIndex(s => s.name === name);
  if (serverIndex === -1) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }

  if (components) {
    const filteredComponents = components.map(c => ({
      name: c.name,
      type: c.type
    }));

    const componentValidation = validateComponents(filteredComponents);
    if (!componentValidation.valid) {
      return res.status(400).json({ message: componentValidation.message });
    }

    newDetails.totalPrice = calculateTotalCost(filteredComponents);
    newDetails.totalMaintenanceCost = calculateTotalMaintenanceCost(filteredComponents);
    newDetails.components = filteredComponents;
  }

  // Si la red se actualiza, verificar que existe
  if (newDetails.network) {
    const existingNetwork = db.networks.find(n => n.name === newDetails.network);
    if (!existingNetwork) {
      return res.status(400).json({ message: `La red "${newDetails.network}" no existe.` });
    }
  }

  // Validar los detalles restantes de la solicitud con el esquema opcional
  const updateSchema = serverSchema.optional();
  const { error: validationError } = updateSchema.validate(newDetails);
  if (validationError) {
    return res.status(400).json({ message: validationError.details[0].message });
  }

  // Actualizar el servidor
  const updatedServer = { ...db.servers[serverIndex], ...newDetails };
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
  const server = db.servers.find(s => s.name === name);
  if (!server) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }
  res.status(200).json({ server });
  return server;
};

export const getAllComponents = (req, res) => {
  const { name } = req.params;
  const server = db.servers.find(s => s.name === name);
  if (!server) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }
  res.status(200).json({ components: server.components });
};

export const addComponentToServer = (req, res) => {
  const { serverName, componentName, componentType } = req.body;

  // 1. Encontrar el servidor
  const serverIndex = db.servers.findIndex(s => s.name === serverName);
  if (serverIndex === -1) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }

  // 2. Validar que el componente exista
  const component = db.components.find(c => c.name === componentName && c.type === componentType);
  if (!component) {
    return res.status(404).json({ message: 'Componente no encontrado.' });
  }

  // 3. Añadir el componente al servidor
  const server = db.servers[serverIndex];
  server.components.push({ name: component.name, type: component.type });

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
  const server = db.servers.find(s => s.name === name);

  if (!server) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }

  const mandatoryTypes = ['Chasis', 'CPU', 'RAM', 'HardDisk', 'BiosConfig', 'Fan', 'PowerSupply'];
  const serverComponentTypes = server.components.map(c => c.type);
  const missingComponents = mandatoryTypes.filter(type => !serverComponentTypes.includes(type));

  res.status(200).json({ missing: missingComponents });
};

export const getServerTotalCost = (req, res) => {
  const { name } = req.params;
  const server = db.servers.find(s => s.name === name);
  if (!server) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }
  res.status(200).json({ totalPrice: server.totalPrice });
};

export const getServerMaintenanceCost = (req, res) => {
  const { name } = req.params;
  const server = db.servers.find(s => s.name === name);
  if (!server) {
    return res.status(404).json({ message: 'Servidor no encontrado.' });
  }
  res.status(200).json({ totalMaintenanceCost: server.totalMaintenanceCost });
};