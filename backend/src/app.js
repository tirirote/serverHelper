import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

//Routes
import userRoutes from './routes/userRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import rackRoutes from './routes/rackRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import componentRoutes from './routes/componentRoutes.js';
import networkRoutes from './routes/networkRoutes.js'

const FRONTENTD_PORT = process.env.FRONTENTD_PORT || 5173

export const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cors({
        origin: `http://localhost:${FRONTENTD_PORT}`,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    }));

    // Conectar todas las rutas a la aplicación
    app.use('/api/users', userRoutes);
    app.use('/api/workspaces', workspaceRoutes);
    app.use('/api/racks', rackRoutes);
    app.use('/api/servers', serverRoutes);
    app.use('/api/components', componentRoutes);
    app.use('/api/networks', networkRoutes)

    return app;
};