import * as fs from 'fs';
import * as path from 'path'
import { fileURLToPath } from 'url'; // 👈 Nueva importación
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // 👈 Recreamos __dirname

const DATA_DIR = path.resolve(__dirname, '../collections/');

// Importa los datos de ejemplo
import { initialDBData } from '../sampleDBData.js'

// Mapeo de las colecciones a sus nombres de archivo JSON
const collectionsMap = {
    users: 'userData.json',
    workspaces: 'workspaceData.json',
    racks: 'rackData.json',
    servers: 'serverData.json',
    components: 'componentData.json',
    networks: 'networkData.json',
};

const seedUp = () => {
    //console.log('✨ Iniciando población y escritura a disco de múltiples archivos...');
    let totalInserted = 0;

    for (const [key, filename] of Object.entries(collectionsMap)) {
        const filePath = path.join(DATA_DIR, filename);
        const dataToInsert = initialDBData[key];

        if (dataToInsert && Array.isArray(dataToInsert)) {
            try {
                // Escribir el array completo al archivo JSON
                fs.writeFileSync(filePath, JSON.stringify(dataToInsert, null, 2), 'utf8');
                totalInserted += dataToInsert.length;
            } catch (err) {
            }
        }
    }

    //console.log(`\n🎉 Proceso de población finalizado. Total de ${totalInserted} registros escritos.`);
};

seedUp();