#!/usr/bin/env node

/**
 * SAYU - DDP 스펙트럴 크로싱스 전시 데이터 업데이트
 * 
 * 이 스크립트는 DDP의 "스펙트럴 크로싱스" 전시 정보를 
 * exhibitions_master와 exhibitions_translations 테이블에 업데이트합니다.
 */

// 환경 설정을 위한 path 모듈
const path = require('path');

// .env 파일 로드 (backend 디렉토리의 .env 파일 사용)
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const { getSupabaseAdmin } = require('./backend/src/config/supabase');
const { log } = require('./backend/src/config/logger');

async function updateSpectralCrossings() {
  try {
    log.info('스펙트럴 크로싱스 전시 데이터 업데이트 시작');

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new Error('Supabase admin client not available');
    }

    // 1단계: exhibitions_master 테이블 업데이트
    log.info('1단계: exhibitions_master 테이블 업데이트 중...');

    // 먼저 해당 전시의 exhibition_id를 찾기
    const { data: exhibitionData, error: findError } = await supabase
      .from('exhibitions_translations')
      .select('exhibition_id')
      .eq('venue_name', 'DDP')
      .eq('language_code', 'ko')
      .ilike('exhibition_title', '%스펙트럴%')
      .single();

    if (findError) {
      log.error('전시 찾기 실패:', findError);
      throw findError;
    }

    if (!exhibitionData) {
      log.error('스펙트럴 크로싱스 전시를 찾을 수 없습니다');
      throw new Error('Exhibition not found');
    }

    const exhibitionId = exhibitionData.exhibition_id;
    log.info(`찾은 전시 ID: ${exhibitionId}`);

    // exhibitions_master 업데이트
    const { data: masterUpdateData, error: masterUpdateError } = await supabase
      .from('exhibitions_master')
      .update({
        ticket_price_adult: 0,
        ticket_price_student: 0,
        genre: 'media',
        exhibition_type: 'group',
        updated_at: new Date().toISOString()
      })
      .eq('id', exhibitionId)
      .select();

    if (masterUpdateError) {
      log.error('exhibitions_master 업데이트 실패:', masterUpdateError);
      throw masterUpdateError;
    }

    log.info('exhibitions_master 업데이트 완료:', masterUpdateData);

    // 2단계: exhibitions_translations 한글 데이터 업데이트
    log.info('2단계: exhibitions_translations 한글 데이터 업데이트 중...');

    const { data: koUpdateData, error: koUpdateError } = await supabase
      .from('exhibitions_translations')
      .update({
        exhibition_title: '스펙트럴 크로싱스',
        subtitle: 'Spectral Crossings',
        artists: ['더 스웨이(THE SWAY)'],
        description: 'AI가 만든 얼굴과 형체 없는 감정의 흐름이 빛을 따라 움직이며 관객과 교차해 만나는 순간을 담아낸 미디어아트 전시. 144개의 크리스탈과 아나몰픽 미디어아트를 통해 감정의 빛이 현실 공간에 물리적으로 드러나는 몰입형 설치작품이다. 빛과 움직임으로 가득한 공간에서 관객은 타인의 감정 속에서 자신의 내면을 비추며 새로운 지각의 확장을 경험하게 된다.',
        operating_hours: '10:00~20:00',
        ticket_info: '무료',
        phone_number: '02-2153-0086',
        address: 'DDP 디자인랩 3층',
        website_url: 'http://www.the-sway.com/',
        updated_at: new Date().toISOString()
      })
      .eq('exhibition_id', exhibitionId)
      .eq('language_code', 'ko')
      .select();

    if (koUpdateError) {
      log.error('한글 번역 업데이트 실패:', koUpdateError);
      throw koUpdateError;
    }

    log.info('한글 번역 업데이트 완료:', koUpdateData);

    // 3단계: 영문 번역 추가 또는 업데이트
    log.info('3단계: 영문 번역 업데이트 중...');

    // 먼저 영문 번역이 존재하는지 확인
    const { data: existingEnData, error: checkEnError } = await supabase
      .from('exhibitions_translations')
      .select('id')
      .eq('exhibition_id', exhibitionId)
      .eq('language_code', 'en')
      .single();

    if (checkEnError && checkEnError.code !== 'PGRST116') {
      log.error('영문 번역 확인 실패:', checkEnError);
      throw checkEnError;
    }

    const englishTranslation = {
      exhibition_title: 'Spectral Crossings',
      artists: ['THE SWAY'],
      description: 'An immersive media art exhibition where AI-generated faces and formless emotional flows move along with light, creating moments of intersection with viewers. Through 144 crystals and anamorphic media art, emotional light physically manifests in real space. In this light-filled environment, viewers reflect on their inner selves through others\' emotions, experiencing an expansion of perception.',
      venue_name: 'DDP',
      city: 'Seoul',
      operating_hours: '10:00~20:00',
      ticket_info: 'Free',
      updated_at: new Date().toISOString()
    };

    let enResult;
    if (existingEnData) {
      // 기존 영문 번역 업데이트
      const { data: enUpdateData, error: enUpdateError } = await supabase
        .from('exhibitions_translations')
        .update(englishTranslation)
        .eq('exhibition_id', exhibitionId)
        .eq('language_code', 'en')
        .select();

      if (enUpdateError) {
        log.error('영문 번역 업데이트 실패:', enUpdateError);
        throw enUpdateError;
      }

      enResult = enUpdateData;
      log.info('영문 번역 업데이트 완료');
    } else {
      // 새로운 영문 번역 생성
      const { data: enInsertData, error: enInsertError } = await supabase
        .from('exhibitions_translations')
        .insert({
          exhibition_id: exhibitionId,
          language_code: 'en',
          created_at: new Date().toISOString(),
          ...englishTranslation
        })
        .select();

      if (enInsertError) {
        log.error('영문 번역 생성 실패:', enInsertError);
        throw enInsertError;
      }

      enResult = enInsertData;
      log.info('영문 번역 생성 완료');
    }

    log.info('영문 번역 결과:', enResult);

    // 4단계: 최종 확인
    log.info('4단계: 최종 업데이트 결과 확인 중...');

    const { data: finalData, error: finalError } = await supabase
      .from('exhibitions_translations')
      .select(`
        exhibition_id,
        language_code,
        exhibition_title,
        artists,
        venue_name,
        ticket_info
      `)
      .eq('exhibition_id', exhibitionId);

    if (finalError) {
      log.error('최종 확인 실패:', finalError);
      throw finalError;
    }

    log.info('최종 업데이트 결과:');
    finalData.forEach(record => {
      log.info(`  [${record.language_code}] ${record.exhibition_title} - ${record.venue_name} (${record.ticket_info})`);
    });

    log.info('✅ 스펙트럴 크로싱스 전시 데이터 업데이트 완료!');

    return {
      success: true,
      exhibitionId,
      updatedRecords: finalData.length,
      message: '모든 업데이트가 성공적으로 완료되었습니다.'
    };

  } catch (error) {
    log.error('❌ 스펙트럴 크로싱스 업데이트 실패:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  updateSpectralCrossings()
    .then(result => {
      if (result.success) {
        console.log('\n🎨 SUCCESS: 스펙트럴 크로싱스 전시 업데이트 완료');
        console.log(`📊 업데이트된 레코드 수: ${result.updatedRecords}`);
        console.log(`💬 메시지: ${result.message}`);
      } else {
        console.error('\n❌ ERROR: 업데이트 실패');
        console.error(`🔍 에러: ${result.error}`);
        if (result.stack) {
          console.error(`📚 스택 트레이스:\n${result.stack}`);
        }
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 FATAL ERROR:', error);
      process.exit(1);
    });
}

module.exports = { updateSpectralCrossings };