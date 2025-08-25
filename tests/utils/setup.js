import { createApp } from '../../src/app.js'; // Importamos createApp
import { db } from '../../src/db/index.js';

// Datos iniciales para poblar la base de datos en cada test
const initialDbState = {
    users: [],
    workspaces: [],
    racks: [],
    servers: [],
    components: [ // Estos componentes estarán disponibles para cada test
        { type: 'CPU', name: 'CPU Test', cost: 500, compatibleList: [], details: 'Procesador de prueba', selled: false },
        { type: 'RAM', name: 'RAM Test', cost: 100, compatibleList: [], details: 'Memoria RAM de prueba', selled: false },
        { type: 'Chasis', name: 'Chasis Test', cost: 200, compatibleList: [], details: 'Chasis de prueba 1U', selled: false },
        { type: 'HardDisk', name: 'HD Test', cost: 50, compatibleList: [], details: 'Disco duro de prueba 1TB', selled: false },
        { type: 'BiosConfig', name: 'BIOS Test', cost: 20, compatibleList: [], details: 'Configuración BIOS básica', selled: false },
        { type: 'Fan', name: 'Fan Test', cost: 10, compatibleList: [], details: 'Ventilador de 80mm', selled: false },
        { type: 'PowerSupply', name: 'PSU Test', cost: 80, compatibleList: [], details: 'Fuente de alimentación 500W', selled: false },
    ],
};

export const setupTestEnvironment = () => {
    const app = createApp();

    beforeEach(() => {
        // Reinicia todos los arrays de la BD con el estado inicial predefinido
        Object.keys(initialDbState).forEach(key => {
            db[key].splice(0, db[key].length, ...initialDbState[key]);
        });
    });

    return app;
};