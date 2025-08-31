#!/usr/bin/env node

/**
 * 누락된 전시 #60-71 추가
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const { createClient } = require('@supabase/supabase-js');

async function addMissingExhibitions() {
  console.log('🎨 누락된 전시 추가 시작...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // SQL 파일 읽기
    const sqlContent = fs.readFileSync(path.join(__dirname, 'add-missing-exhibitions-60-71.sql'), 'utf8');
    
    // SQL 실행
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      // exec_sql 함수가 없을 수 있으므로 다른 방법 시도
      console.log('⚠️ exec_sql 함수가 없습니다. 직접 쿼리 실행...');
      
      // DO 블록을 개별 실행
      const sqlBlocks = sqlContent.split(/DO\s*\$/g).filter(block => block.trim());
      
      for (let i = 0; i < sqlBlocks.length; i++) {
        if (!sqlBlocks[i].includes('DECLARE')) continue;
        
        const fullBlock = 'DO $' + sqlBlocks[i];
        console.log(`\n📝 블록 ${i} 실행 중...`);
        
        // 직접 SQL 실행은 Supabase JS 클라이언트로는 제한적이므로
        // 대신 개별 INSERT 문으로 변환하여 실행
      }
      
      console.log('\n⚠️ Supabase JS 클라이언트로는 DO 블록 실행이 제한적입니다.');
      console.log('📋 대신 Supabase 대시보드의 SQL 에디터에서 다음 파일을 실행하세요:');
      console.log('   add-missing-exhibitions-60-71.sql');
      
      // 전시 개수 확인
      const { data: exhibitions, error: countError } = await supabase
        .from('exhibitions_master')
        .select('id', { count: 'exact', head: true });
        
      if (!countError) {
        console.log(`\n📊 현재 exhibitions_master 테이블의 전시 개수: ${exhibitions}`);
      }
      
      // 국립현대미술관 전시 확인
      const { data: mmcaExhibitions } = await supabase
        .from('exhibitions_translations')
        .select('exhibition_title')
        .eq('venue_name', '국립현대미술관 서울')
        .eq('language_code', 'ko');
        
      if (mmcaExhibitions) {
        console.log(`\n🏛️ 국립현대미술관 전시 목록 (${mmcaExhibitions.length}개):`);
        mmcaExhibitions.forEach(ex => {
          console.log(`   - ${ex.exhibition_title}`);
        });
      }
    } else {
      console.log('✅ SQL 실행 완료!');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

addMissingExhibitions();