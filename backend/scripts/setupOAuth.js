require('dotenv').config();
const { pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function setupOAuth() {
  try {
    console.log('🔐 Setting up OAuth tables...');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../migrations/add-oauth-accounts.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ OAuth tables created successfully');
    console.log('📋 Created tables:');
    console.log('   - user_oauth_accounts');
    console.log('📋 Added columns to users table:');
    console.log('   - oauth_profile_image');
    console.log('   - last_login_provider');

    // Verify the tables were created
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_oauth_accounts'
    `);

    if (tableCheck.rows.length > 0) {
      console.log('✅ OAuth setup completed successfully!');
    } else {
      console.error('❌ OAuth table creation verification failed');
    }

  } catch (error) {
    console.error('❌ OAuth setup failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
  } finally {
    await pool.end();
  }
}

setupOAuth();
