#!/usr/bin/env node
/**
 * SAYU 환경 변수 동기화 스크립트
 * 
 * 노트북 ↔ 데스크탑 환경 변수 동기화 문제 해결
 * .env 파일이 gitignore에 있어서 발생하는 동기화 이슈 해결
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SAYU 환경 변수 동기화 시작...\n');

// 현재 환경 확인
function checkCurrentEnv() {
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  
  console.log('📍 현재 환경 상태:');
  console.log(`   Backend .env: ${fs.existsSync(backendEnvPath) ? '✅ 존재' : '❌ 없음'}`);
  console.log(`   Frontend .env.local: ${fs.existsSync(frontendEnvPath) ? '✅ 존재' : '❌ 없음'}`);
  
  if (fs.existsSync(backendEnvPath)) {
    const content = fs.readFileSync(backendEnvPath, 'utf8');
    const isSupabase = content.includes('hgltvdshuyfffskvjmst.supabase.co');
    const isRailway = content.includes('tramway.proxy.rlwy.net');
    
    console.log(`   Backend DB: ${isSupabase ? '✅ Supabase' : isRailway ? '⚠️ Railway' : '❓ Unknown'}`);
  }
  
  console.log('');
}

// 환경 변수 동기화
function syncEnvironment() {
  const backendExamplePath = path.join(__dirname, 'backend', '.env.example');
  const frontendExamplePath = path.join(__dirname, 'frontend', '.env.example');
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  
  console.log('🔄 환경 변수 동기화 중...');
  
  // Backend 환경 변수 동기화
  if (fs.existsSync(backendExamplePath)) {
    if (!fs.existsSync(backendEnvPath)) {
      fs.copyFileSync(backendExamplePath, backendEnvPath);
      console.log('   ✅ Backend .env 생성 완료');
    } else {
      // 기존 .env 파일 백업
      const backupPath = backendEnvPath + '.backup.' + Date.now();
      fs.copyFileSync(backendEnvPath, backupPath);
      console.log(`   📦 기존 .env 백업: ${path.basename(backupPath)}`);
      
      // 새 설정으로 교체
      fs.copyFileSync(backendExamplePath, backendEnvPath);
      console.log('   ✅ Backend .env Supabase 설정으로 업데이트');
    }
  }
  
  // Frontend 환경 변수 동기화
  if (fs.existsSync(frontendExamplePath)) {
    if (!fs.existsSync(frontendEnvPath)) {
      fs.copyFileSync(frontendExamplePath, frontendEnvPath);
      console.log('   ✅ Frontend .env.local 생성 완료');
    } else {
      // 기존 파일 확인
      const content = fs.readFileSync(frontendEnvPath, 'utf8');
      if (!content.includes('hgltvdshuyfffskvjmst.supabase.co')) {
        const backupPath = frontendEnvPath + '.backup.' + Date.now();
        fs.copyFileSync(frontendEnvPath, backupPath);
        console.log(`   📦 기존 .env.local 백업: ${path.basename(backupPath)}`);
        
        fs.copyFileSync(frontendExamplePath, frontendEnvPath);
        console.log('   ✅ Frontend .env.local Supabase 설정으로 업데이트');
      } else {
        console.log('   ✅ Frontend .env.local 이미 최신 상태');
      }
    }
  }
  
  console.log('');
}

// 연결 테스트
async function testConnection() {
  console.log('🧪 Supabase 연결 테스트...');
  
  try {
    // 환경 변수 로드
    require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
    
    // Supabase 클라이언트 테스트
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.log('   ❌ Supabase 연결 실패:', error.message);
    } else {
      console.log('   ✅ Supabase 연결 성공!');
      
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      console.log(`   📊 데이터베이스 사용자 수: ${count}명`);
    }
  } catch (error) {
    console.log('   ❌ 테스트 실패:', error.message);
  }
  
  console.log('');
}

// 사용법 안내
function showUsage() {
  console.log('📚 다음 단계:');
  console.log('   1. 데스크탑에서도 동일한 스크립트 실행');
  console.log('   2. 양쪽 환경에서 모두 Supabase 연결 확인');
  console.log('   3. 개발 서버 재시작');
  console.log('');
  console.log('   🖥️  데스크탑: node sync-env.js');
  console.log('   💻 노트북: node sync-env.js');
  console.log('');
  console.log('⚠️  참고: 이 스크립트는 자동으로 기존 파일을 백업합니다.');
}

// 메인 실행
async function main() {
  checkCurrentEnv();
  syncEnvironment();
  await testConnection();
  showUsage();
  
  console.log('🎉 환경 변수 동기화 완료!\n');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}