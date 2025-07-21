#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

async function testSeoulAPI() {
  console.log('🔍 서울시 열린데이터광장 API 테스트\n');
  
  // API 키가 있다면 사용, 없으면 샘플키 사용
  const apiKey = process.env.SEOUL_API_KEY || 'sample';
  
  const endpoints = [
    {
      name: '서울시 문화행사 정보',
      url: `http://openapi.seoul.go.kr:8088/${apiKey}/json/culturalEventInfo/1/5/`,
      desc: '문화행사 전반'
    },
    {
      name: '서울시 박물관/미술관 정보',
      url: `http://openapi.seoul.go.kr:8088/${apiKey}/json/SebcMuseumInfoKor/1/5/`,
      desc: '박물관/미술관 기본정보'
    },
    {
      name: '서울시 문화공간 정보',
      url: `http://openapi.seoul.go.kr:8088/${apiKey}/json/culturalSpaceInfo/1/5/`,
      desc: '문화시설 정보'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📌 ${endpoint.name}`);
    console.log(`   설명: ${endpoint.desc}`);
    
    try {
      const response = await axios.get(endpoint.url, { timeout: 5000 });
      
      if (response.data.RESULT) {
        console.log(`   ❌ 오류: ${response.data.RESULT.MESSAGE}`);
        continue;
      }
      
      // 데이터 구조 확인
      const dataKey = Object.keys(response.data).find(key => key !== 'RESULT');
      const data = response.data[dataKey];
      
      console.log(`   ✅ 총 ${data.list_total_count}개 데이터`);
      console.log(`   📊 샘플 데이터:`);
      
      if (data.row && data.row.length > 0) {
        const sample = data.row[0];
        console.log(`      - 제목: ${sample.TITLE || sample.MAIN_IMG || sample.FAC_NAME || '없음'}`);
        console.log(`      - 장소: ${sample.PLACE || sample.ADDR1 || '없음'}`);
        
        // 전시 관련 데이터 있는지 확인
        if (endpoint.name.includes('문화행사')) {
          const exhibitions = data.row.filter(item => 
            item.CODENAME && item.CODENAME.includes('전시')
          );
          console.log(`      - 전시 카테고리: ${exhibitions.length}개`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ 접근 실패: ${error.message}`);
    }
  }

  console.log('\n\n💡 실제 사용 가능한 전시 데이터 소스:');
  console.log('1. 한국문화정보원 - 문화포털 API (전국 문화시설 정보)');
  console.log('2. 한국문화예술위원회 - 문화예술 DB');
  console.log('3. 각 미술관 개별 API (국립현대미술관 등)');
  console.log('4. 네이버/카카오 검색 API (키워드 검색)');
}

testSeoulAPI();