#!/usr/bin/env node
/**
 * REST API Migration - Use Supabase REST API directly
 * Supabase REST API 직접 사용으로 마이그레이션
 */
const { Client } = require('pg');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function insertToSupabaseREST(tableName, data) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${tableName}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response;
}

async function migrateTableREST(railwayClient, tableName, limit = 10) {
  log(`\n📋 Migrating ${tableName} via REST API (${limit} records)...`, 'blue');
  
  try {
    // Railway에서 데이터 가져오기
    const result = await railwayClient.query(`SELECT * FROM ${tableName} LIMIT ${limit}`);
    log(`  Found ${result.rows.length} records in Railway`, 'blue');

    if (result.rows.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    let errors = [];

    for (const row of result.rows) {
      try {
        // Railway ID 제거하고 데이터 정리
        const { id, ...cleanData } = row;
        
        // null 값과 undefined 제거
        const filteredData = {};
        Object.keys(cleanData).forEach(key => {
          if (cleanData[key] !== null && cleanData[key] !== undefined) {
            filteredData[key] = cleanData[key];
          }
        });

        // REST API로 삽입
        await insertToSupabaseREST(tableName, filteredData);
        success++;
        
        if (success % 5 === 0) {
          log(`    Progress: ${success}/${result.rows.length}`, 'green');
        }
        
      } catch (error) {
        failed++;
        errors.push(error.message);
        if (errors.length <= 2) {
          log(`    Error: ${error.message.substring(0, 80)}...`, 'red');
        }
      }
    }

    log(`  📊 ${tableName}: ${success} success, ${failed} failed`, success > 0 ? 'green' : 'red');
    return { success, failed, errors: errors.slice(0, 3) };
    
  } catch (error) {
    log(`  ✗ ${tableName}: ${error.message}`, 'red');
    return { success: 0, failed: 1, errors: [error.message] };
  }
}

async function main() {
  log('🌐 REST API Migration Test', 'blue');
  log('='.repeat(50), 'blue');

  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const testTables = [
    { name: 'artists', limit: 5 },
    { name: 'artvee_artworks', limit: 5 },
    { name: 'apt_profiles', limit: 5 },
    { name: 'global_venues', limit: 5 }
  ];

  try {
    await railwayClient.connect();
    log('✓ Connected to Railway', 'green');
    
    const results = {};
    
    for (const table of testTables) {
      const result = await migrateTableREST(railwayClient, table.name, table.limit);
      results[table.name] = result;
    }

    await railwayClient.end();

    // 결과 요약
    log('\n📊 REST API Test Results:', 'blue');
    log('='.repeat(50), 'blue');
    
    let anySuccess = false;
    Object.entries(results).forEach(([table, result]) => {
      const status = result.success > 0 ? '✅ Working' : '❌ Failed';
      log(`${table.padEnd(20)} ${status}`, result.success > 0 ? 'green' : 'red');
      
      if (result.success > 0) anySuccess = true;
    });

    if (anySuccess) {
      log('\n✅ REST API working! Ready for full migration.', 'green');
    } else {
      log('\n❌ REST API failed. Check table schema match.', 'red');
    }

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    await railwayClient.end();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}