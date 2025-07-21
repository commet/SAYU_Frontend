/**
 * Run Easter Egg Migration
 * This script runs the easter egg database migration
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// Create database connection
const sslConfig = process.env.DATABASE_URL?.includes('railway') 
  ? { rejectUnauthorized: false }
  : process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig
});

async function runMigration() {
  console.log('🐣 Running Easter Egg Migration...');
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_easter_egg_tables.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Split by semicolons but keep them for PostgreSQL
    const statements = migrationSQL
      .split(/;\s*$(?=\n)/m)
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim() + (stmt.trim().endsWith(';') ? '' : ';'));
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (!statement.trim() || statement.trim() === ';') {
        continue;
      }
      
      // Log progress for longer migrations
      if (statement.includes('CREATE TABLE')) {
        const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
        if (tableMatch) {
          console.log(`📊 Creating table: ${tableMatch[1]}`);
        }
      } else if (statement.includes('INSERT INTO')) {
        console.log(`📝 Inserting initial data...`);
      } else if (statement.includes('CREATE INDEX')) {
        const indexMatch = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/i);
        if (indexMatch) {
          console.log(`🔍 Creating index: ${indexMatch[1]}`);
        }
      }
      
      try {
        await pool.query(statement);
      } catch (error) {
        // Handle specific errors
        if (error.code === '42P07') { // duplicate_table
          console.log(`⚠️  Table already exists, skipping...`);
        } else if (error.code === '42P01') { // undefined_table
          console.log(`⚠️  Referenced table doesn't exist: ${error.message}`);
          throw error;
        } else if (error.code === '42701') { // duplicate_column
          console.log(`⚠️  Column already exists, skipping...`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }
    
    // Verify migration success
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('easter_eggs', 'user_easter_eggs')
    `);
    
    const eggCount = await pool.query('SELECT COUNT(*) FROM easter_eggs');
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`📊 Tables created: ${tableCheck.rows[0].table_count}/2`);
    console.log(`🥚 Easter eggs inserted: ${eggCount.rows[0].count}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n🎉 Easter Egg system is ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });