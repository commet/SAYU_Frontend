const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 연결
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

const MMCA_VENUE_INFO = {
  name: '국립현대미술관',
  name_en: 'National Museum of Modern and Contemporary Art',
  city: '서울',
  city_en: 'Seoul',  
  country: 'KR',
  address: '서울특별시 종로구 삼청로 30'
};

async function crawlMMCAExhibitions() {
  console.log('=== MMCA 전시 데이터 크롤링 시작 ===\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // 디버깅을 위해 브라우저 표시
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // 1. MMCA 홈페이지 접속
    console.log('1. MMCA 홈페이지 접속...');
    await page.goto('https://www.mmca.go.kr', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. 현재전시 페이지로 직접 접근
    console.log('2. 현재전시 페이지로 이동...');
    await page.goto('https://www.mmca.go.kr/exhibitions/progressList.do', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // JavaScript 기반 페이지이므로 추가 대기 및 상호작용
    console.log('3. JavaScript 컨텐츠 로드 대기...');
    
    // 페이지에서 JavaScript가 실행될 때까지 대기
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // 페이지에서 전시 목록이 로드될 때까지 주기적으로 확인
        const checkContent = () => {
          const links = document.querySelectorAll('a[href*="exhibitionsDetail"]');
          const items = document.querySelectorAll('li, tr, .item');
          
          if (links.length > 0 || items.length > 20) {
            resolve();
          } else {
            setTimeout(checkContent, 1000);
          }
        };
        
        setTimeout(checkContent, 2000); // 2초 후 시작
        setTimeout(resolve, 15000); // 최대 15초 대기
      });
    });
    
    console.log('현재 URL:', page.url());
    
    // 4. 전시 목록 추출
    console.log('4. 전시 목록 추출 중...');
    
    // 먼저 페이지 구조 파악
    const pageInfo = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const classNames = new Set();
      const ids = new Set();
      
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(cls => {
            if (cls.includes('exh') || cls.includes('exhibition') || cls.includes('list')) {
              classNames.add(cls);
            }
          });
        }
        if (el.id && (el.id.includes('exh') || el.id.includes('exhibition'))) {
          ids.add(el.id);
        }
      });
      
      return {
        title: document.title,
        h1: document.querySelector('h1') ? document.querySelector('h1').textContent : 'No H1',
        classNames: Array.from(classNames),
        ids: Array.from(ids),
        allText: document.body.textContent.substring(0, 500)
      };
    });
    
    console.log('페이지 정보:', pageInfo);
    
    const exhibitions = await page.evaluate(() => {
      const results = [];
      
      console.log('=== MMCA 전시 목록 완전 분석 ===');
      
      // 1. 모든 가능한 링크 찾기
      const allLinks = Array.from(document.querySelectorAll('a'));
      console.log(`총 링크 수: ${allLinks.length}`);
      
      // exhibitionsDetail.do 링크 찾기
      const detailLinks = allLinks.filter(link => 
        link.href && link.href.includes('exhibitionsDetail.do')
      );
      console.log(`exhibitionsDetail.do 링크: ${detailLinks.length}개`);
      
      // 2. 모든 텍스트에서 전시 정보 패턴 찾기
      const bodyText = document.body.textContent;
      const exhibitionTitlePatterns = [
        /MMCA[^\\n]{10,100}/g,
        /전시[^\\n]{5,80}/g,
        /특별전[^\\n]{5,80}/g,
        /소장품[^\\n]{5,80}/g,
        /\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2}[^\\n]{0,50}~/g
      ];
      
      const foundTitles = [];
      exhibitionTitlePatterns.forEach(pattern => {
        const matches = bodyText.match(pattern) || [];
        foundTitles.push(...matches);
      });
      
      console.log(`패턴으로 발견된 전시 제목: ${foundTitles.length}개`);
      foundTitles.slice(0, 5).forEach(title => console.log(`- ${title.substring(0, 50)}...`));
      
      // 3. 테이블, 리스트 등 구조적 요소에서 전시 정보 추출
      const structuralSelectors = [
        'table tr', 'ul li', 'ol li', 'div[class*="list"] > div', 
        '.item', '.list-item', '[class*="exhibition"]', '[class*="exh"]'
      ];
      
      structuralSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`선택자 "${selector}": ${elements.length}개 요소`);
        
        elements.forEach((element, index) => {
          if (results.length >= 12) return;
          
          const text = element.textContent.trim();
          const linkElement = element.querySelector('a') || element.closest('a');
          
          // 전시로 보이는 텍스트 필터링
          if (text.length > 15 && text.length < 200 && 
              (text.includes('MMCA') || text.includes('전시') || text.includes('특별') || 
               text.match(/\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2}/))) {
            
            // 날짜 추출
            const dateMatch = text.match(/(\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2})[\s~\-]*(\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2})?/);
            
            const exhibitionItem = {
              title: text.replace(/\\s+/g, ' ').trim().substring(0, 100),
              link: linkElement ? linkElement.href : null,
              date: dateMatch ? dateMatch[0] : null,
              location: null,
              image: element.querySelector('img') ? element.querySelector('img').src : null,
              fullText: text.substring(0, 200),
              selector: selector
            };
            
            // 중복 제거 (제목 기준)
            const isDuplicate = results.some(item => 
              item.title.substring(0, 30) === exhibitionItem.title.substring(0, 30)
            );
            
            if (!isDuplicate) {
              results.push(exhibitionItem);
              console.log(`전시 발견: ${exhibitionItem.title.substring(0, 40)}...`);
            }
          }
        });
      });
      
      // 4. JavaScript로 동적 생성된 콘텐츠 대기 및 재시도
      if (results.length === 0) {
        console.log('동적 콘텐츠 재검색...');
        
        // DOM 변화를 감지하여 새로운 요소 찾기
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
              console.log('새로운 DOM 요소 감지됨');
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // 잠시 대기 후 observer 중지
        setTimeout(() => observer.disconnect(), 3000);
      }
      
      console.log(`=== 최종 수집 결과: ${results.length}개 전시 ===`);
      return results;
    });
    
    console.log(`발견된 전시: ${exhibitions.length}개`);
    exhibitions.slice(0, 5).forEach((exh, i) => {
      console.log(`${i+1}. ${exh.title} - ${exh.date || '날짜 미상'}`);
    });
    
    // 4. 각 전시 상세 정보 수집
    const detailedExhibitions = [];
    
    for (let i = 0; i < Math.min(exhibitions.length, 10); i++) {
      const exhibition = exhibitions[i];
      console.log(`\n상세 정보 수집 중: ${exhibition.title}`);
      
      try {
        if (exhibition.link) {
          await page.goto(exhibition.link, { waitUntil: 'networkidle2' });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 페이지 로드 완료까지 추가 대기
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const details = await page.evaluate(() => {
            console.log('상세 페이지 HTML 구조 분석 시작...');
            console.log('Page URL:', window.location.href);
            console.log('Page Title:', document.title);
            
            // MMCA 상세 페이지의 실제 구조에 맞는 선택자
            const selectors = {
              // 전시 제목
              title: [
                'h1', 'h2', '.tit', '.title', 
                '#contents h1', '#contents h2', '#contents .tit',
                '.detail-tit', '.exh-tit', '.main-tit'
              ],
              // 전시 설명/내용
              description: [
                '.txt', '.text', '.cont', '.content', '.desc', '.description',
                '#contents .txt', '#contents .text', '#contents .cont',
                '.detail-txt', '.detail-text', '.detail-cont', '.detail-desc',
                '.exh-txt', '.exh-text', '.exh-cont', '.exh-desc',
                'p', '.info', '.intro'
              ],
              // 작가 정보
              artist: [
                '.artist', '.writer', '.name', '.artist-name',
                'dd', 'dt + dd', '.info-item', '.detail-info',
                '.artist-info', '.creator'
              ],
              // 전시 기간
              period: [
                '.date', '.period', '.time', '.when',
                '.exh-date', '.exh-period', '.detail-date',
                'dd:contains("기간")', '.date-info'
              ],
              // 전시 장소
              location: [
                '.place', '.location', '.where', '.venue',
                '.exh-place', '.detail-place', '.gallery'
              ],
              // 이미지
              images: [
                'img', '.img img', '.photo img', '.image img',
                '.exh-img img', '.detail-img img', '.main-img img',
                '.poster img', '.thumbnail img'
              ]
            };
            
            // 실제 페이지 구조 디버깅
            const bodyText = document.body.textContent;
            console.log('페이지 텍스트 길이:', bodyText.length);
            console.log('페이지 텍스트 샘플:', bodyText.substring(0, 300));
            
            // 모든 요소의 클래스명 수집
            const allElements = document.querySelectorAll('*[class]');
            const classNames = new Set();
            allElements.forEach(el => {
              if (el.className && typeof el.className === 'string') {
                el.className.split(' ').forEach(cls => {
                  if (cls.length > 2) classNames.add(cls);
                });
              }
            });
            console.log('발견된 주요 클래스명:', Array.from(classNames).slice(0, 20));
            
            function getTextBySelectors(selectorArray, minLength = 10) {
              for (const selector of selectorArray) {
                try {
                  const elements = document.querySelectorAll(selector);
                  for (const element of elements) {
                    const text = element.textContent?.trim();
                    if (text && text.length >= minLength && !text.includes('검색') && !text.includes('메뉴')) {
                      console.log(`선택자 "${selector}"에서 텍스트 발견: ${text.substring(0, 50)}...`);
                      return text;
                    }
                  }
                } catch (e) {
                  console.log(`선택자 오류: ${selector}`);
                }
              }
              return null;
            }
            
            function getMultipleTextBySelectors(selectorArray) {
              const results = [];
              for (const selector of selectorArray) {
                try {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(el => {
                    const text = el.textContent?.trim();
                    if (text && text.length > 2 && text.length < 100 && 
                        !text.includes('검색') && !text.includes('메뉴') && 
                        !results.includes(text)) {
                      results.push(text);
                    }
                  });
                  if (results.length > 0) {
                    console.log(`선택자 "${selector}"에서 ${results.length}개 작가 발견: ${results.join(', ')}`);
                    break;
                  }
                } catch (e) {
                  console.log(`선택자 오류: ${selector}`);
                }
              }
              return results;
            }
            
            function getImagesBySelectors(selectorArray) {
              const results = [];
              for (const selector of selectorArray) {
                try {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(img => {
                    if (img.src && img.src.startsWith('http') && 
                        !img.src.includes('icon') && !img.src.includes('logo')) {
                      results.push(img.src);
                    }
                  });
                  if (results.length > 0) {
                    console.log(`선택자 "${selector}"에서 ${results.length}개 이미지 발견`);
                    break;
                  }
                } catch (e) {
                  console.log(`선택자 오류: ${selector}`);
                }
              }
              return results.slice(0, 5); // 최대 5개
            }
            
            // 실제 정보 추출
            const extractedTitle = getTextBySelectors(selectors.title, 5);
            const extractedDescription = getTextBySelectors(selectors.description, 20);
            const extractedArtists = getMultipleTextBySelectors(selectors.artist);
            const extractedPeriod = getTextBySelectors(selectors.period, 5);
            const extractedLocation = getTextBySelectors(selectors.location, 3);
            const extractedImages = getImagesBySelectors(selectors.images);
            
            // 페이지 전체 텍스트에서 작가명 패턴 매칭
            const fullText = document.body.textContent;
            const artistPatterns = [
              /작가[:\s]*([가-힣\s,·]+)/g,
              /Artist[:\s]*([A-Za-z\s,·]+)/g,
              /참여작가[:\s]*([가-힣\s,·]+)/g
            ];
            
            const artistsFromText = [];
            artistPatterns.forEach(pattern => {
              const matches = fullText.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  const cleaned = match.replace(/(작가|Artist|참여작가)[:\s]*/g, '').trim();
                  if (cleaned.length > 1 && cleaned.length < 50) {
                    artistsFromText.push(cleaned);
                  }
                });
              }
            });
            
            console.log('=== 추출 결과 ===');
            console.log('제목:', extractedTitle?.substring(0, 50));
            console.log('설명 길이:', extractedDescription?.length || 0);
            console.log('작가 수:', extractedArtists?.length || 0);
            console.log('이미지 수:', extractedImages?.length || 0);
            
            return {
              title: extractedTitle,
              description: extractedDescription,
              artists: extractedArtists || [],
              period: extractedPeriod,
              location: extractedLocation,
              images: extractedImages || [],
              artistsFromText: [...new Set(artistsFromText)], // 중복 제거
              pageTitle: document.title,
              pageUrl: window.location.href,
              fullTextSample: fullText.substring(0, 500)
            };
          });
          
          // 날짜 파싱
          const { start_date, end_date } = parseDateRange(exhibition.date);
          
          // 작가 정보 통합 (여러 소스에서 수집)
          let allArtists = [...(details.artists || []), ...(details.artistsFromText || [])];
          allArtists = [...new Set(allArtists)]; // 중복 제거
          
          console.log(`상세 정보 분석:`);
          console.log(`- 제목: ${details.title || '없음'}`);
          console.log(`- 설명 길이: ${details.description ? details.description.length : 0}자`);
          console.log(`- 작가: ${JSON.stringify(allArtists)}`);
          console.log(`- 이미지: ${details.images?.length || 0}개`);
          console.log(`- 페이지 제목: ${details.pageTitle}`);
          
          const exhibitionData = {
            title_en: details.title || exhibition.title,
            title_local: details.title || exhibition.title,
            description: details.description && details.description.length > 50 
              ? details.description 
              : `${exhibition.title} 전시`,
            start_date: start_date || '2024-01-01',
            end_date: end_date || '2024-12-31',
            venue_name: MMCA_VENUE_INFO.name,
            venue_city: MMCA_VENUE_INFO.city,
            venue_country: MMCA_VENUE_INFO.country,
            venue_address: MMCA_VENUE_INFO.address,
            artists: allArtists.length > 0 
              ? allArtists.map(name => ({ 
                  name: name.replace(/작가:?/g, '').trim(), 
                  role: 'artist' 
                }))
              : [{ name: '미상', role: 'artist' }],
            source: 'mmca_web',
            status: 'ongoing',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          detailedExhibitions.push(exhibitionData);
        }
      } catch (error) {
        console.log(`상세 정보 수집 실패: ${exhibition.title} - ${error.message}`);
      }
    }
    
    console.log(`\n수집된 상세 전시 정보: ${detailedExhibitions.length}개`);
    
    // 5. Supabase에 저장
    if (detailedExhibitions.length > 0) {
      console.log('\n5. Supabase에 데이터 저장 중...');
      
      for (const exhibition of detailedExhibitions) {
        try {
          // 중복 확인
          const { data: existing } = await supabase
            .from('exhibitions')
            .select('id')
            .eq('title_en', exhibition.title_en)
            .eq('venue_name', exhibition.venue_name)
            .single();
          
          if (existing) {
            console.log(`이미 존재: ${exhibition.title_en}`);
            continue;
          }
          
          // 새 데이터 삽입
          const { error } = await supabase
            .from('exhibitions')
            .insert([exhibition]);
          
          if (error) {
            console.error(`저장 실패: ${exhibition.title_en} - ${error.message}`);
          } else {
            console.log(`저장 성공: ${exhibition.title_en}`);
          }
          
        } catch (error) {
          console.error(`처리 오류: ${exhibition.title_en} - ${error.message}`);
        }
      }
    }
    
    console.log('\n=== MMCA 크롤링 완료 ===');
    
  } catch (error) {
    console.error('크롤링 오류:', error.message);
  } finally {
    await browser.close();
  }
}

function parseDateRange(dateString) {
  if (!dateString) return { start_date: null, end_date: null };
  
  // 다양한 날짜 형식 처리
  const patterns = [
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\s*[-~]\s*(\d{4})\.(\d{1,2})\.(\d{1,2})/,
    /(\d{4})-(\d{1,2})-(\d{1,2})\s*[-~]\s*(\d{4})-(\d{1,2})-(\d{1,2})/,
    /(\d{1,2})\.(\d{1,2})\s*[-~]\s*(\d{1,2})\.(\d{1,2})/
  ];
  
  for (const pattern of patterns) {
    const match = dateString.match(pattern);
    if (match) {
      if (match.length === 7) { // Full date range
        return {
          start_date: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
          end_date: `${match[4]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`
        };
      }
    }
  }
  
  return { start_date: null, end_date: null };
}

// 실행
if (require.main === module) {
  crawlMMCAExhibitions().catch(console.error);
}

module.exports = { crawlMMCAExhibitions };