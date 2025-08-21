// Test Exhibition Visits API endpoints
require('dotenv').config({ path: './backend/.env' });

const axios = require('axios');

const API_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3007'; // 백엔드 포트

// Mock JWT token (실제로는 로그인 후 받은 토큰 사용)
const MOCK_USER_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Mock UUID
const MOCK_AUTH_TOKEN = 'mock-jwt-token';

async function testExhibitionVisitsAPI() {
  console.log('🧪 Testing Exhibition Visits API...\n');

  try {
    // 1. Test API connection
    console.log('1️⃣ Testing API connection...');
    try {
      const healthCheck = await axios.get(`${BACKEND_URL}/api/health`);
      console.log('✅ Backend server is running:', healthCheck.data);
    } catch (error) {
      console.log('⚠️ Backend server not running, testing with frontend proxy...');
    }

    // 2. Test profile API base
    console.log('\n2️⃣ Testing profile base endpoint...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Profile API accessible');
    } catch (error) {
      console.log('❌ Profile API error:', error.response?.status, error.response?.data);
    }

    // 3. Test GET /api/profile/visits (empty state)
    console.log('\n3️⃣ Testing GET visits (should be empty)...');
    try {
      const getVisitsResponse = await axios.get(`${API_BASE_URL}/api/profile/visits`, {
        headers: {
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GET visits successful:', {
        count: getVisitsResponse.data.data?.length || 0,
        total: getVisitsResponse.data.pagination?.total || 0
      });
    } catch (error) {
      console.log('❌ GET visits error:', error.response?.status, error.response?.data?.error);
      if (error.response?.status === 500) {
        console.log('💡 This likely means the exhibition_visits table doesn\'t exist yet.');
        console.log('   Please run the SQL in exhibition-visits-table.sql in your Supabase dashboard.');
      }
    }

    // 4. Test POST /api/profile/visits (create new visit)
    console.log('\n4️⃣ Testing POST visits (create new)...');
    const testVisitData = {
      exhibitionTitle: '테스트 전시: 현대 미술의 이해',
      museum: '서울시립미술관',
      visitDate: '2025-01-20',
      duration: 120,
      rating: 5,
      notes: 'API 연동 테스트를 위한 샘플 전시 기록입니다. 매우 인상 깊었고 특히 작가의 색채 활용이 놀라웠습니다.',
      artworks: [
        {
          id: 'artwork_1',
          title: '도시의 빛',
          artist: '김예술',
          liked: true
        },
        {
          id: 'artwork_2', 
          title: '시간의 흐름',
          artist: '박창작',
          liked: false
        },
        {
          id: 'artwork_3',
          title: '내면의 소리',
          artist: '이미술',
          liked: true
        }
      ],
      photos: ['photo_001.jpg', 'photo_002.jpg'],
      badges: ['Art Explorer', 'First Visit'],
      points: 150
    };

    try {
      const createVisitResponse = await axios.post(`${API_BASE_URL}/api/profile/visits`, testVisitData, {
        headers: {
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ POST visits successful:', {
        id: createVisitResponse.data.id,
        title: createVisitResponse.data.exhibition_title
      });

      const createdVisitId = createVisitResponse.data.id;

      // 5. Test GET single visit
      console.log('\n5️⃣ Testing GET single visit...');
      try {
        const getSingleVisitResponse = await axios.get(`${API_BASE_URL}/api/profile/visits/${createdVisitId}`, {
          headers: {
            'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ GET single visit successful:', {
          id: getSingleVisitResponse.data.id,
          artworks_count: getSingleVisitResponse.data.artworks?.length || 0
        });
      } catch (error) {
        console.log('❌ GET single visit error:', error.response?.status, error.response?.data?.error);
      }

      // 6. Test PUT visit (update)
      console.log('\n6️⃣ Testing PUT visit (update)...');
      const updateData = {
        rating: 4,
        notes: '업데이트된 후기: 재방문했더니 새로운 감상이 생겼습니다.',
        points: 180
      };

      try {
        const updateVisitResponse = await axios.put(`${API_BASE_URL}/api/profile/visits/${createdVisitId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ PUT visit successful:', {
          rating: updateVisitResponse.data.rating,
          points: updateVisitResponse.data.points
        });
      } catch (error) {
        console.log('❌ PUT visit error:', error.response?.status, error.response?.data?.error);
      }

      // 7. Test DELETE visit (cleanup)
      console.log('\n7️⃣ Testing DELETE visit (cleanup)...');
      try {
        const deleteVisitResponse = await axios.delete(`${API_BASE_URL}/api/profile/visits/${createdVisitId}`, {
          headers: {
            'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ DELETE visit successful:', deleteVisitResponse.data.message);
      } catch (error) {
        console.log('❌ DELETE visit error:', error.response?.status, error.response?.data?.error);
      }

    } catch (error) {
      console.log('❌ POST visits error:', error.response?.status, error.response?.data?.error);
      if (error.response?.status === 500) {
        console.log('💡 This likely means:');
        console.log('   1. The exhibition_visits table doesn\'t exist');
        console.log('   2. The authentication middleware is rejecting the mock token');
        console.log('   3. The Supabase connection is not working');
      }
    }

    // 8. Test with real user session (if available)
    console.log('\n8️⃣ Checking for real user session...');
    console.log('💡 For real testing, you need to:');
    console.log('   1. Start the backend server: cd backend && npm run dev');
    console.log('   2. Start the frontend: cd frontend && npm run dev');
    console.log('   3. Login through the frontend to get real auth token');
    console.log('   4. Use the frontend form to create exhibition records');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎯 Test Summary:');
  console.log('- If you see table errors, run the SQL in exhibition-visits-table.sql');
  console.log('- If you see auth errors, that\'s expected with mock tokens');
  console.log('- The real test is using the frontend form with actual login');
}

// Run tests
testExhibitionVisitsAPI();