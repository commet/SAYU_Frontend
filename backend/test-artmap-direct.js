/**
 * Artmap.com 직접 크롤링 테스트
 * 실제 페이지 구조 분석 및 데이터 추출
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeArtmapStructure() {
  try {
    // 1. 메인 페이지 분석
    console.log('=== Analyzing Artmap Main Page ===');
    const mainUrl = 'https://artmap.com';
    const mainResponse = await axios.get(mainUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $main = cheerio.load(mainResponse.data);
    console.log('Main page title:', $main('title').text());
    
    // 네비게이션 링크 찾기
    console.log('\nNavigation links:');
    $main('a').each((i, link) => {
      const href = $main(link).attr('href');
      const text = $main(link).text().trim();
      if (text && href && (text.toLowerCase().includes('exhibition') || text.toLowerCase().includes('show'))) {
        console.log(`- ${text} -> ${href}`);
      }
    });
    
    // 2. 전시 목록 페이지 분석
    console.log('\n\n=== Analyzing Exhibitions Page ===');
    const exhibitionsUrl = 'https://artmap.com/exhibitions/institutions/';
    const exResponse = await axios.get(exhibitionsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(exResponse.data);
    
    // 테이블 구조 분석
    console.log('\nTable structure:');
    $('table').each((i, table) => {
      const $table = $(table);
      console.log(`\nTable ${i + 1}:`);
      
      // 첫 5개 행 분석
      $table.find('tr').slice(0, 5).each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        console.log(`  Row ${j + 1}: ${cells.length} cells`);
        
        // 각 셀의 내용 확인
        cells.each((k, cell) => {
          const $cell = $(cell);
          const links = $cell.find('a');
          if (links.length > 0) {
            links.each((l, link) => {
              const href = $(link).attr('href');
              const text = $(link).text().trim();
              if (text) {
                console.log(`    Cell ${k + 1} Link: ${text} -> ${href}`);
              }
            });
          }
        });
      });
    });
    
    // 3. 전시 데이터 추출 (개선된 방법)
    console.log('\n\n=== Extracting Exhibition Data ===');
    const exhibitions = [];
    
    // 모든 행 검사
    $('tr').each((i, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      
      // 3개의 셀이 있는 행 (이미지, 장소, 전시정보)
      if (cells.length === 3) {
        const $imageCell = cells.eq(0);
        const $middleCell = cells.eq(1);
        const $lastCell = cells.eq(2);
        
        // 모든 링크 찾기
        const allLinks = $row.find('a');
        let venueLink = null;
        let exhibitionLink = null;
        
        allLinks.each((j, link) => {
          const href = $(link).attr('href') || '';
          if (href.includes('/exhibition/')) {
            exhibitionLink = $(link);
          } else if (!href.includes('.jpg') && !href.includes('.png') && !venueLink) {
            venueLink = $(link);
          }
        });
        
        if (exhibitionLink) {
          const venue = venueLink ? venueLink.text().trim() : 'Unknown';
          const title = exhibitionLink.text().trim();
          const exhibitionUrl = exhibitionLink.attr('href');
          
          // 전체 행 텍스트에서 날짜 추출
          const rowText = $row.text();
          const dateMatch = rowText.match(/(\d{1,2}\s+\w{3})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/);
          
          exhibitions.push({
            venue,
            title,
            url: exhibitionUrl,
            dates: dateMatch ? dateMatch[0] : 'N/A',
            fullText: rowText.trim()
          });
        }
      }
    });
    
    console.log(`\nFound ${exhibitions.length} exhibitions`);
    
    // 처음 10개 출력
    console.log('\nFirst 10 exhibitions:');
    exhibitions.slice(0, 10).forEach((ex, i) => {
      console.log(`\n${i + 1}. ${ex.title}`);
      console.log(`   Venue: ${ex.venue}`);
      console.log(`   Dates: ${ex.dates}`);
      console.log(`   URL: ${ex.url}`);
    });
    
    // 4. 도시별 필터링
    console.log('\n\n=== City Analysis ===');
    const cities = ['Seoul', 'Tokyo', 'New York', 'London', 'Paris', 'Berlin'];
    
    cities.forEach(city => {
      const cityExhibitions = exhibitions.filter(ex => 
        ex.venue.toLowerCase().includes(city.toLowerCase()) ||
        ex.fullText.toLowerCase().includes(city.toLowerCase())
      );
      console.log(`${city}: ${cityExhibitions.length} exhibitions`);
      
      if (cityExhibitions.length > 0) {
        console.log(`  First exhibition: ${cityExhibitions[0].title} at ${cityExhibitions[0].venue}`);
      }
    });
    
    // 5. 한국 관련 전시 찾기
    console.log('\n\n=== Korea-related Exhibitions ===');
    const koreaKeywords = ['seoul', 'korea', 'korean', 'busan', 'daegu', 'gwangju'];
    const koreaExhibitions = exhibitions.filter(ex => {
      const text = (ex.venue + ' ' + ex.fullText).toLowerCase();
      return koreaKeywords.some(keyword => text.includes(keyword));
    });
    
    console.log(`Found ${koreaExhibitions.length} Korea-related exhibitions`);
    koreaExhibitions.forEach((ex, i) => {
      console.log(`\n${i + 1}. ${ex.title}`);
      console.log(`   Venue: ${ex.venue}`);
      console.log(`   Dates: ${ex.dates}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

analyzeArtmapStructure();