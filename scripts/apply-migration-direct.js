#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from the frontend directory
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function executeDirectMigration() {
  console.log('🚀 Applying database migration directly...');
  
  try {
    // Try to add columns one by one to avoid syntax errors
    const alterTableStatements = [
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20)",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_group VARCHAR(20)",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region VARCHAR(100)",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS viewing_styles TEXT[]",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_version INTEGER DEFAULT 1"
    ];
    
    console.log('📝 Adding profile completion columns...');
    
    for (const statement of alterTableStatements) {
      console.log(`   ${statement.substring(0, 50)}...`);
      
      // Use REST API to execute SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: statement })
      });
      
      if (!response.ok) {
        console.log(`   ⚠️  Failed: ${response.statusText}`);
        // Continue with other statements
      } else {
        console.log('   ✅ Success');
      }
    }
    
    // Test the migration by querying the table
    console.log('\n🔍 Testing profile table schema...');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, gender, age_group, region, viewing_styles, profile_completed_at')
      .limit(1);
    
    if (error) {
      console.error('❌ Test failed:', error.message);
      
      // Print manual SQL for user to execute
      console.log('\n📋 Please execute this SQL manually in Supabase Dashboard:');
      console.log('🌐 Go to: https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst/sql');
      console.log('\n' + '='.repeat(60));
      const fs = require('fs');
      const sqlContent = fs.readFileSync(path.join(__dirname, 'add-profile-completion-fields.sql'), 'utf8');
      console.log(sqlContent);
      console.log('='.repeat(60));
    } else {
      console.log('✅ Migration successful! New columns are available.');
      console.log('📊 Columns:', data?.[0] ? Object.keys(data[0]) : 'No data yet');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

executeDirectMigration();