const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkTables() {
  console.log('🔍 Checking gamification tables in Supabase...\n');
  
  const tables = [
    'user_game_profiles',
    'point_transactions', 
    'daily_activity_limits',
    'level_definitions',
    'point_rules'
  ];
  
  let allExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: NOT FOUND`);
        console.log(`   Error: ${error.message}`);
        allExist = false;
      } else {
        console.log(`✅ Table ${table}: EXISTS`);
        
        // Check row count for data tables
        if (table === 'level_definitions' || table === 'point_rules') {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          console.log(`   Rows: ${count}`);
        }
      }
    } catch (err) {
      console.log(`❌ Table ${table}: ERROR - ${err.message}`);
      allExist = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (!allExist) {
    console.log('\n⚠️  Some tables are missing!');
    console.log('\n📝 To create the missing tables:');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of: scripts/create-gamification-tables.sql');
    console.log('4. Click "Run" to execute the SQL');
    console.log('\n🔗 Direct link to SQL Editor:');
    console.log('https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst/sql/new');
  } else {
    console.log('\n✨ All gamification tables exist!');
    
    // Check RPC functions
    console.log('\n🔍 Checking RPC functions...\n');
    
    try {
      // Try to call the function with a fake user ID
      const { data, error } = await supabase.rpc('get_user_game_stats', {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      });
      
      if (error && error.message.includes('function')) {
        console.log('❌ RPC function get_user_game_stats: NOT FOUND');
        console.log('\n📝 The RPC functions need to be created.');
        console.log('   Run the SQL script in Supabase to create them.');
      } else {
        console.log('✅ RPC function get_user_game_stats: EXISTS');
      }
    } catch (err) {
      console.log('❌ Error checking RPC functions:', err.message);
    }
  }
}

checkTables().catch(console.error);