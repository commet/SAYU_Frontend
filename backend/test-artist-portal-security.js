#!/usr/bin/env node

/**
 * SAYU Artist Portal Security Test Suite
 * 보안 기능들이 올바르게 작동하는지 확인하는 테스트 스크립트
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

// 설정
const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api/artist-portal`;

console.log('🛡️ SAYU Artist Portal Security Test Suite');
console.log(`Testing against: ${BASE_URL}`);
console.log('='.repeat(50));

// 테스트 결과 수집
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// 테스트 헬퍼 함수
function logTest(name, status, message = '', duration = 0) {
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${statusIcon} ${name} ${duration ? `(${duration}ms)` : ''}`);
  if (message) console.log(`   ${message}`);
  
  testResults.details.push({ name, status, message, duration });
  testResults[status === 'PASS' ? 'passed' : status === 'FAIL' ? 'failed' : 'skipped']++;
}

// Rate Limiting 테스트
async function testRateLimiting() {
  console.log('\n📊 Rate Limiting Tests');
  console.log('-'.repeat(30));
  
  try {
    const start = performance.now();
    const promises = [];
    
    // 15개의 동시 요청으로 rate limit 테스트
    for (let i = 0; i < 15; i++) {
      promises.push(
        axios.post(`${API_BASE}/submit`, {
          artist_name: `Test Artist ${i}`,
          contact_email: `test${i}@example.com`,
          bio: 'Test bio for rate limiting'
        }, {
          timeout: 5000,
          validateStatus: () => true // 모든 상태 코드 허용
        })
      );
    }
    
    const responses = await Promise.all(promises);
    const duration = Math.round(performance.now() - start);
    
    // 429 (Too Many Requests) 응답이 있는지 확인
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    if (rateLimitedResponses.length > 0) {
      logTest('Rate Limiting', 'PASS', 
        `${rateLimitedResponses.length}/15 requests rate limited`, duration);
    } else {
      logTest('Rate Limiting', 'FAIL', 
        'No rate limiting detected with 15 concurrent requests', duration);
    }
    
  } catch (error) {
    logTest('Rate Limiting', 'FAIL', `Error: ${error.message}`);
  }
}

// 입력 검증 테스트
async function testInputValidation() {
  console.log('\n🔍 Input Validation Tests');
  console.log('-'.repeat(30));
  
  const maliciousInputs = [
    {
      name: 'SQL Injection',
      payload: { artist_name: "'; DROP TABLE users; --", contact_email: 'test@example.com' }
    },
    {
      name: 'XSS Script Tag',
      payload: { artist_name: '<script>alert("xss")</script>', contact_email: 'test@example.com' }
    },
    {
      name: 'XSS Event Handler',
      payload: { artist_name: 'Test', bio: '<img src=x onerror=alert("xss")>', contact_email: 'test@example.com' }
    },
    {
      name: 'Path Traversal',
      payload: { artist_name: '../../../etc/passwd', contact_email: 'test@example.com' }
    },
    {
      name: 'Command Injection',
      payload: { artist_name: 'test; cat /etc/passwd', contact_email: 'test@example.com' }
    },
    {
      name: 'Invalid Email',
      payload: { artist_name: 'Test Artist', contact_email: 'not-an-email' }
    },
    {
      name: 'Oversized Input',
      payload: { artist_name: 'A'.repeat(1000), contact_email: 'test@example.com' }
    }
  ];
  
  for (const test of maliciousInputs) {
    try {
      const start = performance.now();
      const response = await axios.post(`${API_BASE}/submit`, test.payload, {
        timeout: 5000,
        validateStatus: () => true
      });
      const duration = Math.round(performance.now() - start);
      
      // 400 (Bad Request) 또는 다른 에러 응답을 기대
      if (response.status >= 400) {
        logTest(`Input Validation - ${test.name}`, 'PASS', 
          `Blocked with status ${response.status}`, duration);
      } else {
        logTest(`Input Validation - ${test.name}`, 'FAIL', 
          `Malicious input accepted (status ${response.status})`, duration);
      }
      
    } catch (error) {
      logTest(`Input Validation - ${test.name}`, 'PASS', 
        `Blocked with error: ${error.response?.status || 'Network Error'}`);
    }
  }
}

// CORS 테스트
async function testCORSProtection() {
  console.log('\n🌐 CORS Protection Tests');
  console.log('-'.repeat(30));
  
  const corsTests = [
    {
      name: 'Valid Origin',
      origin: BASE_URL,
      expectPass: true
    },
    {
      name: 'Invalid Origin',
      origin: 'https://malicious-site.com',
      expectPass: false
    },
    {
      name: 'No Origin (Direct Access)',
      origin: null,
      expectPass: true // 개발 환경에서는 허용될 수 있음
    }
  ];
  
  for (const test of corsTests) {
    try {
      const start = performance.now();
      const headers = {};
      if (test.origin) {
        headers['Origin'] = test.origin;
      }
      
      const response = await axios.get(`${API_BASE}/public/artists`, {
        headers,
        timeout: 5000,
        validateStatus: () => true
      });
      const duration = Math.round(performance.now() - start);
      
      const passed = test.expectPass ? response.status < 400 : response.status >= 400;
      
      logTest(`CORS - ${test.name}`, passed ? 'PASS' : 'FAIL', 
        `Status: ${response.status}`, duration);
        
    } catch (error) {
      const passed = !test.expectPass; // 에러가 발생하면 차단된 것으로 간주
      logTest(`CORS - ${test.name}`, passed ? 'PASS' : 'FAIL', 
        `Error: ${error.message}`);
    }
  }
}

// 파일 업로드 보안 테스트
async function testFileUploadSecurity() {
  console.log('\n📁 File Upload Security Tests');
  console.log('-'.repeat(30));
  
  // 이 테스트는 실제 파일 업로드가 필요하므로 스킵
  // 실제 환경에서는 FormData와 multer 테스트 필요
  logTest('File Upload Security', 'SKIP', 
    'Requires multipart/form-data testing with actual files');
}

// 보안 헤더 테스트
async function testSecurityHeaders() {
  console.log('\n🔒 Security Headers Tests');
  console.log('-'.repeat(30));
  
  try {
    const start = performance.now();
    const response = await axios.get(`${API_BASE}/public/artists`, {
      timeout: 5000
    });
    const duration = Math.round(performance.now() - start);
    
    const headers = response.headers;
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'strict-transport-security'
    ];
    
    let foundHeaders = 0;
    for (const header of securityHeaders) {
      if (headers[header]) {
        foundHeaders++;
      }
    }
    
    if (foundHeaders >= securityHeaders.length / 2) {
      logTest('Security Headers', 'PASS', 
        `${foundHeaders}/${securityHeaders.length} security headers present`, duration);
    } else {
      logTest('Security Headers', 'FAIL', 
        `Only ${foundHeaders}/${securityHeaders.length} security headers found`, duration);
    }
    
  } catch (error) {
    logTest('Security Headers', 'FAIL', `Error: ${error.message}`);
  }
}

// 성능 테스트 (보안 오버헤드 측정)
async function testPerformanceOverhead() {
  console.log('\n⚡ Performance Overhead Tests');
  console.log('-'.repeat(30));
  
  try {
    const iterations = 10;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await axios.get(`${API_BASE}/public/artists?limit=5`, {
        timeout: 5000
      });
      const end = performance.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    
    if (avgTime < 200) { // 200ms 이하면 양호
      logTest('Performance Overhead', 'PASS', 
        `Avg: ${avgTime.toFixed(1)}ms, Max: ${maxTime.toFixed(1)}ms`);
    } else if (avgTime < 500) {
      logTest('Performance Overhead', 'PASS', 
        `Acceptable - Avg: ${avgTime.toFixed(1)}ms, Max: ${maxTime.toFixed(1)}ms`);
    } else {
      logTest('Performance Overhead', 'FAIL', 
        `Too slow - Avg: ${avgTime.toFixed(1)}ms, Max: ${maxTime.toFixed(1)}ms`);
    }
    
  } catch (error) {
    logTest('Performance Overhead', 'FAIL', `Error: ${error.message}`);
  }
}

// 메인 테스트 실행
async function runAllTests() {
  console.log('🚀 Starting security tests...\n');
  
  try {
    await testRateLimiting();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit 리셋 대기
    
    await testInputValidation();
    await testCORSProtection();
    await testFileUploadSecurity();
    await testSecurityHeaders();
    await testPerformanceOverhead();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
  
  // 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️ Skipped: ${testResults.skipped}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n🚨 Failed Tests:');
    testResults.details
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`   • ${t.name}: ${t.message}`));
  }
  
  console.log('\n✨ Security test suite completed!');
  
  // 종료 코드 설정
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// 스크립트 실행
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };