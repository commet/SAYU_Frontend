const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking available tables...\n');
  
  // exhibitions 테이블 확인
  const { data: exhibitions, error: exError } = await supabase
    .from('exhibitions')
    .select('*')
    .limit(1);
    
  if (!exError) {
    console.log('✓ exhibitions 테이블 존재');
    console.log('  샘플 데이터:', exhibitions);
  } else {
    console.log('✗ exhibitions 테이블 없음:', exError.message);
  }
  
  // exhibitions_unified 테이블 확인
  const { data: unified, error: unError } = await supabase
    .from('exhibitions_unified')
    .select('*')
    .limit(1);
    
  if (!unError) {
    console.log('\n✓ exhibitions_unified 테이블 존재');
    console.log('  샘플 데이터:', unified);
  } else {
    console.log('\n✗ exhibitions_unified 테이블 없음:', unError.message);
  }
  
  // venues 테이블 확인
  const { data: venues, error: vError } = await supabase
    .from('venues')
    .select('*')
    .limit(1);
    
  if (!vError) {
    console.log('\n✓ venues 테이블 존재');
    console.log('  샘플 데이터:', venues);
  } else {
    console.log('\n✗ venues 테이블 없음:', vError.message);
  }
  
  // exhibition_artworks 테이블 확인 (새로 만든 테이블)
  const { data: artworks, error: aError } = await supabase
    .from('exhibition_artworks')
    .select('*')
    .limit(1);
    
  if (!aError) {
    console.log('\n✓ exhibition_artworks 테이블 존재');
  } else {
    console.log('\n✗ exhibition_artworks 테이블 없음:', aError.message);
  }
}

checkTables();