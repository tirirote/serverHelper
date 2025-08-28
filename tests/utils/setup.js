import { createApp } from '../../src/app.js';
import { db } from '../../src/db/index.js';

const initialDbState = {
    users: [],
    workspaces: [],
    racks: [],
    servers: [],
    components: [
        { type: 'CPU', name: 'CPU Test', cost: 500, compatibleList: [], details: '', selled: false },
        { type: 'RAM', name: 'RAM Test', cost: 100, compatibleList: [], details: '', selled: false },
        { type: 'Chasis', name: 'Chasis Test', cost: 200, compatibleList: [], details: '', selled: false },
        { type: 'HardDisk', name: 'HD Test', cost: 50, compatibleList: [], details: '', selled: false },
        { type: 'BiosConfig', name: 'BIOS Test', cost: 20, compatibleList: [], details: '', selled: false },
        { type: 'Fan', name: 'Fan Test', cost: 10, compatibleList: [], details: '', selled: false },
        { type: 'PowerSupply', name: 'PSU Test', cost: 80, compatibleList: [], details: '', selled: false },
        { type: 'ServerChasis', name: 'Server Chassis Test', cost: 150, compatibleList: [], details: '', selled: false },
        { type: 'NetworkInterface', name: 'NIC Test', cost: 40, compatibleList: [], details: '', selled: false },
        { type: 'OS', name: 'OS Test', cost: 600, compatibleList: [], details: '', selled: false },
        { type: 'UPS', name: 'UPS Test', cost: 250, compatibleList: [], details: '', selled: false },
    ],
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