const { pool } = require('./backend/src/config/database');

async function checkDatabaseStructure() {
  try {
    // Check if users table exists
    const usersCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    console.log('=== DATABASE STRUCTURE CHECK ===');
    console.log('Users table exists:', usersCheck.rows.length > 0);
    
    if (usersCheck.rows.length > 0) {
      // Get users table structure
      const usersStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Users table structure:');
      usersStructure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
    }
    
    // Check if exhibition_visits table exists
    const visitsCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'exhibition_visits'
    `);
    
    console.log('\n✅ Exhibition visits table exists:', visitsCheck.rows.length > 0);
    
    // List all tables
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 All existing tables:');
    allTables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Test database connection
    const testConnection = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('\n🔗 Database connection test:');
    console.log('  Current time:', testConnection.rows[0].current_time);
    console.log('  Database version:', testConnection.rows[0].db_version.split(' ')[0]);
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseStructure();