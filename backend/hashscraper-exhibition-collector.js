#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 전시 관련 해시태그들
const EXHIBITION_HASHTAGS = [
  // 한국어 해시태그
  '전시', '전시회', '미술관', '갤러리', 
  '아트', '아트전시', '전시추천', '전시관람',
  '서울전시', '미술전시', '개인전', '기획전',
  '현대미술', '작품전시', '아트갤러리', '전시정보',
  
  // 영어 해시태그  
  'exhibition', 'artexhibition', 'gallery', 'museum',
  'contemporaryart', 'artshow', 'seoul_art', 'korea_art',
  'art_gallery', 'art_museum', 'solo_exhibition', 'group_exhibition',
  
  // 미술관별 해시태그
  'mmca', '국립현대미술관', 'leeum', '리움미술관',
  'sac', '예술의전당', 'sema', '서울시립미술관',
  '갤러리현대', '국제갤러리', '학고재갤러리'
];

class HashscraperExhibitionCollector {
  constructor() {
    this.apiKey = process.env.HASHSCRAPER_API_KEY; // 환경변수에 API 키 설정 필요
    this.baseUrl = 'https://api.hashscraper.com'; // 실제 API URL 확인 필요
    this.stats = {
      hashtags_processed: 0,
      posts_collected: 0,
      exhibitions_extracted: 0,
      errors: 0
    };
  }

  async startCollection() {
    console.log('🔥 해시스크래퍼 인스타그램 전시 정보 수집');
    console.log('📱 Instagram 해시태그 기반 실시간 전시 데이터 크롤링');
    console.log(`🏷️  ${EXHIBITION_HASHTAGS.length}개 전시 관련 해시태그 모니터링\n`);

    if (!this.apiKey) {
      console.log('⚠️  HASHSCRAPER_API_KEY 환경변수 설정이 필요합니다.');
      console.log('💡 해시스크래퍼 가입 후 API 키를 .env 파일에 추가하세요.\n');
    }

    // 1. 해시스크래퍼 서비스 소개
    this.introduceHashscraper();
    
    // 2. 전시 해시태그 전략 수립
    this.planHashtagStrategy();
    
    // 3. 가상 API 호출 예제 (실제 API 키 있을 때 작동)
    await this.demonstrateApiUsage();
    
    // 4. 데이터 처리 및 전시 추출 로직
    this.demonstrateDataProcessing();
  }

  introduceHashscraper() {
    console.log('🔥 해시스크래퍼 (HashScraper) 소개');
    console.log('='.repeat(60));
    console.log('💰 가격: 월 30,000원 ~ 255,000원');
    console.log('🎁 무료 체험: 5만 크레딧 제공');
    console.log('⚡ 특징: IP 차단 없는 고속 크롤링');
    console.log('📊 데이터: Excel 다운로드 + API 연동');
    console.log('🎯 장점: 비개발자도 쉽게 사용 가능');
    
    console.log('\n✅ 인스타그램 크롤링 기능:');
    console.log('   • 해시태그 기반 포스팅 수집');
    console.log('   • 댓글, 좋아요, 감정 분석');
    console.log('   • 실시간 모니터링 가능');
    console.log('   • API를 통한 자동화 연동');
    
    console.log('\n🎨 전시 정보 수집 활용법:');
    console.log('   • #전시 #미술관 #갤러리 해시태그 모니터링');
    console.log('   • 미술관 공식 계정 포스팅 추적');
    console.log('   • 전시 관람 후기 및 사용자 반응 수집');
    console.log('   • 실시간 전시 트렌드 파악');
  }

  planHashtagStrategy() {
    console.log('\n\n🏷️  전시 해시태그 수집 전략');
    console.log('='.repeat(60));
    
    // 해시태그를 카테고리별로 분류
    const categories = {
      '일반 전시': ['전시', '전시회', '전시추천', 'exhibition', 'artexhibition'],
      '장소별': ['미술관', '갤러리', 'museum', 'gallery', 'art_gallery'],
      '유형별': ['개인전', '기획전', 'solo_exhibition', 'group_exhibition'], 
      '지역별': ['서울전시', 'seoul_art', 'korea_art'],
      '미술관별': ['mmca', 'leeum', 'sac', 'sema', '국립현대미술관', '리움미술관']
    };

    Object.entries(categories).forEach(([category, hashtags]) => {
      console.log(`📂 ${category}:`);
      console.log(`   ${hashtags.map(tag => `#${tag}`).join(' ')}`);
    });

    console.log('\n💡 수집 전략:');
    console.log('1. 🎯 고빈도 해시태그 우선 (#전시, #미술관, #갤러리)');
    console.log('2. 🏛️  미술관 공식 계정 포스팅 집중 모니터링');
    console.log('3. 📅 주기적 수집 (일 1회, 주말 집중)');
    console.log('4. 🔍 키워드 필터링으로 정확도 향상');
  }

  async demonstrateApiUsage() {
    console.log('\n\n🚀 해시스크래퍼 API 사용 예제');
    console.log('='.repeat(60));

    // 가상의 API 호출 예제
    const sampleApiCall = {
      method: 'POST',
      url: 'https://api.hashscraper.com/instagram/hashtag',
      headers: {
        'Authorization': `Bearer ${this.apiKey || 'YOUR_API_KEY'}`,
        'Content-Type': 'application/json'
      },
      data: {
        hashtag: '전시',
        max_count: 100,
        sort: 'recent',
        include_comments: true,
        include_likes: true
      }
    };

    console.log('📡 API 호출 예제:');
    console.log(JSON.stringify(sampleApiCall, null, 2));

    if (this.apiKey) {
      console.log('\n🔥 실제 API 호출 시도 중...');
      try {
        // 실제 API 호출 (URL과 파라미터는 해시스크래퍼 문서 확인 필요)
        console.log('   ⚠️  실제 API 엔드포인트는 해시스크래퍼 문서에서 확인하세요.');
        this.stats.hashtags_processed++;
      } catch (error) {
        console.log(`   ❌ API 호출 실패: ${error.message}`);
        this.stats.errors++;
      }
    } else {
      console.log('\n💡 API 키 설정 방법:');
      console.log('1. https://www.hashscraper.com 가입');
      console.log('2. API 키 발급받기');
      console.log('3. .env 파일에 HASHSCRAPER_API_KEY=your_key 추가');
      console.log('4. 이 스크립트 재실행');
    }
  }

  demonstrateDataProcessing() {
    console.log('\n\n🔍 인스타그램 데이터 → 전시정보 추출 로직');
    console.log('='.repeat(60));

    // 가상의 인스타그램 포스트 데이터
    const sampleInstagramData = [
      {
        id: '12345',
        caption: '🎨 국립현대미술관 론 뮤익 전시 다녀왔어요! 2025.3.6-8.31까지 진행됩니다 #전시 #mmca #론뮤익',
        hashtags: ['전시', 'mmca', '론뮤익'],
        likes: 245,
        comments: 18,
        posted_at: '2025-07-19T10:30:00Z'
      },
      {
        id: '12346', 
        caption: '리움미술관 피에르 위그 개인전 너무 좋았다 ✨ #리움미술관 #피에르위그 #현대미술 #전시추천',
        hashtags: ['리움미술관', '피에르위그', '현대미술', '전시추천'],
        likes: 89,
        comments: 7,
        posted_at: '2025-07-19T14:20:00Z'
      }
    ];

    console.log('📱 샘플 인스타그램 데이터:');
    sampleInstagramData.forEach((post, i) => {
      console.log(`\n${i+1}. 포스트 ID: ${post.id}`);
      console.log(`   💬 "${post.caption}"`);
      console.log(`   👍 좋아요: ${post.likes} | 💬 댓글: ${post.comments}`);
    });

    console.log('\n🤖 전시정보 추출 알고리즘:');
    const extractedExhibitions = this.extractExhibitionsFromPosts(sampleInstagramData);
    
    extractedExhibitions.forEach((exhibition, i) => {
      console.log(`\n✅ 추출된 전시 ${i+1}:`);
      console.log(`   제목: ${exhibition.title}`);
      console.log(`   장소: ${exhibition.venue}`);
      console.log(`   기간: ${exhibition.period}`);
      console.log(`   신뢰도: ${exhibition.confidence}%`);
    });

    console.log('\n📊 수집 통계:');
    console.log(`   처리된 포스트: ${sampleInstagramData.length}개`);
    console.log(`   추출된 전시: ${extractedExhibitions.length}개`);
    console.log(`   추출 성공률: ${Math.round(extractedExhibitions.length / sampleInstagramData.length * 100)}%`);
  }

  extractExhibitionsFromPosts(posts) {
    const exhibitions = [];
    
    posts.forEach(post => {
      // 전시명 추출 패턴
      const exhibitionPatterns = [
        /([가-힣a-zA-Z\s]+)\s*전시?/g,
        /([가-힣a-zA-Z\s]+)\s*개인전/g,
        /([가-힣a-zA-Z\s]+)\s*기획전/g
      ];

      // 미술관명 추출
      const venues = ['국립현대미술관', '리움미술관', '예술의전당', '서울시립미술관'];
      const venue = venues.find(v => post.caption.includes(v)) || '미상';

      // 날짜 추출 패턴
      const datePattern = /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g;
      const dates = [...post.caption.matchAll(datePattern)];

      // 전시명 추출
      let title = null;
      for (const pattern of exhibitionPatterns) {
        const match = pattern.exec(post.caption);
        if (match) {
          title = match[1].trim();
          break;
        }
      }

      if (title && venue !== '미상') {
        exhibitions.push({
          title: title,
          venue: venue,
          period: dates.length > 0 ? `${dates[0][0]}` : '기간 미상',
          confidence: this.calculateConfidence(post, title, venue),
          source: 'instagram_hashscraper',
          original_post: post.id
        });
      }
    });

    return exhibitions;
  }

  calculateConfidence(post, title, venue) {
    let confidence = 50; // 기본 신뢰도
    
    // 좋아요/댓글 수에 따른 가중치
    if (post.likes > 100) confidence += 20;
    else if (post.likes > 50) confidence += 10;
    
    // 해시태그 관련성
    const relevantHashtags = ['전시', '미술관', '갤러리', 'exhibition'];
    const matchingTags = post.hashtags.filter(tag => 
      relevantHashtags.some(relevant => tag.includes(relevant))
    );
    confidence += matchingTags.length * 5;
    
    // 미술관명 정확도
    if (venue !== '미상') confidence += 15;
    
    return Math.min(confidence, 95); // 최대 95%
  }
}

async function main() {
  const collector = new HashscraperExhibitionCollector();
  
  try {
    await collector.startCollection();
    
    console.log('\n\n💡 다음 단계:');
    console.log('1. 해시스크래퍼 가입 및 API 키 발급');
    console.log('2. 환경변수 설정 (HASHSCRAPER_API_KEY)');
    console.log('3. 실제 해시태그 모니터링 시작');
    console.log('4. 추출된 데이터 검증 및 DB 저장');
    console.log('5. 정기 수집 스케줄러 구축');
    
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}