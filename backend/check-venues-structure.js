const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkVenuesTable() {
  try {
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'venues'
      ORDER BY ordinal_position
    `);
    
    console.log('venues 테이블 컬럼:');
    columns.rows.forEach(col => console.log(` - ${col.column_name}: ${col.data_type}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkVenuesTable();