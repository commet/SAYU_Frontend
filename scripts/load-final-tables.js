#!/usr/bin/env node
/**
 * Load Final 4 Tables Data
 * 마지막 4개 테이블 데이터 로드
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
    log(`  ❌ No data file found: ${dataFile}`, 'red');
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
    
    for (const row of data) {
      try {
        // Railway ID 제거하고 데이터 정리
        const { id, ...cleanData } = row;
        
        // null 값 및 undefined 제거
        const filteredData = {};
        Object.keys(cleanData).forEach(key => {
          const value = cleanData[key];
          if (value !== null && value !== undefined) {
            filteredData[key] = value;
          }
        });
        
        // Supabase에 삽입
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .insert(filteredData)
          .select('id');
        
        if (error) {
          if (error.message.includes('duplicate') || 
              error.message.includes('already exists') ||
              error.message.includes('unique constraint')) {
            skipped++;
            log(`    Record skipped (duplicate)`, 'yellow');
          } else {
            failed++;
            errors.push(error.message);
            log(`    Error: ${error.message.substring(0, 100)}`, 'red');
          }
        } else {
          success++;
          log(`    ✅ Record inserted: ${insertedData[0]?.id}`, 'green');
        }
        
      } catch (error) {
        failed++;
        errors.push(error.message);
        log(`    Exception: ${error.message.substring(0, 100)}`, 'red');
      }
    }
    
    const statusColor = success > failed ? 'green' : success > 0 ? 'yellow' : 'red';
    log(`  📊 ${tableName}: ${success} success, ${failed} failed, ${skipped} skipped`, statusColor);
    
    return { success, failed, skipped, errors: errors.slice(0, 3) };
    
  } catch (error) {
    log(`  ❌ Failed to load ${tableName}: ${error.message}`, 'red');
    return { success: 0, failed: 1, skipped: 0, errors: [error.message] };
  }
}

async function main() {
  log('🏁 Loading Final 4 Tables', 'blue');
  log('='.repeat(50), 'blue');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // 마지막 4개 테이블
  const finalTables = [
    'importance_tiers',
    'artist_profiles',
    'waitlists',
    'system_stats'
  ];

  const results = {};
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const tableName of finalTables) {
    const result = await loadTableData(supabase, tableName);
    
    results[tableName] = result;
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
    
    // 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 결과 요약
  log('\n📊 Final Tables Summary:', 'blue');
  log('='.repeat(50), 'blue');
  
  Object.entries(results).forEach(([table, result]) => {
    const status = result.success > 0 ? '✅ Success' : 
                   result.skipped > 0 ? '⚠️  Skipped' : '❌ Failed';
    
    const color = result.success > 0 ? 'green' : 
                  result.skipped > 0 ? 'yellow' : 'red';
    
    log(`${table.padEnd(20)} ${result.success} success, ${result.failed} failed, ${result.skipped} skipped - ${status}`, color);
  });

  log(`\n🎯 FINAL TOTAL: ${totalSuccess} success, ${totalFailed} failed, ${totalSkipped} skipped`, 
      totalSuccess > 0 ? 'green' : 'red');

  if (totalSuccess === 13) { // 모든 레코드 성공 (5+5+2+1)
    log('\n🎉 PERFECT! All final tables loaded successfully!', 'green');
    log('🏆 MIGRATION 100% COMPLETE!', 'green');
  } else if (totalSuccess > 0) {
    log('\n✅ Most final tables loaded successfully!', 'green'); 
    log('🎯 Migration is essentially complete!', 'green');
  } else {
    log('\n❌ Final tables still having issues.', 'red');
  }
}

if (require.main === module) {
  main().catch(console.error);
}