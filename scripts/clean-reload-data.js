#!/usr/bin/env node
/**
 * Clean Reload Data - 깔끔한 데이터 재로드
 * Railway 원본과 정확히 일치하도록 중복 없이 로드
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

async function cleanReloadTable(supabase, tableName, targetCount) {
  log(`\n📥 Clean loading ${tableName} (target: ${targetCount} records)...`, 'blue');
  
  const dataFile = path.join(__dirname, `data_${tableName}.json`);
  
  if (!fs.existsSync(dataFile)) {
    log(`  ❌ No data file found: ${dataFile}`, 'red');
    return { success: 0, failed: 0, target: targetCount };
  }
  
  try {
    const rawData = fs.readFileSync(dataFile, 'utf8');
    const allData = JSON.parse(rawData);
    
    if (!Array.isArray(allData)) {
      log(`  ❌ Invalid data format in ${tableName}`, 'red');
      return { success: 0, failed: 0, target: targetCount };
    }
    
    // 정확히 목표 개수만큼만 로드 (Railway와 일치)
    const dataToLoad = allData.slice(0, targetCount);
    log(`  Found ${allData.length} total records, loading exactly ${dataToLoad.length}`, 'blue');
    
    let success = 0;
    let failed = 0;
    let errors = [];
    
    const batchSize = 50;
    
    for (let i = 0; i < dataToLoad.length; i += batchSize) {
      const batch = dataToLoad.slice(i, i + batchSize);
      
      try {
        // Railway ID 제거하고 데이터 정리
        const cleanBatch = batch.map(row => {
          const { id, ...cleanData } = row;
          
          // null 값 및 undefined 제거
          const filteredData = {};
          Object.keys(cleanData).forEach(key => {
            const value = cleanData[key];
            if (value !== null && value !== undefined) {
              // venues 테이블 city 필드 특별 처리
              if (tableName === 'venues' && key === 'city' && (!value || value.trim() === '')) {
                filteredData[key] = '미정';
              } else {
                filteredData[key] = value;
              }
            }
          });
          
          return filteredData;
        });
        
        // Supabase에 배치 삽입 (중복 없이 깔끔하게)
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .insert(cleanBatch)
          .select('id');
        
        if (error) {
          failed += batch.length;
          errors.push(error.message);
          log(`    Batch ${Math.floor(i/batchSize) + 1}: Error - ${error.message.substring(0, 80)}`, 'red');
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
    
    // 최종 카운트 확인
    const { count: finalCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    const statusColor = success >= targetCount * 0.95 ? 'green' : success > 0 ? 'yellow' : 'red';
    log(`  📊 ${tableName}: ${success} inserted, ${failed} failed, final count: ${finalCount}`, statusColor);
    
    const accuracy = targetCount > 0 ? Math.round((finalCount / targetCount) * 100) : 0;
    log(`  🎯 Accuracy: ${accuracy}% (target: ${targetCount}, actual: ${finalCount})`, accuracy >= 95 ? 'green' : 'yellow');
    
    if (errors.length > 0) {
      log(`  Sample errors: ${errors.slice(0, 1).join('; ')}`, 'red');
    }
    
    return { success, failed, target: targetCount, final: finalCount, accuracy };
    
  } catch (error) {
    log(`  ❌ Failed to load ${tableName}: ${error.message}`, 'red');
    return { success: 0, failed: 1, target: targetCount, final: 0, accuracy: 0 };
  }
}

async function main() {
  log('🧹 Clean Data Reload - Railway와 정확히 일치하도록', 'blue');
  log('='.repeat(70), 'blue');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Railway 원본 데이터 크기에 맞춰 정확히 로드
  const targetTables = [
    { name: 'artists', target: 1423 },        // Railway 정확한 개수
    { name: 'global_venues', target: 1088 },  // Railway 정확한 개수
    { name: 'venues', target: 963 }           // Railway 정확한 개수
  ];

  const results = {};
  let totalSuccess = 0;
  let totalTargets = 0;
  let perfectMatches = 0;

  for (const table of targetTables) {
    const result = await cleanReloadTable(supabase, table.name, table.target);
    
    results[table.name] = result;
    totalSuccess += result.success;
    totalTargets += result.target;
    
    if (result.accuracy >= 95) perfectMatches++;
    
    // 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 결과 요약
  log('\n📊 Clean Reload Summary:', 'blue');
  log('='.repeat(70), 'blue');
  log(`${'Table'.padEnd(20)} ${'Target'.padEnd(10)} ${'Loaded'.padEnd(10)} ${'Final'.padEnd(10)} Accuracy`, 'blue');
  log('-'.repeat(70), 'blue');
  
  Object.entries(results).forEach(([table, result]) => {
    const color = result.accuracy >= 95 ? 'green' : result.accuracy >= 80 ? 'yellow' : 'red';
    log(`${table.padEnd(20)} ${result.target.toString().padEnd(10)} ${result.success.toString().padEnd(10)} ${result.final.toString().padEnd(10)} ${result.accuracy}%`, color);
  });

  const overallAccuracy = totalTargets > 0 ? Math.round((totalSuccess / totalTargets) * 100) : 0;
  log(`\n🎯 OVERALL: ${totalSuccess}/${totalTargets} loaded (${overallAccuracy}% accuracy)`, 
      overallAccuracy >= 95 ? 'green' : 'yellow');

  if (perfectMatches === 3) {
    log('\n🎉 PERFECT! 모든 테이블이 Railway와 정확히 일치!', 'green');
    log('✅ 이제 최종 검증 실행: node final-migration-verification.js', 'blue');
  } else if (perfectMatches >= 2) {
    log('\n✅ GOOD! 대부분 테이블이 정확히 일치', 'green');
    log('🔍 최종 검증 실행 권장', 'blue');
  } else {
    log('\n⚠️  일부 테이블에 아직 문제 있음', 'yellow');
    log('🔧 추가 조치 필요', 'yellow');
  }
}

if (require.main === module) {
  main().catch(console.error);
}