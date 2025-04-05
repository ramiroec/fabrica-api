const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM perfil');
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
        const result = await pool.query('SELECT * FROM perfil WHERE id = $1', [userId]);
        
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

// Agregar un nuevo registro
router.post('/', async (req, res) => {
    const { descripcion, observacion, estado } = req.body;
    try {
        const result = await pool.query('INSERT INTO perfil (descripcion, observacion, estado) VALUES ($1, $2, $3) RETURNING *', [descripcion, observacion, estado]); 
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ error: 'Error al insertar datos' });
    }
});

// Actualizar un registro existente
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { descripcion, observacion, estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE perfil SET descripcion = $1, observacion = $2, estado = $3 WHERE id = $4 RETURNING *',
            [descripcion, observacion, estado, userId]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        res.status(500).json({ error: 'Error al actualizar datos' });
    }
});
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM perfil WHERE id = $1 RETURNING *', [userId]);
        
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
