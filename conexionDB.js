// conexionBD.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_WpTDyYH6Mt0n@ep-morning-cloud-a5p4js6l-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

const pg = require('pg');
pg.types.setTypeParser(1114, function(stringValue) {
  return stringValue;  //1114 for time without timezone type
});

pg.types.setTypeParser(1082, function(stringValue) {
  return stringValue;  //1082 for date type
});

module.exports = pool;
