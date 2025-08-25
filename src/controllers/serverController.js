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

const calculateTotalCost = (serverComponents) => {
  return serverComponents.reduce((total, component) => {
    const dbComponent = db.components.find(c => c.name === component.name);
    return total + (dbComponent ? dbComponent.cost : 0);
  }, 0);
};

export const createServer = (req, res) => {
  const { error } = serverSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, description, components: serverComponents } = req.body;

  if (!name || !serverComponents || !Array.isArray(serverComponents)) {
    return res.status(400).json({ message: 'Nombre y lista de componentes son obligatorios.' });
  }

  const existingServer = db.servers.find(s => s.name === name);
  if (existingServer) {
    return res.status(409).json({ message: 'Ya existe un servidor con este nombre.' });
  }

  const validation = validateComponents(serverComponents);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  const newServer = {
    id: `server-${db.servers.length + 1}`,
    name,
    description: description || '',
    components: serverComponents,
    totalCost: calculateTotalCost(serverComponents),
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