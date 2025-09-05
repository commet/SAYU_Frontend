// SAYU Exhibition Migration Resume Helper
// 작업 재개 시 실행하여 현재 상태 확인

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigrationStatus() {
  console.log('📊 SAYU Exhibition Migration Status Check\n');
  console.log('=' . repeat(50));
  
  try {
    // 1. Check venues status
    const { count: venuesCount } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n📍 Venues 테이블 상태:');
    console.log(`  총 venue 수: ${venuesCount}개`);
    
    // 2. Check exhibitions status
    const { count: totalExhibitions } = await supabase
      .from('exhibitions_master')
      .select('*', { count: 'exact', head: true });
    
    const { count: exhibitionsWithVenue } = await supabase
      .from('exhibitions_master')
      .select('*', { count: 'exact', head: true })
      .not('venue_id', 'is', null);
    
    const { count: exhibitionsWithInstagram } = await supabase
      .from('exhibitions_master')
      .select('*', { count: 'exact', head: true })
      .not('instagram_url', 'is', null);
    
    console.log('\n🎨 Exhibitions 상태:');
    console.log(`  총 전시 수: ${totalExhibitions}개`);
    console.log(`  venue 연결된 전시: ${exhibitionsWithVenue}개`);
    console.log(`  Instagram URL 있는 전시: ${exhibitionsWithInstagram}개`);
    
    // 3. Check September exhibitions
    const { data: septExhibitions } = await supabase
      .from('exhibitions_master')
      .select(`
        id,
        start_date,
        end_date,
        source_url,
        instagram_url,
        venue:venues(name)
      `)
      .gte('start_date', '2025-09-01')
      .order('start_date');
    
    console.log('\n📅 9월 이후 시작 전시:');
    console.log(`  총 ${septExhibitions?.length || 0}개 전시`);
    
    if (septExhibitions && septExhibitions.length > 0) {
      console.log('\n  상세 목록:');
      septExhibitions.slice(0, 10).forEach((ex, idx) => {
        console.log(`  ${idx + 1}. ${ex.venue?.name || 'Unknown'}`);
        console.log(`     기간: ${ex.start_date} ~ ${ex.end_date}`);
        console.log(`     URLs: ${ex.source_url ? '✓' : '✗'} Web | ${ex.instagram_url ? '✓' : '✗'} Instagram`);
      });
      
      if (septExhibitions.length > 10) {
        console.log(`  ... 외 ${septExhibitions.length - 10}개 전시`);
      }
    }
    
    // 4. Check recent additions
    const { data: recentExhibitions } = await supabase
      .from('exhibitions_master')
      .select('id, created_at, source_url')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('\n🆕 최근 추가된 전시:');
    recentExhibitions?.forEach((ex) => {
      const date = new Date(ex.created_at).toLocaleDateString('ko-KR');
      console.log(`  ID ${ex.id}: ${date} - ${ex.source_url || 'No URL'}`);
    });
    
    // 5. Next steps
    console.log('\n' + '=' . repeat(50));
    console.log('\n📝 다음 작업:');
    console.log('1. exhibitions-sept-batch1.sql 완성 (2-5번 전시 정보 추가)');
    console.log('2. exhibitions-sept-batch2.sql 생성 (6-10번 전시)');
    console.log('3. 나머지 batch 파일들 순차적으로 생성');
    console.log('\n💡 작업 재개 명령:');
    console.log('  "exhibitions-sept-batch1.sql 파일의 2-5번 전시 정보 추가해줘"');
    console.log('  또는');
    console.log('  "9월 전시 목록 다시 보여줘"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run status check
checkMigrationStatus();