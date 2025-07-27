#!/usr/bin/env node
/**
 * Check Railway Schema Structure
 */
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function checkTableStructure(client, tableName) {
  try {
    const result = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position;
    `, [tableName]);
    
    return result.rows;
  } catch (error) {
    return null;
  }
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to Railway PostgreSQL');

    // Check key tables
    const tablesToCheck = ['users', 'venues', 'exhibitions'];
    
    for (const tableName of tablesToCheck) {
      console.log(`\n📋 ${tableName.toUpperCase()} Table Structure:`);
      console.log('='.repeat(50));
      
      const columns = await checkTableStructure(client, tableName);
      
      if (columns && columns.length > 0) {
        columns.forEach(col => {
          console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      } else {
        console.log(`  ⚠️  Table ${tableName} not found or empty`);
      }
    }

    // Get actual data sample
    console.log('\n📊 Sample Data:');
    console.log('='.repeat(50));
    
    try {
      const userSample = await client.query('SELECT * FROM users LIMIT 1');
      if (userSample.rows.length > 0) {
        console.log('\nUsers columns:', Object.keys(userSample.rows[0]).join(', '));
      }
    } catch (e) {
      console.log('Users table: No data or error');
    }

    try {
      const venueSample = await client.query('SELECT * FROM venues LIMIT 1');
      if (venueSample.rows.length > 0) {
        console.log('\nVenues columns:', Object.keys(venueSample.rows[0]).join(', '));
      }
    } catch (e) {
      console.log('Venues table: No data or error');
    }

    try {
      const exhibitionSample = await client.query('SELECT * FROM exhibitions LIMIT 1');
      if (exhibitionSample.rows.length > 0) {
        console.log('\nExhibitions columns:', Object.keys(exhibitionSample.rows[0]).join(', '));
      }
    } catch (e) {
      console.log('Exhibitions table: No data or error');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);