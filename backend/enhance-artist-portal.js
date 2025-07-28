const { Pool } = require('pg');
const ThreeAPTGenerator = require('./generateThreeAPTProfiles');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class EnhancedArtistPortal {
  constructor() {
    this.aptGenerator = new ThreeAPTGenerator();
  }

  /**
   * 신규 작가 등록 시 자동으로 기존 artists 테이블에도 추가
   */
  async syncNewArtistToMasterDB(artistProfileId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Artist Profile 정보 가져오기
      const profileResult = await client.query(`
        SELECT ap.*, u.email as user_email
        FROM artist_profiles ap
        JOIN users u ON ap.user_id = u.id
        WHERE ap.id = $1
      `, [artistProfileId]);

      if (profileResult.rows.length === 0) {
        throw new Error('Artist profile not found');
      }

      const profile = profileResult.rows[0];

      // 2. 기존 artists 테이블에 중복 확인
      const existingResult = await client.query(`
        SELECT id FROM artists WHERE LOWER(name) = LOWER($1)
      `, [profile.artist_name]);

      if (existingResult.rows.length > 0) {
        console.log(`⚠️ 작가 "${profile.artist_name}"는 이미 존재함`);
        return existingResult.rows[0].id;
      }

      // 3. APT 자동 생성
      const basicInfo = {
        name: profile.artist_name,
        bio: profile.bio,
        specialties: profile.specialties,
        website: profile.website_url,
        nationality: null, // 추후 확장 가능
        period: 'Contemporary'
      };

      const threeAPTs = this.aptGenerator.generateThreeAPTs(basicInfo);

      // dimensions 생성
      const primaryType = threeAPTs[0].type;
      const dimensions = {
        L: primaryType.includes('L') ? 70 : 30,
        S: primaryType.includes('S') ? 70 : 30,
        A: primaryType.includes('A') ? 70 : 30,
        R: primaryType.includes('R') ? 70 : 30,
        E: primaryType.includes('E') ? 70 : 30,
        M: primaryType.includes('M') ? 70 : 30,
        F: primaryType.includes('F') ? 70 : 30,
        C: primaryType.includes('C') ? 70 : 30
      };

      const aptProfile = {
        primary_types: threeAPTs,
        dimensions,
        meta: {
          analysis_method: 'artist_portal_submission',
          confidence: 'medium',
          generated_date: new Date().toISOString(),
          updated_to_three_apt: true,
          sources: ['artist_portal'],
          reasoning: '작가 포털 자체 등록 기반 APT 생성'
        }
      };

      // 4. artists 테이블에 추가
      const artistInsertResult = await client.query(`
        INSERT INTO artists (
          name, bio, importance_score, apt_profile
        ) VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [
        profile.artist_name,
        profile.bio,
        70, // 신규 작가 기본 중요도
        JSON.stringify(aptProfile)
      ]);

      const artistId = artistInsertResult.rows[0].id;

      // 5. artist_profiles에 연결 정보는 별도 관리 (metadata 컬럼 없음)

      await client.query('COMMIT');

      console.log(`✅ 신규 작가 "${profile.artist_name}" 마스터 DB 동기화 완료`);
      console.log(`   Profile ID: ${artistProfileId}`);
      console.log(`   Artist ID: ${artistId}`);
      console.log(`   APT: ${threeAPTs.map(t => t.type).join(' → ')}`);

      return artistId;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 승인된 작품을 artworks 테이블에 동기화
   */
  async syncApprovedArtworkToMasterDB(submittedArtworkId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. 제출된 작품 정보 가져오기
      const artworkResult = await client.query(`
        SELECT sa.*, 
               COALESCE(ap.artist_name, gp.gallery_name) as creator_name,
               ap.metadata->>'connected_artist_id' as connected_artist_id
        FROM submitted_artworks sa
        LEFT JOIN artist_profiles ap ON sa.artist_profile_id = ap.id
        LEFT JOIN gallery_profiles gp ON sa.gallery_profile_id = gp.id
        WHERE sa.id = $1 AND sa.submission_status = 'approved'
      `, [submittedArtworkId]);

      if (artworkResult.rows.length === 0) {
        throw new Error('Approved artwork not found');
      }

      const artwork = artworkResult.rows[0];

      // 2. artworks 테이블에 추가
      const artworkInsertResult = await client.query(`
        INSERT INTO artworks (
          title, artist_name, creation_year, medium, description,
          image_url, tags, style, subject_matter, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        artwork.title,
        artwork.artist_display_name || artwork.creator_name,
        artwork.creation_date ? new Date(artwork.creation_date).getFullYear() : null,
        artwork.medium,
        artwork.description,
        artwork.primary_image_url,
        artwork.tags || [],
        artwork.style,
        artwork.subject_matter || [],
        {
          source: 'artist_portal',
          submitted_artwork_id: submittedArtworkId,
          dimensions: artwork.dimensions,
          technique: artwork.technique,
          price_range: artwork.price_range,
          additional_images: artwork.additional_images,
          connected_artist_id: artwork.connected_artist_id
        }
      ]);

      const artworkId = artworkInsertResult.rows[0].id;

      // 3. 연결 artist가 있으면 artwork_artists 테이블에도 추가
      if (artwork.connected_artist_id) {
        await client.query(`
          INSERT INTO artwork_artists (artwork_id, artist_id, role)
          VALUES ($1, $2, 'creator')
          ON CONFLICT (artwork_id, artist_id) DO NOTHING
        `, [artworkId, artwork.connected_artist_id]);
      }

      // 4. submitted_artworks에 연결 정보는 별도 관리

      await client.query('COMMIT');

      console.log(`✅ 승인된 작품 "${artwork.title}" 마스터 DB 동기화 완료`);
      console.log(`   Submitted ID: ${submittedArtworkId}`);
      console.log(`   Artwork ID: ${artworkId}`);

      return artworkId;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 간단한 작가 정보 제출 폼 (최소 필수 정보만)
   */
  async createSimpleArtistSubmission(submissionData) {
    const {
      artist_name,
      contact_email,
      website_url = null,
      bio = null,
      specialties = [],
      social_links = {}
    } = submissionData;

    // 필수 검증
    if (!artist_name || !contact_email) {
      throw new Error('작가명과 연락처 이메일은 필수입니다');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. 임시 사용자 계정 생성 (또는 기존 확인)
      let userId;
      const existingUserResult = await client.query(`
        SELECT id FROM users WHERE email = $1
      `, [contact_email]);

      if (existingUserResult.rows.length > 0) {
        userId = existingUserResult.rows[0].id;
      } else {
        // 임시 사용자 생성
        const userInsertResult = await client.query(`
          INSERT INTO users (email, username)
          VALUES ($1, $2)
          RETURNING id
        `, [contact_email, artist_name.toLowerCase().replace(/\s+/g, '_')]);

        userId = userInsertResult.rows[0].id;
      }

      // 2. Artist Profile 생성
      const profileInsertResult = await client.query(`
        INSERT INTO artist_profiles (
          user_id, artist_name, bio, website_url, 
          contact_email, specialties, social_links, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING id
      `, [
        userId, artist_name, bio, website_url,
        contact_email, specialties, social_links
      ]);

      const profileId = profileInsertResult.rows[0].id;

      await client.query('COMMIT');

      console.log(`✅ 간단 작가 제출 완료: ${artist_name}`);
      console.log(`   Profile ID: ${profileId}`);
      console.log(`   상태: 승인 대기 중`);

      return {
        profileId,
        userId,
        status: 'pending',
        message: '작가 정보가 성공적으로 제출되었습니다. 관리자 승인 후 활성화됩니다.'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 작가 정보 템플릿 생성
   */
  generateArtistTemplate() {
    return {
      // 필수 정보
      required: {
        artist_name: '작가명 (예: 김사유)',
        contact_email: '연락처 이메일 (예: artist@example.com)'
      },

      // 기본 정보
      basic: {
        bio: '작가 소개 (선택사항)',
        website_url: '웹사이트 주소 (선택사항)',
        specialties: ['회화', '조각', '설치미술'] // 예시
      },

      // 상세 정보 (선택사항)
      detailed: {
        social_links: {
          instagram: '인스타그램 주소',
          facebook: '페이스북 주소',
          twitter: '트위터 주소'
        },
        phone: '전화번호',
        address: '주소',
        profile_image_url: '프로필 이미지 URL',
        banner_image_url: '배너 이미지 URL'
      },

      // 자동 생성될 항목들
      auto_generated: {
        apt_profile: '3개 APT 자동 생성',
        importance_score: '초기 70점 부여',
        status: '승인 대기 상태'
      }
    };
  }
}

async function demonstrateArtistPortal() {
  const portal = new EnhancedArtistPortal();

  try {
    console.log('🎨 Artist Portal 시스템 데모\n');

    // 1. 템플릿 보기
    console.log('📋 작가 정보 제출 템플릿:');
    const template = portal.generateArtistTemplate();
    console.log(JSON.stringify(template, null, 2));

    // 2. 간단한 작가 제출 예시
    console.log('\n✨ 간단 작가 제출 예시:');
    const simpleSubmission = {
      artist_name: '김현대',
      contact_email: 'kim.hyeondae@example.com',
      bio: '현대 미술 작가입니다. 주로 디지털 아트와 설치 미술 작업을 합니다.',
      specialties: ['디지털아트', '설치미술', '미디어아트'],
      website_url: 'https://kimhyeondae.art'
    };

    console.log('제출 데이터:', JSON.stringify(simpleSubmission, null, 2));

    console.log('\n📝 실제 제출을 원하시면 다음 명령어를 실행하세요:');
    console.log('node enhance-artist-portal.js --submit');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

async function submitTestArtist() {
  const portal = new EnhancedArtistPortal();

  try {
    const result = await portal.createSimpleArtistSubmission({
      artist_name: '김현대',
      contact_email: 'kim.hyeondae@test.com',
      bio: '현대 미술 작가입니다. 주로 디지털 아트와 설치 미술 작업을 합니다.',
      specialties: ['디지털아트', '설치미술', '미디어아트'],
      website_url: 'https://kimhyeondae.art',
      social_links: {
        instagram: '@kim_hyeondae_art'
      }
    });

    console.log('✅ 테스트 작가 제출 완료:', result);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 실행
if (require.main === module) {
  if (process.argv.includes('--submit')) {
    submitTestArtist();
  } else {
    demonstrateArtistPortal();
  }
}

module.exports = EnhancedArtistPortal;
