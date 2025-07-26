const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

async function analyzeArtMapStructure() {
  console.log('🔍 ANALYZING ARTMAP HTML STRUCTURE');
  console.log('==================================');
  
  try {
    // ArtMap 런던 페이지 가져오기
    const response = await axios.get('https://artmap.com/london', {
      headers: {
        'User-Agent': 'SAYU Art Platform Crawler (contact@sayu.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    console.log(`✅ Page loaded successfully (${html.length} characters)`);
    
    // HTML 구조 분석
    console.log('\n📋 ANALYZING PAGE STRUCTURE');
    console.log('===========================');
    
    // 주요 컨테이너 찾기
    const containers = [
      'main', 'section', 'article', 'div.container', 'div.content',
      'div.venues', 'div.galleries', 'div.institutions', 'div.spaces'
    ];
    
    containers.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`${selector}: ${elements.length} elements`);
      }
    });
    
    // 링크 분석
    console.log('\n🔗 ANALYZING LINKS');
    console.log('==================');
    
    const links = $('a[href]');
    console.log(`Total links: ${links.length}`);
    
    // venue 관련 링크 찾기
    const venueLinks = [];
    links.each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();
      
      if (href && (href.includes('/venue') || href.includes('/gallery') || href.includes('/museum'))) {
        venueLinks.push({ href, text });
      }
    });
    
    console.log(`Venue-related links: ${venueLinks.length}`);
    if (venueLinks.length > 0) {
      console.log('Sample venue links:');
      venueLinks.slice(0, 5).forEach((link, i) => {
        console.log(`  ${i + 1}. ${link.text} -> ${link.href}`);
      });
    }
    
    // 클래스명 분석
    console.log('\n🏷️  ANALYZING CLASS NAMES');
    console.log('=========================');
    
    const classNames = new Set();
    $('*[class]').each((i, elem) => {
      const classes = $(elem).attr('class').split(' ');
      classes.forEach(cls => {
        if (cls && (cls.includes('venue') || cls.includes('gallery') || cls.includes('museum') || cls.includes('institution'))) {
          classNames.add(cls);
        }
      });
    });
    
    if (classNames.size > 0) {
      console.log('Venue-related classes found:');
      Array.from(classNames).forEach(cls => console.log(`  .${cls}`));
    } else {
      console.log('No obvious venue-related classes found');
    }
    
    // 페이지 타이틀과 메타 정보
    console.log('\n📄 PAGE INFORMATION');
    console.log('===================');
    console.log(`Title: ${$('title').text()}`);
    console.log(`Meta description: ${$('meta[name="description"]').attr('content') || 'None'}`);
    
    // JavaScript 실행 여부 확인
    console.log('\n⚙️  JAVASCRIPT DETECTION');
    console.log('========================');
    
    const scripts = $('script');
    console.log(`Script tags: ${scripts.length}`);
    
    const hasReact = html.includes('React') || html.includes('react');
    const hasVue = html.includes('Vue') || html.includes('vue');
    const hasAngular = html.includes('Angular') || html.includes('angular');
    
    console.log(`React detected: ${hasReact}`);
    console.log(`Vue detected: ${hasVue}`);
    console.log(`Angular detected: ${hasAngular}`);
    
    if (hasReact || hasVue || hasAngular) {
      console.log('⚠️  This appears to be a SPA (Single Page Application)');
      console.log('   Content may be loaded dynamically via JavaScript');
      console.log('   Consider using Puppeteer/Playwright for scraping');
    }
    
    // 데이터 속성 확인
    console.log('\n📊 DATA ATTRIBUTES');
    console.log('==================');
    
    const dataAttrs = new Set();
    $('*[data-*]').each((i, elem) => {
      const attrs = elem.attribs;
      Object.keys(attrs).forEach(attr => {
        if (attr.startsWith('data-')) {
          dataAttrs.add(attr);
        }
      });
    });
    
    if (dataAttrs.size > 0) {
      console.log('Data attributes found:');
      Array.from(dataAttrs).slice(0, 10).forEach(attr => console.log(`  ${attr}`));
    }
    
    // HTML 샘플 저장
    await fs.writeFile('artmap_london_sample.html', html);
    console.log('\n💾 HTML sample saved to: artmap_london_sample.html');
    
    // API 엔드포인트 추측
    console.log('\n🌐 POTENTIAL API ENDPOINTS');
    console.log('==========================');
    
    const apiPatterns = [
      '/api/venues', '/api/galleries', '/api/exhibitions',
      '/venues.json', '/galleries.json', '/exhibitions.json',
      '/graphql', '/api/v1/', '/api/v2/'
    ];
    
    apiPatterns.forEach(pattern => {
      if (html.includes(pattern)) {
        console.log(`Found potential API: ${pattern}`);
      }
    });
    
    // 추천 전략
    console.log('\n💡 RECOMMENDED SCRAPING STRATEGY');
    console.log('=================================');
    
    if (venueLinks.length > 0) {
      console.log('✅ Direct link scraping possible');
      console.log('   Strategy: Follow venue links and scrape individual pages');
    } else if (hasReact || hasVue || hasAngular) {
      console.log('🤖 Browser automation required');
      console.log('   Strategy: Use Puppeteer/Playwright to execute JavaScript');
    } else {
      console.log('🔍 Further investigation needed');
      console.log('   Strategy: Manual inspection or alternative data sources');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing ArtMap:', error.message);
  }
}

analyzeArtMapStructure();