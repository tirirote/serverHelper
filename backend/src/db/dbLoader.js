import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 1. RECREAR __dirname en contexto ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lista de colecciones y sus archivos correspondientes
const collections = {
    users: 'userData.json',
    workspaces: 'workspaceData.json',
    racks: 'rackData.json',
    servers: 'serverData.json',
    components: 'componentData.json',
    networks: 'networkData.json',
};

// Objeto que mantiene la DB en memoria (inicialmente vacío)
let dbCache = {};
const watchers = []
// Ruta base donde se encuentran tus archivos de datos
const DATA_DIR = path.resolve(__dirname, 'collections/');

/**
 * Carga todos los archivos JSON de datos y actualiza la caché de la DB.
 */
const loadDbFromDiskOnce = () => {
    let newDb = {};

    for (const [key, filename] of Object.entries(collections)) {
        const filePath = path.join(DATA_DIR, filename);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            newDb[key] = JSON.parse(data);
        } catch (error) {

            if (process.env.NODE_ENV === 'test') {
                newDb[key] = [];
            } else {
                // En producción/desarrollo, usamos la caché como fallback
                newDb[key] = dbCache[key] || [];
            }
        }
    }

    return newDb;
};

const loadAllCollectionsFromDisk = () => {
    const newDb = loadDbFromDiskOnce();
    dbCache = newDb;
};

export const getDb = () => {
    // 💡 CONDICIÓN CLAVE: Si estamos en test, leemos el disco en cada llamada.
    if (process.env.NODE_ENV === 'test') {
        return loadDbFromDiskOnce();
    }

    // Si no es test (producción/desarrollo), usamos el Singleton/caché.
    if (Object.keys(dbCache).length === 0) {
        // Si la caché está vacía, la cargamos (esto solo ocurre la primera vez).
        loadAllCollectionsFromDisk();
    }
    return dbCache;
};

/**
 * Configura el monitoreo de cambios para todos los archivos de colección.
 */
const setupDbWatcher = () => {
    // 1. Cargar la DB al iniciar
    loadAllCollectionsFromDisk();

    // 2. Monitorear cada archivo de colección
    for (const filename of Object.values(collections)) {
        const filePath = path.join(DATA_DIR, filename);

        // fs.watch monitorea el archivo.
        const watcher = fs.watch(filePath, (eventType, name) => {
            if (eventType === 'change') {
                // Cuando un archivo cambia (ej: por el script de seed), recargamos *todo*.
                loadAllCollectionsFromDisk();
            }
        });

        watchers.push(watcher);
    }
    console.log('[DB WATCHER] Monitoreo activo sobre los archivos de datos.');
};

// 💡 NUEVA FUNCIÓN: Para cerrar todos los manejadores abiertos
export const closeDbWatchers = () => {
    watchers.forEach(watcher => {
        try {
            watcher.close(); // Cierra el manejador del sistema operativo
            //console.log('[DB WATCHER] Un manejador de fs.watch ha sido cerrado.');
        } catch (error) {
            //console.warn('[DB WATCHER] Error al intentar cerrar el watcher:', error.message);
        }
    });
    watchers.length = 0; // Vaciar el array
};

// Iniciar el sistema
if (process.env.NODE_ENV !== 'test') {
    setupDbWatcher();
} else {
    // Cargar la DB la primera vez, sin iniciar el watcher
    loadAllCollectionsFromDisk();
}
