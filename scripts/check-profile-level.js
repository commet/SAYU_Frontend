const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkProfileLevel() {
  const userId = '4cb9d9da-a973-4c41-ba24-6b809dff911a';
  
  console.log('🔍 Checking profile structure for user:', userId);
  
  // 1. Direct table query
  const { data: profile, error } = await supabase
    .from('user_game_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('\n📊 Profile data from table:');
  console.log(JSON.stringify(profile, null, 2));
  
  // 2. Check RPC function result
  const { data: stats, error: rpcError } = await supabase.rpc('get_user_game_stats', {
    p_user_id: userId
  });
  
  if (rpcError) {
    console.error('RPC Error:', rpcError);
  } else {
    console.log('\n📊 Stats from RPC function:');
    console.log(JSON.stringify(stats, null, 2));
  }
  
  // 3. Update level if missing
  if (profile && !profile.level) {
    console.log('\n⚠️  Level field is missing! Updating...');
    
    const { data: updated, error: updateError } = await supabase
      .from('user_game_profiles')
      .update({ level: 1 })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('✅ Level updated:', updated);
    }
  }
}

checkProfileLevel();