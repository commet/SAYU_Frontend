#!/usr/bin/env node
/**
 * Direct SQL Migration - Bypass Supabase JS client cache issues
 * SQL 직접 실행으로 스키마 캐시 우회
 */
const { Client } = require('pg');
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

// Supabase connection string 생성
function getSupabaseConnectionString() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  
  // URL에서 호스트 추출
  const urlParts = url.replace('https://', '').split('.');
  const projectId = urlParts[0];
  
  return `postgresql://postgres.${projectId}:${serviceKey}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;
}

async function migrateTableDirectSQL(railwayClient, supabaseClient, tableName, limit = 50) {
  log(`\n📋 Migrating ${tableName} (${limit} records)...`, 'blue');
  
  try {
    // Railway에서 데이터 가져오기
    const railwayResult = await railwayClient.query(`SELECT * FROM ${tableName} LIMIT ${limit}`);
    log(`  Found ${railwayResult.rows.length} records in Railway`, 'blue');

    if (railwayResult.rows.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    let errors = [];

    for (const row of railwayResult.rows) {
      try {
        // 데이터 변환
        const { id, ...data } = row;
        
        // 컬럼명과 값 추출
        const columns = Object.keys(data);
        const values = Object.values(data);
        
        // SQL 준비
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');
        
        const insertSQL = `
          INSERT INTO ${tableName} (${columnNames}) 
          VALUES (${placeholders})
          ON CONFLICT (id) DO NOTHING
        `;

        // 직접 SQL 실행
        await supabaseClient.query(insertSQL, values);
        success++;
        
        if (success % 10 === 0) {
          log(`    Progress: ${success}/${railwayResult.rows.length}`, 'green');
        }
        
      } catch (error) {
        failed++;
        errors.push(error.message);
        if (errors.length <= 3) {
          log(`    Error: ${error.message.substring(0, 100)}`, 'red');
        }
      }
    }

    log(`  📊 ${tableName}: ${success} success, ${failed} failed`, success > 0 ? 'green' : 'red');
    return { success, failed, errors: errors.slice(0, 5) };
    
  } catch (error) {
    log(`  ✗ ${tableName} migration failed: ${error.message}`, 'red');
    return { success: 0, failed: 1, errors: [error.message] };
  }
}

async function main() {
  log('🚀 Direct SQL Migration - Critical Data', 'blue');
  log('='.repeat(60), 'blue');

  // Railway 연결
  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  // Supabase 직접 연결 (캐시 우회)
  const supabaseConnectionString = getSupabaseConnectionString();
  const supabaseClient = new Client({
    connectionString: supabaseConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  const criticalTables = [
    { name: 'artists', limit: 100 },      // 1423개 중 100개 테스트
    { name: 'artvee_artworks', limit: 50 }, // 794개 중 50개 테스트
    { name: 'global_venues', limit: 50 },   // 1088개 중 50개 테스트
    { name: 'apt_profiles', limit: 44 }     // 44개 전체
  ];

  try {
    await railwayClient.connect();
    await supabaseClient.connect();
    log('✓ Connected to Railway and Supabase (direct)', 'green');
    
    const results = {};
    
    for (const table of criticalTables) {
      const result = await migrateTableDirectSQL(
        railwayClient, 
        supabaseClient, 
        table.name, 
        table.limit
      );
      results[table.name] = result;
    }

    await railwayClient.end();
    await supabaseClient.end();

    // 결과 요약
    log('\n📊 Direct Migration Summary:', 'blue');
    log('='.repeat(60), 'blue');
    
    let totalSuccess = 0;
    let totalFailed = 0;
    
    Object.entries(results).forEach(([table, result]) => {
      const status = result.success > 0 ? '✅ Success' : '❌ Failed';
      log(`${table.padEnd(20)} ${result.success.toString().padEnd(8)} ${result.failed.toString().padEnd(8)} ${status}`, 
          result.success > 0 ? 'green' : 'red');
      
      totalSuccess += result.success;
      totalFailed += result.failed;
    });

    log(`\nTotal: ${totalSuccess} success, ${totalFailed} failed`, 
        totalSuccess > 0 ? 'green' : 'red');

    if (totalSuccess > 0) {
      log('\n✅ Direct SQL migration working! Ready for full migration.', 'green');
    } else {
      log('\n❌ Direct SQL migration failed. Check connection and schema.', 'red');
    }

  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    await railwayClient.end();
    await supabaseClient.end();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}