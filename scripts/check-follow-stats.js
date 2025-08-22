const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkFollowStats() {
  console.log('🔍 Checking follow stats function...\n');
  
  try {
    // Check if follows table exists
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('*')
      .limit(1);
    
    if (followsError) {
      console.log('❌ Table follows: NOT FOUND');
      console.log('   Creating follows table and function...');
      
      // Read and execute the SQL
      const fs = require('fs');
      const sql = fs.readFileSync(path.join(__dirname, 'add-follow-stats-function.sql'), 'utf8');
      
      console.log('\n📝 Please run the following SQL in Supabase:');
      console.log('   File: scripts/add-follow-stats-function.sql');
      console.log('\n🔗 Direct link to SQL Editor:');
      console.log('https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst/sql/new');
      
      return false;
    } else {
      console.log('✅ Table follows: EXISTS');
    }
    
    // Try to call the function
    const { data, error } = await supabase.rpc('get_follow_stats', {
      p_user_id: '00000000-0000-0000-0000-000000000000'
    });
    
    if (error && error.message.includes('function')) {
      console.log('❌ RPC function get_follow_stats: NOT FOUND');
      console.log('\n📝 Please run the SQL in scripts/add-follow-stats-function.sql');
      return false;
    } else {
      console.log('✅ RPC function get_follow_stats: EXISTS');
      return true;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

checkFollowStats().then(exists => {
  if (!exists) {
    console.log('\n⚠️  Missing components detected!');
    console.log('Please run the SQL script in Supabase to fix this.');
  } else {
    console.log('\n✨ All follow stats components exist!');
  }
});