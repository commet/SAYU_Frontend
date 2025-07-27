const { Pool } = require('pg');
const ThreeAPTGenerator = require('./generateThreeAPTProfiles');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class FlexibleArtistSubmission {
  constructor() {
    this.aptGenerator = new ThreeAPTGenerator();
  }

  /**
   * 매우 유연한 작가 정보 제출 시스템
   * 필수: 작가명만
   * 나머지는 모두 선택사항
   */
  async submitArtistInfo(submissionData, submitterInfo = null) {
    const {
      // 필수 (1개)
      artist_name,
      
      // 기본 정보 (선택)
      bio = null,
      birth_year = null,
      death_year = null,
      nationality = null,
      
      // 연락처 (선택)
      contact_email = null,
      website_url = null,
      phone = null,
      
      // 예술 정보 (선택)
      specialties = [],
      art_movements = [],
      famous_works = [],
      
      // 소셜/웹 (선택)
      social_links = {},
      
      // 제출자 정보
      submitted_by_name = null,
      submitted_by_email = null,
      submission_reason = 'missing_artist', // 'missing_artist', 'self_registration', 'update_info'
      
      // 추가 정보
      additional_info = null,
      source_references = [] // Wikipedia, 다른 사이트 등
      
    } = submissionData;

    // 유일한 필수 검증
    if (!artist_name?.trim()) {
      throw new Error('작가명은 필수입니다');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. 제출자 처리 (이메일이 있으면 사용자 연결, 없으면 익명)
      let submitterUserId = null;
      
      if (submitted_by_email) {
        // 기존 사용자 확인
        const existingUser = await client.query(`
          SELECT id FROM users WHERE email = $1
        `, [submitted_by_email]);
        
        if (existingUser.rows.length > 0) {
          submitterUserId = existingUser.rows[0].id;
        } else {
          // 새 사용자 생성
          const newUser = await client.query(`
            INSERT INTO users (email, username)
            VALUES ($1, $2)
            RETURNING id
          `, [
            submitted_by_email, 
            submitted_by_name || `user_${Date.now()}`
          ]);
          submitterUserId = newUser.rows[0].id;
        }
      }
      
      // 2. 기존 작가 중복 확인
      const existingArtist = await client.query(`
        SELECT id, name FROM artists 
        WHERE LOWER(name) = LOWER($1)
      `, [artist_name.trim()]);
      
      if (existingArtist.rows.length > 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          message: `작가 "${artist_name}"는 이미 등록되어 있습니다 (ID: ${existingArtist.rows[0].id})`,
          existing_artist_id: existingArtist.rows[0].id
        };
      }
      
      // 3. Artist Profile 생성 (이메일 없어도 가능)
      const profileInsertResult = await client.query(`
        INSERT INTO artist_profiles (
          user_id, artist_name, bio, website_url, 
          contact_email, phone, specialties, social_links,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
        RETURNING id
      `, [
        submitterUserId, // null 가능
        artist_name.trim(),
        bio,
        website_url,
        contact_email, // null 가능
        phone,
        specialties,
        social_links
      ]);
      
      const profileId = profileInsertResult.rows[0].id;
      
      // 4. 제출 정보 기록 (별도 테이블)
      await client.query(`
        INSERT INTO artist_submissions (
          artist_profile_id, submitted_by_name, submitted_by_email,
          submission_reason, birth_year, death_year, nationality,
          art_movements, famous_works, additional_info, source_references
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        profileId,
        submitted_by_name,
        submitted_by_email,
        submission_reason,
        birth_year,
        death_year,
        nationality,
        art_movements,
        famous_works,
        additional_info,
        source_references
      ]);
      
      await client.query('COMMIT');
      
      console.log(`✅ 작가 정보 제출 완료: ${artist_name}`);
      console.log(`   Profile ID: ${profileId}`);
      console.log(`   제출자: ${submitted_by_name || '익명'}`);
      console.log(`   제출 사유: ${submission_reason}`);
      
      return {
        success: true,
        message: '작가 정보가 성공적으로 제출되었습니다. 관리자 검토 후 등록됩니다.',
        profile_id: profileId,
        artist_name: artist_name,
        status: 'pending'
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 작가 정보 제출 템플릿 (완전히 유연한 버전)
   */
  generateFlexibleTemplate() {
    return {
      // 유일한 필수 정보
      required: {
        artist_name: "작가명 (유일한 필수 항목)"
      },
      
      // 기본 정보 (모두 선택)
      basic_info: {
        bio: "작가 소개",
        birth_year: "출생년도 (예: 1970)",
        death_year: "사망년도 (생존 작가는 null)",
        nationality: "국적 (예: 한국, 미국, 프랑스)"
      },
      
      // 연락처 (모두 선택)
      contact_info: {
        contact_email: "작가 이메일 (없어도 됨)",
        website_url: "웹사이트 주소",
        phone: "전화번호"
      },
      
      // 예술 정보 (모두 선택)
      art_info: {
        specialties: ["회화", "조각", "설치미술"],
        art_movements: ["인상주의", "추상표현주의"],
        famous_works: ["대표작1", "대표작2"]
      },
      
      // 소셜/웹 (모두 선택)
      social_web: {
        social_links: {
          instagram: "인스타그램 주소",
          twitter: "트위터 주소",
          facebook: "페이스북 주소"
        }
      },
      
      // 제출자 정보
      submitter_info: {
        submitted_by_name: "제출자 이름 (익명 가능)",
        submitted_by_email: "제출자 이메일 (계정 연결용, 선택)",
        submission_reason: "missing_artist | self_registration | update_info",
        additional_info: "추가 설명이나 특이사항",
        source_references: ["참고 사이트 URL들"]
      },
      
      // 제출 사유 옵션
      submission_reasons: {
        "missing_artist": "누락된 작가 발견하여 대신 제출",
        "self_registration": "작가 본인이 직접 등록",
        "update_info": "기존 정보 업데이트 요청"
      }
    };
  }

  /**
   * 다양한 시나리오별 예시
   */
  getSubmissionExamples() {
    return {
      // 1. 최소한의 정보 (이름만)
      minimal: {
        artist_name: "김무명",
        submitted_by_name: "미술 애호가",
        submission_reason: "missing_artist"
      },
      
      // 2. 누락된 유명 작가 제보
      famous_missing: {
        artist_name: "이중섭",
        bio: "한국 근현대 미술사의 대표 화가",
        birth_year: 1916,
        death_year: 1956,
        nationality: "한국",
        specialties: ["회화", "서양화"],
        famous_works: ["소", "황소", "아이들"],
        submitted_by_name: "미술사 연구자",
        submitted_by_email: "researcher@art.edu",
        submission_reason: "missing_artist",
        additional_info: "국립현대미술관 소장작 다수",
        source_references: ["https://ko.wikipedia.org/wiki/이중섭"]
      },
      
      // 3. 작가 본인 등록 (이메일 없음)
      self_no_email: {
        artist_name: "박신인",
        bio: "젊은 설치미술가",
        birth_year: 1995,
        nationality: "한국",
        specialties: ["설치미술", "미디어아트"],
        website_url: "https://parksin.wixsite.com/portfolio",
        social_links: {
          instagram: "@park_sin_art"
        },
        submitted_by_name: "박신인",
        submission_reason: "self_registration",
        additional_info: "이메일이 없어서 SNS로 연락 가능"
      },
      
      // 4. 상세 정보 제출
      detailed: {
        artist_name: "최미래",
        bio: "AI와 인간의 관계를 탐구하는 현대미술가",
        birth_year: 1988,
        nationality: "한국",
        contact_email: "choi.future@gmail.com",
        website_url: "https://choifuture.com",
        phone: "010-1234-5678",
        specialties: ["디지털아트", "AI아트", "인터랙티브미술"],
        art_movements: ["포스트인터넷아트", "테크노페미니즘"],
        famous_works: ["인공지능의 꿈", "디지털 네이처", "로봇의 감정"],
        social_links: {
          instagram: "@choi_future_art",
          twitter: "@choifuture",
          youtube: "최미래 아트채널"
        },
        submitted_by_name: "최미래",
        submitted_by_email: "choi.future@gmail.com",
        submission_reason: "self_registration",
        source_references: [
          "https://artkorea.or.kr/artist/choi-future",
          "https://gallery21.com/exhibitions/choi-future"
        ]
      }
    };
  }
}

async function createSubmissionTable() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // artist_submissions 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS artist_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
        submitted_by_name VARCHAR(200),
        submitted_by_email VARCHAR(255),
        submission_reason VARCHAR(50) DEFAULT 'missing_artist' 
          CHECK (submission_reason IN ('missing_artist', 'self_registration', 'update_info')),
        birth_year INTEGER,
        death_year INTEGER,
        nationality VARCHAR(100),
        art_movements TEXT[] DEFAULT '{}',
        famous_works TEXT[] DEFAULT '{}',
        additional_info TEXT,
        source_references TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query('COMMIT');
    console.log('✅ artist_submissions 테이블 생성 완료');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function demonstrateFlexibleSubmission() {
  const submission = new FlexibleArtistSubmission();
  
  try {
    console.log('🎨 유연한 작가 제출 시스템 데모\n');
    
    // 1. 테이블 생성
    await createSubmissionTable();
    
    // 2. 템플릿 보기
    console.log('📋 유연한 제출 템플릿:');
    const template = submission.generateFlexibleTemplate();
    console.log(JSON.stringify(template.required, null, 2));
    console.log('나머지는 모두 선택사항...\n');
    
    // 3. 예시들 보기
    console.log('💡 제출 시나리오 예시:');
    const examples = submission.getSubmissionExamples();
    
    console.log('\n1️⃣ 최소 정보 (이름만):');
    console.log(JSON.stringify(examples.minimal, null, 2));
    
    console.log('\n2️⃣ 누락된 유명 작가 제보:');
    console.log(JSON.stringify(examples.famous_missing, null, 2));
    
    console.log('\n📝 실제 테스트를 원하시면:');
    console.log('node flexible-artist-submission.js --test');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

async function testFlexibleSubmission() {
  const submission = new FlexibleArtistSubmission();
  
  try {
    // 테이블 생성
    await createSubmissionTable();
    
    // 최소 정보로 테스트
    const result1 = await submission.submitArtistInfo({
      artist_name: "김무명작가",
      submitted_by_name: "미술 애호가",
      submission_reason: "missing_artist",
      additional_info: "이 작가에 대한 정보가 부족해서 등록 요청합니다"
    });
    
    console.log('1️⃣ 최소 정보 제출 결과:', result1);
    
    // 상세 정보로 테스트
    const result2 = await submission.submitArtistInfo({
      artist_name: "박현대미술",
      bio: "현대미술의 새로운 지평을 여는 작가",
      birth_year: 1985,
      nationality: "한국",
      specialties: ["설치미술", "비디오아트"],
      website_url: "https://parkmodern.com",
      social_links: {
        instagram: "@park_modern_art"
      },
      submitted_by_name: "박현대미술",
      submission_reason: "self_registration",
      additional_info: "작가 본인이 직접 등록합니다. 이메일은 없고 인스타그램으로 연락 가능합니다."
    });
    
    console.log('\n2️⃣ 상세 정보 제출 결과:', result2);
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  if (process.argv.includes('--test')) {
    testFlexibleSubmission();
  } else {
    demonstrateFlexibleSubmission();
  }
}

module.exports = FlexibleArtistSubmission;