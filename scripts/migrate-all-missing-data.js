#!/usr/bin/env node
/**
 * Migrate ALL missing critical data without LIMIT
 * 모든 누락된 중요 데이터를 제한 없이 마이그레이션
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

// 모든 중요 테이블 매핑
const criticalTables = [
  { railway: 'artists', supabase: 'artists', priority: 'HIGH' },
  { railway: 'global_venues', supabase: 'global_venues', priority: 'HIGH' },
  { railway: 'artvee_artworks', supabase: 'artvee_artworks', priority: 'HIGH' },
  { railway: 'apt_profiles', supabase: 'apt_profiles', priority: 'HIGH' },
  { railway: 'artist_profiles', supabase: 'artist_profiles', priority: 'MEDIUM' },
  { railway: 'artist_apt_mappings', supabase: 'artist_apt_mappings', priority: 'MEDIUM' },
  { railway: 'artvee_artist_mappings', supabase: 'artvee_artist_mappings', priority: 'MEDIUM' },
  { railway: 'artvee_artwork_artists', supabase: 'artvee_artwork_artists', priority: 'MEDIUM' },
  { railway: 'city_translations', supabase: 'city_translations', priority: 'LOW' },
  { railway: 'institutions', supabase: 'institutions', priority: 'LOW' },
  { railway: 'importance_tiers', supabase: 'importance_tiers', priority: 'LOW' },
  { railway: 'journey_nudges', supabase: 'journey_nudges', priority: 'LOW' },
  { railway: 'journey_templates', supabase: 'journey_templates', priority: 'LOW' },
  { railway: 'titles', supabase: 'titles', priority: 'LOW' },
  { railway: 'waitlists', supabase: 'waitlists', priority: 'LOW' }
];

async function migrateSingleTable(railwayClient, supabase, tableInfo) {
  const { railway: railwayTable, supabase: supabaseTable, priority } = tableInfo;
  
  log(`\n📋 Processing ${railwayTable} (${priority} priority)...`, 'blue');
  
  try {
    // Railway에서 모든 데이터 가져오기 (제한 없이)
    const result = await railwayClient.query(`SELECT * FROM ${railwayTable}`);
    log(`  Found ${result.rows.length} records in Railway`, 'blue');

    if (result.rows.length === 0) {
      log(`  ⚠️  No data to migrate`, 'yellow');
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    let errors = [];

    // 배치 단위로 처리 (50개씩)
    const batchSize = 50;
    for (let i = 0; i < result.rows.length; i += batchSize) {
      const batch = result.rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          // Railway ID 제거하고 나머지 데이터 변환
          const { id, ...data } = row;
          
          // 데이터 변환 로직
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
              log(`    ⚠️  Table ${supabaseTable} does not exist in Supabase`, 'yellow');
              return { success: 0, failed: result.rows.length, needsTable: true };
            } else if (error.message.includes('duplicate key')) {
              // 중복 키는 성공으로 간주
              success++;
            } else {
              failed++;
              errors.push(error.message);
            }
          } else {
            success++;
            if (success % 100 === 0) {
              log(`    Progress: ${success}/${result.rows.length}`, 'green');
            }
          }
        } catch (error) {
          failed++;
          errors.push(error.message);
        }
      }
    }

    log(`  📊 ${railwayTable}: ${success} success, ${failed} failed`, success > failed ? 'green' : 'yellow');
    
    if (errors.length > 0 && errors.length <= 5) {
      log(`  Sample errors: ${errors.slice(0, 3).join(', ')}`, 'red');
    }
    
    return { success, failed, errors: errors.slice(0, 5) };
    
  } catch (error) {
    log(`  ✗ ${railwayTable}: ${error.message}`, 'red');
    return { success: 0, failed: 1, errors: [error.message] };
  }
}

async function main() {
  log('🚨 Complete Missing Data Migration - ALL Tables', 'red');
  log('='.repeat(70), 'red');

  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const results = {};
  const missingTables = [];

  try {
    await railwayClient.connect();
    log('✓ Connected to Railway', 'green');
    
    // HIGH priority 테이블 먼저 마이그레이션
    const highPriorityTables = criticalTables.filter(t => t.priority === 'HIGH');
    const mediumPriorityTables = criticalTables.filter(t => t.priority === 'MEDIUM');
    const lowPriorityTables = criticalTables.filter(t => t.priority === 'LOW');

    log('\n🔥 HIGH Priority Tables (Critical):', 'red');
    for (const table of highPriorityTables) {
      const result = await migrateSingleTable(railwayClient, supabase, table);
      results[table.railway] = result;
      if (result.needsTable) {
        missingTables.push(table.supabase);
      }
    }

    log('\n⚡ MEDIUM Priority Tables:', 'yellow');
    for (const table of mediumPriorityTables) {
      const result = await migrateSingleTable(railwayClient, supabase, table);
      results[table.railway] = result;
      if (result.needsTable) {
        missingTables.push(table.supabase);
      }
    }

    log('\n📦 LOW Priority Tables:', 'blue');
    for (const table of lowPriorityTables) {
      const result = await migrateSingleTable(railwayClient, supabase, table);
      results[table.railway] = result;
      if (result.needsTable) {
        missingTables.push(table.supabase);
      }
    }

    await railwayClient.end();

    // 결과 요약
    log('\n📊 Complete Migration Summary', 'blue');
    log('='.repeat(70), 'blue');
    
    let totalSuccess = 0;
    let totalFailed = 0;
    
    Object.entries(results).forEach(([table, result]) => {
      const status = result.needsTable ? '❌ Table Missing' :
                     result.success > result.failed ? '✅ Success' :
                     result.success > 0 ? '⚠️  Partial' : '❌ Failed';
      
      log(`${table.padEnd(25)} ${result.success.toString().padEnd(8)} ${result.failed.toString().padEnd(8)} ${status}`, 
          result.needsTable ? 'red' : result.success > result.failed ? 'green' : 'yellow');
      
      totalSuccess += result.success;
      totalFailed += result.failed;
    });

    log('\n📈 Overall Statistics:', 'blue');
    log(`Total Records Migrated: ${totalSuccess}`, 'green');
    log(`Total Failed: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green');
    log(`Success Rate: ${Math.round(totalSuccess / (totalSuccess + totalFailed) * 100)}%`, 'blue');

    if (missingTables.length > 0) {
      log('\n🚨 Missing Tables in Supabase:', 'red');
      missingTables.forEach(table => log(`  - ${table}`, 'red'));
      log('\nCreate these tables first, then re-run this script!', 'yellow');
    }

    if (totalSuccess > 0) {
      log('\n✅ Migration completed successfully!', 'green');
      log('🎯 Ready for Railway termination!', 'green');
    } else {
      log('\n⚠️  No data was migrated. Check table existence and constraints.', 'yellow');
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

module.exports = { migrateSingleTable };