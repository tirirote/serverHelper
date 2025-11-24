import * as fs from 'fs';
import * as path from 'path'
import { fileURLToPath } from 'url'; // 👈 Nueva importación
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // 👈 Recreamos __dirname

const DATA_DIR = path.resolve(__dirname, '../collections'); 

// Mapeo de las colecciones a sus nombres de archivo JSON
const collectionsMap = {
    users: 'userData.json',
    workspaces: 'workspaceData.json',
    racks: 'rackData.json',
    servers: 'serverData.json',
    components: 'componentData.json',
    networks: 'networkData.json',
};

const seedDown = () => {
    //console.log('🗑️ Iniciando limpieza y escritura a disco de múltiples archivos...');
    let filesCleaned = 0;
    
    for (const [key, filename] of Object.entries(collectionsMap)) {
        const filePath = path.join(DATA_DIR, filename); 

        try {
            // Escribir un array vacío al archivo JSON
            fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
            console.log(`✅ Colección '${key}' vaciada y escrita en '${filename}'.`);
            filesCleaned++;
        } catch (err) {
            // En un caso real, podríamos intentar leer y vaciar el array si existe,
            // pero para scripts de seed de desarrollo, si el archivo no existe, lo creamos vacío.
            console.error(`❌ Error al limpiar ${filename}: ${err.message}. Intentando crear archivo vacío...`);
             try {
                fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
             } catch (createErr) {
                 console.error(`❌ Falló la creación del archivo ${filename}: ${createErr.message}`);
             }
        }
    }
    
    //console.log(`\n🎉 Proceso de limpieza finalizado. Total de ${filesCleaned} archivos procesados.`);
};

seedDown();