#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from the frontend directory
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  console.log('🚀 Starting profile completion migration...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-profile-completion-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n${i + 1}. Executing: ${statement.substring(0, 60)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });
      
      if (error) {
        // Try direct query if rpc doesn't work
        console.log('   Trying direct query...');
        const { error: directError } = await supabase.from('_').select('*').limit(0);
        
        if (directError && directError.message.includes('relation "_" does not exist')) {
          // This is expected, it means we can't execute raw SQL directly
          console.log('   ⚠️  Direct SQL execution not available, need to use Supabase dashboard');
          console.log('   📋 Copy this SQL to Supabase SQL Editor:');
          console.log('\n' + '='.repeat(60));
          console.log(fs.readFileSync(sqlPath, 'utf8'));
          console.log('='.repeat(60) + '\n');
          return;
        } else {
          throw error;
        }
      }
      
      console.log('   ✅ Success');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Test the new columns
    console.log('\n🔍 Testing new profile structure...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, gender, age_group, region, viewing_styles, profile_completed_at')
      .limit(1);
    
    if (testError) {
      console.error('❌ Test query failed:', testError.message);
    } else {
      console.log('✅ New profile structure is working');
      console.log('   Sample columns:', Object.keys(testData?.[0] || {}));
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

executeMigration();