require('dotenv').config();
const { pool } = require('./src/config/database');

async function testSimpleQuery() {
  try {
    const result = await pool.query(`
      SELECT * FROM artvee_artworks 
      WHERE sayu_type = $1 
      ORDER BY RANDOM() 
      LIMIT $2
    `, ['LAEF', 3]);
    
    console.log('✅ Query successful');
    console.log('Records found:', result.rows.length);
    console.log('Sample artwork:', result.rows[0]?.title);
    
    return result.rows;
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

testSimpleQuery();