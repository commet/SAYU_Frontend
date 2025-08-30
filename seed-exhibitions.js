// Supabase 전시 샘플 데이터 추가 스크립트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffjasggfifzxnsuagiml.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmamFzZ2dmaWZ6eG5zdWFnaW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MTM0NjUsImV4cCI6MjA0OTA4OTQ2NX0.SPEJrzOrxvxjZkBNOLXBD9oRN4AQF4E8H8hv-jzqOTI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedExhibitions() {
  const today = new Date();
  
  // 샘플 전시 데이터
  const exhibitions = [
    // 현재 진행중인 전시들
    {
      title_local: '색채의 향연',
      title_en: 'Festival of Colors',
      artist_name: '김민수',
      venue_name: '서울시립미술관',
      start_date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 전 시작
      end_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 후 종료
      admission_fee: 15000,
      description: '현대 추상화의 새로운 지평을 여는 전시',
      tags: ['추상', '현대미술', '회화'],
      image_url: 'https://picsum.photos/800/600?random=1',
      is_free: false,
      popularity_score: 95
    },
    {
      title_local: '추상 표현주의의 재발견',
      title_en: 'Rediscovering Abstract Expressionism',
      artist_name: '이정희',
      venue_name: '국립현대미술관',
      start_date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      admission_fee: 0,
      description: '추상 표현주의의 역사와 현재를 조명',
      tags: ['추상표현주의', '무료전시', '교육'],
      image_url: 'https://picsum.photos/800/600?random=2',
      is_free: true,
      popularity_score: 88
    },
    {
      title_local: '감성의 여정',
      title_en: 'Journey of Emotions',
      artist_name: '박서연',
      venue_name: '예술의전당',
      start_date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      admission_fee: 20000,
      description: '감정을 색으로 표현한 대형 설치 작품',
      tags: ['설치미술', '감성', '체험형'],
      image_url: 'https://picsum.photos/800/600?random=3',
      is_free: false,
      popularity_score: 92
    },
    {
      title_local: '빛과 그림자',
      title_en: 'Light and Shadow',
      artist_name: '최영진',
      venue_name: '대림미술관',
      start_date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      admission_fee: 0,
      description: '빛을 활용한 미디어 아트 전시',
      tags: ['미디어아트', '빛', '무료'],
      image_url: 'https://picsum.photos/800/600?random=4',
      is_free: true,
      popularity_score: 78
    },
    // 곧 시작할 전시들
    {
      title_local: '디지털 르네상스',
      title_en: 'Digital Renaissance',
      artist_name: '한지원',
      venue_name: '리움미술관',
      start_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3일 후 시작
      end_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      admission_fee: 25000,
      description: 'AI와 예술의 만남',
      tags: ['디지털아트', 'AI', '미래'],
      image_url: 'https://picsum.photos/800/600?random=5',
      is_free: false,
      popularity_score: 85
    },
    {
      title_local: '자연의 소리',
      title_en: 'Sounds of Nature',
      artist_name: '정수민',
      venue_name: '아트센터 나비',
      start_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      admission_fee: 0,
      description: '자연과 사운드 아트의 조화',
      tags: ['사운드아트', '자연', '무료', '체험'],
      image_url: 'https://picsum.photos/800/600?random=6',
      is_free: true,
      popularity_score: 72
    },
    // 지난 전시 (참고용)
    {
      title_local: '과거의 흔적',
      title_en: 'Traces of the Past',
      artist_name: '김동현',
      venue_name: '아모레퍼시픽미술관',
      start_date: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10일 전 종료
      admission_fee: 18000,
      description: '시간의 흐름을 담은 사진전',
      tags: ['사진', '역사', '기록'],
      image_url: 'https://picsum.photos/800/600?random=7',
      is_free: false,
      popularity_score: 68
    }
  ];

  console.log('전시 데이터 추가 시작...');
  
  for (const exhibition of exhibitions) {
    try {
      const { data, error } = await supabase
        .from('exhibitions')
        .insert(exhibition)
        .select();
        
      if (error) {
        console.error(`오류 - ${exhibition.title_local}:`, error);
      } else {
        console.log(`✓ 추가됨: ${exhibition.title_local} (${exhibition.start_date} ~ ${exhibition.end_date})`);
      }
    } catch (err) {
      console.error(`실패 - ${exhibition.title_local}:`, err);
    }
  }
  
  console.log('\n전시 데이터 추가 완료!');
  
  // 추가된 데이터 확인
  const { count } = await supabase
    .from('exhibitions')
    .select('*', { count: 'exact', head: true });
    
  console.log(`\n총 ${count}개의 전시가 데이터베이스에 있습니다.`);
}

seedExhibitions().catch(console.error);