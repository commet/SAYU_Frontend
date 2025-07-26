/**
 * Artmap.com 전시 목록 페이지 직접 크롤링 테스트
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function testExhibitionsList() {
  try {
    // 전시 목록 페이지 접속
    const url = 'https://artmap.com/exhibitions/institutions/';
    console.log(`Fetching: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8'
      },
      timeout: 15000
    });
    
    console.log(`Status: ${response.status}`);
    
    const $ = cheerio.load(response.data);
    
    // 페이지 구조 분석
    console.log('\n=== Page Structure ===');
    console.log('Title:', $('title').text());
    console.log('H1:', $('h1').text());
    
    // 전시 테이블 찾기
    const tables = $('table');
    console.log(`\nFound ${tables.length} tables`);
    
    // 모든 행 검사
    console.log('\n=== All Rows Analysis ===');
    $('tr').each((i, row) => {
      const $row = $(row);
      const text = $row.text().replace(/\s+/g, ' ').trim();
      const links = $row.find('a');
      
      // 링크가 2개 이상 있는 행만 (전시 정보 가능성)
      if (links.length >= 2 && i < 20) { // 처음 20개만 출력
        console.log(`\nRow ${i + 1}:`);
        console.log(`Text: ${text.substring(0, 100)}...`);
        console.log(`Links: ${links.length}`);
        
        // 각 링크 정보
        links.slice(0, 3).each((j, link) => {
          const $link = $(link);
          console.log(`  Link ${j + 1}: ${$link.text().trim()} -> ${$link.attr('href')}`);
        });
      }
    });
    
    // 전시 정보가 있는 테이블 찾기
    console.log('\n\n=== Exhibition Rows ===');
    let exhibitionCount = 0;
    
    $('tr').each((i, row) => {
      const $row = $(row);
      const text = $row.text();
      const links = $row.find('a');
      
      // 전시 링크 패턴 확인
      const hasExhibitionLink = links.toArray().some(link => {
        const href = $(link).attr('href') || '';
        return href.includes('/exhibition/');
      });
      
      if (hasExhibitionLink && links.length >= 2) {
        exhibitionCount++;
        if (exhibitionCount <= 10) {
          const venue = links.eq(0).text().trim();
          const venueUrl = links.eq(0).attr('href');
          const exhibition = links.eq(1).text().trim();
          const exhibitionUrl = links.eq(1).attr('href');
          const rowText = $row.text();
          const dateMatch = rowText.match(/(\d{2}\.\d{2}\.)\s*[-–]\s*(\d{2}\.\d{2}\.\d{4})/);
          
          console.log(`\n${exhibitionCount}. ${exhibition}`);
          console.log(`   Venue: ${venue}`);
          console.log(`   Dates: ${dateMatch ? dateMatch[0] : 'N/A'}`);
          console.log(`   Exhibition URL: ${exhibitionUrl}`);
          console.log(`   Full text: ${text.substring(0, 150)}...`);
        }
      }
    });
    
    console.log(`\nTotal exhibition rows found: ${exhibitionCount}`);
    
    // 서울 전시만 필터링
    console.log('\n\n=== Seoul Exhibitions ===');
    let seoulCount = 0;
    
    $('tr').each((i, row) => {
      const $row = $(row);
      const text = $row.text();
      
      if (text.toLowerCase().includes('seoul') && text.match(/\d{2}\.\d{2}\./)) {
        const links = $row.find('a');
        if (links.length >= 2) {
          seoulCount++;
          const venue = links.eq(0).text().trim();
          const exhibition = links.eq(1).text().trim();
          const dateMatch = text.match(/(\d{2}\.\d{2}\.)\s*[-–]\s*(\d{2}\.\d{2}\.\d{4})/);
          
          console.log(`\n${seoulCount}. ${exhibition}`);
          console.log(`   Venue: ${venue}`);
          console.log(`   Dates: ${dateMatch ? dateMatch[0] : 'N/A'}`);
        }
      }
    });
    
    console.log(`\nTotal Seoul exhibitions found: ${seoulCount}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testExhibitionsList();