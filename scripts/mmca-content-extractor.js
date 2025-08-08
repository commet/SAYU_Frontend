const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function extractDetailedContent() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // User-Agent 설정으로 차단 방지
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // 추수 전시 페이지
    const url = 'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202501060001891';
    console.log(`🎨 MMCA 전시 상세 정보 추출 시작: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // DOM이 완전히 로드될 때까지 대기
    console.log('⏳ DOM 로딩 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 페이지가 제대로 로드되었는지 확인
    const pageTitle = await page.title();
    console.log('📄 페이지 제목:', pageTitle);

    const detailedInfo = await page.evaluate(() => {
      console.log('=== DOM 기반 상세 컨텐츠 추출 시작 ===');
      
      // 전체 텍스트도 백업으로 보관
      const bodyText = document.body.textContent;
      
      // 1. DOM 선택자를 이용한 전시 제목 추출
      const getExhibitionTitle = () => {
        let title = '';
        let titleEn = '';
        let series = '';
        
        // 다양한 제목 선택자 시도
        const titleSelectors = [
          '.exh_info .tit',
          '.exh_tit h2',
          '.exhibition-title h1',
          '.exh_detail .tit',
          'h1.tit',
          '.content_title h1',
          '.exh_top .tit',
          'h1'
        ];
        
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            title = element.textContent.trim();
            console.log(`제목 발견 (${selector}):`, title);
            break;
          }
        }
        
        // 영문 제목 찾기
        const titleEnSelectors = [
          '.exh_info .en_tit',
          '.exh_tit .en',
          '.title-en',
          '.en_title'
        ];
        
        for (const selector of titleEnSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            titleEn = element.textContent.trim();
            console.log(`영문 제목 발견 (${selector}):`, titleEn);
            break;
          }
        }
        
        // 시리즈명 추출 (패턴 매칭으로 보강)
        const seriesPattern = /MMCA[×X]LG\s+OLED\s+시리즈/gi;
        const seriesMatch = bodyText.match(seriesPattern);
        if (seriesMatch) {
          series = seriesMatch[0];
          console.log('시리즈명 발견:', series);
        }
        
        // 작품 제목 추출 (« » 패턴)
        const workTitlePattern = /«([^»]+)»/g;
        const workTitles = [];
        let match;
        while ((match = workTitlePattern.exec(bodyText)) !== null) {
          workTitles.push(match[1]);
        }
        
        console.log('작품 제목들:', workTitles);
        
        return {
          title: title || '',
          titleEn: titleEn || '',
          series: series || '',
          workTitles: workTitles
        };
      };
      
      // 2. DOM 기반 전시 설명 추출
      const getExhibitionDescription = () => {
        let description = '';
        
        // 전시 설명 영역 선택자들
        const descriptionSelectors = [
          '.exh_txt .txt',
          '.exh_info .content',
          '.exhibition-description',
          '.exh_detail .content',
          '.content_area .txt',
          '.desc_area p',
          '.exh_txt p',
          '.content p'
        ];
        
        for (const selector of descriptionSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            // 가장 긴 텍스트를 가진 요소 선택
            let longestText = '';
            elements.forEach(el => {
              const text = el.textContent.trim();
              if (text.length > longestText.length && 
                  text.length > 50 && 
                  !text.includes('회원가입') && 
                  !text.includes('로그인') &&
                  !text.includes('메뉴')) {
                longestText = text;
              }
            });
            if (longestText) {
              description = longestText;
              console.log(`설명 발견 (${selector}), 길이: ${longestText.length}`);
              break;
            }
          }
        }
        
        // DOM에서 찾지 못했다면 텍스트 패턴 매칭 사용
        if (!description) {
          console.log('DOM에서 설명을 찾지 못했습니다. 텍스트 패턴 매칭 시도...');
          const paragraphs = bodyText.split(/\n\s*\n/).filter(p => {
            const text = p.trim();
            return text.length > 100 && 
                   text.length < 2000 && 
                   !text.includes('회원가입') && 
                   !text.includes('로그인') && 
                   !text.includes('검색') &&
                   !text.includes('메뉴') &&
                   (text.includes('국립현대미술관') || text.includes('LG전자') || 
                    text.includes('OLED') || text.includes('전시') || 
                    text.includes('작가') || text.includes('아가몬'));
          });
          
          if (paragraphs.length > 0) {
            description = paragraphs.sort((a, b) => b.length - a.length)[0];
            console.log('패턴 매칭으로 설명 발견, 길이:', description.length);
          }
        }
        
        return description.replace(/\s+/g, ' ').trim();
      };
      
      // 3. DOM 기반 작가 정보 추출
      const getArtistInfo = () => {
        const artists = [];
        
        // 작가 정보 영역 선택자들
        const artistSelectors = [
          '.exh_info .artist',
          '.artist_info',
          '.exh_detail .artist',
          '[class*="artist"]'
        ];
        
        for (const selector of artistSelectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length < 100) {
              artists.push(text);
              console.log(`작가 정보 발견 (${selector}):`, text);
            }
          });
        }
        
        // dt/dd 구조에서 작가 정보 추출
        const dtElements = document.querySelectorAll('dt');
        dtElements.forEach(dt => {
          if (dt.textContent.includes('작가') || dt.textContent.includes('Artist')) {
            const dd = dt.nextElementSibling;
            if (dd && dd.tagName === 'DD') {
              const artistText = dd.textContent.trim();
              if (artistText && artistText.length < 100) {
                artists.push(artistText);
                console.log('dt/dd에서 작가 정보 발견:', artistText);
              }
            }
          }
        });
        
        // DOM에서 찾지 못했다면 텍스트 패턴 매칭 사용
        if (artists.length === 0) {
          console.log('DOM에서 작가를 찾지 못했습니다. 텍스트 패턴 매칭 시도...');
          const artistPatterns = [
            /작가\s*:?\s*([\가-힣A-Za-z\(\)\s]+)/gi,
            /Artist\s*:?\s*([A-Za-z\(\)\s]+)/gi,
            /추수\s*\(TZUSOO\)/gi,
            /작품\s*제작\s*팀\s*:?\s*([^\n]+)/gi,
            /TZUSOO/gi
          ];
          
          artistPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(bodyText)) !== null) {
              const name = match[1] ? match[1].trim() : match[0].trim();
              if (name.length > 0 && name.length < 100) {
                artists.push(name);
                console.log('패턴 매칭으로 작가 발견:', name);
              }
            }
          });
        }
        
        // 중복 제거 및 정리
        return [...new Set(artists)]
          .filter(name => name && !name.includes('\n') && name.length > 1)
          .map(name => name.replace(/\s+/g, ' ').trim());
      };
      
      // 4. DOM 기반 전시 상세 정보 추출
      const getExhibitionDetails = () => {
        const details = {};
        
        // dt/dd 구조에서 정보 추출
        const dtElements = document.querySelectorAll('dt');
        dtElements.forEach(dt => {
          const dd = dt.nextElementSibling;
          if (dd && dd.tagName === 'DD') {
            const key = dt.textContent.trim();
            const value = dd.textContent.trim();
            
            console.log(`dt/dd 발견: ${key} -> ${value}`);
            
            if (key.includes('기간') || key.includes('Period')) {
              details.period = value;
            } else if (key.includes('장소') || key.includes('Venue')) {
              details.location = value;
            } else if (key.includes('작품수') || key.includes('Works')) {
              details.artworksCount = value;
            } else if (key.includes('주최') || key.includes('주관')) {
              details.organizer = value;
            } else if (key.includes('후원')) {
              details.sponsor = value;
            }
          }
        });
        
        // 특정 클래스나 ID로 정보 추출
        const infoSelectors = [
          '.exh_info .info_list',
          '.exhibition-info',
          '.exh_detail .info',
          '.exh_info'
        ];
        
        for (const selector of infoSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const text = element.textContent;
            console.log(`정보 영역 발견 (${selector}):`, text.substring(0, 200) + '...');
            
            // 기간 패턴 매칭
            if (!details.period) {
              const periodPatterns = [
                /(2025[-.]01[-.]06)\s*[~-]\s*(2025[-.]03[-.]23)/,
                /2025.*03.*23/
              ];
              
              for (const pattern of periodPatterns) {
                const periodMatch = text.match(pattern);
                if (periodMatch) {
                  details.period = periodMatch[0];
                  console.log('기간 패턴 매칭 성공:', details.period);
                  break;
                }
              }
            }
            
            // 장소 패턴 매칭
            if (!details.location) {
              const locationPatterns = [
                /(서울\s*[\지하\d층\s]*[^\n,;]+)/,
                /(MMCA\s*서울[^\n,;]*)/,
                /(국립현대미술관[^\n,;]*)/
              ];
              
              for (const pattern of locationPatterns) {
                const locationMatch = text.match(pattern);
                if (locationMatch) {
                  details.location = locationMatch[0];
                  console.log('장소 패턴 매칭 성공:', details.location);
                  break;
                }
              }
            }
            
            // 작품수 패턴 매칭
            if (!details.artworksCount) {
              const worksPattern = /(\d+)\s*점/;
              const worksMatch = text.match(worksPattern);
              if (worksMatch) {
                details.artworksCount = worksMatch[1] + '점';
                console.log('작품수 패턴 매칭 성공:', details.artworksCount);
              }
            }
          }
        }
        
        return details;
      };
      
      // 모든 정보 추출 실행
      const titleInfo = getExhibitionTitle();
      const description = getExhibitionDescription();
      const artists = getArtistInfo();
      const details = getExhibitionDetails();
      
      // 추출 품질 점수 계산
      let qualityScore = 0;
      if (titleInfo.title) qualityScore += 20;
      if (titleInfo.series) qualityScore += 15;
      if (description.length > 50) qualityScore += 25;
      if (artists.length > 0) qualityScore += 20;
      if (details.period) qualityScore += 10;
      if (details.location) qualityScore += 10;
      
      console.log('=== 추출 결과 요약 ===');
      console.log('제목:', titleInfo.title);
      console.log('영문 제목:', titleInfo.titleEn);
      console.log('시리즈:', titleInfo.series);
      console.log('설명 길이:', description.length);
      console.log('작가 수:', artists.length);
      console.log('작가들:', artists);
      console.log('전시 세부사항:', details);
      console.log('데이터 품질 점수:', qualityScore + '/100');
      
      return {
        titleInfo,
        description,
        artists,
        details,
        qualityScore,
        fullTextLength: bodyText.length
      };
    });
    
    console.log('\n🎯 === 추출된 상세 정보 ===');
    console.log('📋 전시 제목:', detailedInfo.titleInfo.title);
    console.log('🌐 영문 제목:', detailedInfo.titleInfo.titleEn);
    console.log('📺 시리즈:', detailedInfo.titleInfo.series);
    console.log('🎨 작품 제목들:', detailedInfo.titleInfo.workTitles);
    console.log('\n📝 전시 설명 (길이: ' + detailedInfo.description.length + '):', 
                detailedInfo.description.substring(0, 300) + '...');
    console.log('\n👨‍🎨 작가 정보:', detailedInfo.artists);
    console.log('\n📍 전시 세부사항:', detailedInfo.details);
    console.log('\n📊 데이터 품질 점수:', detailedInfo.qualityScore + '/100');
    
    // 추출된 정보로 DB 업데이트 (품질 점수가 60 이상일 때만)
    if (detailedInfo.qualityScore >= 60) {
      console.log('\n💾 === DB 업데이트 중... (품질 점수: ' + detailedInfo.qualityScore + ') ===');
      
      const updateData = {
        title_ko: detailedInfo.titleInfo.title || null,
        title_en: detailedInfo.titleInfo.titleEn || null,
        description: detailedInfo.description || null,
        artists: detailedInfo.artists.length > 0 ? 
          detailedInfo.artists.map(name => ({ name: name.trim(), role: 'artist' })) : null,
        period: detailedInfo.details.period || null,
        location: detailedInfo.details.location || null,
        artworks_count: detailedInfo.details.artworksCount || null,
        organizer: detailedInfo.details.organizer || null,
        sponsor: detailedInfo.details.sponsor || null,
        series: detailedInfo.titleInfo.series || null,
        work_titles: detailedInfo.titleInfo.workTitles || null,
        data_quality_score: detailedInfo.qualityScore,
        updated_at: new Date().toISOString()
      };
      
      // null 값 제거
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });
      
      console.log('📋 업데이트할 데이터:', JSON.stringify(updateData, null, 2));
      
      // 여러 조건으로 매칭 시도
      const matchConditions = [
        { title_en: { ilike: '%tzusoo%' } },
        { title_ko: { ilike: '%추수%' } },
        { title_en: { ilike: '%agamon%' } },
        { title_ko: { ilike: '%아가몬%' } },
        { description: { ilike: '%mmca%lg%' } }
      ];
      
      let updateSuccess = false;
      
      for (const condition of matchConditions) {
        console.log('🔍 매칭 시도 중:', JSON.stringify(condition));
        
        const { data, error } = await supabase
          .from('exhibitions')
          .update(updateData)
          .match(condition)
          .select();
        
        if (error) {
          console.error('❌ DB 업데이트 실패 (조건:', JSON.stringify(condition), '):', error.message);
        } else if (data && data.length > 0) {
          console.log('✅ DB 업데이트 성공! (매칭된 레코드:', data.length, '개)');
          console.log('📋 업데이트된 레코드 ID:', data.map(record => record.id));
          updateSuccess = true;
          break;
        } else {
          console.log('🔍 해당 조건으로 매칭된 레코드 없음');
        }
      }
      
      if (!updateSuccess) {
        console.log('⚠️  모든 매칭 조건으로 업데이트에 실패했습니다.');
        
        // 현재 DB에 있는 전시 목록 확인
        const { data: existingExhibitions, error: fetchError } = await supabase
          .from('exhibitions')
          .select('id, title_ko, title_en, description')
          .limit(10);
        
        if (fetchError) {
          console.error('❌ 기존 전시 목록 조회 실패:', fetchError.message);
        } else {
          console.log('📋 현재 DB의 전시 목록 (최근 10개):');
          existingExhibitions.forEach((exhibition, index) => {
            console.log(`${index + 1}. ID: ${exhibition.id}`);
            console.log(`   제목 (한글): ${exhibition.title_ko || 'N/A'}`);
            console.log(`   제목 (영문): ${exhibition.title_en || 'N/A'}`);
            console.log(`   설명: ${exhibition.description ? exhibition.description.substring(0, 100) + '...' : 'N/A'}`);
            console.log('');
          });
        }
      }
      
    } else {
      console.log('\n⚠️  데이터 품질 점수가 낮아 DB 업데이트를 건너뜁니다. (점수: ' + detailedInfo.qualityScore + '/100)');
      console.log('💡 최소 60점 이상이어야 DB에 저장됩니다.');
    }
    
    console.log('\n🎉 전시 정보 추출 완료!');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('❌ 추출 오류:', error.message);
    console.error('스택 트레이스:', error.stack);
  } finally {
    await browser.close();
    console.log('🔚 브라우저 종료');
  }
}

// 스크립트 실행
console.log('🚀 MMCA 전시 정보 추출 스크립트 시작');
extractDetailedContent().catch(console.error);