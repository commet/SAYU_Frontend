#!/usr/bin/env node

const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Railway PostgreSQL 연결
const railwayPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Naver API 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 로그 함수
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// 전시 수집 함수
async function collectExhibitions() {
  log('🎨 Starting automated exhibition collection...');
  
  try {
    // 1. Tier 1 venues 조회
    const { data: tier1Venues, error: venueError } = await supabase
      .from('venues')
      .select('name, tier')
      .eq('tier', '1')
      .eq('is_active', true);
    
    if (venueError) {
      log(`❌ Error fetching venues: ${venueError.message}`);
      return;
    }
    
    log(`📍 Found ${tier1Venues.length} Tier 1 venues to process`);
    
    // 2. 각 venue별 검색 실행
    const allExhibitions = [];
    
    for (const venue of tier1Venues) {
      log(`🔍 Searching exhibitions for: ${venue.name}`);
      
      const searchQuery = `${venue.name} 전시 2025`;
      const exhibitions = await searchNaverExhibitions(searchQuery);
      
      log(`📊 Found ${exhibitions.length} exhibitions for ${venue.name}`);
      allExhibitions.push(...exhibitions);
      
      // API 호출 간격 (429 에러 방지)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 3. 중복 제거
    const uniqueExhibitions = removeDuplicates(allExhibitions);
    log(`🔄 Removed duplicates: ${allExhibitions.length} -> ${uniqueExhibitions.length}`);
    
    // 4. Supabase에 저장
    const savedCount = await saveExhibitionsToSupabase(uniqueExhibitions);
    log(`✅ Successfully saved ${savedCount} new exhibitions`);
    
    // 5. 작업 결과 Railway에 로그
    await logCronJob('exhibition_collection', 'completed', {
      searched_venues: tier1Venues.length,
      found_exhibitions: uniqueExhibitions.length,
      saved_exhibitions: savedCount
    });
    
  } catch (error) {
    log(`❌ Exhibition collection failed: ${error.message}`);
    
    // 실패 로그
    await logCronJob('exhibition_collection', 'failed', {
      error: error.message
    });
  }
}

// Naver API 검색 함수
async function searchNaverExhibitions(query) {
  try {
    const [blogResponse, newsResponse] = await Promise.all([
      axios.get('https://openapi.naver.com/v1/search/blog.json', {
        params: { query, display: 50, sort: 'date' },
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
        }
      }),
      axios.get('https://openapi.naver.com/v1/search/news.json', {
        params: { query, display: 50, sort: 'date' },
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
        }
      })
    ]);
    
    const allItems = [
      ...blogResponse.data.items.map(item => ({ ...item, source: 'naver_blog' })),
      ...newsResponse.data.items.map(item => ({ ...item, source: 'naver_news' }))
    ];
    
    return parseExhibitionData(allItems);
    
  } catch (error) {
    log(`❌ Naver API error: ${error.message}`);
    return [];
  }
}

// 전시 데이터 파싱 함수
function parseExhibitionData(items) {
  const exhibitions = [];
  
  const patterns = {
    titleBrackets: /\[(.*?)\]/g,
    titleQuotes: /[「"'](.*?)[」"']/g,
    dateRange: /(\d{4})[년.\s]*(\d{1,2})[월.\s]*(\d{1,2})[일]?\s*[-~]\s*(?:(\d{4})[년.\s]*)?(\d{1,2})[월.\s]*(\d{1,2})[일]?/,
    venue: /(국립현대미술관|서울시립미술관|리움미술관|아모레퍼시픽미술관|대림미술관|갤러리현대|국제갤러리|PKM갤러리|페이스갤러리|타데우스 로팍|페로탱|송은|아트선재센터|디뮤지엄|백남준아트센터|부산시립미술관|부산현대미술관)/
  };
  
  items.forEach(item => {
    const title = item.title.replace(/<[^>]*>/g, '').trim();
    const description = item.description.replace(/<[^>]*>/g, '').trim();
    const content = `${title} ${description}`;
    
    // 제목 추출
    const titleMatches = [
      ...Array.from(content.matchAll(patterns.titleBrackets)),
      ...Array.from(content.matchAll(patterns.titleQuotes))
    ];
    
    // 날짜 추출
    const dateMatch = content.match(patterns.dateRange);
    let startDate = null, endDate = null;
    
    if (dateMatch) {
      const [, year1, month1, day1, year2, month2, day2] = dateMatch;
      startDate = `${year1}-${month1.padStart(2, '0')}-${day1.padStart(2, '0')}`;
      endDate = `${year2 || year1}-${month2.padStart(2, '0')}-${day2.padStart(2, '0')}`;
    }
    
    // 장소 추출
    const venueMatch = content.match(patterns.venue);
    const venueName = venueMatch ? venueMatch[1] : null;
    
    // 유효한 전시 데이터가 있는 경우만 추가
    if (titleMatches.length > 0 && venueName) {
      titleMatches.forEach(match => {
        const exhibitionTitle = match[1].trim();
        if (exhibitionTitle.length > 3) {
          exhibitions.push({
            title: exhibitionTitle,
            venueName,
            venueCity: '서울',
            venueCountry: 'KR',
            startDate,
            endDate,
            description: description.substring(0, 500),
            source: item.source,
            sourceUrl: item.link
          });
        }
      });
    }
  });
  
  return exhibitions;
}

// 중복 제거 함수
function removeDuplicates(exhibitions) {
  const seen = new Set();
  return exhibitions.filter(exhibition => {
    const key = `${exhibition.title}-${exhibition.venueName}-${exhibition.startDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Supabase 저장 함수
async function saveExhibitionsToSupabase(exhibitions) {
  let savedCount = 0;
  
  for (const exhibition of exhibitions) {
    try {
      // 1. Venue ID 찾기
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .select('id')
        .eq('name', exhibition.venueName)
        .single();
      
      if (venueError || !venue) continue;
      
      // 2. 중복 체크
      const { data: existing, error: checkError } = await supabase
        .from('exhibitions')
        .select('id')
        .eq('title', exhibition.title)
        .eq('venue_id', venue.id)
        .eq('start_date', exhibition.startDate)
        .maybeSingle();
      
      if (checkError || existing) continue;
      
      // 3. 저장
      const exhibitionRecord = {
        venue_id: venue.id,
        title: exhibition.title,
        venue_name: exhibition.venueName,
        venue_city: exhibition.venueCity,
        venue_country: exhibition.venueCountry,
        start_date: exhibition.startDate,
        end_date: exhibition.endDate,
        description: exhibition.description,
        source: exhibition.source,
        source_url: exhibition.sourceUrl,
        verification_status: 'verified',
        status: determineStatus(exhibition.startDate, exhibition.endDate)
      };
      
      const { error: saveError } = await supabase
        .from('exhibitions')
        .insert(exhibitionRecord);
      
      if (!saveError) {
        savedCount++;
      }
      
    } catch (error) {
      log(`❌ Error saving exhibition: ${error.message}`);
    }
  }
  
  return savedCount;
}

// 전시 상태 결정 함수
function determineStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'draft';
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}

// 크론 작업 로그 함수
async function logCronJob(jobType, status, metadata = {}) {
  try {
    const client = await railwayPool.connect();
    
    await client.query(`
      INSERT INTO scraping_jobs (job_type, status, completed_at, results_count, metadata)
      VALUES ($1, $2, NOW(), $3, $4)
    `, [jobType, status, metadata.saved_exhibitions || 0, JSON.stringify(metadata)]);
    
    client.release();
    
  } catch (error) {
    log(`❌ Error logging cron job: ${error.message}`);
  }
}

// 메인 크론 작업 스케줄러
function startCronJobs() {
  log('🚀 Starting exhibition collection cron jobs...');
  
  // 매일 오전 9시에 Tier 1 venues 수집
  cron.schedule('0 9 * * *', async () => {
    log('⏰ Daily Tier 1 collection started');
    await collectExhibitions();
  });
  
  // 매주 월요일 오전 10시에 Tier 2 venues 수집
  cron.schedule('0 10 * * 1', async () => {
    log('⏰ Weekly Tier 2 collection started');
    // TODO: Tier 2 수집 로직 구현
  });
  
  // 매월 1일 오전 11시에 Tier 3 venues 수집
  cron.schedule('0 11 1 * *', async () => {
    log('⏰ Monthly Tier 3 collection started');
    // TODO: Tier 3 수집 로직 구현
  });
  
  log('✅ All cron jobs scheduled successfully');
}

// 프로그램 시작
if (require.main === module) {
  // 즉시 실행 모드 (테스트용)
  if (process.argv.includes('--run-now')) {
    log('🧪 Running exhibition collection immediately...');
    collectExhibitions();
  } else {
    // 크론 모드
    startCronJobs();
  }
}

module.exports = {
  collectExhibitions,
  startCronJobs
};