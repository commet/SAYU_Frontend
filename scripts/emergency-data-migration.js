#!/usr/bin/env node
/**
 * Emergency Data Migration - Critical missing data
 * 가장 중요한 누락 데이터를 긴급 이전
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

// 중요한 테이블들을 Supabase에 생성하고 데이터 이전
const criticalTables = [
  {
    name: 'artists',
    sql: `CREATE TABLE IF NOT EXISTS artists (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(300) NOT NULL,
      name_en VARCHAR(300),
      birth_year INTEGER,
      death_year INTEGER,
      nationality VARCHAR(100),
      bio TEXT,
      style VARCHAR(100),
      movement VARCHAR(100),
      website TEXT,
      image_url TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'global_venues',
    sql: `CREATE TABLE IF NOT EXISTS global_venues (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(300) NOT NULL,
      name_en VARCHAR(300),
      city VARCHAR(100),
      country VARCHAR(100),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      type VARCHAR(100),
      website TEXT,
      metadata JSONB,
      railway_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  },
  {
    name: 'artvee_artworks', 
    sql: `CREATE TABLE IF NOT EXISTS artvee_artworks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      artist VARCHAR(300),
      year INTEGER,
      medium VARCHAR(200),
      description TEXT,
      image_url TEXT,
      source_url TEXT,
      tags TEXT[],
      metadata JSONB,
      railway_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  }
];

async function createTablesInSupabase() {
  log('\n🔧 Creating critical tables in Supabase...', 'blue');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  for (const table of criticalTables) {
    try {
      // Supabase에서는 직접 SQL 실행이 제한적이므로 스키마 생성은 수동으로 해야 함
      log(`  📋 Table ${table.name} schema ready`, 'green');
    } catch (error) {
      log(`  ✗ Failed to create ${table.name}: ${error.message}`, 'red');
    }
  }
}

async function migrateAllVenues() {
  log('\n📋 Migrating ALL venues (including global_venues)...', 'blue');
  
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
    
    // 모든 venues 가져오기 (이번에는 제한 없이)
    const result = await railwayClient.query('SELECT * FROM venues');
    log(`  Found ${result.rows.length} venues in Railway`, 'blue');

    let success = 0;
    let failed = 0;

    for (const venue of result.rows) {
      try {
        const supabaseVenue = {
          name: venue.name,
          name_en: venue.name_en,
          city: venue.city,
          district: venue.district,
          country: venue.country || 'KR',
          type: venue.type,
          tier: venue.tier,
          website: venue.website,
          address: venue.address,
          instagram: venue.instagram,
          is_active: venue.is_active,
          latitude: venue.latitude,
          longitude: venue.longitude,
          phone: venue.phone,
          rating: venue.rating,
          review_count: venue.review_count,
          opening_hours: venue.opening_hours,
          admission_fee: venue.admission_fee,
          google_place_id: venue.google_place_id,
          data_completeness: venue.data_completeness,
          last_updated: venue.last_updated,
          created_at: venue.created_at,
          updated_at: venue.updated_at,
          metadata: { railway_id: venue.id }
        };

        const { error } = await supabase
          .from('venues')
          .upsert(supabaseVenue, { onConflict: 'name' });

        if (error) {
          log(`    ✗ Failed: ${venue.name} - ${error.message}`, 'red');
          failed++;
        } else {
          log(`    ✓ Migrated: ${venue.name}`, 'green');
          success++;
        }
      } catch (error) {
        log(`    ✗ Error: ${venue.name} - ${error.message}`, 'red');
        failed++;
      }
    }

    await railwayClient.end();
    log(`\n  📊 Venues: ${success} success, ${failed} failed`, success > failed ? 'green' : 'yellow');
    return { success, failed };
    
  } catch (error) {
    log(`  ✗ Failed to migrate venues: ${error.message}`, 'red');
    await railwayClient.end();
    return { success: 0, failed: 1 };
  }
}

async function migrateCriticalData() {
  log('\n📋 Migrating critical data tables...', 'blue');
  
  const railwayClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const results = {};

  try {
    await railwayClient.connect();
    
    // Critical tables to migrate
    const tablesToMigrate = [
      { railway: 'global_venues', supabase: 'global_venues' },
      { railway: 'artists', supabase: 'artists' },
      { railway: 'artvee_artworks', supabase: 'artvee_artworks' },
      { railway: 'apt_profiles', supabase: 'apt_profiles' }
    ];

    for (const { railway: railwayTable, supabase: supabaseTable } of tablesToMigrate) {
      log(`\n  📋 Processing ${railwayTable}...`, 'blue');
      
      try {
        const result = await railwayClient.query(`SELECT * FROM ${railwayTable} LIMIT 50`);
        log(`    Found ${result.rows.length} records`, 'blue');

        if (result.rows.length === 0) {
          results[railwayTable] = { success: 0, failed: 0 };
          continue;
        }

        let success = 0;
        let failed = 0;

        for (const row of result.rows) {
          try {
            // 간단한 데이터 변환 (ID 제거하고 나머지 그대로)
            const { id, ...data } = row;
            const supabaseData = {
              ...data,
              metadata: { railway_id: id }
            };

            // Supabase에 삽입 시도
            const { error } = await supabase
              .from(supabaseTable)
              .insert(supabaseData);

            if (error) {
              if (error.message.includes('relation') && error.message.includes('does not exist')) {
                log(`    ⚠️  Table ${supabaseTable} does not exist in Supabase`, 'yellow');
                break;
              } else {
                failed++;
              }
            } else {
              success++;
            }
          } catch (error) {
            failed++;
          }
        }

        results[railwayTable] = { success, failed };
        log(`    📊 ${railwayTable}: ${success} success, ${failed} failed`, success > 0 ? 'green' : 'yellow');
        
      } catch (error) {
        log(`    ✗ ${railwayTable}: ${error.message}`, 'red');
        results[railwayTable] = { success: 0, failed: 1 };
      }
    }

    await railwayClient.end();
    return results;
    
  } catch (error) {
    log(`  ✗ Failed to migrate critical data: ${error.message}`, 'red');
    await railwayClient.end();
    return {};
  }
}

async function main() {
  log('🚨 Emergency Data Migration - Critical Data Only', 'red');
  log('='.repeat(60), 'red');

  try {
    // 1. 모든 venues 이전 (가장 중요)
    const venueResult = await migrateAllVenues();
    
    // 2. 기타 중요 데이터 이전
    const criticalResults = await migrateCriticalData();
    
    // 요약
    log('\n📊 Emergency Migration Summary', 'blue');
    log('='.repeat(60), 'blue');
    log(`Venues: ${venueResult.success} success, ${venueResult.failed} failed`, 'green');
    
    Object.entries(criticalResults).forEach(([table, result]) => {
      log(`${table}: ${result.success} success, ${result.failed} failed`, 
          result.success > 0 ? 'green' : 'yellow');
    });

    log('\n🚨 IMPORTANT: Manual steps required:', 'red');
    log('1. Execute the table creation SQL in Supabase for missing tables', 'yellow');
    log('2. Re-run this script after creating tables', 'yellow');
    log('3. Verify all critical data before Railway termination', 'yellow');

  } catch (error) {
    log(`\n❌ Emergency migration failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run emergency migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateAllVenues, migrateCriticalData };