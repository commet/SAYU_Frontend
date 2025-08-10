const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI'
);

async function checkMMCAData() {
  const { data, error } = await supabase
    .from('exhibitions')
    .select('title_en, description, artists')
    .eq('venue_name', '국립현대미술관')
    .limit(3);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('=== MMCA 전시 데이터 품질 확인 ===\n');
  data.forEach((item, i) => {
    console.log(`${i+1}. ${item.title_en.substring(0, 50)}...`);
    console.log(`   설명 길이: ${item.description ? item.description.length : 0}자`);
    console.log(`   설명 내용: ${item.description ? item.description.substring(0, 100) : 'None'}...`);
    console.log(`   작가 수: ${item.artists ? item.artists.length : 0}명`);
    console.log(`   작가 정보: ${JSON.stringify(item.artists)}`);
    console.log('');
  });
}

checkMMCAData().catch(console.error);