const express = require('express');
const router = express.Router();
const pool = require('../conexionDB'); 

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`SELECT 
        e.*,
        u1.nombre || ' ' || u1.apellido AS contacto_responsable_nombre_apellido,
        u2.nombre || ' ' || u2.apellido AS contacto_admin_nombre_apellido
    FROM 
        empresa e
    JOIN 
        usuario u1 ON e.contacto_responsable = u1.id
    JOIN 
        usuario u2 ON e.contacto_admin = u2.id`);
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
    const result = await pool.query(`SELECT 
    e.*,
    u1.nombre || ' ' || u1.apellido AS contacto_responsable_nombre_apellido,
    u2.nombre || ' ' || u2.apellido AS contacto_admin_nombre_apellido
FROM 
    empresa e
JOIN 
    usuario u1 ON e.contacto_responsable = u1.id
JOIN 
    usuario u2 ON e.contacto_admin = u2.id where e.id = $1`, [userId]);

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

// Actualizar un registro existente 
router.put('/:id', async (req, res) => {
    const empresaId = req.params.id;
    const { razon_social, ruc, celular_salida, direccion, email, contacto_responsable, contacto_admin } = req.body;
    try {
      const result = await pool.query('UPDATE empresa SET razon_social = $1, ruc = $2, celular_salida = $3, email = $4, direccion = $5, contacto_responsable = $6, contacto_admin = $7 WHERE id = $8 RETURNING *',
        [razon_social, ruc, celular_salida, email, direccion, contacto_responsable, contacto_admin, empresaId]);
  
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

  module.exports = router;
