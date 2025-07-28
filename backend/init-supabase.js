const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// You'll need to set this with your Supabase connection string
const DATABASE_URL = process.env.SUPABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(`
Please set your Supabase connection string:
  export SUPABASE_URL="postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:5432/postgres"
  
Or run with:
  SUPABASE_URL="your-connection-string" node init-supabase.js
`);
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Force IPv4
  host: 'db.dvbsopkjedkrjvhmwdpn.supabase.co'
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
    console.log('🚀 Starting Supabase database initialization...\n');

    // Test connection first
    const testResult = await pool.query('SELECT version()');
    console.log('✓ Connected to PostgreSQL:', testResult.rows[0].version);

    // Check for pgvector
    const vectorCheck = await pool.query(`
      SELECT * FROM pg_available_extensions WHERE name = 'vector';
    `);

    if (vectorCheck.rows.length > 0) {
      console.log('✓ pgvector is available!');
    }

    // Run files in order
    await runSQLFile('schema.sql'); // Can use the full schema with pgvector!
    await runSQLFile('migrations/add-oauth-accounts.sql');
    await runSQLFile('migrations/add-user-roles.sql');
    await runSQLFile('migrations/add-community-features.sql');
    await runSQLFile('migrations/add-email-system.sql');
    await runSQLFile('migrations/performance-indexes.sql');

    console.log('\n✅ Supabase database initialization completed successfully!');

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\nCreated tables:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // Check if pgvector extension was created
    const extensions = await pool.query(`
      SELECT extname FROM pg_extension WHERE extname = 'vector';
    `);

    if (extensions.rows.length > 0) {
      console.log('\n✓ pgvector extension is active!');
    }

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
