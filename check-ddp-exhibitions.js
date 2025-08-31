#!/usr/bin/env node

/**
 * DDP 전시 데이터 확인 스크립트
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const { getSupabaseAdmin } = require('./backend/src/config/supabase');
const { log } = require('./backend/src/config/logger');

async function checkDDPExhibitions() {
  try {
    log.info('DDP 전시 데이터 확인 시작');

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new Error('Supabase admin client not available');
    }

    // DDP 관련 전시 검색
    log.info('DDP 전시 검색 중...');

    const { data: ddpExhibitions, error: searchError } = await supabase
      .from('exhibitions_translations')
      .select(`
        exhibition_id,
        language_code,
        exhibition_title,
        venue_name,
        artists
      `)
      .eq('venue_name', 'DDP');

    if (searchError) {
      log.error('DDP 전시 검색 실패:', searchError);
      throw searchError;
    }

    log.info(`찾은 DDP 전시 수: ${ddpExhibitions?.length || 0}`);

    if (ddpExhibitions && ddpExhibitions.length > 0) {
      ddpExhibitions.forEach((exhibition, index) => {
        log.info(`${index + 1}. [${exhibition.language_code}] ${exhibition.exhibition_title}`);
        log.info(`   - 전시 ID: ${exhibition.exhibition_id}`);
        log.info(`   - 작가: ${exhibition.artists?.join(', ') || 'N/A'}`);
      });
    } else {
      log.warn('DDP 전시를 찾을 수 없습니다.');
    }

    // 스펙트럴 관련 전시 검색 (더 넓은 검색)
    log.info('\n스펙트럴 관련 전시 검색 중...');

    const { data: spectralExhibitions, error: spectralError } = await supabase
      .from('exhibitions_translations')
      .select(`
        exhibition_id,
        language_code,
        exhibition_title,
        venue_name,
        artists
      `)
      .ilike('exhibition_title', '%스펙트럴%');

    if (spectralError) {
      log.error('스펙트럴 전시 검색 실패:', spectralError);
      throw spectralError;
    }

    log.info(`찾은 스펙트럴 전시 수: ${spectralExhibitions?.length || 0}`);

    if (spectralExhibitions && spectralExhibitions.length > 0) {
      spectralExhibitions.forEach((exhibition, index) => {
        log.info(`${index + 1}. [${exhibition.language_code}] ${exhibition.exhibition_title}`);
        log.info(`   - 전시 ID: ${exhibition.exhibition_id}`);
        log.info(`   - 장소: ${exhibition.venue_name}`);
        log.info(`   - 작가: ${exhibition.artists?.join(', ') || 'N/A'}`);
      });
    } else {
      log.warn('스펙트럴 전시를 찾을 수 없습니다.');
    }

    // 전체 전시 수 확인
    const { count: totalExhibitions, error: countError } = await supabase
      .from('exhibitions_translations')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      log.info(`\n총 전시 번역 레코드 수: ${totalExhibitions}`);
    }

    return {
      success: true,
      ddpExhibitions,
      spectralExhibitions,
      totalExhibitions
    };

  } catch (error) {
    log.error('❌ DDP 전시 확인 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  checkDDPExhibitions()
    .then(result => {
      if (result.success) {
        console.log('\n✅ DDP 전시 확인 완료');
      } else {
        console.error('\n❌ ERROR:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 FATAL ERROR:', error);
      process.exit(1);
    });
}

module.exports = { checkDDPExhibitions };