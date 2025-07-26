#!/usr/bin/env node
const axios = require('axios');

async function checkMaintenanceDetail() {
  console.log('🔍 문화포털 시스템 점검 상세 확인\n');
  
  const serviceKey = '+wfa+sUFfXVTtQtcbqA2cFvHiWWKJh2jLQzuMZywhdM0LfcNiHbuX9DkLvJJ5JDFa+3+DxNM7RHCETyzDMbzmA==';
  const url = 'http://www.culture.go.kr/openapi/rest/publicperformancedisplays/period';
  
  try {
    const response = await axios.get(url, {
      params: {
        serviceKey: serviceKey,
        from: '20250701',
        to: '20250731',
        rows: 10,
        cPage: 1
      },
      timeout: 10000
    });
    
    if (response.status === 200 && response.data) {
      const html = response.data;
      
      // HTML 전체 저장
      const fs = require('fs');
      fs.writeFileSync('culture-portal-maintenance.html', html);
      console.log('📄 HTML 파일 저장: culture-portal-maintenance.html\n');
      
      // 텍스트만 추출
      const textOnly = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      console.log('📝 페이지 텍스트 내용:\n');
      console.log('='.repeat(60));
      console.log(textOnly);
      console.log('='.repeat(60));
      
      // 날짜 패턴 찾기
      const datePatterns = [
        /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/g,
        /\d{4}\.\d{1,2}\.\d{1,2}/g,
        /\d{4}-\d{1,2}-\d{1,2}/g,
        /\d{1,2}월\s*\d{1,2}일/g
      ];
      
      console.log('\n📅 발견된 날짜:');
      for (const pattern of datePatterns) {
        const matches = textOnly.match(pattern);
        if (matches) {
          matches.forEach(date => console.log(`   - ${date}`));
        }
      }
      
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

checkMaintenanceDetail();