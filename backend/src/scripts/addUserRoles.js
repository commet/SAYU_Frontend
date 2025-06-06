require('dotenv').config();
const { pool } = require('../config/database');

async function addUserRoles() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Add role column to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
    `);
    
    console.log('✅ Added role column to users table');
    
    // Create index on role for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);
    
    console.log('✅ Created index on role column');
    
    await client.query('COMMIT');
    console.log('✅ User roles migration completed successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
addUserRoles()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));