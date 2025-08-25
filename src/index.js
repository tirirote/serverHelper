import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 3000;

// Ruta principal para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('¡Servidor de Server Helper funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});