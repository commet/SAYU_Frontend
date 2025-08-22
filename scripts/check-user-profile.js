const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkUserProfile(email) {
  console.log(`🔍 Checking profile for user: ${email}\n`);
  
  try {
    // 1. Find user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error getting users:', authError);
      return;
    }
    
    const user = authUser.users.find(u => u.email === email);
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }
    
    console.log(`✅ Found user: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    
    // 2. Check if user has game profile
    const { data: gameProfile, error: profileError } = await supabase
      .from('user_game_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError && profileError.code === 'PGRST116') {
      console.log('\n❌ No game profile found for this user');
      console.log('\n📝 Creating initial game profile...');
      
      // Create game profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_game_profiles')
        .insert({
          user_id: user.id,
          level: 1,
          current_exp: 0,
          total_points: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        return;
      }
      
      console.log('✅ Game profile created successfully!');
      console.log(`   Level: ${newProfile.level}`);
      console.log(`   Points: ${newProfile.total_points}`);
      
      // Add signup points
      console.log('\n💰 Adding signup bonus points...');
      
      const { data: pointResult, error: pointError } = await supabase.rpc('add_points', {
        p_user_id: user.id,
        p_action_type: 'signup',
        p_metadata: { source: 'manual_creation' }
      });
      
      if (pointError) {
        console.error('Error adding signup points:', pointError);
      } else {
        console.log('✅ Signup points added:', pointResult);
      }
      
    } else if (profileError) {
      console.error('Error checking profile:', profileError);
    } else {
      console.log('\n✅ Game profile exists:');
      console.log(`   Level: ${gameProfile.level}`);
      console.log(`   Current EXP: ${gameProfile.current_exp}`);
      console.log(`   Total Points: ${gameProfile.total_points}`);
      console.log(`   Created: ${new Date(gameProfile.created_at).toLocaleString()}`);
      
      // Check point transactions
      const { data: transactions, error: txError } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!txError && transactions.length > 0) {
        console.log('\n📊 Recent point transactions:');
        transactions.forEach(tx => {
          console.log(`   ${tx.action_type}: +${tx.points} points (${new Date(tx.created_at).toLocaleDateString()})`);
        });
      } else {
        console.log('\n📊 No point transactions found');
      }
    }
    
    // 3. Check quiz results
    const { data: quizResults, error: quizError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (!quizError && quizResults && quizResults.length > 0) {
      console.log('\n🎯 Quiz results found:');
      quizResults.forEach(quiz => {
        console.log(`   Type: ${quiz.result_type}, Score: ${quiz.score || 'N/A'} (${new Date(quiz.created_at).toLocaleDateString()})`);
      });
      
      // Check if APT test completed but no points given
      const aptTest = quizResults.find(q => q.result_type && q.result_type.includes('APT'));
      if (aptTest) {
        const { data: aptPoints } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('action_type', 'apt_test_complete')
          .single();
        
        if (!aptPoints) {
          console.log('\n⚠️  APT test completed but no points awarded!');
          console.log('   Consider adding APT test completion points');
        }
      }
    } else {
      console.log('\n🎯 No quiz results found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run with the test email
checkUserProfile('test0821@sayu.com');