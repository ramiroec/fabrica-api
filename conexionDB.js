// conexionBD.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://fullstack_wut1_user:2U7gh27uiFCcAqqjX4C9ZP3r3UqToXiY@dpg-cvo31jk9c44c73bhucfg-a.oregon-postgres.render.com/fullstack_wut1?sslmode=require',
});

const pg = require('pg');
pg.types.setTypeParser(1114, function(stringValue) {
  return stringValue;  //1114 for time without timezone type
});

pg.types.setTypeParser(1082, function(stringValue) {
  return stringValue;  //1082 for date type
});

module.exports = pool;
