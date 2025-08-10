const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyKukjeExhibitions() {
  try {
    console.log('=== 국제갤러리 전시 데이터 검증 시작 ===\n');
    
    // 1. exhibitions 테이블에 저장된 국제갤러리 전시 총 개수 확인
    console.log('1. 국제갤러리 전시 총 개수 확인...');
    const { data: allKukje, count: totalCount, error: countError } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact' })
      .eq('venue_name', '국제갤러리');
    
    if (countError) {
      console.error('❌ 개수 확인 실패:', countError.message);
      return;
    }
    
    console.log(`✅ 국제갤러리 전시 총 개수: ${totalCount}개\n`);
    
    if (totalCount === 0) {
      console.log('⚠️  국제갤러리 전시가 하나도 없습니다. import 스크립트를 실행해야 합니다.\n');
      return;
    }
    
    // 2. venue 정보가 올바르게 저장되었는지 확인
    console.log('2. venue 정보 검증...');
    const venueInfo = allKukje.reduce((acc, exhibition) => {
      const key = `${exhibition.venue_name}-${exhibition.venue_city}-${exhibition.venue_country}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(venueInfo).forEach(([key, count]) => {
      const [name, city, country] = key.split('-');
      console.log(`  - ${name}, ${city}, ${country}: ${count}개`);
    });
    
    const correctVenue = allKukje.filter(ex => 
      ex.venue_name === '국제갤러리' && 
      ex.venue_city === '서울' && 
      ex.venue_country === 'KR'
    ).length;
    
    console.log(`✅ 올바른 venue 정보: ${correctVenue}/${totalCount}개\n`);
    
    // 3. 필수 필드들이 모두 채워져 있는지 확인
    console.log('3. 필수 필드 검증...');
    const fieldValidation = {
      title_en: allKukje.filter(ex => ex.title_en && ex.title_en.trim()).length,
      start_date: allKukje.filter(ex => ex.start_date).length,
      end_date: allKukje.filter(ex => ex.end_date).length,
      artists: allKukje.filter(ex => ex.artists && Array.isArray(ex.artists) && ex.artists.length > 0).length
    };
    
    Object.entries(fieldValidation).forEach(([field, validCount]) => {
      const status = validCount === totalCount ? '✅' : '⚠️';
      console.log(`  ${status} ${field}: ${validCount}/${totalCount}개`);
    });
    console.log('');
    
    // 4. 최근 import된 전시 5개의 상세 정보 출력
    console.log('4. 최근 전시 5개 상세 정보...');
    const { data: recentExhibitions } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('venue_name', '국제갤러리')
      .order('created_at', { ascending: false })
      .limit(5);
    
    recentExhibitions?.forEach((ex, index) => {
      console.log(`\n--- 전시 ${index + 1} ---`);
      console.log(`제목(영문): ${ex.title_en}`);
      console.log(`제목(한국어): ${ex.title_local || 'N/A'}`);
      console.log(`기간: ${ex.start_date} ~ ${ex.end_date}`);
      console.log(`상태: ${ex.status}`);
      console.log(`작가: ${ex.artists?.map(a => a.name || a).join(', ') || 'N/A'}`);
      console.log(`설명: ${ex.description?.substring(0, 100) || 'N/A'}${ex.description?.length > 100 ? '...' : ''}`);
      console.log(`생성일: ${ex.created_at}`);
    });
    
    // 5. 데이터 무결성 문제 확인
    console.log('\n5. 데이터 무결성 문제 확인...');
    const issues = [];
    
    // 제목이 없는 전시
    const noTitle = allKukje.filter(ex => !ex.title_en || ex.title_en.trim() === '');
    if (noTitle.length > 0) {
      issues.push(`제목 누락: ${noTitle.length}개`);
    }
    
    // 날짜가 잘못된 전시 (종료일이 시작일보다 이른 경우)
    const invalidDates = allKukje.filter(ex => 
      ex.start_date && ex.end_date && new Date(ex.end_date) < new Date(ex.start_date)
    );
    if (invalidDates.length > 0) {
      issues.push(`잘못된 날짜: ${invalidDates.length}개`);
      invalidDates.forEach(ex => {
        console.log(`  ⚠️  ${ex.title_en}: ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 중복 전시 (같은 제목)
    const titleCounts = allKukje.reduce((acc, ex) => {
      acc[ex.title_en] = (acc[ex.title_en] || 0) + 1;
      return acc;
    }, {});
    const duplicates = Object.entries(titleCounts).filter(([title, count]) => count > 1);
    if (duplicates.length > 0) {
      issues.push(`중복 전시: ${duplicates.length}개 제목`);
      duplicates.forEach(([title, count]) => {
        console.log(`  ⚠️  "${title}": ${count}개`);
      });
    }
    
    if (issues.length === 0) {
      console.log('✅ 데이터 무결성 문제 없음');
    } else {
      console.log('⚠️  발견된 문제:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // 6. 최종 요약
    console.log('\n=== 검증 결과 요약 ===');
    console.log(`총 전시 수: ${totalCount}개`);
    console.log(`올바른 venue 정보: ${correctVenue}/${totalCount}개`);
    console.log(`필수 필드 완성도:`);
    Object.entries(fieldValidation).forEach(([field, validCount]) => {
      const percentage = ((validCount / totalCount) * 100).toFixed(1);
      console.log(`  - ${field}: ${percentage}%`);
    });
    console.log(`데이터 무결성 문제: ${issues.length}개`);
    
  } catch (error) {
    console.error('❌ 검증 실패:', error);
  }
}

// 실행
verifyKukjeExhibitions();