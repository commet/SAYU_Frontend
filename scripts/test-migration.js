#!/usr/bin/env node
/**
 * Test migration for critical tables with just 10 records each
 * 중요 테이블의 작은 샘플 마이그레이션 테스트
 */
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
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

async function testTableMigration(railwayClient, supabase, railwayTable, supabaseTable) {
  log(`\n🧪 Testing ${railwayTable} → ${supabaseTable}...`, 'blue');
  
  try {
    // Railway에서 10개 샘플만 가져오기
    const result = await railwayClient.query(`SELECT * FROM ${railwayTable} LIMIT 10`);
    log(`  Found ${result.rows.length} sample records`, 'blue');

    if (result.rows.length === 0) {
      log(`  ⚠️  No data to test`, 'yellow');
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    let lastError = null;

    for (const row of result.rows) {
      try {
        // Railway ID 제거
        const { id, ...data } = row;
        
        // 간단한 데이터 변환
        const supabaseData = {
          ...data,
          metadata: data.metadata || { railway_id: id }
        };

        // Supabase에 삽입
        const { error } = await supabase
          .from(supabaseTable)
          .insert(supabaseData);

        if (error) {
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            log(`    ❌ Table ${supabaseTable} does not exist`, 'red');
            return { success: 0, failed: result.rows.length, needsTable: true };
          }
          failed++;
          lastError = error.message;
        } else {
          success++;
        }
      } catch (error) {
        failed++;
        lastError = error.message;
      }
    }

    log(`  📊 Result: ${success} success, ${failed} failed`, success > 0 ? 'green' : 'red');
    if (lastError && failed > 0) {
      log(`  Last error: ${lastError.substring(0, 100)}...`, 'red');
    }
    
    return { success, failed, lastError };
    
  } catch (error) {
    log(`  ✗ Test failed: ${error.message}`, 'red');
    return { success: 0, failed: 1, error: error.message };
  }
}

async function main() {
  log('🧪 Test Migration - Critical Tables Only', 'blue');
  log('='.repeat(50), 'blue');

  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const testTables = [
    { railway: 'artists', supabase: 'artists' },
    { railway: 'global_venues', supabase: 'global_venues' },
    { railway: 'artvee_artworks', supabase: 'artvee_artworks' },
    { railway: 'apt_profiles', supabase: 'apt_profiles' }
  ];

  try {
    await railwayClient.connect();
    log('✓ Connected to Railway and Supabase', 'green');
    
    const results = {};
    
    for (const table of testTables) {
      const result = await testTableMigration(
        railwayClient, 
        supabase, 
        table.railway, 
        table.supabase
      );
      results[table.railway] = result;
    }

    await railwayClient.end();

    // 결과 요약
    log('\n📊 Test Results Summary:', 'blue');
    log('='.repeat(50), 'blue');
    
    let anySuccess = false;
    Object.entries(results).forEach(([table, result]) => {
      const status = result.needsTable ? '❌ Table Missing' :
                     result.success > 0 ? '✅ Working' : '❌ Failed';
      
      log(`${table.padEnd(20)} ${status}`, 
          result.needsTable ? 'red' : result.success > 0 ? 'green' : 'red');
      
      if (result.success > 0) anySuccess = true;
    });

    if (anySuccess) {
      log('\n✅ Some tables are working! Ready for full migration.', 'green');
    } else {
      log('\n❌ No tables are working. Check schema and constraints.', 'red');
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