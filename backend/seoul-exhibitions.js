#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getSeoulExhibitions() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        COALESCE(e.title_local, e.title_en) as title,
        e.start_date,
        e.end_date,
        e.venue_name,
        e.artists,
        e.exhibition_type,
        e.description,
        e.official_url,
        e.ticket_price,
        v.name as venue_full_name,
        v.address,
        v.phone,
        v.website,
        v.rating,
        v.review_count,
        v.opening_hours,
        v.admission_fee,
        CASE 
          WHEN e.start_date <= CURRENT_DATE AND e.end_date >= CURRENT_DATE THEN '진행중'
          WHEN e.start_date > CURRENT_DATE THEN '예정'
          ELSE '종료'
        END as current_status
      FROM exhibitions e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.venue_city = '서울' 
        AND (e.end_date >= CURRENT_DATE OR e.start_date >= CURRENT_DATE - INTERVAL '30 days')
      ORDER BY 
        CASE 
          WHEN e.start_date <= CURRENT_DATE AND e.end_date >= CURRENT_DATE THEN 1
          WHEN e.start_date > CURRENT_DATE THEN 2
          ELSE 3
        END,
        e.start_date DESC
      LIMIT 10
    `);
    
    console.log('🎨 서울 주요 전시 현황 (최근 & 진행중)');
    console.log('='.repeat(80));
    console.log();
    
    result.rows.forEach((exhibition, index) => {
      const startDate = new Date(exhibition.start_date).toLocaleDateString('ko-KR');
      const endDate = new Date(exhibition.end_date).toLocaleDateString('ko-KR');
      const statusEmoji = exhibition.current_status === '진행중' ? '🟢' : exhibition.current_status === '예정' ? '🔵' : '🔴';
      
      console.log(`${index + 1}. ${statusEmoji} ${exhibition.title}`);
      console.log(`   📅 ${startDate} ~ ${endDate} (${exhibition.current_status})`);
      console.log(`   🏛️  ${exhibition.venue_name}`);
      
      if (exhibition.artists && Array.isArray(exhibition.artists) && exhibition.artists.length > 0) {
        console.log(`   🎨 작가: ${exhibition.artists.join(', ')}`);
      }
      
      if (exhibition.venue_full_name) {
        console.log(`   📍 주소: ${exhibition.address || 'N/A'}`);
        if (exhibition.phone) console.log(`   📞 전화: ${exhibition.phone}`);
        if (exhibition.website) console.log(`   🌐 웹사이트: ${exhibition.website}`);
        if (exhibition.rating) {
          console.log(`   ⭐ 평점: ${exhibition.rating}/5.0 (${exhibition.review_count?.toLocaleString() || 0}개 리뷰)`);
        }
        
        // 운영시간 정보
        if (exhibition.opening_hours) {
          try {
            const hours = JSON.parse(exhibition.opening_hours);
            if (hours.weekday_text) {
              console.log(`   🕐 운영시간: ${hours.weekday_text[0]} 등`);
            } else if (typeof hours === 'object') {
              const todayHours = hours.tuesday || '정보 없음';
              console.log(`   🕐 운영시간: ${todayHours}`);
            }
          } catch (e) {
            // JSON 파싱 실패시 무시
          }
        }
        
        // 입장료 정보
        if (exhibition.admission_fee) {
          try {
            const fee = JSON.parse(exhibition.admission_fee);
            if (fee.adult !== undefined) {
              console.log(`   💰 입장료: 성인 ${fee.adult === 0 ? '무료' : fee.adult + '원'}`);
            } else if (fee.note) {
              console.log(`   💰 입장료: ${fee.note}`);
            }
          } catch (e) {
            // JSON 파싱 실패시 무시
          }
        }
      }
      console.log();
    });
    
    if (result.rows.length === 0) {
      console.log('현재 서울에서 진행중이거나 예정된 주요 전시가 없습니다.');
      console.log('데이터베이스에 더 많은 실시간 전시 정보를 추가해야 할 것 같습니다.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  getSeoulExhibitions();
}