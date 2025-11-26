// 💡 Exponer 'expect' como una variable global.
global.expect = expect;

import { closeDbWatchers, getDb } from '../../src/db/dbLoader.js'; 
import { resetTestDB } from '../../src/db/dbUtils.js';

beforeEach(() => {
    const db = getDb();
    resetTestDB(db);
});

after(() => {
    console.log('Cerrando watchers de la base de datos...');
    closeDbWatchers();
});