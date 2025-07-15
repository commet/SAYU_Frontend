#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function testRailwayConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('🔍 Testing Railway connection...');
  console.log('DATABASE_URL:', databaseUrl ? `${databaseUrl.substring(0, 50)}...` : 'NOT FOUND');
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Railway PostgreSQL');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('🕐 Server time:', result.rows[0].current_time);
    
    // Check existing tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Existing tables:', tables.rows.map(r => r.table_name));
    
    client.release();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testRailwayConnection();