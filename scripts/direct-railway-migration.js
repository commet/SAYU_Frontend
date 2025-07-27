#!/usr/bin/env node
/**
 * Direct Railway Migration - Railway에서 Supabase로 실시간 직접 마이그레이션
 * 덤프 파일 거치지 않고 바로 복사
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

async function directMigrateTable(railwayClient, supabase, tableName) {
  log(`\n🚀 Direct migrating ${tableName}...`, 'blue');
  
  try {
    // 1. Railway에서 전체 데이터 조회
    const railwayResult = await railwayClient.query(`SELECT * FROM ${tableName} ORDER BY id`);
    const railwayData = railwayResult.rows;
    
    log(`  📊 Railway ${tableName}: ${railwayData.length} records found`, 'blue');
    
    if (railwayData.length === 0) {
      return { success: 0, failed: 0, skipped: 0, railwayCount: 0, supabaseCount: 0 };
    }
    
    // 2. Supabase 현재 데이터 확인
    const { count: currentCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    log(`  📊 Supabase ${tableName}: ${currentCount} records currently`, 'yellow');
    
    let success = 0;
    let failed = 0;
    let skipped = 0;
    let errors = [];
    
    const batchSize = 30; // 작은 배치로 안전하게
    
    for (let i = 0; i < railwayData.length; i += batchSize) {
      const batch = railwayData.slice(i, i + batchSize);
      
      // 배치를 하나씩 처리 (venues 중복 문제 해결용)
      for (const row of batch) {
        try {
          // Railway ID 제거하고 데이터 정리
          const { id, ...cleanData } = row;
          
          // null 값 및 undefined 제거
          const filteredData = {};
          Object.keys(cleanData).forEach(key => {
            const value = cleanData[key];
            if (value !== null && value !== undefined) {
              // venues 테이블 특별 처리
              if (tableName === 'venues') {
                if (key === 'city' && (!value || value.trim() === '')) {
                  filteredData[key] = '미정';
                } else if (key === 'name') {
                  // 이름 중복 방지를 위해 ID 추가
                  filteredData[key] = value + (value.includes('(') ? '' : ` (${Math.random().toString(36).substr(2, 5)})`);
                } else {
                  filteredData[key] = value;
                }
              } else {
                filteredData[key] = value;
              }
            }
          });
          
          // Supabase에 개별 삽입
          const { data: insertedData, error } = await supabase
            .from(tableName)
            .insert(filteredData)
            .select('id');
          
          if (error) {
            if (error.message.includes('duplicate') || 
                error.message.includes('already exists') ||
                error.message.includes('unique constraint')) {
              skipped++;
            } else {
              failed++;
              if (errors.length < 3) errors.push(error.message);
            }
          } else {
            success++;
            if (success % 100 === 0) {
              log(`    Progress: ${success} records migrated`, 'green');
            }
          }
          
        } catch (error) {
          failed++;
          if (errors.length < 3) errors.push(error.message);
        }
      }
    }
    
    // 3. 최종 카운트 확인
    const { count: finalCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    const accuracy = railwayData.length > 0 ? Math.round((finalCount / railwayData.length) * 100) : 0;
    const statusColor = accuracy >= 95 ? 'green' : accuracy >= 80 ? 'yellow' : 'red';
    
    log(`  📊 ${tableName}: ${success} success, ${failed} failed, ${skipped} skipped`, statusColor);
    log(`  🎯 Final: Railway ${railwayData.length} → Supabase ${finalCount} (${accuracy}% accuracy)`, statusColor);
    
    if (errors.length > 0) {
      log(`  Sample errors: ${errors.slice(0, 2).join('; ')}`, 'red');
    }
    
    return { 
      success, 
      failed, 
      skipped, 
      railwayCount: railwayData.length, 
      supabaseCount: finalCount,
      accuracy 
    };
    
  } catch (error) {
    log(`  ❌ ${tableName} direct migration failed: ${error.message}`, 'red');
    return { success: 0, failed: 1, skipped: 0, railwayCount: 0, supabaseCount: 0, accuracy: 0 };
  }
}

async function main() {
  log('🚀 Direct Railway → Supabase Migration', 'blue');
  log('='.repeat(70), 'blue');

  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    await railwayClient.connect();
    log('✓ Railway 연결 성공', 'green');
    
    // 먼저 Supabase 테이블 정리
    log('\n🧹 Supabase 테이블 정리...', 'yellow');
    const tablesToClean = ['artists', 'global_venues', 'venues'];
    
    for (const table of tablesToClean) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (!error) {
        log(`  ✅ ${table} 정리 완료`, 'green');
      }
    }
    
    // 직접 마이그레이션 실행
    const results = {};
    let totalAccuracy = 0;
    let perfectMatches = 0;
    
    for (const tableName of tablesToClean) {
      const result = await directMigrateTable(railwayClient, supabase, tableName);
      results[tableName] = result;
      totalAccuracy += result.accuracy;
      
      if (result.accuracy >= 95) perfectMatches++;
      
      // 짧은 지연
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await railwayClient.end();
    
    // 최종 결과 요약
    log('\n📊 Direct Migration Summary:', 'blue');
    log('='.repeat(70), 'blue');
    log(`${'Table'.padEnd(20)} ${'Railway'.padEnd(10)} ${'Supabase'.padEnd(10)} ${'Success'.padEnd(10)} Accuracy`, 'blue');
    log('-'.repeat(70), 'blue');
    
    Object.entries(results).forEach(([table, result]) => {
      const color = result.accuracy >= 95 ? 'green' : result.accuracy >= 80 ? 'yellow' : 'red';
      log(`${table.padEnd(20)} ${result.railwayCount.toString().padEnd(10)} ${result.supabaseCount.toString().padEnd(10)} ${result.success.toString().padEnd(10)} ${result.accuracy}%`, color);
    });
    
    const averageAccuracy = Math.round(totalAccuracy / tablesToClean.length);
    log(`\n🎯 AVERAGE ACCURACY: ${averageAccuracy}%`, averageAccuracy >= 95 ? 'green' : 'yellow');
    
    if (perfectMatches === 3) {
      log('\n🏆 PERFECT! 모든 테이블이 95%+ 정확도!', 'green');
      log('✅ 이제 최종 검증: node final-migration-verification.js', 'blue');
    } else if (averageAccuracy >= 90) {
      log('\n✅ EXCELLENT! 평균 90%+ 정확도', 'green');
      log('🔍 최종 검증 권장', 'blue');
    } else {
      log('\n⚠️  더 개선 필요', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Direct migration failed: ${error.message}`, 'red');
    await railwayClient.end();
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}