require('dotenv').config();
const { Client } = require('pg');

async function checkUsersTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('railway') 
      ? { rejectUnauthorized: false }
      : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check users table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Users table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // Check if users table exists and has data
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n📈 Total users: ${userCount.rows[0].count}`);

    // Check pioneer numbers
    const pioneerCount = await client.query('SELECT COUNT(*) FROM users WHERE pioneer_number IS NOT NULL');
    console.log(`🏆 Users with pioneer numbers: ${pioneerCount.rows[0].count}`);

    // Check max pioneer number
    const maxPioneer = await client.query('SELECT MAX(pioneer_number) FROM users');
    console.log(`🥇 Highest pioneer number: ${maxPioneer.rows[0].max || 'None'}`);

    // Try to create a test user
    console.log('\n🧪 Testing user creation...');
    try {
      const testResult = await client.query(`
        INSERT INTO users (email, password_hash, nickname)
        VALUES ($1, $2, $3)
        RETURNING id, pioneer_number, email, nickname, created_at
      `, [`test_${Date.now()}@example.com`, 'test_hash', 'Test User']);

      console.log('✅ Test user created successfully:', testResult.rows[0]);
    } catch (createError) {
      console.error('❌ Test user creation failed:', createError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkUsersTable();