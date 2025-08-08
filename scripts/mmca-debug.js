const puppeteer = require('puppeteer');

async function debugMMCAPage() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null 
  });
  
  try {
    const page = await browser.newPage();
    
    const testUrl = 'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202501060001891';
    console.log(`디버깅 URL: ${testUrl}`);
    
    await page.goto(testUrl, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10초 대기
    
    // 페이지 HTML과 텍스트 덤프
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyHTML: document.body.innerHTML.substring(0, 5000),
        bodyText: document.body.textContent.substring(0, 2000),
        h1Elements: Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim()),
        h2Elements: Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim()),
        titleElements: Array.from(document.querySelectorAll('.title, .tit')).map(el => el.textContent.trim()),
        allImages: Array.from(document.querySelectorAll('img')).map(img => img.src).slice(0, 10),
        mainContent: document.querySelector('#contents') ? document.querySelector('#contents').textContent.substring(0, 1000) : 'No #contents found'
      };
    });
    
    console.log('=== 페이지 디버깅 정보 ===');
    console.log('제목:', pageInfo.title);
    console.log('URL:', pageInfo.url);
    console.log('H1 요소들:', pageInfo.h1Elements);
    console.log('H2 요소들:', pageInfo.h2Elements);
    console.log('Title 클래스 요소들:', pageInfo.titleElements);
    console.log('이미지 수:', pageInfo.allImages.length);
    console.log('메인 컨텐츠:', pageInfo.mainContent);
    console.log('Body 텍스트 샘플:', pageInfo.bodyText);
    
    // 10초 더 대기해서 사용자가 브라우저에서 확인할 수 있게 함
    console.log('\n브라우저를 확인하세요. 10초 후 종료됩니다...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('디버깅 오류:', error);
  } finally {
    await browser.close();
  }
}

debugMMCAPage().catch(console.error);