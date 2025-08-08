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
  country: 'KR',
  address: '서울특별시 종로구 삼청로 30'
};

// 직접 접근할 전시 상세 페이지 URL 목록
const EXHIBITION_URLS = [
  'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202501060001891',
  'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202507150001981',
  'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202506200001958',
  'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202501060001890',
  'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202504140001938',
  'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202501060001886'
];

async function crawlMMCADirectURLs() {
  console.log('=== MMCA 직접 URL 크롤링 시작 ===\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // 디버깅을 위해 브라우저 표시
    defaultViewport: null
  });
  
  const detailedExhibitions = [];
  
  try {
    const page = await browser.newPage();
    
    for (let i = 0; i < EXHIBITION_URLS.length; i++) {
      const url = EXHIBITION_URLS[i];
      console.log(`\n${i+1}. ${url} 접근 중...`);
      
      try {
        // 상세 페이지로 직접 접근
        await page.goto(url, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기
        
        console.log(`페이지 로드 완료: ${page.url()}`);
        console.log(`페이지 제목: ${await page.title()}`);
        
        // 상세 정보 추출
        const details = await page.evaluate(() => {
          console.log('=== 상세 페이지 정보 추출 시작 ===');
          
          // 페이지 기본 정보
          const pageTitle = document.title;
          const pageUrl = window.location.href;
          const bodyText = document.body.textContent;
          
          console.log('페이지 제목:', pageTitle);
          console.log('페이지 URL:', pageUrl);
          console.log('본문 텍스트 길이:', bodyText.length);
          
          // 다양한 선택자로 정보 추출
          const extractors = {
            // 전시 제목
            getTitle: () => {
              // 우선 순위가 높은 실제 전시 제목들을 찾기
              const titleCandidates = [];
              
              // 1. .title 클래스 요소들에서 전시 제목 찾기
              const titleElements = document.querySelectorAll('.title, .tit');
              titleElements.forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 5 && text.length < 100 && 
                    !text.includes('메뉴') && !text.includes('검색') && !text.includes('신청') &&
                    !text.includes('안내') && !text.includes('혜택') && !text.includes('선택') &&
                    (text.includes('전시') || text.includes('특별전') || text.includes('컬렉션') || 
                     text.includes('시리즈') || text.includes('MMCA×') || text.includes(':'))) {
                  titleCandidates.push({ text, selector: '.title/.tit', priority: 1 });
                }
              });
              
              // 2. h2 요소에서 전시 제목 찾기 (메인 메뉴 제외)
              const h2Elements = document.querySelectorAll('h2');
              h2Elements.forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.length > 5 && text.length < 100 && 
                    text !== '메인 메뉴' && !text.includes('breadcrumb') && !text.includes('안내') &&
                    (text.includes('전시') || text.includes('특별전') || text.includes('컬렉션'))) {
                  titleCandidates.push({ text, selector: 'h2', priority: 2 });
                }
              });
              
              // 3. 텍스트 패턴으로 전시 제목 찾기
              const patterns = [
                /MMCA[×X][^\\n]{5,50}/g,
                /[가-힣\s:]+특별전[^\\n]{0,30}/g,
                /\d{4}[—\-\s]+[가-힣\w\s]{5,40}/g
              ];
              
              patterns.forEach(pattern => {
                const matches = bodyText.match(pattern);
                if (matches) {
                  matches.forEach(match => {
                    const text = match.trim();
                    if (text.length > 5 && text.length < 100) {
                      titleCandidates.push({ text, selector: 'pattern', priority: 3 });
                    }
                  });
                }
              });
              
              // 우선순위 정렬 후 첫 번째 결과 반환
              titleCandidates.sort((a, b) => a.priority - b.priority);
              
              if (titleCandidates.length > 0) {
                console.log(`제목 후보들:`, titleCandidates.map(c => c.text));
                console.log(`선택된 제목 (${titleCandidates[0].selector}): ${titleCandidates[0].text}`);
                return titleCandidates[0].text;
              }
              
              return null;
            },
            
            // 전시 설명
            getDescription: () => {
              const selectors = [
                '.content', '.text', '.desc', '.description', '.info',
                '#contents .content', '#contents .text', '#contents .desc',
                '.detail-content', '.detail-text', '.detail-desc',
                '.exh-content', '.exh-text', '.exh-desc',
                'p', '.intro', '.summary'
              ];
              
              for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                  const text = el.textContent?.trim();
                  if (text && text.length > 50 && text.length < 2000 && 
                      !text.includes('검색') && !text.includes('메뉴') &&
                      !text.includes('로그인')) {
                    console.log(`설명 발견 (${selector}): ${text.substring(0, 100)}...`);
                    return text;
                  }
                }
              }
              return null;
            },
            
            // 작가 정보
            getArtists: () => {
              const artists = [];
              
              // 텍스트 패턴으로 작가 찾기
              const artistPatterns = [
                /작가[:\s]*([가-힣\s,·]+)/gi,
                /Artist[:\s]*([A-Za-z\s,·]+)/gi,
                /참여작가[:\s]*([가-힣\s,·]+)/gi
              ];
              
              artistPatterns.forEach(pattern => {
                const matches = bodyText.match(pattern);
                if (matches) {
                  matches.forEach(match => {
                    const cleaned = match.replace(/(작가|Artist|참여작가)[:\s]*/gi, '').trim();
                    if (cleaned.length > 1 && cleaned.length < 50) {
                      artists.push(cleaned);
                    }
                  });
                }
              });
              
              // CSS 선택자로도 찾기
              const selectors = ['.artist', '.artist-name', '.creator', 'dd'];
              selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                  const text = el.textContent?.trim();
                  if (text && text.length > 1 && text.length < 100 && 
                      !text.includes('검색') && !text.includes('전시')) {
                    artists.push(text);
                  }
                });
              });
              
              const uniqueArtists = [...new Set(artists)].slice(0, 5);
              console.log(`작가 발견: ${uniqueArtists.join(', ')}`);
              return uniqueArtists;
            },
            
            // 전시 기간
            getPeriod: () => {
              const datePatterns = [
                /(\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2})[\s~\-–]*(\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2})/g,
                /\d{4}\.\d{1,2}\.\d{1,2}[\s~\-–]\d{4}\.\d{1,2}\.\d{1,2}/g
              ];
              
              for (const pattern of datePatterns) {
                const matches = bodyText.match(pattern);
                if (matches && matches.length > 0) {
                  console.log(`날짜 발견: ${matches[0]}`);
                  return matches[0];
                }
              }
              return null;
            },
            
            // 이미지
            getImages: () => {
              const images = [];
              const imgElements = document.querySelectorAll('img');
              
              imgElements.forEach(img => {
                if (img.src && img.src.startsWith('http') && 
                    !img.src.includes('icon') && !img.src.includes('logo') &&
                    !img.src.includes('banner')) {
                  images.push(img.src);
                }
              });
              
              const uniqueImages = [...new Set(images)].slice(0, 5);
              console.log(`이미지 발견: ${uniqueImages.length}개`);
              return uniqueImages;
            }
          };
          
          // 모든 정보 추출
          const extractedData = {
            title: extractors.getTitle(),
            description: extractors.getDescription(),
            artists: extractors.getArtists(),
            period: extractors.getPeriod(),
            images: extractors.getImages(),
            pageTitle: pageTitle,
            pageUrl: pageUrl,
            bodyLength: bodyText.length,
            // 디버깅을 위한 샘플 텍스트
            bodySample: bodyText.substring(0, 1000)
          };
          
          console.log('=== 추출 결과 요약 ===');
          console.log('제목:', extractedData.title || 'None');
          console.log('설명 길이:', extractedData.description?.length || 0);
          console.log('작가 수:', extractedData.artists?.length || 0);
          console.log('이미지 수:', extractedData.images?.length || 0);
          
          return extractedData;
        });
        
        // 날짜 파싱
        const { start_date, end_date } = parseDateRange(details.period);
        
        // 작가 정보 정리
        const cleanedArtists = details.artists && details.artists.length > 0 
          ? details.artists.map(name => ({ 
              name: name.replace(/작가:?/g, '').trim(), 
              role: 'artist' 
            }))
          : [{ name: '미상', role: 'artist' }];
        
        // 전시 데이터 구성
        const exhibitionData = {
          title_en: details.title || `MMCA 전시 ${i+1}`,
          title_local: details.title || `MMCA 전시 ${i+1}`,
          description: details.description && details.description.length > 50 
            ? details.description 
            : `MMCA 전시 정보 (${url})`,
          start_date: start_date || '2025-01-01',
          end_date: end_date || '2025-12-31',
          venue_name: MMCA_VENUE_INFO.name,
          venue_city: MMCA_VENUE_INFO.city,
          venue_country: MMCA_VENUE_INFO.country,
          venue_address: MMCA_VENUE_INFO.address,
          artists: cleanedArtists,
          source: 'mmca_direct',
          status: 'ongoing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        detailedExhibitions.push(exhibitionData);
        
        console.log(`✅ 전시 정보 추출 완료: ${exhibitionData.title_en}`);
        
      } catch (error) {
        console.error(`❌ URL 처리 실패: ${url} - ${error.message}`);
      }
    }
    
    // Supabase에 저장
    if (detailedExhibitions.length > 0) {
      console.log(`\n=== ${detailedExhibitions.length}개 전시 데이터 저장 중... ===`);
      
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
            console.log(`✅ 저장 성공: ${exhibition.title_en}`);
          }
          
        } catch (error) {
          console.error(`처리 오류: ${exhibition.title_en} - ${error.message}`);
        }
      }
    }
    
    console.log('\n=== MMCA 직접 URL 크롤링 완료 ===');
    
  } catch (error) {
    console.error('크롤링 오류:', error.message);
  } finally {
    await browser.close();
  }
}

function parseDateRange(dateString) {
  if (!dateString) return { start_date: null, end_date: null };
  
  const patterns = [
    /(\d{4})[\.\-\/](\d{1,2})[\.\-\/](\d{1,2})[\s~\-–]*(\d{4})[\.\-\/](\d{1,2})[\.\-\/](\d{1,2})/,
    /(\d{4})-(\d{1,2})-(\d{1,2})[\s~\-–]*(\d{4})-(\d{1,2})-(\d{1,2})/
  ];
  
  for (const pattern of patterns) {
    const match = dateString.match(pattern);
    if (match) {
      return {
        start_date: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
        end_date: `${match[4]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`
      };
    }
  }
  
  return { start_date: null, end_date: null };
}

// 실행
if (require.main === module) {
  crawlMMCADirectURLs().catch(console.error);
}

module.exports = { crawlMMCADirectURLs };