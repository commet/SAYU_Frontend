const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkExhibitionsSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'exhibitions' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Current exhibitions table schema:');
    console.table(result.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error checking schema:', error);
    await pool.end();
  }
}

checkExhibitionsSchema();