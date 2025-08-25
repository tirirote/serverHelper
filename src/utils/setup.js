import { createApp } from '../app.js';
import { db } from '../db/index.js';

// Datos iniciales para poblar la base de datos en cada test
const initialDbState = {
    users: [],
    workspaces: [],
    racks: [],
    servers: [],
    components: [],
};

export const setupTestEnvironment = () => {
    const app = createApp(); // Crea la instancia de la app de Express

    // Reiniciar la base de datos simulada antes de cada test
    beforeEach(() => {
        Object.keys(initialDbState).forEach(key => {
            db[key].splice(0, db[key].length, ...initialDbState[key]);
        });
    });

    return app;
};