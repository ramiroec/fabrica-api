const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

// Obtener todos los departamentos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM departamento');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Obtener un departamento por ID
router.get('/:id', async (req, res) => {
    const departamentoId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM departamento WHERE id = $1', [departamentoId]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Departamento no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Agregar un nuevo departamento
router.post('/', async (req, res) => {
    const { descripcion, estado } = req.body;
    try {
        const result = await pool.query('INSERT INTO departamento (descripcion, estado) VALUES ($1, $2) RETURNING *', [descripcion, estado]); 
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ error: 'Error al insertar datos' });
    }
});

// Actualizar un departamento existente
router.put('/:id', async (req, res) => {
    const departamentoId = req.params.id;
    const { descripcion, estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE departamento SET descripcion = $1, estado = $2 WHERE id = $3 RETURNING *',
            [descripcion, estado, departamentoId]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Departamento no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        res.status(500).json({ error: 'Error al actualizar datos' });
    }
});

// Eliminar un departamento
router.delete('/:id', async (req, res) => {
    const departamentoId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM departamento WHERE id = $1 RETURNING *', [departamentoId]);
        
        if (result.rows.length > 0) {
            res.json({ mensaje: 'Departamento eliminado con éxito', registroEliminado: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Departamento no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar datos:', error);
        res.status(500).json({ error: 'Error al eliminar datos' });
    }
});

module.exports = router;