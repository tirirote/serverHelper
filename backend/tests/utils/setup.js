import { createApp } from '../../src/app.js';
import { db } from '../../src/db/index.js';
import { components } from '../../src/db/componentData.js';
const initialDbState = {
    users: [],
    workspaces: [],
    racks: [],
    servers: [],
    components: components,
    networks: [],
};

export const setupTestEnvironment = () => {
    const app = createApp();
    beforeEach(() => {
        Object.keys(initialDbState).forEach(key => {
            db[key].splice(0, db[key].length, ...initialDbState[key]);
        });
    });
    return app;
};