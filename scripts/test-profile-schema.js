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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProfileSchema() {
  console.log('🔍 Testing current profile table schema...');
  
  try {
    // Try to select from profiles with new columns
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, gender, age_group, region, viewing_styles, profile_completed_at')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ New columns do not exist yet');
        console.log('📋 Please execute this SQL in Supabase SQL Editor:');
        console.log('\n' + '='.repeat(80));
        
        const fs = require('fs');
        const sqlContent = fs.readFileSync(path.join(__dirname, 'add-profile-completion-fields.sql'), 'utf8');
        console.log(sqlContent);
        
        console.log('='.repeat(80) + '\n');
        console.log('🌐 Go to: https://supabase.com/dashboard/project/[your-project-id]/sql');
        return false;
      } else {
        throw error;
      }
    }
    
    console.log('✅ Profile table schema is up to date!');
    console.log('📊 Available columns:', data?.[0] ? Object.keys(data[0]) : 'No data');
    return true;
    
  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    return false;
  }
}

async function createTestProfile() {
  console.log('\n🧪 Testing profile creation with new fields...');
  
  try {
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    // Try to upsert a test profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: testUserId,
        email: 'test@example.com',
        username: 'test-user',
        gender: 'prefer_not_to_say',
        age_group: '20s',
        region: 'seoul',
        viewing_styles: ['intuitive', 'social'],
        profile_completed_at: new Date().toISOString(),
        profile_completion_version: 1
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Test profile created successfully');
    
    // Clean up test data
    await supabase.from('profiles').delete().eq('id', testUserId);
    console.log('🧹 Test data cleaned up');
    
    return true;
    
  } catch (error) {
    console.error('❌ Profile creation test failed:', error.message);
    return false;
  }
}

async function main() {
  const schemaOk = await testProfileSchema();
  
  if (schemaOk) {
    await createTestProfile();
    console.log('\n🎉 All tests passed! Profile completion feature is ready.');
  } else {
    console.log('\n⚠️  Please update the database schema first.');
  }
}

main();