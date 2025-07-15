#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function applyExhibitionIndexes() {
  console.log('📊 Applying Exhibition System Performance Indexes...');
  
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'migrations', 'exhibition-performance-indexes.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL statements (remove comments and empty lines)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        if (statement.includes('CREATE INDEX CONCURRENTLY')) {
          console.log(`Creating index: ${statement.substring(0, 100)}...`);
        } else if (statement.includes('ALTER TABLE')) {
          console.log(`Adding constraint: ${statement.substring(0, 100)}...`);
        }
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Already exists, skipping...`);
            skipCount++;
          } else {
            console.error(`❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error executing statement: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📈 Index Application Summary:');
    console.log(`✅ Successfully applied: ${successCount}`);
    console.log(`⚠️  Skipped (already exists): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Test performance of common exhibition queries
    console.log('\n🧪 Testing Exhibition Query Performance...');
    
    const testQueries = [
      {
        name: 'Filter by status',
        query: `SELECT id, title FROM exhibitions WHERE status = 'ongoing' LIMIT 10`
      },
      {
        name: 'Filter by city',
        query: `SELECT id, title FROM exhibitions WHERE venue_city = '서울' LIMIT 10`
      },
      {
        name: 'Sort by popularity',
        query: `SELECT id, title, view_count, like_count FROM exhibitions ORDER BY view_count DESC, like_count DESC LIMIT 10`
      },
      {
        name: 'Date range filter',
        query: `SELECT id, title FROM exhibitions WHERE start_date <= NOW() AND end_date >= NOW() LIMIT 10`
      }
    ];
    
    for (const test of testQueries) {
      const startTime = Date.now();
      const { data, error } = await supabase.rpc('exec_sql', { sql: test.query });
      const endTime = Date.now();
      
      if (error) {
        console.log(`❌ ${test.name}: Error - ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: ${endTime - startTime}ms`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to apply indexes:', error);
    process.exit(1);
  }
}

// Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const { error } = await supabase.rpc('exec_sql', { 
    sql: `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });
  
  if (error && !error.message.includes('already exists')) {
    console.error('Failed to create exec_sql function:', error);
  }
}

// Run the index application
if (require.main === module) {
  createExecSqlFunction().then(() => {
    applyExhibitionIndexes();
  });
}

module.exports = { applyExhibitionIndexes };