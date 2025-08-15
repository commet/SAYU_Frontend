const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    console.log('🔑 Testing Supabase Authentication...');
    
    // 1. 테스트 계정으로 회원가입
    console.log('\n1. Attempting to sign up test user...');
    const testEmail = `test_${Date.now()}@sayu.art`;
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: 'Test User',
          personality_type: 'LAEF'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Sign up error:', signUpError);
    } else {
      console.log('✅ Sign up successful:', signUpData.user?.email);
    }
    
    // 2. 로그인 테스트
    console.log('\n2. Testing login with test account...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError);
    } else {
      console.log('✅ Sign in successful!');
      console.log('   User ID:', signInData.user?.id);
      console.log('   Email:', signInData.user?.email);
      console.log('   Session:', !!signInData.session);
    }
    
    // 3. 기존 계정으로 로그인 시도
    console.log('\n3. Testing login with existing account...');
    const { data: existingSignIn, error: existingError } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (existingError) {
      console.error('❌ Existing account login error:', existingError.message);
    } else {
      console.log('✅ Existing account login successful!');
    }
    
    // 4. 세션 확인
    console.log('\n4. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else {
      console.log('✅ Session status:', session ? 'Active' : 'No session');
      if (session) {
        console.log('   Session expires at:', new Date(session.expires_at * 1000).toLocaleString());
      }
    }
    
    // 5. 로그아웃
    console.log('\n5. Testing logout...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Sign out error:', signOutError);
    } else {
      console.log('✅ Sign out successful');
    }
    
    console.log('\n✨ Authentication test completed!');
    console.log('📝 Test Account Created:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    
  } catch (error) {
    console.error('🔴 Unexpected error:', error);
  }
}

// 실행
testAuth();