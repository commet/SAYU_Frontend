// Replicate API 직접 테스트
require('dotenv').config({ path: '.env.local' });

async function testReplicate() {
  const token = process.env.REPLICATE_API_TOKEN;
  console.log('Token exists:', !!token);
  console.log('Token prefix:', token?.substring(0, 10) + '...');
  
  if (!token) {
    console.error('No Replicate API token found!');
    return;
  }

  try {
    // 간단한 테스트: 모델 정보 가져오기
    const response = await fetch('https://api.replicate.com/v1/models/stability-ai/sdxl', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('API Error:', response.status, text);
      return;
    }

    const data = await response.json();
    console.log('Model info:', {
      name: data.name,
      owner: data.owner,
      description: data.description?.substring(0, 100) + '...'
    });

    console.log('\n✅ Replicate API is working!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testReplicate();