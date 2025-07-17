const axios = require('axios');

// Test chatbot API endpoints
async function testChatbotAPI() {
  const baseURL = 'http://localhost:3001';
  
  console.log('🤖 Testing Chatbot API...\n');

  // 1. Test health check
  try {
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${baseURL}/api/chatbot/health`);
    console.log('✅ Health check:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
  }

  // 2. Test sending a message (requires auth)
  try {
    console.log('\n2. Testing message sending...');
    
    // First, we need to get a test token
    // For now, we'll simulate with a test user
    const messageData = {
      message: "이 작품의 색감이 정말 아름답네요",
      artworkId: "test-artwork-1",
      artwork: {
        id: "test-artwork-1",
        title: "별이 빛나는 밤",
        artist: "빈센트 반 고흐",
        year: 1889,
        medium: "캔버스에 유화",
        description: "소용돌이치는 밤하늘과 프랑스 마을의 풍경"
      }
    };

    // Note: This will fail without auth token
    const messageResponse = await axios.post(
      `${baseURL}/api/chatbot/message`,
      messageData,
      {
        headers: {
          'Content-Type': 'application/json',
          // In real test, you'd need a valid JWT token here
          // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
        }
      }
    );
    console.log('✅ Message response:', messageResponse.data);
  } catch (error) {
    console.error('❌ Message sending failed:', error.response?.data || error.message);
    console.log('💡 Note: This is expected without authentication');
  }

  // 3. Test getting suggestions
  try {
    console.log('\n3. Testing suggestions...');
    const suggestionsResponse = await axios.get(
      `${baseURL}/api/chatbot/suggestions/test-artwork-1?title=Starry Night&artist=Van Gogh&year=1889`
    );
    console.log('✅ Suggestions:', suggestionsResponse.data);
  } catch (error) {
    console.error('❌ Suggestions failed:', error.response?.data || error.message);
  }

  console.log('\n✨ Chatbot API test completed!');
}

// Test the Google AI service directly
async function testGoogleAI() {
  console.log('\n🧠 Testing Google AI Service...\n');
  
  try {
    const chatbotService = require('./src/services/chatbotService');
    
    // Test if Google AI is initialized
    if (chatbotService.model) {
      console.log('✅ Google AI is initialized');
      
      // Test a simple message
      const testMessage = await chatbotService.processMessage(
        'test-user-1',
        '이 작품에서 어떤 감정이 느껴지나요?',
        {
          id: 'test-1',
          title: '별이 빛나는 밤',
          artist: '빈센트 반 고흐',
          year: 1889
        },
        'LAEF' // Fox personality
      );
      
      console.log('✅ Test message response:', testMessage);
    } else {
      console.log('❌ Google AI is not initialized. Check GOOGLE_AI_API_KEY in .env');
    }
  } catch (error) {
    console.error('❌ Google AI test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  // Test Google AI service first
  await testGoogleAI();
  
  // Then test API endpoints
  // Note: Make sure the server is running on port 3001
  await testChatbotAPI();
}

// Check if running directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testChatbotAPI, testGoogleAI };