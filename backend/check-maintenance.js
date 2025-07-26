#!/usr/bin/env node
const axios = require('axios');

async function checkMaintenancePeriod() {
  console.log('🔍 문화포털 시스템 점검 기간 확인\n');
  
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
      headers: {
        'Accept': 'text/html, application/xml'
      },
      timeout: 10000
    });
    
    if (response.status === 200 && response.data) {
      const html = response.data;
      
      console.log('📄 HTML 응답 수신\n');
      
      // 점검 기간 정보 찾기
      const patterns = [
        /점검\s*기간[:\s]*([^<\n]+)/i,
        /점검\s*일시[:\s]*([^<\n]+)/i,
        /서비스\s*중단[:\s]*([^<\n]+)/i,
        /(\d{4}[년\.\-]\s*\d{1,2}[월\.\-]\s*\d{1,2}[일]?\s*~\s*\d{4}[년\.\-]\s*\d{1,2}[월\.\-]\s*\d{1,2}[일]?)/,
        /(\d{1,2}월\s*\d{1,2}일[^~]*~[^<]+)/,
        /기간[:\s]*([^<]+(?:까지|~)[^<]+)/i
      ];
      
      let maintenanceInfo = null;
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          maintenanceInfo = match[1].trim();
          break;
        }
      }
      
      if (maintenanceInfo) {
        console.log('✅ 점검 기간 정보 발견:');
        console.log(`   ${maintenanceInfo}`);
      } else {
        console.log('⚠️  점검 기간 정보를 찾을 수 없습니다.');
        
        // 본문 내용 일부 출력
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          const bodyText = bodyMatch[1]
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          console.log('\n📝 페이지 내용 (텍스트만):');
          console.log(bodyText.substring(0, 1000));
        }
      }
      
      // 추가 정보 확인
      if (html.includes('문의')) {
        const contactMatch = html.match(/문의[:\s]*([^<]+)/i);
        if (contactMatch) {
          console.log(`\n📞 문의처: ${contactMatch[1].trim()}`);
        }
      }
      
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

checkMaintenancePeriod();