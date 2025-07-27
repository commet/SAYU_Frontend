#!/usr/bin/env node
/**
 * Final Data Migration - Direct mapping without transformation
 * 최종 데이터 마이그레이션 - 변환 없이 직접 매핑
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

async function migrateTableDirect(railwayClient, supabase, tableName, limit = null) {
  log(`\n📋 Migrating ${tableName}${limit ? ` (${limit} records)` : ' (ALL records)'}...`, 'blue');
  
  try {
    // Railway에서 데이터 가져오기
    const query = limit ? `SELECT * FROM ${tableName} LIMIT ${limit}` : `SELECT * FROM ${tableName}`;
    const result = await railwayClient.query(query);
    log(`  Found ${result.rows.length} records in Railway`, 'blue');

    if (result.rows.length === 0) {
      return { success: 0, failed: 0, skipped: 0 };
    }

    let success = 0;
    let failed = 0;
    let skipped = 0;
    let errors = [];

    const batchSize = 10; // 작은 배치로 처리
    
    for (let i = 0; i < result.rows.length; i += batchSize) {
      const batch = result.rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          // Railway ID 제거 (Supabase는 자동으로 UUID 생성)
          const { id, ...cleanData } = row;
          
          // NULL 값 제거 및 데이터 정리
          const filteredData = {};
          Object.keys(cleanData).forEach(key => {
            const value = cleanData[key];
            if (value !== null && value !== undefined) {
              // 빈 배열이나 빈 객체 처리
              if (Array.isArray(value) && value.length === 0) {
                filteredData[key] = [];
              } else if (typeof value === 'object' && Object.keys(value).length === 0) {
                filteredData[key] = {};
              } else {
                filteredData[key] = value;
              }
            }
          });

          // Supabase에 삽입 (conflict 시 무시)
          const { error } = await supabase
            .from(tableName)
            .insert(filteredData);

          if (error) {
            if (error.message.includes('duplicate') || error.message.includes('conflict')) {
              skipped++;
            } else {
              failed++;
              errors.push(error.message);
            }
          } else {
            success++;
          }
          
          // 진행 상황 표시
          const total = success + failed + skipped;
          if (total % 50 === 0) {
            log(`    Progress: ${total}/${result.rows.length} (${success} success, ${failed} failed, ${skipped} skipped)`, 'yellow');
          }
          
        } catch (error) {
          failed++;
          errors.push(error.message);
        }
      }
    }

    const statusColor = success > failed ? 'green' : success > 0 ? 'yellow' : 'red';
    log(`  📊 ${tableName}: ${success} success, ${failed} failed, ${skipped} skipped`, statusColor);
    
    if (errors.length > 0) {
      log(`  Sample errors: ${errors.slice(0, 2).join('; ')}`, 'red');
    }
    
    return { success, failed, skipped, errors: errors.slice(0, 5) };
    
  } catch (error) {
    log(`  ✗ ${tableName}: ${error.message}`, 'red');
    return { success: 0, failed: 1, skipped: 0, errors: [error.message] };
  }
}

async function main() {
  log('🚀 Final Data Migration - All Critical Data', 'blue');
  log('='.repeat(70), 'blue');

  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // 마이그레이션할 테이블들 (우선순위 순)
  const migrationTables = [
    { name: 'artists', limit: 100 },      // 1423개 중 100개 먼저
    { name: 'artvee_artworks', limit: 50 }, // 794개 중 50개 먼저  
    { name: 'apt_profiles', limit: null },   // 44개 전체
    { name: 'global_venues', limit: 100 }    // 1088개 중 100개 먼저
  ];

  try {
    await railwayClient.connect();
    log('✓ Connected to Railway and Supabase', 'green');
    
    const results = {};
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    
    for (const table of migrationTables) {
      const result = await migrateTableDirect(
        railwayClient, 
        supabase, 
        table.name, 
        table.limit
      );
      
      results[table.name] = result;
      totalSuccess += result.success;
      totalFailed += result.failed;
      totalSkipped += result.skipped;
    }

    await railwayClient.end();

    // 최종 요약
    log('\n📊 Final Migration Summary:', 'blue');
    log('='.repeat(70), 'blue');
    
    Object.entries(results).forEach(([table, result]) => {
      const rate = result.success + result.failed > 0 ? 
        Math.round(result.success / (result.success + result.failed) * 100) : 0;
      
      const status = result.success > 0 ? `✅ ${rate}% success` : '❌ Failed';
      
      log(`${table.padEnd(20)} ${result.success.toString().padEnd(8)} ${result.failed.toString().padEnd(8)} ${result.skipped.toString().padEnd(8)} ${status}`, 
          result.success > 0 ? 'green' : 'red');
    });

    log(`\n🎯 Overall: ${totalSuccess} success, ${totalFailed} failed, ${totalSkipped} skipped`, 
        totalSuccess > 0 ? 'green' : 'red');

    if (totalSuccess > 0) {
      log('\n✅ Partial migration successful! Ready to scale up.', 'green');
      log('🔥 If this works well, we can increase limits and migrate ALL data!', 'yellow');
    } else {
      log('\n❌ No data migrated. Need to investigate issues.', 'red');
    }

  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    await railwayClient.end();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}