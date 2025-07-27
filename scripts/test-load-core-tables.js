#!/usr/bin/env node
/**
 * Test Load Core Tables - 핵심 테이블 3개만 먼저 테스트
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

async function loadTableData(supabase, tableName, limit = 10) {
  log(`\n📥 Loading ${tableName} data (${limit} records test)...`, 'blue');
  
  const dataFile = path.join(__dirname, `data_${tableName}.json`);
  
  if (!fs.existsSync(dataFile)) {
    log(`  ❌ No data file found: ${dataFile}`, 'red');
    return { success: 0, failed: 0, skipped: 0 };
  }
  
  try {
    const rawData = fs.readFileSync(dataFile, 'utf8');
    const allData = JSON.parse(rawData);
    
    if (!Array.isArray(allData) || allData.length === 0) {
      log(`  ⚠️  No data in ${tableName}`, 'yellow');
      return { success: 0, failed: 0, skipped: 0 };
    }
    
    // 테스트용으로 제한된 수만 로드
    const data = allData.slice(0, limit);
    log(`  Found ${allData.length} total records, testing with ${data.length}`, 'blue');
    
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
  log('🧪 Testing Core Tables Data Load', 'blue');
  log('='.repeat(60), 'blue');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // 핵심 테이블 3개만 테스트
  const coreTables = [
    { name: 'artists', limit: 5 },
    { name: 'global_venues', limit: 5 },
    { name: 'artvee_artworks', limit: 5 }
  ];

  const results = {};
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const table of coreTables) {
    const result = await loadTableData(supabase, table.name, table.limit);
    
    results[table.name] = result;
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
    
    // 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 테스트 결과 요약
  log('\n📊 Core Tables Test Summary:', 'blue');
  log('='.repeat(60), 'blue');
  
  Object.entries(results).forEach(([table, result]) => {
    const status = result.success > 0 ? '✅ Working' : 
                   result.skipped > 0 ? '⚠️  All skipped' : '❌ Failed';
    
    const color = result.success > 0 ? 'green' : 
                  result.skipped > 0 ? 'yellow' : 'red';
    
    log(`${table.padEnd(20)} ${result.success} success, ${result.failed} failed, ${result.skipped} skipped - ${status}`, color);
  });

  log(`\n🎯 TOTAL: ${totalSuccess} success, ${totalFailed} failed, ${totalSkipped} skipped`, 
      totalSuccess > 0 ? 'green' : 'red');

  if (totalSuccess > 0) {
    log('\n✅ Core tables working! Ready to load all data.', 'green');
    log('🚀 Next: Run "node load-all-data.js" to load everything', 'blue');
  } else {
    log('\n❌ Core tables failed. Check table schemas.', 'red');
    log('🔍 Review errors before proceeding.', 'yellow');
  }
}

if (require.main === module) {
  main().catch(console.error);
}