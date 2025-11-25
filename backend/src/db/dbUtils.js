// src/db/dbUtils.js

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js'; // Usamos el logger que implementamos

// --- 1. Definición de Rutas y Constantes ---

// Recrear __dirname para contexto de módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const COLLECTIONS_DIR = path.resolve(__dirname, 'collections/'); 

// Constantes para referenciar los nombres de las colecciones y sus archivos
export const COLLECTION_NAMES = {
    users: 'userData.json',
    workspaces: 'workspaceData.json',
    racks: 'rackData.json',
    servers: 'serverData.json',
    components: 'componentData.json',
    networks: 'networkData.json',
};

// --- 2. Funciones de Utilidad ---

/**
 * Persiste el array de una colección en su archivo JSON correspondiente.
 * * @param {Array} collectionArray - El array de datos actualizado (ej: [newServer, ...]).
 * @param {string} collectionKey - La clave de la colección (ej: COLLECTION_NAMES.servers).
 */
export const saveCollectionToDisk = (collectionArray, collectionKey) => {
    const filename = COLLECTION_NAMES[collectionKey];
    
    if (!filename) {
        //logger.error('Intento de guardar colección desconocida.', { key: collectionKey });
        throw new Error(`Colección no definida en COLLECTION_NAMES: ${collectionKey}`);
    }

    const filePath = path.join(COLLECTIONS_DIR, filename);

    try {
        // Escribe el array en el archivo JSON, usando null y 2 para un formato legible
        fs.writeFileSync(filePath, JSON.stringify(collectionArray, null, 2), 'utf8');
        //logger.debug(`Colección '${collectionKey}' guardada en disco.`, { path: filePath });
    } catch (error) {
        //logger.error(`Error crítico al guardar la colección '${collectionKey}' en disco.`, { error: error.message, path: filePath });
        // Lanzar el error para que el controlador pueda responder con un 500
        throw new Error(`Fallo en la persistencia de datos para ${collectionKey}.`);
    }
};

// --- 3. (Opcional) Función para obtener la ruta del archivo ---
// Útil si necesitas la ruta en otro lado (ej: para scripts de backup)
export const getCollectionPath = (collectionKey) => {
    const filename = COLLECTION_NAMES[collectionKey];
    if (!filename) {
        throw new Error(`Colección no definida: ${collectionKey}`);
    }
    return path.join(COLLECTIONS_DIR, filename);
};