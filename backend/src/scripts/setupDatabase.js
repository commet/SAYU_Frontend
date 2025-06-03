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
    const schemaPath = path.join(__dirname, '../../schema-no-vector.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📝 Applying database schema...');
    
    // Execute schema
    await client.query(schema);
    
    console.log('✅ Database schema created successfully');
    
    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_quiz_sessions_type ON quiz_sessions(session_type);'
    ];
    
    console.log('📝 Creating indexes...');
    for (const index of indexes) {
      await client.query(index);
    }
    
    console.log('✅ Indexes created successfully');
    
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