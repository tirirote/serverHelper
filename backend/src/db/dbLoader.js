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
const loadAllCollectionsFromDisk = () => {
    let newDb = {};

    for (const [key, filename] of Object.entries(collections)) {
        const filePath = path.join(DATA_DIR, filename);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            newDb[key] = JSON.parse(data);
        } catch (error) {
            //console.error(`[DB LOADER ERROR] No se pudo cargar la colección ${key} (${filename}): ${error.message}`);
            newDb[key] = dbCache[key] || [];
        }
    }

    dbCache = newDb;
};

export const reloadDbCache = () => {
    loadAllCollectionsFromDisk();
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
// Exportar una función para que los servicios accedan a la versión actual de la DB
export const getDb = () => {
    reloadDbCache();
    return dbCache;
}