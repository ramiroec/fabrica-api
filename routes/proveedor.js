const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM proveedor');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Obtener datos por ID
router.get('/:id', async (req, res) => {
    const proveedorId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM proveedor WHERE id = $1', [proveedorId]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Proveedor no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Agregar un nuevo proveedor
router.post('/', async (req, res) => {
    const { razon_social, nombre_fantasia, tipo_documento, numero_documento, pais, departamento, ciudad, barrio, direccion, telefono, email, nombre_contacto, estado } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO proveedor (razon_social, nombre_fantasia, tipo_documento, numero_documento, pais, departamento, ciudad, barrio, direccion, telefono, email, nombre_contacto, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *', 
            [razon_social, nombre_fantasia, tipo_documento, numero_documento, pais, departamento, ciudad, barrio, direccion, telefono, email, nombre_contacto, estado]
        ); 
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({ error: 'Error al insertar datos' });
    }
});

// Actualizar un proveedor existente
router.put('/:id', async (req, res) => {
    const proveedorId = req.params.id;
    const { razon_social, nombre_fantasia, tipo_documento, numero_documento, pais, departamento, ciudad, barrio, direccion, telefono, email, nombre_contacto, estado } = req.body;

    try {
        const result = await pool.query(
            'UPDATE proveedor SET razon_social = $1, nombre_fantasia = $2, tipo_documento = $3, numero_documento = $4, pais = $5, departamento = $6, ciudad = $7, barrio = $8, direccion = $9, telefono = $10, email = $11, nombre_contacto = $12, estado = $13 WHERE id = $14 RETURNING *',
            [razon_social, nombre_fantasia, tipo_documento, numero_documento, pais, departamento, ciudad, barrio, direccion, telefono, email, nombre_contacto, estado, proveedorId]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Proveedor no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        res.status(500).json({ error: 'Error al actualizar datos' });
    }
});

// Eliminar un proveedor por ID
router.delete('/:id', async (req, res) => {
    const proveedorId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM proveedor WHERE id = $1 RETURNING *', [proveedorId]);
        
        if (result.rows.length > 0) {
            res.json({ mensaje: 'Proveedor eliminado con éxito', proveedorEliminado: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Proveedor no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar datos:', error);
        res.status(500).json({ error: 'Error al eliminar datos' });
    }
});

module.exports = router;
