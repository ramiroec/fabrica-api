const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://fullstack_wut1_user:2U7gh27uiFCcAqqjX4C9ZP3r3UqToXiY@dpg-cvo31jk9c44c73bhucfg-a.oregon-postgres.render.com/fullstack_wut1?sslmode=require',
});

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Eliminar tablas en orden correcto para evitar errores por claves foráneas
    await client.query(`
      DROP TABLE IF EXISTS empresa CASCADE;
      DROP TABLE IF EXISTS proveedor CASCADE;
      DROP TABLE IF EXISTS feriado CASCADE;
      DROP TABLE IF EXISTS usuario CASCADE;
      DROP TABLE IF EXISTS perfil CASCADE;
      DROP TABLE IF EXISTS departamento CASCADE;
    `);

    // Crear tablas en orden correcto
    await client.query(`
      CREATE TABLE departamento(
        id SERIAL PRIMARY KEY,
        descripcion varchar(50) NOT NULL,
        estado varchar(10) NOT NULL
      );

      CREATE TABLE perfil(
        id SERIAL PRIMARY KEY,
        descripcion varchar(50) NOT NULL,
        observacion varchar(100),
        estado varchar(10) NOT NULL
      );

      CREATE TABLE usuario(
        id SERIAL PRIMARY KEY,
        usuario varchar(50) NOT NULL,
        contrasena varchar(50) NOT NULL,
        nombre varchar(50) NOT NULL,
        apellido varchar(50) NOT NULL,
        tipo_documento varchar(10) NOT NULL,
        numero_documento varchar(20) NOT NULL,
        perfil integer NOT NULL REFERENCES perfil(id),
        email varchar(50) NOT NULL,
        telefono varchar(20) NOT NULL,
        estado varchar(10) NOT NULL,
        departamento integer REFERENCES departamento(id),
        cargo varchar(50),
        superior integer REFERENCES usuario(id)
      );

      CREATE TABLE empresa(
        id SERIAL PRIMARY KEY,
        razon_social varchar(80) NOT NULL,
        ruc varchar(80) NOT NULL,
        celular_salida varchar(80) NOT NULL,
        direccion varchar(200) NOT NULL,
        contacto_responsable integer NOT NULL REFERENCES usuario(id),
        contacto_admin integer NOT NULL REFERENCES usuario(id),
        email varchar(80)
      );

      CREATE TABLE feriado(
        id SERIAL PRIMARY KEY,
        dia smallint NOT NULL,
        mes smallint NOT NULL,
        descripcion varchar(80) NOT NULL
      );

      CREATE TABLE proveedor(
        id SERIAL PRIMARY KEY,
        razon_social varchar(25) NOT NULL,
        nombre_fantasia varchar(25) NOT NULL,
        tipo_documento varchar(20) NOT NULL,
        numero_documento varchar(15) NOT NULL,
        pais varchar(50) NOT NULL DEFAULT 'PARAGUAY',
        departamento varchar(80) NOT NULL DEFAULT 'CENTRAL',
        ciudad varchar(80) NOT NULL DEFAULT 'LUQUE',
        barrio varchar(80),
        direccion varchar(100) NOT NULL,
        telefono varchar(20) NOT NULL,
        email varchar(80) NOT NULL,
        nombre_contacto varchar(40) NOT NULL,
        estado varchar(10) NOT NULL,
        CONSTRAINT proveedor_estado_check CHECK (estado IN ('Activo', 'Inactivo'))
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Tablas eliminadas y creadas correctamente.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al crear tablas:', error);
  } finally {
    client.release();
  }
};

const insertSampleData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insertar datos en departamento
    const depRes = await client.query(`
      INSERT INTO departamento (descripcion, estado)
      VALUES ('Sistemas', 'Activo'), ('Recursos Humanos', 'Activo')
      RETURNING id;
    `);

    // Insertar perfil
    const perfilRes = await client.query(`
      INSERT INTO perfil (descripcion, observacion, estado)
      VALUES ('Admin', 'Acceso total', 'Activo'),
             ('Empleado', 'Acceso limitado', 'Activo')
      RETURNING id;
    `);

    // Insertar usuario
    const usuarioRes = await client.query(`
      INSERT INTO usuario (usuario, contrasena, nombre, apellido, tipo_documento, numero_documento, perfil, email, telefono, estado, departamento)
      VALUES ('jdoe', '1234', 'John', 'Doe', 'CI', '1234567', ${perfilRes.rows[0].id}, 'jdoe@example.com', '0981123456', 'Activo', ${depRes.rows[0].id})
      RETURNING id;
    `);
    const userId = usuarioRes.rows[0].id;

    // Insertar empresa usando el mismo usuario como contacto
    await client.query(`
      INSERT INTO empresa (razon_social, ruc, celular_salida, direccion, contacto_responsable, contacto_admin, email)
      VALUES ('Mi Empresa S.A.', '80012345-6', '0981123456', 'Calle Falsa 123', ${userId}, ${userId}, 'empresa@example.com');
    `);

    // Insertar feriado
    await client.query(`
      INSERT INTO feriado (dia, mes, descripcion)
      VALUES (25, 12, 'Navidad');
    `);

    // Insertar proveedor
    await client.query(`
      INSERT INTO proveedor (razon_social, nombre_fantasia, tipo_documento, numero_documento, direccion, telefono, email, nombre_contacto, estado)
      VALUES ('Provee S.R.L.', 'Provee', 'RUC', '1234567-8', 'Av. Central 456', '021123456', 'contacto@provee.com', 'Maria Lopez', 'Activo');
    `);

    await client.query('COMMIT');
    console.log('✅ Datos de ejemplo insertados.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al insertar datos:', error);
  } finally {
    client.release();
  }
};

const main = async () => {
  await createTables();
  await insertSampleData();
  await pool.end();
};

main();
