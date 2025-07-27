#!/usr/bin/env node
/**
 * Check Supabase Tables - Verify table existence and structure
 * Supabase 테이블 존재 및 구조 확인
 */
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

async function checkTable(supabase, tableName) {
  log(`\n🔍 Checking ${tableName}...`, 'blue');
  
  try {
    // 테이블에서 1개 레코드만 조회해보기 (구조 확인용)
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      log(`  ❌ Error: ${error.message}`, 'red');
      return false;
    } else {
      log(`  ✅ Table exists, ${count || 0} records`, 'green');
      return true;
    }
  } catch (error) {
    log(`  ❌ Exception: ${error.message}`, 'red');
    return false;
  }
}

async function testSimpleInsert(supabase, tableName) {
  log(`\n🧪 Testing simple insert to ${tableName}...`, 'blue');
  
  try {
    // 간단한 테스트 데이터
    let testData = {};
    
    switch (tableName) {
      case 'artists':
        testData = {
          name: 'Test Artist',
          nationality: 'Test Country'
        };
        break;
      case 'artvee_artworks':
        testData = {
          artvee_id: 'test123',
          title: 'Test Artwork',
          artist: 'Test Artist',
          artist_slug: 'test-artist',
          url: 'https://test.com',
          sayu_type: 'test'
        };
        break;
      case 'global_venues':
        testData = {
          name: 'Test Venue',
          country: 'Test Country',
          city: 'Test City',
          venue_type: 'museum',
          data_source: 'test'
        };
        break;
      case 'apt_profiles':
        testData = {
          artist_id: '00000000-0000-0000-0000-000000000000',
          primary_apt: 'INFP_호랑이'
        };
        break;
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert(testData)
      .select();

    if (error) {
      log(`  ❌ Insert failed: ${error.message}`, 'red');
      return false;
    } else {
      log(`  ✅ Insert successful, record ID: ${data[0]?.id}`, 'green');
      
      // 삽입한 테스트 데이터 삭제
      if (data[0]?.id) {
        await supabase.from(tableName).delete().eq('id', data[0].id);
        log(`  🧹 Test record deleted`, 'yellow');
      }
      return true;
    }
  } catch (error) {
    log(`  ❌ Exception: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🔍 Supabase Table Verification', 'blue');
  log('='.repeat(50), 'blue');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const tables = ['artists', 'artvee_artworks', 'global_venues', 'apt_profiles'];
  
  const results = {};

  for (const table of tables) {
    const exists = await checkTable(supabase, table);
    let canInsert = false;
    
    if (exists) {
      canInsert = await testSimpleInsert(supabase, table);
    }
    
    results[table] = { exists, canInsert };
  }

  // 결과 요약
  log('\n📊 Verification Summary:', 'blue');
  log('='.repeat(50), 'blue');
  
  let allReady = true;
  
  Object.entries(results).forEach(([table, result]) => {
    const status = result.exists && result.canInsert ? '✅ Ready' : 
                   result.exists ? '⚠️  Exists but can\'t insert' : '❌ Missing';
    
    log(`${table.padEnd(20)} ${status}`, 
        result.exists && result.canInsert ? 'green' : 
        result.exists ? 'yellow' : 'red');
    
    if (!result.exists || !result.canInsert) {
      allReady = false;
    }
  });

  if (allReady) {
    log('\n✅ All tables ready for migration!', 'green');
  } else {
    log('\n⚠️  Some tables need attention before migration.', 'yellow');
  }
}

if (require.main === module) {
  main().catch(console.error);
}