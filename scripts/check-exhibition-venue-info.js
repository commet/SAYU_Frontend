const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExhibitionVenueInfo() {
  console.log('=== Exhibition 테이블의 Venue 정보 분석 ===\n');
  
  // 1. venue 관련 컬럼들 확인
  const { data: sample } = await supabase
    .from('exhibitions')
    .select('*')
    .limit(1);
    
  console.log('1. Venue 관련 컬럼들:');
  const venueColumns = Object.keys(sample[0] || {}).filter(key => 
    key.includes('venue') || key.includes('address') || key.includes('location')
  );
  console.log(venueColumns);
  
  // 2. venue 정보가 있는 전시들 샘플
  console.log('\n2. Venue 정보 샘플 (venue_id 없는 것들):');
  const { data: exhibitions } = await supabase
    .from('exhibitions')
    .select('id, title_en, venue_id, venue_name, venue_city, venue_country, venue_address')
    .is('venue_id', null)
    .not('venue_name', 'is', null)
    .limit(10);
    
  exhibitions?.forEach(ex => {
    console.log(`\n전시: ${ex.title_en}`);
    console.log(`  - venue_name: ${ex.venue_name}`);
    console.log(`  - venue_city: ${ex.venue_city}`);
    console.log(`  - venue_country: ${ex.venue_country}`);
    console.log(`  - venue_address: ${ex.venue_address}`);
  });
  
  // 3. venue_city별 통계
  console.log('\n3. Venue City별 분포 (Top 10):');
  const { data: cities } = await supabase
    .from('exhibitions')
    .select('venue_city')
    .not('venue_city', 'is', null);
    
  const cityCount = {};
  cities?.forEach(row => {
    cityCount[row.venue_city] = (cityCount[row.venue_city] || 0) + 1;
  });
  
  Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([city, count]) => {
      console.log(`  ${city}: ${count}개`);
    });
    
  // 4. venue_country별 통계
  console.log('\n4. Venue Country별 분포:');
  const { data: countries } = await supabase
    .from('exhibitions')
    .select('venue_country')
    .not('venue_country', 'is', null);
    
  const countryCount = {};
  countries?.forEach(row => {
    countryCount[row.venue_country] = (countryCount[row.venue_country] || 0) + 1;
  });
  
  Object.entries(countryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, count]) => {
      console.log(`  ${country}: ${count}개`);
    });
    
  // 5. venue_name이 있지만 venue_id가 없는 것들의 품질 체크
  console.log('\n5. Venue Name 품질 체크:');
  const { data: venueNames } = await supabase
    .from('exhibitions')
    .select('venue_name')
    .is('venue_id', null)
    .not('venue_name', 'is', null)
    .limit(50);
    
  let properNames = 0;
  let numberOnly = 0;
  let shortNames = 0;
  let foreignNames = 0;
  
  venueNames?.forEach(row => {
    const name = row.venue_name;
    if (/^\d+$/.test(name)) numberOnly++;
    else if (name.length <= 3) shortNames++;
    else if (/[a-zA-Z]/.test(name) && name.length > 10) foreignNames++;
    else properNames++;
  });
  
  console.log(`  - 정상적인 이름: ${properNames}개`);
  console.log(`  - 숫자만: ${numberOnly}개`);
  console.log(`  - 3글자 이하: ${shortNames}개`);
  console.log(`  - 외국 이름 추정: ${foreignNames}개`);
  
  // 6. 가장 많이 나오는 venue_name (venue_id 없는 것)
  console.log('\n6. 자주 나오는 Venue Name (venue_id 없는 것):');
  const { data: allVenueNames } = await supabase
    .from('exhibitions')
    .select('venue_name, venue_city')
    .is('venue_id', null)
    .not('venue_name', 'is', null);
    
  const venueFreq = {};
  allVenueNames?.forEach(row => {
    const key = `${row.venue_name} (${row.venue_city})`;
    venueFreq[key] = (venueFreq[key] || 0) + 1;
  });
  
  Object.entries(venueFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([venue, count]) => {
      console.log(`  ${venue}: ${count}개`);
    });
}

checkExhibitionVenueInfo();