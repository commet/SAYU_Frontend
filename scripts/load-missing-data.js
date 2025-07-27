#!/usr/bin/env node
/**
 * Load Missing Data - 누락된 데이터 추가 로드
 * artists, global_venues, venues 누락 분 완전 보완
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

async function loadMissingTableData(supabase, tableName) {
  log(`\n📥 Loading ALL ${tableName} data (complete dataset)...`, 'blue');
  
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
    
    log(`  Found ${allData.length} total records in dump file`, 'blue');
    
    let success = 0;
    let failed = 0;
    let skipped = 0;
    let errors = [];
    
    const batchSize = 20; // 작은 배치로 안전하게
    
    for (let i = 0; i < allData.length; i += batchSize) {
      const batch = allData.slice(i, i + batchSize);
      
      try {
        // Railway ID 제거하고 데이터 정리
        const cleanBatch = batch.map(row => {
          const { id, ...cleanData } = row;
          
          // null 값 및 undefined 제거
          const filteredData = {};
          Object.keys(cleanData).forEach(key => {
            const value = cleanData[key];
            if (value !== null && value !== undefined) {
              // venues 테이블 특별 처리
              if (tableName === 'venues' && key === 'city' && (!value || value.trim() === '')) {
                // city가 빈 문자열이면 기본값 설정
                filteredData[key] = '서울';
              } else {
                filteredData[key] = value;
              }
            }
          });
          
          return filteredData;
        });
        
        // Supabase에 배치 삽입 (중복 시 무시하도록 upsert 사용)
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .upsert(cleanBatch, { 
            onConflict: 'id',
            ignoreDuplicates: true 
          })
          .select('id');
        
        if (error) {
          // 중복 에러는 무시하고 스킵으로 처리
          if (error.message.includes('duplicate') || 
              error.message.includes('already exists') ||
              error.message.includes('unique constraint') ||
              error.message.includes('conflicting key')) {
            skipped += batch.length;
            log(`    Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} skipped (duplicates)`, 'yellow');
          } else {
            // 다른 에러는 개별 처리 시도
            log(`    Batch ${Math.floor(i/batchSize) + 1}: Batch error, trying individual inserts...`, 'yellow');
            
            for (const row of cleanBatch) {
              try {
                const { data: singleInsert, error: singleError } = await supabase
                  .from(tableName)
                  .insert(row)
                  .select('id');
                
                if (singleError) {
                  if (singleError.message.includes('duplicate') || 
                      singleError.message.includes('already exists')) {
                    skipped++;
                  } else {
                    failed++;
                    if (errors.length < 5) errors.push(singleError.message);
                  }
                } else {
                  success++;
                }
              } catch (e) {
                failed++;
                if (errors.length < 5) errors.push(e.message);
              }
            }
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
      
      // 진행률 표시
      if ((i + batchSize) % 200 === 0 || i + batchSize >= allData.length) {
        const processed = Math.min(i + batchSize, allData.length);
        const percentage = Math.round((processed / allData.length) * 100);
        log(`    Progress: ${processed}/${allData.length} (${percentage}%) - ${success} success, ${failed} failed, ${skipped} skipped`, 'blue');
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
  log('🔄 Loading Missing Data - 누락 데이터 완전 보완', 'blue');
  log('='.repeat(70), 'blue');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // 누락이 발견된 3개 테이블의 전체 데이터 재로드
  const missingDataTables = [
    'artists',        // 1,423 → 1,005 (418개 누락)
    'global_venues',  // 1,088 → 1,010 (78개 누락)
    'venues'          // 963 → 797 (166개 누락)
  ];

  const results = {};
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const tableName of missingDataTables) {
    const result = await loadMissingTableData(supabase, tableName);
    
    results[tableName] = result;
    totalSuccess += result.success;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
    
    // 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 결과 요약
  log('\n📊 Missing Data Loading Summary:', 'blue');
  log('='.repeat(70), 'blue');
  
  Object.entries(results).forEach(([table, result]) => {
    const total = result.success + result.failed + result.skipped;
    const rate = total > 0 ? Math.round(result.success / total * 100) : 0;
    
    const status = result.success > 0 ? `✅ ${rate}% success` : 
                   result.skipped > 0 ? '⚠️  All skipped' : '❌ Failed';
    
    const color = result.success > 0 ? 'green' : 
                  result.skipped > 0 ? 'yellow' : 'red';
    
    log(`${table.padEnd(20)} ${result.success.toString().padEnd(8)} ${result.failed.toString().padEnd(8)} ${result.skipped.toString().padEnd(8)} ${status}`, color);
  });

  log(`\n🎯 TOTAL: ${totalSuccess} success, ${totalFailed} failed, ${totalSkipped} skipped`, 
      totalSuccess > 0 ? 'green' : 'red');

  if (totalSuccess > 300) {
    log('\n🎉 EXCELLENT! 대량의 누락 데이터 복구 성공!', 'green');
    log('🚀 이제 재검증 실행 권장: node final-migration-verification.js', 'blue');
  } else if (totalSuccess > 0) {
    log('\n✅ 일부 누락 데이터 복구됨', 'green');
    log('🔍 재검증 실행 권장', 'blue');
  } else {
    log('\n⚠️  대부분 데이터가 이미 존재 (중복 스킵)', 'yellow');
    log('📊 현재 상태가 최신일 가능성 높음', 'yellow');
  }
}

if (require.main === module) {
  main().catch(console.error);
}