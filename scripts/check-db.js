require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const db = await pool.query('SELECT current_database() AS db_name');
    console.log('DATABASE', db.rows[0].db_name);

    const tables = await pool.query(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = $1 ORDER BY table_schema",
      ['products']
    );
    console.log('TABLES', JSON.stringify(tables.rows, null, 2));

    const count = await pool.query('SELECT COUNT(*) AS cnt FROM products');
    console.log('COUNT', count.rows[0].cnt);
  } catch (err) {
    console.error('ERROR', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
})();