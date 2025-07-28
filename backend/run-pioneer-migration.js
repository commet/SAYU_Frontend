require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('railway')
      ? { rejectUnauthorized: false }
      : false
  });

  try {
    console.log('🔗 Connecting to Railway database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read and execute migration
    const migrationSQL = fs.readFileSync('./src/migrations/add_pioneer_system.sql', 'utf8');

    console.log('🚀 Running Pioneer system migration...');
    await client.query(migrationSQL);
    console.log('✅ Pioneer system migration completed');

    // Test the migration
    console.log('🧪 Testing Pioneer system...');

    // Check if tables exist
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('journey_nudges', 'journey_templates')
    `);

    console.log('📊 Created tables:', tableCheck.rows.map(r => r.table_name));

    // Check users table has pioneer_number column
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'pioneer_number'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ pioneer_number column added to users table');
    }

    // Check journey templates
    const templateCount = await client.query('SELECT COUNT(*) FROM journey_templates');
    console.log(`✅ Journey templates created: ${templateCount.rows[0].count}`);

    // Check pioneer stats view
    const statsCheck = await client.query('SELECT * FROM pioneer_stats LIMIT 1');
    console.log('✅ Pioneer stats view:', statsCheck.rows[0]);

    console.log('🎉 All systems ready!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
