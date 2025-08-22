const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk'
);

async function checkExhibitions() {
  try {
    // 이불 전시 찾기
    const { data: leebul } = await supabase
      .from('exhibitions')
      .select('*')
      .or('title.ilike.%이불%,description.ilike.%이불%,venue_name.ilike.%리움%')
      .limit(5);
    
    console.log('\n🎨 이불 관련 전시:');
    if (leebul && leebul.length > 0) {
      leebul.forEach(ex => {
        console.log(`- ${ex.title || ex.description}`);
        console.log(`  장소: ${ex.venue_name}`);
        console.log(`  기간: ${ex.start_date} ~ ${ex.end_date}`);
      });
    } else {
      console.log('  찾을 수 없음');
    }

    // 오랑주리 전시 찾기
    const { data: orangerie } = await supabase
      .from('exhibitions')
      .select('*')
      .or('title.ilike.%오랑주리%,description.ilike.%오랑주리%,title.ilike.%세잔%,title.ilike.%르누아르%,venue_name.ilike.%예술의전당%,venue_name.ilike.%한가람%')
      .limit(5);
    
    console.log('\n🎨 오랑주리/세잔/르누아르 관련 전시:');
    if (orangerie && orangerie.length > 0) {
      orangerie.forEach(ex => {
        console.log(`- ${ex.title || ex.description}`);
        console.log(`  장소: ${ex.venue_name}`);
        console.log(`  기간: ${ex.start_date} ~ ${ex.end_date}`);
      });
    } else {
      console.log('  찾을 수 없음');
    }

    // 김창열 전시 찾기
    const { data: kimChangYeol } = await supabase
      .from('exhibitions')
      .select('*')
      .or('title.ilike.%김창열%,description.ilike.%김창열%,title.ilike.%물방울%,venue_name.ilike.%국립현대%')
      .limit(5);
    
    console.log('\n🎨 김창열 관련 전시:');
    if (kimChangYeol && kimChangYeol.length > 0) {
      kimChangYeol.forEach(ex => {
        console.log(`- ${ex.title || ex.description}`);
        console.log(`  장소: ${ex.venue_name}`);
        console.log(`  기간: ${ex.start_date} ~ ${ex.end_date}`);
      });
    } else {
      console.log('  찾을 수 없음');
    }

    // 최근 전시 확인
    const { data: recent } = await supabase
      .from('exhibitions')
      .select('*')
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(10);
    
    console.log('\n📅 현재 진행중/예정 전시:');
    if (recent && recent.length > 0) {
      recent.forEach(ex => {
        console.log(`- ${ex.title || ex.description}`);
        console.log(`  장소: ${ex.venue_name}`);
        console.log(`  기간: ${ex.start_date} ~ ${ex.end_date}`);
      });
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

checkExhibitions();