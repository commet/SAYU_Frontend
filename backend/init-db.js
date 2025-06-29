const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database URL from environment or Railway
const DATABASE_URL = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found. Please run with Railway: railway run node init-db.js');
  process.exit(1);
}

console.log('Using database connection...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSQLFile(filename) {
  try {
    console.log(`\nRunning ${filename}...`);
    const sql = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    await pool.query(sql);
    console.log(`✓ ${filename} completed successfully`);
  } catch (error) {
    console.error(`✗ Error running ${filename}:`, error.message);
    throw error;
  }
}

async function initDatabase() {
  try {
    console.log('Starting database initialization...\n');
    
    // Run files in order
    await runSQLFile('schema.sql');
    await runSQLFile('migrations/add-oauth-accounts.sql');
    await runSQLFile('migrations/add-user-roles.sql');
    await runSQLFile('migrations/add-community-features.sql');
    await runSQLFile('migrations/add-email-system.sql');
    await runSQLFile('migrations/performance-indexes.sql');
    
    console.log('\n✅ Database initialization completed successfully!');
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\nCreated tables:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();