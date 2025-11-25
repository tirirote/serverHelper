import { createApp } from '../../src/app.js';
import { getDb } from '../../src/db/dbLoader.js';
import { saveCollectionToDisk } from '../../src/db/dbUtils.js';
import { initialDBData } from '../../src/db/sampleDBData.js';

const db = getDb();

const cleanDB = () => {
    beforeEach(() => {
        //Vaciamos la BD
        db.components = initialDBData.components;
        db.servers = [];
        db.networks = [];
        db.racks = [];
        db.workspaces = [];
        db.users = [];
        //Persistencia en el Disco para los tests
        saveCollectionToDisk(db.components, 'components');
        saveCollectionToDisk(db.servers, 'servers');
        saveCollectionToDisk(db.networks, 'networks');
        saveCollectionToDisk(db.racks, 'racks');
        saveCollectionToDisk(db.workspaces, 'workspaces');
        saveCollectionToDisk(db.users, 'users');
    });
}

export const setupTestEnvironment = () => {
    const app = createApp();
    cleanDB();
    return app;
};