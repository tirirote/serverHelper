import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 3000;
// Log current node environment to help debugging and ensure it's not running as test
console.log(`[SERVER] NODE_ENV=${process.env.NODE_ENV || 'undefined'}, PORT=${PORT}`);
if (process.env.NODE_ENV === 'test') {
  console.warn('[SERVER] WARNING: Server is running with NODE_ENV=test; this is intended for tests only.');
}

// Ruta principal para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('¡Servidor de Server Helper funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});