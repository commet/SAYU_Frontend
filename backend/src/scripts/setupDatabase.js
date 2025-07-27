const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  // Connect to PostgreSQL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../migrations/master-schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📝 Applying database schema...');
    
    // Execute schema
    await client.query(schema);
    
    console.log('✅ Database schema created successfully');
    
    // Indexes are already created in master-schema.sql
    console.log('✅ Indexes are created as part of the schema');
    
    client.release();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;