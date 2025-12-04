import { serverSchema } from '../schemas/serverSchema.js';
import { mandatoryComponentTypes } from '../schemas/types.js';
import { findComponentByName } from './componentController.js';
import { findNetworkByName } from './networkController.js';
//BD
import { getDb } from '../db/dbLoader.js';
import { saveCollectionToDisk, COLLECTION_NAMES } from '../db/dbUtils.js';

//AUX
const findExistingServer = async (serverName) => {
  const db = await getDb();

  const existingServer = db.servers.find(s => s.name === serverName);

  if (existingServer) {
    const error = new Error('Ya existe un servidor con este nombre.');
    error.status = 409; // 💡 Adjuntar status
    throw error;
  }
};

export const findServerByName = async (serverName) => {
  const db = await getDb();

  const server = db.servers.find(s => s.name === serverName);

  if (!server) {
    const error = new Error('Servidor no encontrado.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }

  return server;
};

const findServerIndexByName = async (serverName) => {
  const db = await getDb();

  const serverIndex = db.servers.findIndex(s => s.name === serverName);

  if (serverIndex === -1) {
    const error = new Error('Servidor no encontrado.');
    error.status = 404; // 💡 Adjuntar status
    throw error;
  }
  return serverIndex;
};

//Validation
export const preprocessAndValidateServerData = async (rawServerData, network) => {
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
  const totalPrice = await calculateTotalCost(componentsWithType);
  const totalMaintenanceCost = await calculateTotalMaintenanceCost(componentsWithType);

  // 2. Validación de Componentes (LANZA ERROR 400 si faltan tipos o si no existen en DB)
  // Se usa el array completo aquí
  await validateComponents(componentsWithType);

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

export const validateServer = (serverToValidate) => {
  const { error, value } = serverSchema.validate(serverToValidate, { stripUnknown: true });

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400; // 💡 Adjuntar status
    throw validationError;
  }

  return value;
};

const validateServerDetails = (serverDetails) => {
  const { error, value } = serverSchema.optional().validate(serverDetails);

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400; // 💡 Adjuntar status
    throw validationError;
  }

  return value;
};

const validateComponents = async (serverComponents, res) => {

  const db = await getDb();

  const serverComponentTypes = serverComponents.map(c => c.type);

  // 1. Validar componentes obligatorios
  const requiredTypes = [
    'CPU'
  ]

  for (const type of requiredTypes) {
    if (!serverComponentTypes.includes(type)) {
      const error = new Error(`Falta el componente obligatorio: ${type}.`);
      error.status = 400; // 💡 Adjuntar status
      throw error;
    }
  }

  // 2. Validar compatibilidad (simulado)
  for (const component of serverComponents) {
    const dbComponent = db.components.find(c => c.name === component.name);
    if (!dbComponent) {
      const error = new Error(`El componente "${component.name}" no existe en la base de datos.`);
      error.status = 400; // 💡 Adjuntar status
      throw error;
    }
  }
};

//API
export const calculateTotalCost = async (serverComponents) => {
  const db = await getDb();

  return serverComponents.reduce((total, component) => {
    const dbComponent = db.components.find(c => c.name === component.name);
    return total + (dbComponent ? dbComponent.price : 0);
  }, 0);
};

export const calculateTotalMaintenanceCost = async (serverComponents) => {
  const db = await getDb();

  return serverComponents.reduce((total, component) => {
    const dbComponent = db.components.find(c => c.name === component.name);
    return total + (dbComponent && dbComponent.maintenanceCost ? dbComponent.maintenanceCost : 0);
  }, 0);
};

export const createServer = async (req, res) => {

  try {
    const db = await getDb();

    const servers = [...db.servers];
    const workspaces = [...db.workspaces];
    const { name, rackName } = req.body;

    // 1. Determinar Network (AHORA OPCIONAL)
    let network = null;
    let existingNetwork = null;

    if (rackName) {
      const workspace = workspaces.find(w => w.racks.includes(rackName));

      if (workspace) {
        network = workspace.network;
      }

      if (!network) {
        return res.status(400).json({ message: 'No se pudo determinar la red para el servidor.' });
      }

      // 2. Verificar existencia de la Network (respuesta rápida)
      existingNetwork = await findNetworkByName(network);
    }

    // 3. Verificar existencia de servidor (respuesta rápida 409)
    await findExistingServer(name);

    // 4. Preprocesar y Validar todo (Costos, Componentes, Joi)
    // Lanza ValidationError (status 400) si hay algún problema
    const validatedServerData = await preprocessAndValidateServerData(req.body, network);

    // 5. Creación del objeto final (ya validado)
    const newServer = {
      ...validatedServerData,
      network: existingNetwork ? existingNetwork.name : null,
      rackName: rackName || null
    };

    // 4. PERSISTENCIA EN DISCO
    servers.push(newServer);

    await saveCollectionToDisk(servers, 'servers');

    res.status(201).json({
      message: 'Servidor creado con éxito',
      server: newServer
    });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }

};

export const deleteServerByName = async (req, res) => {
  try {
    const db = await getDb();

    const servers = [...db.servers];
    const { name } = req.params;
    const updatedServers = servers.filter(s => s.name !== name);

    if (updatedServers.length === servers.length) {
      return res.status(404).json({ message: 'Servidor no encontrado.' });
    }
    await saveCollectionToDisk(updatedServers, 'servers');
    res.status(200).json({ message: 'Servidor eliminado con éxito.' });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }

};

export const updateServer = async (req, res) => {
  try {
    const db = await getDb();
    const servers = [...db.servers];

    const { name } = req.params;
    const { id, components, rackName, ...newDetails } = req.body; // Extraer y descartar 'id'

    // 1. Encontrar el servidor (Aún usa la versión 'respuesta rápida' que devuelve el índice o 'res')
    const serverIndex = await findServerIndexByName(name);

    const currentServer = servers[serverIndex];

    // 2. Lógica si los COMPONENTES se están actualizando
    if (components) {
      const componentsWithType = components.map(c => ({
        name: c.name,
        type: c.type
      }));

      // Validación de Componentes (Pura, lanza 400 si falla)
      await validateComponents(componentsWithType);

      // Recálculo y asignación de costos
      newDetails.totalPrice = await calculateTotalCost(componentsWithType);
      newDetails.totalMaintenanceCost = await calculateTotalMaintenanceCost(componentsWithType);

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
      await findNetworkByName(newDetails.network);
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
    await saveCollectionToDisk(servers, 'servers');

    res.status(200).json({
      message: 'Servidor actualizado con éxito',
      server: updatedServer
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor.' });
  }


};

export const getAllServers = async (req, res) => {
  const db = await getDb();

  const servers = db.servers;
  res.status(200).json({ servers });
};

export const getServerByName = async (req, res) => {
  const { name } = req.params;
  const server = await findServerByName(name);
  res.status(200).json({ server });
};

export const getAllComponents = async (req, res) => {
  const { name } = req.params;
  const server = await findServerByName(name);
  res.status(200).json({ components: server.components });
};

export const getMissingComponents = async (req, res) => {
  const { name } = req.params;

  const server = await findServerByName(name);

  // Usamos la lista mandatoryComponentTypes, asumiendo que incluye 'OS'
  const serverComponentTypes = server.components.map(c => c.type);
  const requiredTypes = mandatoryComponentTypes.filter(type => type !== 'HardDisk' && type !== 'RAM');

  const missingComponents = requiredTypes.filter(type => !serverComponentTypes.includes(type));

  res.status(200).json({ missing: missingComponents });
};

export const getServerTotalCost = async (req, res) => {
  const { name } = req.params;

  const server = await findServerByName(name);

  res.status(200).json({ totalPrice: server.totalPrice });
};

export const getServerMaintenanceCost = async (req, res) => {
  const { name } = req.params;

  const server = await findServerByName(name);

  res.status(200).json({ totalMaintenanceCost: server.totalMaintenanceCost });
};

//Server - Component Interactions
export const addComponentToServer = async (req, res) => {
  const db = await getDb();

  const servers = [...db.servers]; // Copia mutable
  const { serverName, componentName } = req.body;

  // 1. Encontrar el servidor
  const serverIndex = await findServerIndexByName(serverName);
  if (typeof serverIndex !== 'number') return serverIndex;

  // 2. Validar que el componente exista
  const component = await findComponentByName(componentName);
  if (!component || component.statusCode) return component;

  // 3. Añadir el componente al servidor
  const server = servers[serverIndex];
  server.components.push({ name: component.name, type: component.type });

  // Si el componente es un OS, actualizar el campo 'operatingSystem'
  if (component.type === 'OS') {
    server.operatingSystem = component.name;
  }

  // 4. Recalcular costos
  server.totalPrice = await calculateTotalCost(server.components);
  server.totalMaintenanceCost = await calculateTotalMaintenanceCost(server.components);

  await saveCollectionToDisk(servers, 'servers');

  res.status(200).json({
    message: 'Componente añadido al servidor con éxito.',
    server
  });
};

export const removeComponentFromServer = async (req, res) => {
  try {
    const db = await getDb();
    const servers = [...db.servers]; // Copia mutable
    const { serverName, componentName } = req.body;

    // 1. Encontrar el índice del servidor (Lanza 404 si no existe)
    const serverIndex = await findServerIndexByName(serverName);

    const server = servers[serverIndex];

    // 2. Encontrar el componente en el servidor (buscando por nombre)
    const componentIndex = server.components.findIndex(c => c.name === componentName);

    if (componentIndex === -1) {
      return res.status(404).json({ message: `Componente '${componentName}' no encontrado en el servidor.` });
    }

    // 💡 Obtener los detalles del componente a eliminar
    const componentToRemove = server.components[componentIndex];


    // 3. 🚫 COMPROBACIÓN CRÍTICA: Impedir la eliminación de componentes obligatorios
    if (mandatoryComponentTypes.includes(componentToRemove.type)) {
      return res.status(400).json({
        message: `No se puede eliminar el componente obligatorio de tipo: ${componentToRemove.type}.`
      });
    }

    // 4. Eliminar el componente del array
    server.components.splice(componentIndex, 1);

    // 5. Lógica especial para OS
    if (componentToRemove.type === 'OS') {
      // Si se elimina el OS, se establece a 'N/A' o al valor que maneje el esquema
      server.operatingSystem = 'N/A';
    }

    // 6. Recalcular costos
    // Se usa la función auxiliar con el array de componentes actualizado
    server.totalPrice = await calculateTotalCost(server.components);
    server.totalMaintenanceCost = await calculateTotalMaintenanceCost(server.components);

    // 7. Persistencia
    await saveCollectionToDisk(servers, 'servers');

    res.status(200).json({
      message: 'Componente eliminado del servidor con éxito.',
      server
    });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || 'Error interno del servidor.'
    });
  }
};