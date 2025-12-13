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

const FRONTENTD_PORT = process.env.FRONTENTD_PORT || 3001
// API key used to allow requests from frontend. Can be overridden with env var API_KEY
const API_KEY = process.env.API_KEY || 'tirirote'

export const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cors({
        origin: `http://localhost:${FRONTENTD_PORT}`,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    }));

    // Simple API key middleware: require `x-api-key` header for incoming requests.
    // - Skips check when running tests (NODE_ENV==='test') to avoid breaking test runners
    // - Skips check for root path `/` so health-checks remain accessible
    app.use((req, res, next) => {
        if (process.env.NODE_ENV === 'test') return next();
        if (req.path === '/') return next();
        const key = req.header('x-api-key') || req.header('X-Api-Key');
        if (!key || key !== API_KEY) {
            return res.status(401).json({ error: 'Unauthorized - invalid API key' });
        }
        next();
    });

    // Conectar todas las rutas a la aplicación
    app.use('/api/users', userRoutes);
    app.use('/api/workspaces', workspaceRoutes);
    app.use('/api/racks', rackRoutes);
    app.use('/api/servers', serverRoutes);
    app.use('/api/components', componentRoutes);
    app.use('/api/networks', networkRoutes)

    return app;
};