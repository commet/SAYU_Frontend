// Supabase 직접 연결 테스트
require('dotenv').config({ path: './frontend/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 환경변수 확인:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다!');
  console.error('frontend/.env.local 파일을 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🚀 Supabase 연결 테스트 시작\n');

  try {
    // 1. artworks 테이블 확인
    console.log('1️⃣ artworks 테이블 조회...');
    const { data: artworks, error: artworksError, count } = await supabase
      .from('artworks')
      .select('*', { count: 'exact' })
      .limit(5);

    if (artworksError) {
      console.error('❌ artworks 테이블 조회 실패:', artworksError);
    } else {
      console.log('✅ artworks 테이블 조회 성공!');
      console.log(`   - 전체 작품 수: ${count}개`);
      console.log(`   - 조회된 작품: ${artworks.length}개`);
      if (artworks.length > 0) {
        console.log('   - 첫 번째 작품:', {
          title: artworks[0].title,
          artist: artworks[0].artist,
          style: artworks[0].style
        });
      }
    }
    console.log('');

    // 2. artwork_interactions 테이블 확인
    console.log('2️⃣ artwork_interactions 테이블 조회...');
    const { data: interactions, error: interactionsError } = await supabase
      .from('artwork_interactions')
      .select('*')
      .limit(5);

    if (interactionsError) {
      console.error('❌ artwork_interactions 테이블 조회 실패:', interactionsError);
    } else {
      console.log('✅ artwork_interactions 테이블 조회 성공!');
      console.log(`   - 조회된 상호작용: ${interactions.length}개`);
    }
    console.log('');

    // 3. 테이블 구조 확인 (컬럼 정보)
    console.log('3️⃣ artworks 테이블 구조 확인...');
    const { data: singleArtwork, error: structureError } = await supabase
      .from('artworks')
      .select('*')
      .limit(1)
      .single();

    if (!structureError && singleArtwork) {
      console.log('✅ artworks 테이블 컬럼:');
      Object.keys(singleArtwork).forEach(key => {
        const value = singleArtwork[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`   - ${key}: ${type}`);
      });
    }
    console.log('');

    // 4. RLS 정책 테스트
    console.log('4️⃣ RLS 정책 테스트...');
    const testUserId = 'test-user-' + Date.now();
    const testArtworkId = 'test-artwork-' + Date.now();

    // 테스트 작품 생성
    const { error: insertArtworkError } = await supabase
      .from('artworks')
      .insert({
        id: testArtworkId,
        title: 'RLS 테스트 작품',
        artist: '테스트 작가'
      });

    if (insertArtworkError) {
      console.log('ℹ️ 테스트 작품 생성 시도:', insertArtworkError.message);
    } else {
      console.log('✅ 테스트 작품 생성 성공');
    }

    // 작품 조회 (RLS로 인해 모든 사용자가 볼 수 있어야 함)
    const { data: testArtwork, error: selectError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', testArtworkId)
      .single();

    if (selectError) {
      console.log('ℹ️ RLS 정책으로 인한 조회 제한:', selectError.message);
    } else {
      console.log('✅ RLS 정책 확인: 작품 조회 가능');
    }

    console.log('\n=====================================');
    console.log('✨ Supabase 연결 테스트 완료!');
    console.log('=====================================');

  } catch (error) {
    console.error('\n❌ 예상치 못한 오류:', error);
  }
}

// 테스트 실행
testSupabaseConnection().catch(console.error);