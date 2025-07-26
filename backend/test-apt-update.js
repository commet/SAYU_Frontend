const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testDirectUpdate() {
  try {
    // Check if the artist exists first
    const checkArtist = await pool.query(`
      SELECT id, name FROM artists WHERE name = 'Andreas Gursky'
    `);
    
    console.log('Artist check:', checkArtist.rows);
    
    if (checkArtist.rows.length === 0) {
      console.log('Artist not found, trying by partial name...');
      
      const partialCheck = await pool.query(`
        SELECT id, name FROM artists WHERE name ILIKE '%Gursky%'
      `);
      
      console.log('Partial match:', partialCheck.rows);
    }
    
    // Test with a simple minimal profile
    const simpleProfile = {
      meta: {
        source: 'test',
        confidence: 0.9
      },
      dimensions: {
        A: 50, C: 60, E: 40, F: 50, L: 70, M: 60, R: 80, S: 60
      },
      primary_types: [
        { type: 'OWL', weight: 0.8 }
      ]
    };
    
    if (checkArtist.rows.length > 0) {
      const result = await pool.query(`
        UPDATE artists 
        SET apt_profile = $1
        WHERE id = $2
        RETURNING name, id
      `, [JSON.stringify(simpleProfile), checkArtist.rows[0].id]);
      
      console.log('Direct update result:', result.rows);
    }
    
  } catch (error) {
    console.error('Direct update error:', error.message);
  } finally {
    await pool.end();
  }
}

testDirectUpdate();