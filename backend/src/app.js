import express from 'express';
import userRoutes from './routes/userRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import rackRoutes from './routes/rackRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import componentRoutes from './routes/componentRoutes.js';

export const createApp = () => {
    const app = express();
    app.use(express.json());

    // Conectar todas las rutas a la aplicación
    app.use('/api/users', userRoutes);
    app.use('/api/workspaces', workspaceRoutes);
    app.use('/api/racks', rackRoutes);
    app.use('/api/servers', serverRoutes);
    app.use('/api/components', componentRoutes);

    return app;
};