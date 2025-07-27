#!/usr/bin/env node
/**
 * Cleanup Duplicates - 중복 데이터 정리
 * 완전히 잘못된 중복 데이터들을 정리합니다
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function cleanupDuplicates() {
  console.log('🧹 중복 데이터 정리 시작...');
  
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  // 각 테이블별 중복 정리
  const tables = ['artists', 'global_venues', 'venues'];
  
  for (const tableName of tables) {
    console.log(`\n📋 ${tableName} 중복 정리...`);
    
    try {
      // 모든 데이터 삭제하고 다시 시작
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 데이터 삭제
      
      if (deleteError) {
        console.log(`❌ ${tableName} 삭제 오류:`, deleteError.message);
      } else {
        console.log(`✅ ${tableName} 모든 데이터 삭제 완료`);
        
        // 카운트 확인
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        console.log(`📊 ${tableName} 현재 레코드 수: ${count}`);
      }
      
    } catch (error) {
      console.log(`❌ ${tableName} 정리 중 오류:`, error.message);
    }
  }
  
  console.log('\n🎯 중복 정리 완료! 이제 원본 데이터를 다시 로드해야 합니다.');
}

cleanupDuplicates().catch(console.error);