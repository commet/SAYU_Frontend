const { Pool } = require('pg');

// Get database URL from environment or Railway
const DATABASE_URL = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found. Please run with Railway: railway run node enable-pgvector.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function enablePgVector() {
  try {
    console.log('Enabling pgvector extension...');
    
    // First, check if pgvector is available
    const checkResult = await pool.query(`
      SELECT * FROM pg_available_extensions WHERE name = 'vector';
    `);
    
    if (checkResult.rows.length > 0) {
      // Try to create the extension
      await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('✅ pgvector extension enabled successfully!');
    } else {
      console.log('❌ pgvector extension is not available on this PostgreSQL installation');
      console.log('You may need to use a different PostgreSQL provider or use schema-no-vector.sql');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

enablePgVector();