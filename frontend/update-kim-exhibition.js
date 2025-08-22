const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk'
);

async function updateKimExhibition() {
  try {
    // 김창열전 입장료 업데이트
    const { data, error } = await supabase
      .from('exhibitions')
      .update({ 
        admission_fee: '2000원'
      })
      .eq('id', '92e15c7e-2a0e-42f8-b660-c3fb6361199b');
    
    if (error) {
      console.error('Error updating exhibition:', error);
    } else {
      console.log('✅ 김창열전 입장료 업데이트 완료: 2000원');
    }

    // 업데이트 확인
    const { data: updated } = await supabase
      .from('exhibitions')
      .select('title, admission_fee')
      .eq('id', '92e15c7e-2a0e-42f8-b660-c3fb6361199b')
      .single();
    
    if (updated) {
      console.log('📋 업데이트된 정보:', updated);
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

updateKimExhibition();