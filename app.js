// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Contraseña segura para validar el acceso
const API_PASSWORD = "my_teki-secure_password";  // Usa la misma contraseña que en api.js

// Middleware para verificar la contraseña en el encabezado Authorization
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${API_PASSWORD}`) {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }
  next();  // Si la contraseña es válida, continúa con la solicitud
};

// Middleware de logging personalizado
app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const durationInMilliseconds = getDurationInMilliseconds(start);
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationInMilliseconds.toLocaleString()} ms`);
    });
    next();
});

// Función para calcular la duración.
function getDurationInMilliseconds(start) {
    const NS_PER_SEC = 1e9; // Convertir nanosegundos a segundos
    const NS_TO_MS = 1e6; // Convertir nanosegundos a milisegundos
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

// Middleware para analizar el cuerpo de la solicitud en formato JSON
app.use(express.json());
app.use(cors());
app.use(authenticateRequest); // Aplica el middleware de autenticación

// Importa las rutas
const departamentoRoutes = require('./routes/departamento');
const empresaRoutes = require('./routes/empresa');
const feriadoRoutes = require('./routes/feriado');
const usuarioRoutes = require('./routes/usuario');
const perfilRoutes = require('./routes/perfil');
const proveedorRoutes = require('./routes/proveedor');

// Usa las rutas
app.use('/api/departamento', departamentoRoutes);
app.use('/api/empresa', empresaRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/feriado', feriadoRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/proveedor', proveedorRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
