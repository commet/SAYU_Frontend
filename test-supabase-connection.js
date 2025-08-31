#!/usr/bin/env node

/**
 * Supabase 연결 테스트
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔧 Supabase 연결 테스트 시작...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Service Key 존재: ${!!supabaseServiceKey}`);
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔄 테이블 목록 조회 중...');

    // 간단한 테이블 존재 확인
    const { data, error } = await supabase
      .from('exhibitions_translations')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      console.error('❌ 연결 실패:', error.message);
      console.error('상세 에러:', error);
    } else {
      console.log('✅ Supabase 연결 성공!');
      console.log(`📊 exhibitions_translations 테이블 레코드 수: ${data}`);
    }

    // DDP 전시 간단 조회
    console.log('🔄 DDP 전시 검색 중...');
    const { data: ddpData, error: ddpError } = await supabase
      .from('exhibitions_translations')
      .select('exhibition_title, venue_name')
      .eq('venue_name', 'DDP')
      .limit(5);

    if (ddpError) {
      console.error('❌ DDP 전시 검색 실패:', ddpError.message);
    } else {
      console.log(`✅ DDP 전시 발견: ${ddpData?.length || 0}개`);
      if (ddpData && ddpData.length > 0) {
        ddpData.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.exhibition_title}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 연결 테스트 중 오류:', error.message);
    console.error('스택:', error.stack);
  }
}

testConnection();