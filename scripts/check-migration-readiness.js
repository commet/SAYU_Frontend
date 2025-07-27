#!/usr/bin/env node
/**
 * Migration Readiness Checker
 * Verifies environment and connections before running migration
 */
const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Color codes for console output
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

async function checkEnvironmentVariables() {
  log('\n📋 Checking Environment Variables...', 'blue');
  
  const required = {
    railway: ['DATABASE_URL'],
    supabase: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY']
  };
  
  let allPresent = true;
  
  // Check Railway variables
  log('\nRailway Configuration:', 'yellow');
  for (const varName of required.railway) {
    if (process.env[varName]) {
      log(`  ✓ ${varName}: Set`, 'green');
    } else {
      log(`  ✗ ${varName}: Missing`, 'red');
      allPresent = false;
    }
  }
  
  // Check Supabase variables
  log('\nSupabase Configuration:', 'yellow');
  for (const varName of required.supabase) {
    if (process.env[varName]) {
      log(`  ✓ ${varName}: Set`, 'green');
      if (varName === 'SUPABASE_URL') {
        log(`    → ${process.env[varName]}`, 'blue');
      }
    } else {
      log(`  ✗ ${varName}: Missing`, 'red');
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function testRailwayConnection() {
  log('\n🔌 Testing Railway PostgreSQL Connection...', 'blue');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    const result = await pool.query('SELECT version()');
    log('  ✓ Railway PostgreSQL connected', 'green');
    log(`    → ${result.rows[0].version}`, 'blue');
    
    // Check tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    log(`\n  📊 Found ${tablesResult.rows.length} tables in Railway:`, 'yellow');
    tablesResult.rows.slice(0, 5).forEach(row => {
      log(`    - ${row.table_name}`, 'blue');
    });
    if (tablesResult.rows.length > 5) {
      log(`    ... and ${tablesResult.rows.length - 5} more`, 'blue');
    }
    
    await pool.end();
    return true;
  } catch (error) {
    log(`  ✗ Railway connection failed: ${error.message}`, 'red');
    await pool.end();
    return false;
  }
}

async function testSupabaseConnection() {
  log('\n🔌 Testing Supabase Connection...', 'blue');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
      throw error;
    }
    
    log('  ✓ Supabase connected successfully', 'green');
    log(`    → Project: ${process.env.SUPABASE_URL}`, 'blue');
    
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables', {});
    
    if (!tablesError && tables) {
      log(`\n  📊 Found ${tables.length} tables in Supabase:`, 'yellow');
      tables.slice(0, 5).forEach(table => {
        log(`    - ${table.table_name}`, 'blue');
      });
    } else {
      log('\n  ⚠️  No tables found in Supabase (this is expected for first migration)', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`  ✗ Supabase connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkDataVolume() {
  log('\n📏 Checking Data Volume...', 'blue');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    const tables = [
      'users',
      'quiz_sessions',
      'quiz_results',
      'exhibitions',
      'artworks'
    ];
    
    let totalRows = 0;
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        totalRows += count;
        log(`  - ${table}: ${count.toLocaleString()} rows`, 'blue');
      } catch (error) {
        log(`  - ${table}: Not found`, 'yellow');
      }
    }
    
    log(`\n  📊 Total rows to migrate: ~${totalRows.toLocaleString()}`, 'yellow');
    
    const estimatedTime = Math.ceil(totalRows / 1000) * 2; // ~2 seconds per 1000 rows
    log(`  ⏱️  Estimated migration time: ~${estimatedTime} seconds`, 'blue');
    
    await pool.end();
    return true;
  } catch (error) {
    log(`  ✗ Failed to check data volume: ${error.message}`, 'red');
    await pool.end();
    return false;
  }
}

async function main() {
  log('🚀 SAYU Migration Readiness Check', 'blue');
  log('='.repeat(50), 'blue');
  
  const checks = {
    environment: false,
    railway: false,
    supabase: false,
    dataVolume: false
  };
  
  // Run checks
  checks.environment = await checkEnvironmentVariables();
  
  if (checks.environment) {
    checks.railway = await testRailwayConnection();
    checks.supabase = await testSupabaseConnection();
    
    if (checks.railway) {
      checks.dataVolume = await checkDataVolume();
    }
  }
  
  // Summary
  log('\n📊 Summary', 'blue');
  log('='.repeat(50), 'blue');
  
  const allPassed = Object.values(checks).every(check => check);
  
  Object.entries(checks).forEach(([name, passed]) => {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const color = passed ? 'green' : 'red';
    log(`  ${name.padEnd(15)} ${status}`, color);
  });
  
  if (allPassed) {
    log('\n✅ All checks passed! Ready to migrate.', 'green');
    log('\nNext steps:', 'yellow');
    log('  1. Run the migration script:', 'blue');
    log('     node scripts/migrate-to-supabase.js', 'blue');
    log('  2. Monitor the progress', 'blue');
    log('  3. Verify data in Supabase dashboard', 'blue');
  } else {
    log('\n❌ Some checks failed. Please fix the issues before migrating.', 'red');
    log('\nTroubleshooting:', 'yellow');
    log('  1. Check your .env file has all required variables', 'blue');
    log('  2. Verify Railway database is accessible', 'blue');
    log('  3. Ensure Supabase project is set up correctly', 'blue');
    log('  4. Check network connectivity', 'blue');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the checker
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkEnvironmentVariables, testRailwayConnection, testSupabaseConnection };