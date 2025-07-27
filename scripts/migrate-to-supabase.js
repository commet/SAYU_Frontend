#!/usr/bin/env node
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Railway PostgreSQL connection
const railwayPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Tables to migrate in order (respecting foreign key constraints)
const MIGRATION_ORDER = [
  'users',
  'quiz_sessions',
  'quiz_answers',
  'quiz_results',
  'art_profiles',
  'art_profile_generations',
  'venues',
  'exhibitions',
  'exhibition_views',
  'exhibition_likes',
  'artworks',
  'artwork_personality_tags',
  'artwork_interactions',
  'gamification_levels',
  'gamification_points',
  'user_badges',
  'daily_challenges',
  'user_following',
  'exhibition_companions',
  'perception_exchanges',
  'perception_exchange_replies',
  'perception_exchange_reactions',
  'emotion_vectors'
];

// Tables that need special handling
const SPECIAL_HANDLING = {
  'users': {
    transform: (row) => ({
      ...row,
      auth_id: row.auth_id || null, // Handle missing auth_id
      notification_settings: row.notification_settings || { email: true, push: false },
      privacy_settings: row.privacy_settings || { profile_public: true }
    })
  },
  'emotion_vectors': {
    transform: (row) => ({
      ...row,
      // Convert vector string to proper format if needed
      emotion_vector: row.emotion_vector ? `[${row.emotion_vector}]` : null
    })
  }
};

async function migrateTable(tableName) {
  console.log(`\n📊 Migrating ${tableName}...`);
  
  try {
    // Check if table exists in Railway
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `;
    const { rows: exists } = await railwayPool.query(checkQuery, [tableName]);
    
    if (!exists[0].exists) {
      console.log(`⚠️  Table ${tableName} does not exist in Railway, skipping...`);
      return { skipped: true, table: tableName };
    }

    // Get count of records
    const countResult = await railwayPool.query(`SELECT COUNT(*) FROM ${tableName}`);
    const totalCount = parseInt(countResult.rows[0].count);
    
    if (totalCount === 0) {
      console.log(`⚠️  Table ${tableName} is empty, skipping...`);
      return { skipped: true, table: tableName, reason: 'empty' };
    }

    console.log(`📋 Found ${totalCount} records to migrate`);

    // Fetch data in batches
    const batchSize = 1000;
    let offset = 0;
    let migratedCount = 0;
    const errors = [];

    while (offset < totalCount) {
      const { rows } = await railwayPool.query(
        `SELECT * FROM ${tableName} ORDER BY created_at, id LIMIT $1 OFFSET $2`,
        [batchSize, offset]
      );

      if (rows.length === 0) break;

      // Transform data if needed
      let transformedRows = rows;
      if (SPECIAL_HANDLING[tableName]) {
        transformedRows = rows.map(SPECIAL_HANDLING[tableName].transform);
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from(tableName)
        .upsert(transformedRows, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`❌ Error migrating batch at offset ${offset}:`, error.message);
        errors.push({
          offset,
          error: error.message,
          sample: transformedRows[0]
        });
        
        // Try to continue with next batch
        offset += batchSize;
        continue;
      }

      migratedCount += rows.length;
      offset += batchSize;
      
      // Progress indicator
      const progress = Math.round((migratedCount / totalCount) * 100);
      process.stdout.write(`\r✅ Progress: ${progress}% (${migratedCount}/${totalCount})`);
    }

    console.log(`\n✅ Successfully migrated ${migratedCount} records`);
    
    return {
      success: true,
      table: tableName,
      total: totalCount,
      migrated: migratedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error(`❌ Failed to migrate ${tableName}:`, error.message);
    return {
      success: false,
      table: tableName,
      error: error.message
    };
  }
}

async function verifyMigration(tableName) {
  try {
    // Get count from Railway
    const railwayResult = await railwayPool.query(`SELECT COUNT(*) FROM ${tableName}`);
    const railwayCount = parseInt(railwayResult.rows[0].count);

    // Get count from Supabase
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { table: tableName, verified: false, error: error.message };
    }

    const match = railwayCount === count;
    return {
      table: tableName,
      verified: match,
      railwayCount,
      supabaseCount: count,
      difference: railwayCount - count
    };
  } catch (error) {
    return { table: tableName, verified: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting SAYU Database Migration to Supabase\n');
  
  const startTime = Date.now();
  const results = [];
  
  try {
    // Test connections
    console.log('🔌 Testing connections...');
    
    // Test Railway
    await railwayPool.query('SELECT 1');
    console.log('✅ Railway connection successful');
    
    // Test Supabase
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    console.log('✅ Supabase connection successful\n');

    // Migrate tables in order
    for (const table of MIGRATION_ORDER) {
      const result = await migrateTable(table);
      results.push(result);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verification phase
    console.log('\n\n🔍 Verifying migration...\n');
    const verificationResults = [];
    
    for (const table of MIGRATION_ORDER) {
      const result = results.find(r => r.table === table);
      if (result?.success || result?.skipped) {
        const verification = await verifyMigration(table);
        verificationResults.push(verification);
      }
    }

    // Summary
    console.log('\n\n📊 Migration Summary\n' + '='.repeat(50));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    
    // Show failed tables
    if (failed > 0) {
      console.log('\n❌ Failed tables:');
      results.filter(r => !r.success && !r.skipped).forEach(r => {
        console.log(`  - ${r.table}: ${r.error}`);
      });
    }

    // Show verification mismatches
    const mismatches = verificationResults.filter(v => !v.verified && v.difference !== 0);
    if (mismatches.length > 0) {
      console.log('\n⚠️  Verification mismatches:');
      mismatches.forEach(v => {
        console.log(`  - ${v.table}: Railway(${v.railwayCount}) vs Supabase(${v.supabaseCount})`);
      });
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n⏱️  Total time: ${duration} seconds`);

    // Save results to file
    const fs = require('fs');
    const reportPath = path.join(__dirname, `migration-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      duration,
      results,
      verificationResults
    }, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await railwayPool.end();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateTable, verifyMigration };