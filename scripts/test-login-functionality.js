#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from the frontend directory
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function testAuthFlow() {
  console.log('\n🔐 Testing authentication flow...');
  
  try {
    // Create a test user (this will fail if user exists, which is expected)
    console.log('1. Testing user signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'test-login@example.com',
      password: 'test123456'
    });
    
    if (signupError && !signupError.message.includes('already')) {
      console.error('   ❌ Signup failed:', signupError.message);
    } else {
      console.log('   ✅ Signup test completed (user may already exist)');
    }
    
    // Test login
    console.log('\n2. Testing user login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test-login@example.com',
      password: 'test123456'
    });
    
    if (loginError) {
      console.error('   ❌ Login failed:', loginError.message);
      return false;
    }
    
    console.log('   ✅ Login successful');
    console.log('   📧 User email:', loginData.user?.email);
    
    // Test getting session
    console.log('\n3. Testing session retrieval...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('   ❌ Session retrieval failed:', sessionError.message);
    } else {
      console.log('   ✅ Session retrieved successfully');
      console.log('   👤 Session user:', sessionData.session?.user?.email || 'No session');
    }
    
    // Test logout
    console.log('\n4. Testing logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.error('   ❌ Logout failed:', logoutError.message);
    } else {
      console.log('   ✅ Logout successful');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Auth flow test failed:', error.message);
    return false;
  }
}

async function checkProfileTable() {
  console.log('\n📊 Checking profiles table structure...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Profiles table error:', error.message);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Profiles table accessible');
      console.log('📋 Available columns:', Object.keys(data[0]));
    } else {
      console.log('✅ Profiles table accessible (no data yet)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Profiles table check failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 SAYU Login Functionality Test\n');
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Using anon key:', supabaseAnonKey.substring(0, 20) + '...');
  
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) return;
  
  const profilesOk = await checkProfileTable();
  if (!profilesOk) return;
  
  const authOk = await testAuthFlow();
  
  if (authOk) {
    console.log('\n🎉 All tests passed! Login functionality should work.');
    console.log('📝 Next steps:');
    console.log('   1. Start the dev server: cd frontend && npm run dev');
    console.log('   2. Navigate to http://localhost:3000/auth/login');
    console.log('   3. Try logging in with: test-login@example.com / test123456');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

main();