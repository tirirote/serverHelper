import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; // Importamos las rutas de autenticación

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Ruta principal para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('¡Servidor de Server Helper funcionando!');
});

// Lista de rutas para la api
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes); // Usamos el router para las rutas /api/workspaces
app.use('/api/racks', rackRoutes); // Usamos el router para las rutas /api/racks
app.use('/api/components', componentRoutes); // Usamos el router para las rutas /api/components
app.use('/api/servers', serverRoutes); // Usamos el router para las rutas /api/servers

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});