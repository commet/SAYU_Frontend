#!/usr/bin/env node

/**
 * SAYU API 연결 테스트 스크립트
 * 모든 환경 변수와 외부 서비스 연결을 테스트
 */

require('dotenv').config();

async function testOpenAI() {
  console.log('🤖 Testing OpenAI API...');
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ OpenAI API connection successful');
      return true;
    } else {
      console.log('❌ OpenAI API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ OpenAI API error:', error.message);
    return false;
  }
}

async function testSupabase() {
  console.log('🗄️ Testing Supabase connection...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (!error) {
      console.log('✅ Supabase connection successful');
      return true;
    } else {
      console.log('❌ Supabase failed:', error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Supabase error:', error.message);
    return false;
  }
}

async function testCloudinary() {
  console.log('☁️ Testing Cloudinary configuration...');
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('✅ Cloudinary connection successful');
      return true;
    } else {
      console.log('❌ Cloudinary failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cloudinary error:', error.message);
    return false;
  }
}

async function testGoogleAI() {
  console.log('🔍 Testing Google AI API...');
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    
    // 간단한 모델 정보 요청
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('✅ Google AI API connection successful');
    return true;
  } catch (error) {
    console.log('❌ Google AI API error:', error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('⚙️ Checking environment variables...');
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'OPENAI_API_KEY',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'GOOGLE_AI_API_KEY'
  ];
  
  let missing = [];
  let placeholder = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else if (value.includes('your-') || value.includes('sk-your-') || value.length < 10) {
      placeholder.push(varName);
    }
  });
  
  if (missing.length === 0 && placeholder.length === 0) {
    console.log('✅ All required environment variables are set');
    return true;
  } else {
    if (missing.length > 0) {
      console.log('❌ Missing variables:', missing.join(', '));
    }
    if (placeholder.length > 0) {
      console.log('⚠️  Placeholder values detected:', placeholder.join(', '));
    }
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 SAYU API Connection Test Suite');
  console.log('='.repeat(50));
  
  const results = {};
  
  // 환경 변수 체크
  results.envVars = await testEnvironmentVariables();
  console.log('');
  
  // Supabase 연결 테스트
  results.supabase = await testSupabase();
  console.log('');
  
  // OpenAI API 테스트
  results.openai = await testOpenAI();
  console.log('');
  
  // Cloudinary 테스트
  results.cloudinary = await testCloudinary();
  console.log('');
  
  // Google AI 테스트
  results.googleai = await testGoogleAI();
  console.log('');
  
  // 결과 요약
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const testName = test.charAt(0).toUpperCase() + test.slice(1);
    console.log(`${testName.padEnd(15)}: ${status}`);
  });
  
  console.log('');
  console.log(`Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All systems operational! SAYU is ready for production.');
  } else {
    console.log('⚠️  Some services need attention before production deployment.');
  }
  
  return passed === total;
}

// 스크립트 실행
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests };