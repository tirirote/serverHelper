// src/db/dbUtils.js

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js'; // Usamos el logger que implementamos
import { initialDBData } from './sampleDBData.js';

// Recrear __dirname para contexto de módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a separate collections directory when running tests so jest workers don't
// clobber each other's files. Jest exposes JEST_WORKER_ID for worker isolation.
const COLLECTIONS_DIR = process.env.NODE_ENV === 'test'
    ? path.resolve(__dirname, `collections/test-${process.env.JEST_WORKER_ID || '0'}/`)
    : path.resolve(__dirname, 'collections/');

// Constantes para referenciar los nombres de las colecciones y sus archivos
export const COLLECTION_NAMES = {
    users: 'userData.json',
    workspaces: 'workspaceData.json',
    racks: 'rackData.json',
    servers: 'serverData.json',
    components: 'componentData.json',
    networks: 'networkData.json',
};

export const saveCollectionToDisk = async (collectionArray, collectionKey) => {
    const filename = COLLECTION_NAMES[collectionKey];
    const filePath = path.join(COLLECTIONS_DIR, filename);
    let fd; // Descriptor de archivo

    try {
        // Ensure the target directory exists (important for per-worker test dirs)
        await fs.mkdir(COLLECTIONS_DIR, { recursive: true });
        const dataToWrite = JSON.stringify(collectionArray, null, 2);

        // 1. Abrir el archivo (bandera 'w' para escritura)
        fd = await fs.open(filePath, 'w');

        // 2. Escribir los datos en el descriptor
        // Usamos fd.write con string + posicion + encoding
        await fd.write(dataToWrite, 0, 'utf8');

        // 3. 🛑 PUNTO CRÍTICO: Sincronizar los datos del archivo con el disco.
        // Esto garantiza que los datos se escriben ANTES de que la Promesa se resuelva.
        await fd.sync();

        // El método .sync() es el equivalente a fs.fdatasync() o fs.fsync() 
        // en la API de fs/promises sobre el FileHandle (fd).

    } catch (error) {
        // Manejo de errores de I/O
        console.error(`[DB ERROR] Fallo CRÍTICO en la sincronización del disco para ${collectionKey}.`, error);
        throw new Error(`Fallo en la persistencia de datos para ${collectionKey}.`);
    } finally {
        // 4. Cerrar el descriptor de archivo, siempre.
        if (fd) {
            await fd.close();
        }
    }
};

export const getCollectionPath = (collectionKey) => {
    const filename = COLLECTION_NAMES[collectionKey];
    if (!filename) {
        throw new Error(`Colección no definida: ${collectionKey}`);
    }
    return path.join(COLLECTIONS_DIR, filename);
};

export const persistAllCollections = async (sourceDb) => {
    const persistPromises = [];

    // Iterate over all known collection names and write the value present
    // in sourceDb. Important: we push the promise (no await) so writes can
    // happen in parallel; finally we await Promise.all.
    for (const key in COLLECTION_NAMES) {
        if (Object.prototype.hasOwnProperty.call(sourceDb, key)) {
            // Ensure we always write a JSON representation (fall back to [])
            persistPromises.push(saveCollectionToDisk(sourceDb[key] ?? [], key));
        }
    }

    // Wait for all writes to finish
    await Promise.all(persistPromises);
};

export const resetTestDB = async (dbInstance) => {
    // 1. Limpiar/Restablecer el objeto DB en memoria (para el estado del módulo)
    dbInstance.components = initialDBData.components;
    dbInstance.workspaces = [];
    dbInstance.networks = [];
    dbInstance.users = [];
    dbInstance.racks = [];
    dbInstance.servers = [];

    // 2. Persistencia en el Disco (Garantiza que el siguiente getDb() lea el estado limpio)
    await persistAllCollections(dbInstance);
};