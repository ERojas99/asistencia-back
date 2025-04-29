const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const visitorsRoutes = require('./routes/visitors');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Para manejar payloads grandes (embeddings faciales)
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/visitors', visitorsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Registro de Visitantes funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});