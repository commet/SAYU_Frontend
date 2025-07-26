/**
 * Artmap.com 직접 분석 스크립트
 * 실제 HTML 구조를 파악하여 정확한 파싱 로직 개발
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

async function analyzeArtmapStructure() {
  console.log('🔍 Artmap.com 구조 분석 시작');
  
  const baseUrl = 'https://artmap.com';
  const testUrls = [
    // 전시 목록 페이지들
    `${baseUrl}/exhibitions/institutions/opening/worldwide`,
    `${baseUrl}/exhibitions/galleries/opening/worldwide`,
    // 특정 도시 venue 목록
    `${baseUrl}/london/venues/institutions`,
    `${baseUrl}/newyork/venues/institutions`,
    `${baseUrl}/paris/venues/institutions`,
    // 특정 venue 페이지들
    `${baseUrl}/tate-modern`,
    `${baseUrl}/moma`,
    `${baseUrl}/palaisdetokyo`
  ];
  
  const results = {};
  
  for (const url of testUrls) {
    console.log(`\n📊 분석 중: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      
      // HTML 구조 분석
      const analysis = {
        url,
        title: $('title').text().trim(),
        mainSelectors: {},
        tableStructure: {},
        linkPatterns: [],
        imagePatterns: []
      };
      
      // 주요 셀렉터들 확인
      const selectors = [
        '.exibitionsListTable',
        '.venuesListTableRow',
        '.exhibition-item',
        '.venue-item',
        'table',
        'tr',
        'td',
        '.venue-name',
        '.exhibition-title',
        '.date',
        '.artist'
      ];
      
      selectors.forEach(selector => {
        const elements = $(selector);
        if (elements.length > 0) {
          analysis.mainSelectors[selector] = {
            count: elements.length,
            firstText: elements.first().text().trim().substring(0, 100)
          };
        }
      });
      
      // 테이블 구조 분석
      $('table').each((i, table) => {
        const $table = $(table);
        const rows = $table.find('tr');
        analysis.tableStructure[`table_${i}`] = {
          rowCount: rows.length,
          firstRowCells: rows.first().find('td, th').length,
          classes: $table.attr('class') || 'no-class'
        };
      });
      
      // 링크 패턴 분석
      $('a[href*="/venues/"], a[href*="/exhibition"]').each((i, link) => {
        if (i < 10) { // 처음 10개만
          const href = $(link).attr('href');
          const text = $(link).text().trim();
          analysis.linkPatterns.push({ href, text: text.substring(0, 50) });
        }
      });
      
      // 이미지 패턴 분석
      $('img').each((i, img) => {
        if (i < 5) { // 처음 5개만
          const src = $(img).attr('src');
          const alt = $(img).attr('alt');
          analysis.imagePatterns.push({ src, alt });
        }
      });
      
      results[url] = analysis;
      
      // HTML 샘플 저장 (디버깅용)
      const filename = url.split('/').pop() || 'index';
      await fs.writeFile(`artmap-sample-${filename}.html`, response.data);
      console.log(`✅ HTML 샘플 저장: artmap-sample-${filename}.html`);
      
      // 잠깐 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ 오류 (${url}): ${error.message}`);
      results[url] = { error: error.message };
    }
  }
  
  // 분석 결과 저장
  await fs.writeFile('artmap-structure-analysis.json', JSON.stringify(results, null, 2));
  console.log('\n✅ 분석 완료: artmap-structure-analysis.json');
  
  // 요약 출력
  console.log('\n📋 구조 분석 요약:');
  Object.entries(results).forEach(([url, data]) => {
    if (data.error) {
      console.log(`❌ ${url}: ${data.error}`);
    } else {
      console.log(`✅ ${url}:`);
      console.log(`   제목: ${data.title}`);
      console.log(`   주요 셀렉터: ${Object.keys(data.mainSelectors).join(', ')}`);
      console.log(`   테이블 수: ${Object.keys(data.tableStructure).length}`);
      console.log(`   링크 패턴: ${data.linkPatterns.length}개`);
    }
  });
}

// 실행
analyzeArtmapStructure().catch(console.error);