require('dotenv').config();
const { Client } = require('pg');

async function createTestPioneer() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('railway')
      ? { rejectUnauthorized: false }
      : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create a test pioneer with correct column names
    const testEmail = `pioneer_test_${Date.now()}@test.com`;

    const result = await client.query(`
      INSERT INTO users (email, password_hash, username)
      VALUES ($1, $2, $3)
      RETURNING id, pioneer_number, email, username, created_at
    `, [testEmail, 'test_hash_123', 'TestPioneer']);

    console.log('✅ Test Pioneer created successfully:');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Username: ${result.rows[0].username}`);
    console.log(`   Pioneer Number: ${result.rows[0].pioneer_number}`);
    console.log(`   Created: ${result.rows[0].created_at}`);

    // Check updated stats
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_pioneers,
        MAX(pioneer_number) as latest_pioneer_number,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as new_today
      FROM users 
      WHERE pioneer_number IS NOT NULL
    `);

    console.log('\n📊 Updated Pioneer Statistics:');
    console.log(`   Total Pioneers: ${stats.rows[0].total_pioneers}`);
    console.log(`   Latest Pioneer Number: ${stats.rows[0].latest_pioneer_number}`);
    console.log(`   New Today: ${stats.rows[0].new_today}`);

  } catch (error) {
    console.error('❌ Error creating test pioneer:', error);
  } finally {
    await client.end();
  }
}

createTestPioneer();
