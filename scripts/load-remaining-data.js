#!/usr/bin/env node
/**
 * Load Remaining Failed Tables Data
 * 실패한 테이블들의 데이터를 다시 로드
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
    
    const batchSize = 50;
    
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
              // 특별 처리 - exhibitions 테이블의 title 필드들
              if (tableName === 'exhibitions') {
                if (key === 'title_en' && (!value || value.trim() === '')) {
                  filteredData[key] = 'Untitled Exhibition';
                } else if (key === 'venue_id' && typeof value === 'string') {
                  // venue_id가 문자열이면 숫자로 변환 시도
                  const numValue = parseInt(value);
                  if (!isNaN(numValue)) {
                    filteredData[key] = numValue;
                  }
                  // 변환 실패시 해당 필드 제외
                } else if (key === 'institution_id' && typeof value === 'string') {
                  // institution_id가 문자열이면 숫자로 변환 시도
                  const numValue = parseInt(value);
                  if (!isNaN(numValue)) {
                    filteredData[key] = numValue;
                  }
                  // 변환 실패시 해당 필드 제외
                } else {
                  filteredData[key] = value;
                }
              } else {
                filteredData[key] = value;
              }
            }
          });
          
          return filteredData;
        });
        
        // Supabase에 배치 삽입
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .insert(cleanBatch)
          .select('id');
        
        if (error) {
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
    
    return { success, failed, skipped, errors: errors.slice(0, 3) };
    
  } catch (error) {
    log(`  ❌ Failed to load ${tableName}: ${error.message}`, 'red');
    return { success: 0, failed: 1, skipped: 0, errors: [error.message] };
  }
}

async function main() {
  log('🔄 Loading Previously Failed Tables', 'blue');
  log('='.repeat(60), 'blue');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // 이전에 실패했던 테이블들만 다시 로드
  const failedTables = [
    'importance_tiers',
    'titles', 
    'artist_profiles',
    'exhibitions',
    'global_exhibitions',
    'journey_templates',
    'journey_nudges',
    'waitlists',
    'scraping_jobs',
    'global_collection_logs',
    'global_data_quality_metrics',
    'system_stats'
  ];

  const results = {};
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const tableName of failedTables) {
    const result = await loadTableData(supabase, tableName);
    
    results[tableName] = result;
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
    
    // 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 결과 요약
  log('\n📊 Retry Loading Summary:', 'blue');
  log('='.repeat(60), 'blue');
  
  Object.entries(results).forEach(([table, result]) => {
    const rate = result.success + result.failed > 0 ? 
      Math.round(result.success / (result.success + result.failed) * 100) : 0;
    
    const status = result.success > 0 ? `✅ ${rate}% success` : 
                   result.skipped > 0 ? '⚠️  All skipped' : '❌ Failed';
    
    const color = result.success > 0 ? 'green' : 
                  result.skipped > 0 ? 'yellow' : 'red';
    
    log(`${table.padEnd(25)} ${result.success.toString().padEnd(8)} ${result.failed.toString().padEnd(8)} ${result.skipped.toString().padEnd(8)} ${status}`, color);
  });

  log(`\n🎯 TOTAL: ${totalSuccess} success, ${totalFailed} failed, ${totalSkipped} skipped`, 
      totalSuccess > 0 ? 'green' : 'red');

  const grandTotal = totalSuccess + totalFailed + totalSkipped;
  const successRate = grandTotal > 0 ? Math.round(totalSuccess / grandTotal * 100) : 0;
  
  log(`📈 Success Rate: ${successRate}%`, successRate > 80 ? 'green' : successRate > 50 ? 'yellow' : 'red');

  if (successRate > 80) {
    log('\n✅ Retry migration highly successful!', 'green');
    log('🎉 Combined with previous success, migration is nearly complete!', 'green');
  } else if (successRate > 50) {
    log('\n⚠️  Partial retry completed.', 'yellow');
    log('🔍 Still some issues, but major progress made.', 'yellow');
  } else {
    log('\n❌ Retry still having issues.', 'red');
    log('🚨 Manual intervention may be needed.', 'red');
  }
}

if (require.main === module) {
  main().catch(console.error);
}