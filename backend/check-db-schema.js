const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkSchema() {
  try {
    console.log('Checking database schema...\n');
    
    // Check exhibitions table
    const exhibitionsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'exhibitions'
      ORDER BY ordinal_position
    `);
    
    if (exhibitionsColumns.rows.length > 0) {
      console.log('Exhibitions table structure:');
      exhibitionsColumns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('Exhibitions table does not exist');
    }
    
    // Check venues table
    const venuesExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'venues'
      )
    `);
    
    console.log('\nVenues table exists:', venuesExists.rows[0].exists);
    
    if (!venuesExists.rows[0].exists) {
      console.log('\nCreating venues table...');
      await pool.query(`
        CREATE TABLE venues (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          name_en VARCHAR(255),
          city VARCHAR(100),
          district VARCHAR(100),
          country VARCHAR(2) DEFAULT 'KR',
          type VARCHAR(50) DEFAULT 'gallery',
          tier INTEGER DEFAULT 2,
          website VARCHAR(500),
          address VARCHAR(500),
          instagram VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('Venues table created successfully!');
    }
    
    // Check artists table
    const artistsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'artists'
      LIMIT 3
    `);
    
    console.log('\nArtists table:', artistsColumns.rows.length > 0 ? 'exists' : 'does not exist');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();