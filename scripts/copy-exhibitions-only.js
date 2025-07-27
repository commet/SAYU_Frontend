#!/usr/bin/env node
/**
 * Copy only exhibitions from Railway to Supabase
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

async function copyExhibitionsOnly() {
  log('\n📋 Copying Exhibitions Only...', 'blue');
  
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
    
    // Get ALL exhibitions from Railway
    const result = await railwayClient.query('SELECT * FROM exhibitions');
    log(`  Found ${result.rows.length} exhibitions in Railway`, 'blue');

    if (result.rows.length === 0) {
      log('  No exhibitions to migrate', 'yellow');
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    for (const exhibition of result.rows) {
      try {
        // 간단하게 핵심 필드만 복사
        const supabaseExhibition = {
          id: exhibition.id,
          title: exhibition.title_en || exhibition.title_local, // title 필드 사용
          start_date: exhibition.start_date,
          end_date: exhibition.end_date,
          status: exhibition.status || 'upcoming',
          description: exhibition.description,
          artist: exhibition.artists ? exhibition.artists[0] : null, // 첫 번째 작가만
          // venue 연결은 나중에 처리 (지금은 null)
          venue_id: null,
          created_at: exhibition.created_at,
          updated_at: exhibition.updated_at
        };

        const { error } = await supabase
          .from('exhibitions')
          .insert(supabaseExhibition);

        if (error) {
          if (error.message.includes('duplicate key')) {
            log(`    ⚠️  Exhibition already exists: ${exhibition.title_en}`, 'yellow');
          } else {
            log(`    ✗ Failed: ${exhibition.title_en} - ${error.message}`, 'red');
            failed++;
          }
        } else {
          log(`    ✓ Copied: ${exhibition.title_en}`, 'green');
          success++;
        }
      } catch (error) {
        log(`    ✗ Error: ${exhibition.title_en} - ${error.message}`, 'red');
        failed++;
      }
    }

    await railwayClient.end();
    return { success, failed };
    
  } catch (error) {
    log(`  ✗ Failed to copy exhibitions: ${error.message}`, 'red');
    await railwayClient.end();
    return { success: 0, failed: 1 };
  }
}

async function main() {
  log('🚀 Copying Exhibitions Only', 'blue');
  log('='.repeat(40), 'blue');

  try {
    const result = await copyExhibitionsOnly();
    
    log('\n📊 Exhibition Copy Summary', 'blue');
    log('='.repeat(40), 'blue');
    log(`Successful: ${result.success}`, result.success > 0 ? 'green' : 'yellow');
    log(`Failed: ${result.failed}`, result.failed > 0 ? 'red' : 'green');
    log(`Total processed: ${result.success + result.failed}`, 'blue');

    if (result.success > 0) {
      log('\n✅ Some exhibitions copied successfully!', 'green');
    } else {
      log('\n⚠️  No new exhibitions were copied', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Copy failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run copy
if (require.main === module) {
  main().catch(console.error);
}