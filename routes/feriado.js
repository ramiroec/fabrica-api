const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

// Obtener todos los feriados
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM feriado order by mes, dia');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los feriados:', error);
        res.status(500).json({ error: 'Error al obtener los feriados' });
    }
});

// Obtener un feriado por ID
router.get('/:id', async (req, res) => {
    const feriadoId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM feriado WHERE id = $1', [feriadoId]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Feriado no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el feriado:', error);
        res.status(500).json({ error: 'Error al obtener el feriado' });
    }
});

// Agregar un nuevo registro
router.post('/', async (req, res) => {
    const { dia, mes, descripcion } = req.body;
    try {
        const result = await pool.query('INSERT INTO feriado (dia, mes, descripcion) VALUES ($1, $2, $3) RETURNING *', [dia, mes, descripcion]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al insertar datos en feriado:', error);
        res.status(500).json({ error: 'Error al insertar datos en feriado' });
    }
});

// Actualizar un registro existente 
router.put('/:id', async (req, res) => {
    const feriadoId = req.params.id;
    const { dia, mes, descripcion } = req.body;
    try {
        const result = await pool.query(
            'UPDATE feriado SET dia = $1, mes = $2, descripcion = $3 WHERE id = $4 RETURNING *',
            [dia, mes, descripcion, feriadoId]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Feriado no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        res.status(500).json({ error: 'Error al actualizar datos' });
    }
});

// Eliminar un registro existente en la tabla feriado
router.delete('/:id', async (req, res) => {
    const feriadoId = req.params.id;
    try {
        const result = await pool.query(
            'DELETE FROM feriado WHERE id = $1 RETURNING *',
            [feriadoId]
        );
        if (result.rows.length > 0) {
            res.json({ mensaje: 'Feriado eliminado con éxito', feriadoEliminado: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Feriado no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar el feriado:', error);
        res.status(500).json({ error: 'Error al eliminar el feriado' });
    }
});



module.exports = router;
