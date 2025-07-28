#!/usr/bin/env node
require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function processExhibitionImages(folderPath) {
  console.log('🖼️ 문화포털 전시 이미지 처리 시작...\n');
  console.log(`📁 폴더 경로: ${folderPath}\n`);

  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // 폴더의 모든 이미지 파일 읽기
    const files = await fs.readdir(folderPath);
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
    );

    console.log(`📷 발견된 이미지 파일: ${imageFiles.length}개\n`);

    const exhibitions = [];
    const errors = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const imagePath = path.join(folderPath, imageFile);

      console.log(`\n[${i + 1}/${imageFiles.length}] 처리 중: ${imageFile}`);

      try {
        // 이미지를 base64로 인코딩
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');

        // OpenAI Vision API로 전시 정보 추출
        const exhibitionInfo = await extractExhibitionFromImage(openai, base64Image, imageFile);

        if (exhibitionInfo && exhibitionInfo.title) {
          // 중복 확인
          const isDuplicate = await checkExhibitionDuplicate(exhibitionInfo);

          if (!isDuplicate) {
            // 데이터베이스에 저장
            const savedId = await saveExhibitionToDB(exhibitionInfo);
            exhibitions.push({ ...exhibitionInfo, id: savedId, sourceFile: imageFile });

            console.log(`✅ "${exhibitionInfo.title}" 저장 완료 (ID: ${savedId})`);
          } else {
            console.log(`⚠️  "${exhibitionInfo.title}" 이미 존재함 (중복)`);
          }
        } else {
          console.log(`❌ ${imageFile}에서 전시 정보를 추출할 수 없음`);
        }

        // API 호출 제한을 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ ${imageFile} 처리 실패:`, error.message);
        errors.push({ file: imageFile, error: error.message });
      }
    }

    console.log('\n\n📊 처리 결과:');
    console.log(`총 ${imageFiles.length}개 이미지 처리`);
    console.log(`성공: ${exhibitions.length}개`);
    console.log(`오류: ${errors.length}개`);

    if (exhibitions.length > 0) {
      console.log('\n✨ 추가된 전시:');
      exhibitions.forEach(ex => {
        console.log(`- ${ex.title} (${ex.venue}) [${ex.startDate} ~ ${ex.endDate}]`);
      });
    }

    if (errors.length > 0) {
      console.log('\n💥 오류 목록:');
      errors.forEach(err => {
        console.log(`- ${err.file}: ${err.error}`);
      });
    }

    return { exhibitions, errors };

  } catch (error) {
    console.error('오류 발생:', error);
    throw error;
  }
}

async function extractExhibitionFromImage(openai, base64Image, filename) {
  const prompt = `이 이미지는 미술관이나 갤러리의 전시 정보를 담고 있는 포스터나 웹페이지 캡쳐입니다. 
다음 정보를 JSON 형식으로 정확히 추출해주세요:

{
  "title": "전시명 (한글)",
  "titleEn": "전시명 (영문, 있는 경우)",
  "venue": "전시 장소명",
  "address": "주소 (있는 경우)",
  "startDate": "시작일 (YYYY-MM-DD 형식)",
  "endDate": "종료일 (YYYY-MM-DD 형식)",
  "openingHours": "관람시간",
  "admissionFee": "관람료 (숫자만, 무료인 경우 0)",
  "artists": ["참여작가1", "참여작가2"],
  "description": "전시 설명",
  "contact": "문의처 (전화번호나 웹사이트)",
  "organizer": "주최/주관",
  "category": "전시 카테고리 (개인전/기획전/특별전 등)"
}

만약 정보가 없거나 불명확한 경우 null을 사용해주세요.
날짜는 반드시 YYYY-MM-DD 형식으로 통일해주세요.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const { content } = response.choices[0].message;

    // JSON 추출 (마크다운 코드 블록 제거)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const exhibitionData = JSON.parse(jsonStr);

      // 데이터 검증 및 정제
      return validateAndCleanExhibitionData(exhibitionData, filename);
    }

    return null;

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    return null;
  }
}

function validateAndCleanExhibitionData(data, filename) {
  // 필수 필드 검증
  if (!data.title || !data.venue) {
    return null;
  }

  // 날짜 형식 정규화
  data.startDate = normalizeDate(data.startDate);
  data.endDate = normalizeDate(data.endDate);

  // 관람료 정규화
  data.admissionFee = normalizeAdmissionFee(data.admissionFee);

  // 작가 배열 정규화
  if (data.artists && !Array.isArray(data.artists)) {
    data.artists = [data.artists];
  }

  // 메타데이터 추가
  data.source = 'image_extraction';
  data.sourceFile = filename;
  data.extractedAt = new Date().toISOString();

  return data;
}

function normalizeDate(dateStr) {
  if (!dateStr) return null;

  try {
    // 다양한 날짜 형식 처리
    const patterns = [
      /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/,
      /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
      /(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})/
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        let year, month, day;

        if (match[1].length === 4) {
          [, year, month, day] = match;
        } else {
          [, month, day, year] = match;
        }

        const date = new Date(year, month - 1, day);
        return date.toISOString().split('T')[0];
      }
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeAdmissionFee(feeStr) {
  if (!feeStr) return 0;

  if (typeof feeStr === 'number') return feeStr;

  if (typeof feeStr === 'string') {
    if (feeStr.includes('무료') || feeStr.toLowerCase().includes('free')) {
      return 0;
    }

    const match = feeStr.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
  }

  return 0;
}

async function checkExhibitionDuplicate(exhibitionData) {
  try {
    const result = await pool.query(
      'SELECT id FROM exhibitions WHERE title = $1 AND venue_name = $2 AND start_date = $3',
      [exhibitionData.title, exhibitionData.venue, exhibitionData.startDate]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('중복 확인 오류:', error);
    return false;
  }
}

async function saveExhibitionToDB(exhibitionData) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. 장소 찾기 또는 생성
    let venue = await client.query('SELECT * FROM venues WHERE name = $1', [exhibitionData.venue]);

    if (venue.rows.length === 0) {
      const newVenue = await client.query(`
        INSERT INTO venues (name, address, city, country, type, tier, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        exhibitionData.venue,
        exhibitionData.address || '',
        '서울', // 기본값
        'KR',
        'gallery',
        3,
        true
      ]);
      venue = newVenue;
    }

    // 2. 전시 생성
    const exhibition = await client.query(`
      INSERT INTO exhibitions (
        title, title_en, description, venue_id, venue_name, venue_city,
        start_date, end_date, admission_fee, opening_hours, contact_info,
        organizer, category, source, source_file, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING id
    `, [
      exhibitionData.title,
      exhibitionData.titleEn,
      exhibitionData.description,
      venue.rows[0].id,
      exhibitionData.venue,
      venue.rows[0].city,
      exhibitionData.startDate,
      exhibitionData.endDate,
      exhibitionData.admissionFee,
      exhibitionData.openingHours,
      exhibitionData.contact,
      exhibitionData.organizer,
      exhibitionData.category,
      exhibitionData.source,
      exhibitionData.sourceFile,
      determineExhibitionStatus(exhibitionData.startDate, exhibitionData.endDate)
    ]);

    // 3. 작가 정보 저장
    if (exhibitionData.artists && exhibitionData.artists.length > 0) {
      for (const artistName of exhibitionData.artists) {
        if (artistName && artistName.trim()) {
          await linkArtistToExhibition(client, exhibition.rows[0].id, artistName.trim());
        }
      }
    }

    await client.query('COMMIT');
    return exhibition.rows[0].id;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function linkArtistToExhibition(client, exhibitionId, artistName) {
  // 아티스트 찾기 또는 생성
  let artist = await client.query('SELECT id FROM artists WHERE name = $1', [artistName]);

  if (artist.rows.length === 0) {
    const newArtist = await client.query(
      'INSERT INTO artists (name, source, created_at) VALUES ($1, $2, NOW()) RETURNING id',
      [artistName, 'image_extraction']
    );
    artist = newArtist;
  }

  // 전시-아티스트 연결
  await client.query(
    'INSERT INTO exhibition_artists (exhibition_id, artist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [exhibitionId, artist.rows[0].id]
  );
}

function determineExhibitionStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'unknown';

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}

// 사용법
if (process.argv.length < 3) {
  console.log('사용법: node process-exhibition-images.js <이미지_폴더_경로>');
  console.log('예시: node process-exhibition-images.js "C:\\Users\\SAMSUNG\\Documents\\exhibition-captures"');
  process.exit(1);
}

const folderPath = process.argv[2];
processExhibitionImages(folderPath)
  .then(() => {
    console.log('\n✨ 이미지 처리 완료!');
    process.exit(0);
  })
  .catch(error => {
    console.error('실행 오류:', error);
    process.exit(1);
  });
