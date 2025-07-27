#!/usr/bin/env node
/**
 * Load All Dumped Data into Supabase
 * 덤프된 모든 데이터를 Supabase에 로드
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

async function loadTableData(supabase, tableName) {
  log(`\n📥 Loading ${tableName} data...`, 'blue');
  
  const dataFile = path.join(__dirname, `data_${tableName}.json`);
  
  if (!fs.existsSync(dataFile)) {
    log(`  ⚠️  No data file found: ${dataFile}`, 'yellow');
    return { success: 0, failed: 0, skipped: 0 };
  }
  
  try {
    const rawData = fs.readFileSync(dataFile, 'utf8');
    const data = JSON.parse(rawData);
    
    if (!Array.isArray(data) || data.length === 0) {
      log(`  ⚠️  No data in ${tableName}`, 'yellow');
      return { success: 0, failed: 0, skipped: 0 };
    }
    
    log(`  Found ${data.length} records to load`, 'blue');
    
    let success = 0;
    let failed = 0;
    let skipped = 0;
    let errors = [];
    
    const batchSize = 50; // 배치 크기
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        // Railway ID 제거하고 데이터 정리
        const cleanBatch = batch.map(row => {
          const { id, ...cleanData } = row;
          
          // null 값 및 undefined 제거
          const filteredData = {};
          Object.keys(cleanData).forEach(key => {
            const value = cleanData[key];
            if (value !== null && value !== undefined) {
              // 빈 문자열도 유지 (일부 필드는 빈 문자열이 유효할 수 있음)
              filteredData[key] = value;
            }
          });
          
          return filteredData;
        });
        
        // Supabase에 배치 삽입 (충돌 시 무시)
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .insert(cleanBatch)
          .select('id');
        
        if (error) {
          // 일부 에러는 허용 (중복 등)
          if (error.message.includes('duplicate') || 
              error.message.includes('already exists') ||
              error.message.includes('unique constraint')) {
            skipped += batch.length;
            log(`    Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} skipped (duplicates)`, 'yellow');
          } else {
            failed += batch.length;
            errors.push(error.message);
            log(`    Batch ${Math.floor(i/batchSize) + 1}: Error - ${error.message.substring(0, 80)}`, 'red');
          }
        } else {
          const inserted = insertedData ? insertedData.length : batch.length;
          success += inserted;
          log(`    Batch ${Math.floor(i/batchSize) + 1}: ${inserted} records inserted`, 'green');
        }
        
      } catch (error) {
        failed += batch.length;
        errors.push(error.message);
        log(`    Batch ${Math.floor(i/batchSize) + 1}: Exception - ${error.message.substring(0, 80)}`, 'red');
      }
    }
    
    const statusColor = success > failed ? 'green' : success > 0 ? 'yellow' : 'red';
    log(`  📊 ${tableName}: ${success} success, ${failed} failed, ${skipped} skipped`, statusColor);
    
    if (errors.length > 0) {
      log(`  Sample errors: ${errors.slice(0, 2).join('; ')}`, 'red');
    }
    
    return { success, failed, skipped, errors: errors.slice(0, 5) };
    
  } catch (error) {
    log(`  ❌ Failed to load ${tableName}: ${error.message}`, 'red');
    return { success: 0, failed: 1, skipped: 0, errors: [error.message] };
  }
}

async function main() {
  log('📥 Loading All Dumped Data into Supabase', 'blue');
  log('='.repeat(80), 'blue');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // 로드할 테이블들 (우선순위 순서)
  const tablesToLoad = [
    'users',                    // 6 records - 먼저 로드
    'institutions',            // 6 records
    'importance_tiers',        // 5 records
    'titles',                  // 7 records
    'artists',                 // 1,423 records - 핵심 테이블
    'global_venues',           // 1,088 records - 핵심 테이블  
    'venues',                  // 963 records
    'apt_profiles',            // 44 records
    'artist_profiles',         // 5 records
    'artist_apt_mappings',     // 55 records
    'artvee_artworks',         // 794 records - 핵심 테이블
    'artvee_artist_mappings',  // 85 records
    'artvee_artwork_artists',  // 494 records
    'exhibitions',             // 688 records
    'global_exhibitions',      // 10 records
    'city_translations',       // 92 records
    'journey_templates',       // 7 records
    'journey_nudges',          // 7 records
    'waitlists',              // 2 records
    'scraping_jobs',          // 1 record
    'global_collection_logs',  // 9 records
    'global_data_quality_metrics', // 1 record
    'system_stats'             // 1 record
  ];

  const results = {};
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  log(`\n🎯 Loading ${tablesToLoad.length} tables in order...`, 'blue');

  for (const tableName of tablesToLoad) {
    const result = await loadTableData(supabase, tableName);
    
    results[tableName] = result;
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
    
    // 짧은 지연 (API 제한 방지)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 최종 요약
  log('\n📊 Complete Loading Summary:', 'blue');
  log('='.repeat(80), 'blue');
  
  log(`${'Table'.padEnd(30)} ${'Success'.padEnd(10)} ${'Failed'.padEnd(10)} ${'Skipped'.padEnd(10)} Status`, 'blue');
  log('-'.repeat(80), 'blue');
  
  Object.entries(results).forEach(([table, result]) => {
    const rate = result.success + result.failed > 0 ? 
      Math.round(result.success / (result.success + result.failed) * 100) : 0;
    
    const status = result.success > 0 ? `✅ ${rate}% success` : 
                   result.skipped > 0 ? '⚠️  All skipped' : '❌ Failed';
    
    const color = result.success > 0 ? 'green' : 
                  result.skipped > 0 ? 'yellow' : 'red';
    
    log(`${table.padEnd(30)} ${result.success.toString().padEnd(10)} ${result.failed.toString().padEnd(10)} ${result.skipped.toString().padEnd(10)} ${status}`, color);
  });

  log('\n' + '='.repeat(80), 'blue');
  log(`🎯 TOTAL: ${totalSuccess} success, ${totalFailed} failed, ${totalSkipped} skipped`, 
      totalSuccess > 0 ? 'green' : 'red');

  const grandTotal = totalSuccess + totalFailed + totalSkipped;
  const successRate = grandTotal > 0 ? Math.round(totalSuccess / grandTotal * 100) : 0;
  
  log(`📈 Success Rate: ${successRate}%`, successRate > 80 ? 'green' : successRate > 50 ? 'yellow' : 'red');

  if (successRate > 80) {
    log('\n✅ MIGRATION HIGHLY SUCCESSFUL!', 'green');
    log('🎉 Ready to verify and terminate Railway!', 'green');
  } else if (successRate > 50) {
    log('\n⚠️  Partial migration completed.', 'yellow');
    log('🔍 Review failed tables before proceeding.', 'yellow');
  } else {
    log('\n❌ Migration had significant issues.', 'red');
    log('🚨 DO NOT terminate Railway yet!', 'red');
  }

  log('\n📋 Next Steps:', 'blue');
  log('1. Verify critical data in Supabase dashboard', 'yellow');
  log('2. Test application functionality', 'yellow');
  log('3. Only terminate Railway if everything works', 'yellow');
}

if (require.main === module) {
  main().catch(console.error);
}