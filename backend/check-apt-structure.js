const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAptStructure() {
  try {
    const result = await pool.query(`
      SELECT apt_profile 
      FROM artists 
      WHERE apt_profile IS NOT NULL 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      console.log('Existing APT profile structure:');
      console.log(JSON.stringify(result.rows[0].apt_profile, null, 2));
    } else {
      console.log('No existing APT profiles found');
      
      // Check if there are any artists with names we recognize
      const artistCheck = await pool.query(`
        SELECT name, id, apt_profile IS NOT NULL as has_apt
        FROM artists 
        WHERE name IN ('Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci')
        LIMIT 5
      `);
      
      console.log('\nSample artists:');
      artistCheck.rows.forEach(artist => {
        console.log(`- ${artist.name}: ${artist.has_apt ? 'Has APT' : 'No APT'}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAptStructure();