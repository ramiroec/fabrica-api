const express = require('express');
const router = express.Router();
const pool = require('../conexionDB');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT usuario.*, (usuario.nombre || \' \' || usuario.apellido) AS nombre_completo, perfil.descripcion as perfil FROM usuario JOIN perfil ON usuario.perfil = perfil.id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Obtener todos los usuarios
router.get('/activo', async (req, res) => {
    try {
        const result = await pool.query(`SELECT usuario.*, (usuario.nombre || \' \' || usuario.apellido) AS nombre_completo, perfil.descripcion as perfil FROM usuario JOIN perfil ON usuario.perfil = perfil.id where usuario.estado='Activo'`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Obtener datos por ID
router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query(
            `SELECT usuario.*, 
                    (usuario.nombre || ' ' || usuario.apellido) AS nombre_completo, 
                    perfil.descripcion as perfil_descripcion, 
                    departamento.descripcion as departamento_descripcion, 
                    usuario.cargo, 
                    (superior.nombre || ' ' || superior.apellido) AS superior_nombre 
             FROM usuario 
             JOIN perfil ON usuario.perfil = perfil.id 
             LEFT JOIN departamento ON usuario.departamento = departamento.id 
             LEFT JOIN usuario AS superior ON usuario.superior = superior.id 
             WHERE usuario.id = $1`, 
            [userId]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});



// Login 
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT contrasena, id, perfil, CONCAT(nombre, \' \', apellido) AS nombre_completo FROM public.usuario WHERE usuario = $1 AND estado = \'Activo\'', 
            [usuario]
        );
        const user = result.rows[0];

        if (user && (password == user.contrasena)) {
            const { id, perfil, nombre_completo } = user;
            const response = { id, perfil, nombre_completo };
            res.json(response);
        } else {
            res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        client.release();
    } catch (e) {
        console.error('Error:', e);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Agregar un nuevo registro 
router.post('/', async (req, res) => {
    const { 
        usuario, 
        contrasena, 
        nombre, 
        apellido, 
        tipo_documento, 
        numero_documento, 
        perfil, 
        email, 
        telefono, 
        estado, 
        departamento, 
        cargo, 
        superior 
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO usuario (
                usuario, contrasena, nombre, apellido, tipo_documento, numero_documento, 
                perfil, email, telefono, estado, departamento, cargo, superior
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`, 
            [
                usuario, 
                contrasena, 
                nombre, 
                apellido, 
                tipo_documento, 
                numero_documento, 
                perfil, 
                email, 
                telefono, 
                estado, 
                departamento, 
                cargo, 
                superior
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ error: 'Error al insertar datos' });
    }
});


// Actualizar un registro existente
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { 
        usuario, 
        contrasena, 
        nombre, 
        apellido, 
        tipo_documento, 
        numero_documento, 
        perfil, 
        email, 
        telefono, 
        estado, 
        departamento, 
        cargo, 
        superior 
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE usuario SET 
                usuario = $1, 
                contrasena = $2, 
                nombre = $3, 
                apellido = $4, 
                tipo_documento = $5, 
                numero_documento = $6, 
                perfil = $7, 
                email = $8, 
                telefono = $9, 
                estado = $10, 
                departamento = $11, 
                cargo = $12, 
                superior = $13 
            WHERE id = $14 RETURNING *`, 
            [
                usuario, 
                contrasena, 
                nombre, 
                apellido, 
                tipo_documento, 
                numero_documento, 
                perfil, 
                email, 
                telefono, 
                estado, 
                departamento, 
                cargo, 
                superior, 
                userId
            ]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Registro no encontrado para actualizar' });
        }
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        res.status(500).json({ error: 'Error al actualizar datos' });
    }
});

// Eliminar registro 
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query('DELETE FROM usuario WHERE id = $1 RETURNING *', [userId]);

        if (result.rows.length > 0) {
            res.json({ mensaje: 'Registro eliminado con éxito', registroEliminado: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar datos:', error);
        res.status(500).json({ error: 'Error al eliminar datos' });
    }
});

module.exports = router;


