// SAYU Living Identity Server Mode - Railway 배포용
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3005;

// 기본 미들웨어
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'https://*.railway.app', 'https://*.vercel.app'],
  credentials: true
}));

// 전역 rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 2000, // 더 많은 요청 허용
  message: { error: 'Too many requests from this IP' }
});
app.use(globalLimiter);

// ===========================================
// SAYU LIVING IDENTITY API ENDPOINTS
// ===========================================

// 홈 페이지 - 새로운 기능 소개
app.get('/', (req, res) => {
  res.json({
    service: 'SAYU Living Identity API',
    version: '2.0.0',
    status: 'running',
    lastUpdated: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    features: {
      immersiveQuiz: 'Visual A/B choice quiz with gradients',
      livingIdentityCard: 'Evolving identity cards with progression',
      villageSystem: '4 art viewing style clusters',
      tokenEconomy: 'Quiz retake tokens and daily rewards',
      cardExchange: 'Social identity card trading',
      evolutionTracking: 'Identity growth and change monitoring',
      dailyArtHabit: 'Daily art viewing habits with personalized recommendations'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'living',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Basic API endpoints for living mode
app.get('/api/personality-types', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, code: 'LAEF', name: 'Fox', description: 'Creative Explorer' },
      { id: 2, code: 'LAEC', name: 'Cat', description: 'Analytical Observer' }
      // Add more personality types as needed
    ]
  });
});

// ===========================================
// DAILY HABIT API ENDPOINTS - Living Mode Implementation
// ===========================================

// Simple auth middleware for living mode
const simpleAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // In living mode, we'll accept any token for testing
  req.user = { userId: `demo-user-${token.slice(-8)}` };
  next();
};

// Daily Habit Settings
app.get('/api/daily-habit/settings', simpleAuth, (req, res) => {
  res.json({
    morningTime: '08:00',
    lunchTime: '12:30',
    nightTime: '22:00',
    morningEnabled: true,
    lunchEnabled: true,
    nightEnabled: true,
    pushEnabled: true,
    emailReminder: false,
    timezone: 'Asia/Seoul',
    activeDays: [1, 2, 3, 4, 5]
  });
});

app.put('/api/daily-habit/settings', simpleAuth, (req, res) => {
  const settings = req.body;
  res.json({
    ...settings,
    message: 'Settings updated successfully (Living Mode Demo)'
  });
});

// Today's Entry
app.get('/api/daily-habit/today', simpleAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.json({
    entry: {
      id: `demo-entry-${today}`,
      entry_date: today,
      morning_completed_at: null,
      lunch_completed_at: null,
      night_completed_at: null,
      daily_completion_rate: 0
    },
    streak: {
      current_streak: 3,
      longest_streak: 7,
      total_days: 15,
      last_activity_date: today,
      achieved_7_days: true,
      achieved_30_days: false,
      achieved_100_days: false
    }
  });
});

// Date Entry
app.get('/api/daily-habit/entry/:date', simpleAuth, (req, res) => {
  const { date } = req.params;
  res.json({
    id: `demo-entry-${date}`,
    entry_date: date,
    morning_completed_at: null,
    lunch_completed_at: null,
    night_completed_at: null,
    daily_completion_rate: 0
  });
});

// Record Activities
app.post('/api/daily-habit/morning', simpleAuth, (req, res) => {
  const data = req.body;
  res.json({
    entry: {
      ...data,
      morning_completed_at: new Date().toISOString(),
      daily_completion_rate: 0.33
    },
    rewards: [],
    message: 'Morning activity recorded (Living Mode Demo)'
  });
});

app.post('/api/daily-habit/lunch', simpleAuth, (req, res) => {
  const data = req.body;
  res.json({
    entry: {
      ...data,
      lunch_completed_at: new Date().toISOString(),
      daily_completion_rate: 0.66
    },
    rewards: [],
    message: 'Lunch activity recorded (Living Mode Demo)'
  });
});

app.post('/api/daily-habit/night', simpleAuth, (req, res) => {
  const data = req.body;
  res.json({
    entry: {
      ...data,
      night_completed_at: new Date().toISOString(),
      daily_completion_rate: 1.0
    },
    rewards: [
      { type: 'badge', name: 'Daily Completionist', days: 1 }
    ],
    message: 'Night activity recorded (Living Mode Demo)'
  });
});

// Recommendations
app.get('/api/daily-habit/recommendation/:timeSlot', simpleAuth, (req, res) => {
  const { timeSlot } = req.params;

  const sampleArtworks = {
    morning: {
      id: 'demo-artwork-morning',
      title: 'Sunrise Over The Seine',
      artist_display_name: 'Claude Monet',
      primary_image_url: 'https://images.metmuseum.org/CRDImages/ep/original/DT1932.jpg',
      medium: 'Oil on canvas',
      date: '1897'
    },
    lunch: {
      id: 'demo-artwork-lunch',
      title: 'The Luncheon of the Boating Party',
      artist_display_name: 'Pierre-Auguste Renoir',
      primary_image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Luncheon_of_the_Boating_Party.jpg',
      medium: 'Oil on canvas',
      date: '1880-1881'
    },
    night: {
      id: 'demo-artwork-night',
      title: 'The Starry Night',
      artist_display_name: 'Vincent van Gogh',
      primary_image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
      medium: 'Oil on canvas',
      date: '1889'
    }
  };

  const questions = {
    morning: '이 작품이 당신의 하루를 시작하는 색이라면?',
    lunch: '지금 이 순간, 이 작품과 어떤 감정을 나누고 싶나요?',
    night: '오늘 하루를 이 작품의 한 부분으로 표현한다면?'
  };

  res.json({
    artwork: sampleArtworks[timeSlot] || sampleArtworks.morning,
    question: questions[timeSlot] || questions.morning,
    timeSlot
  });
});

// Emotion Check-in
app.post('/api/daily-habit/emotion/checkin', simpleAuth, (req, res) => {
  const data = req.body;
  res.json({
    id: `demo-checkin-${Date.now()}`,
    user_id: req.user.userId,
    checkin_time: new Date().toISOString(),
    ...data,
    message: 'Emotion check-in recorded (Living Mode Demo)'
  });
});

// Push Notifications
app.post('/api/daily-habit/push/subscribe', simpleAuth, (req, res) => {
  res.json({
    message: '푸시 알림 구독 완료 (Living Mode Demo)',
    subscription: req.body
  });
});

app.post('/api/daily-habit/push/test', simpleAuth, (req, res) => {
  res.json({
    message: '테스트 알림 전송 완료 (Living Mode Demo)',
    results: [{ success: true, endpoint: 'demo-endpoint' }]
  });
});

// Statistics
app.get('/api/daily-habit/streak', simpleAuth, (req, res) => {
  res.json({
    streak: {
      current_streak: 5,
      longest_streak: 12,
      total_days: 25,
      last_activity_date: new Date().toISOString().split('T')[0],
      achieved_7_days: true,
      achieved_30_days: false,
      achieved_100_days: false
    },
    rewards: [
      { type: 'badge', name: '일주일의 예술가', days: 7 }
    ]
  });
});

app.get('/api/daily-habit/patterns', simpleAuth, (req, res) => {
  res.json([
    {
      day_of_week: 1,
      hour_of_day: 8,
      activity_count: 15,
      avg_completion_time: 180,
      last_activity: new Date().toISOString()
    },
    {
      day_of_week: 1,
      hour_of_day: 12,
      activity_count: 12,
      avg_completion_time: 300,
      last_activity: new Date().toISOString()
    }
  ]);
});

app.get('/api/daily-habit/stats/:year/:month', simpleAuth, (req, res) => {
  const { year, month } = req.params;
  res.json({
    total_days: 30,
    active_days: 22,
    perfect_days: 8,
    avg_completion_rate: 0.73,
    unique_artworks_viewed: 66
  });
});

// ===========================================
// EXHIBITIONS API ENDPOINTS (Living Mode Demo)
// ===========================================

// Demo exhibition data
const demoExhibitions = [
  {
    id: 'demo-exhibition-1',
    title: '한국 현대미술의 새로운 시선',
    venue_name: '국립현대미술관 서울관',
    venue_city: '서울',
    start_date: '2024-01-15',
    end_date: '2024-04-30',
    description: '한국 현대미술의 다양한 표현 양식과 새로운 시각을 제시하는 특별전시입니다.',
    tags: ['현대미술', '한국', '회화', '조각'],
    status: 'ongoing',
    like_count: 45,
    view_count: 1250,
    admission_fee: 8000,
    venues: {
      name: '국립현대미술관 서울관',
      city: '서울',
      website: 'https://www.mmca.go.kr'
    }
  },
  {
    id: 'demo-exhibition-2',
    title: '부산, 바다와 예술의 만남',
    venue_name: '부산시립미술관',
    venue_city: '부산',
    start_date: '2024-02-01',
    end_date: '2024-05-15',
    description: '부산의 해양 문화와 예술이 어우러진 특별 기획전시입니다.',
    tags: ['해양', '부산', '설치미술', '미디어아트'],
    status: 'ongoing',
    like_count: 32,
    view_count: 890,
    admission_fee: 5000,
    venues: {
      name: '부산시립미술관',
      city: '부산',
      website: 'https://art.busan.go.kr'
    }
  },
  {
    id: 'demo-exhibition-3',
    title: 'Digital Art Revolution',
    venue_name: 'D Museum',
    venue_city: '서울',
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    description: '디지털 기술과 예술의 융합을 통한 새로운 예술 경험을 제안합니다.',
    tags: ['디지털아트', '인터렉티브', '뉴미디어'],
    status: 'upcoming',
    like_count: 78,
    view_count: 2100,
    admission_fee: 12000,
    venues: {
      name: 'D Museum',
      city: '서울',
      website: 'https://dmuseum.co.kr'
    }
  }
];

// Get exhibitions
app.get('/api/exhibitions', (req, res) => {
  const { limit = 50, status, city } = req.query;

  let exhibitions = [...demoExhibitions];

  // Apply filters
  if (status) {
    exhibitions = exhibitions.filter(ex => ex.status === status);
  }

  if (city) {
    exhibitions = exhibitions.filter(ex => ex.venue_city.toLowerCase() === city.toLowerCase());
  }

  // Limit results
  exhibitions = exhibitions.slice(0, parseInt(limit));

  res.json({
    success: true,
    data: exhibitions,
    total: exhibitions.length
  });
});

// Get single exhibition
app.get('/api/exhibitions/:id', (req, res) => {
  const { id } = req.params;

  const exhibition = demoExhibitions.find(ex => ex.id === id);

  if (!exhibition) {
    return res.status(404).json({
      success: false,
      error: 'Exhibition not found'
    });
  }

  res.json({
    success: true,
    data: exhibition
  });
});

// ===========================================
// VENUE API ENDPOINTS (Living Mode Demo)
// ===========================================

// Demo venue data
const demoVenues = [
  {
    id: '1',
    name: 'National Museum of Modern and Contemporary Art, Seoul',
    name_ko: '국립현대미술관 서울관',
    name_en: 'National Museum of Modern and Contemporary Art, Seoul',
    city: 'Seoul',
    city_ko: '서울',
    city_en: 'Seoul',
    country: 'South Korea',
    venue_type: 'museum',
    tier: 1,
    rating: 4.5,
    review_count: 123,
    latitude: 37.5665,
    longitude: 126.9780,
    address: '30 Samcheong-ro, Jongno-gu, Seoul',
    address_ko: '서울특별시 종로구 삼청로 30',
    description: 'National Museum of Modern and Contemporary Art, Seoul branch, located in the heart of Seoul showcasing contemporary Korean and international art.',
    description_ko: '서울 중심부에 위치한 국립현대미술관 서울관, 한국과 국제 현대미술을 전시',
    phone: '02-3701-9500',
    website: 'https://www.mmca.go.kr',
    google_maps_uri: 'https://maps.google.com/?q=37.5665,126.9780',
    opening_hours: {
      'tuesday': '10:00-18:00',
      'wednesday': '10:00-18:00',
      'thursday': '10:00-18:00',
      'friday': '10:00-21:00',
      'saturday': '10:00-18:00',
      'sunday': '10:00-18:00'
    }
  },
  {
    id: '2',
    name: 'Busan Museum of Art',
    name_ko: '부산시립미술관',
    name_en: 'Busan Museum of Art',
    city: 'Busan',
    city_ko: '부산',
    city_en: 'Busan',
    country: 'South Korea',
    venue_type: 'museum',
    tier: 2,
    rating: 4.2,
    review_count: 87,
    latitude: 35.1796,
    longitude: 129.0756,
    address: '58 APEC-ro, Haeundae-gu, Busan',
    address_ko: '부산광역시 해운대구 APEC로 58',
    description: 'Busan Museum of Art, the premier art museum in Korea\'s second largest city, featuring diverse contemporary exhibitions.',
    description_ko: '한국 제2도시 부산의 대표 미술관으로 다양한 현대미술 전시',
    phone: '051-744-2602',
    website: 'https://art.busan.go.kr',
    google_maps_uri: 'https://maps.google.com/?q=35.1796,129.0756'
  }
];

// Get venues with search and filters
app.get('/api/venues', (req, res) => {
  const { search, city, country, type, lang = 'ko', page = 1, limit = 20 } = req.query;

  let venues = [...demoVenues];

  // Apply filters
  if (search) {
    venues = venues.filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.name_ko?.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (city) {
    venues = venues.filter(v => v.city.toLowerCase() === city.toLowerCase());
  }

  if (country) {
    venues = venues.filter(v => v.country.toLowerCase() === country.toLowerCase());
  }

  if (type) {
    venues = venues.filter(v => v.venue_type === type);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedVenues = venues.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedVenues,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: venues.length,
      totalPages: Math.ceil(venues.length / limit),
      hasNext: endIndex < venues.length,
      hasPrev: page > 1
    },
    language: lang
  });
});

// Get single venue
app.get('/api/venues/:id', (req, res) => {
  const { id } = req.params;
  const { lang = 'ko' } = req.query;

  const venue = demoVenues.find(v => v.id === id);

  if (!venue) {
    return res.status(404).json({
      success: false,
      error: 'Venue not found'
    });
  }

  res.json({
    success: true,
    data: venue,
    language: lang
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Living server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===========================================
// ARTVEE API ENDPOINTS (Living Mode)
// ===========================================

// Import cloudinary service directly
const cloudinaryArtveeService = require('./services/cloudinaryArtveeService');

// Artvee random artworks
app.get('/api/artvee/random', (req, res) => {
  cloudinaryArtveeService.getRandomArtworks(parseInt(req.query.limit) || 10)
    .then(artworks => {
      res.json({
        success: true,
        data: artworks,
        count: artworks.length
      });
    })
    .catch(error => {
      console.error('Artvee random error:', error);
      res.status(500).json({ success: false, error: error.message });
    });
});

// Artvee images (general endpoint)
app.get('/api/artvee/images', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  cloudinaryArtveeService.getRandomArtworks(limit)
    .then(artworks => {
      res.json({
        success: true,
        data: artworks,
        count: artworks.length
      });
    })
    .catch(error => {
      console.error('Artvee images error:', error);
      res.status(500).json({ success: false, error: error.message });
    });
});

// Artvee by personality type
app.get('/api/artvee/personality/:type', (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const { emotionFilter } = req.query;

  cloudinaryArtveeService.getArtworksForPersonality(type, { limit, emotionFilter })
    .then(artworks => {
      res.json({
        success: true,
        data: artworks,
        personality_type: type,
        count: artworks.length
      });
    })
    .catch(error => {
      console.error('Artvee personality error:', error);
      res.status(500).json({ success: false, error: error.message });
    });
});

// ===========================================
// USER MATCHING API ENDPOINTS (Living Mode Demo)
// ===========================================

// Demo users data for matching
const demoUsers = [
  {
    id: '1',
    nickname: 'ArtLover123',
    age: 28,
    user_purpose: 'dating',
    type_code: 'LAEF',
    archetype_name: 'Creative Fox',
    generated_image_url: 'https://picsum.photos/150/150?random=1'
  },
  {
    id: '2',
    nickname: 'FamilyArt',
    age: 35,
    user_purpose: 'family',
    type_code: 'LAEC',
    archetype_name: 'Wise Cat',
    generated_image_url: 'https://picsum.photos/150/150?random=2'
  },
  {
    id: '3',
    nickname: 'SocialBee',
    age: 26,
    user_purpose: 'social',
    type_code: 'CAEF',
    archetype_name: 'Social Butterfly',
    generated_image_url: 'https://picsum.photos/150/150?random=3'
  },
  {
    id: '4',
    nickname: 'ArtCurator',
    age: 42,
    user_purpose: 'professional',
    type_code: 'CAEC',
    archetype_name: 'Art Expert',
    generated_image_url: 'https://picsum.photos/150/150?random=4'
  },
  {
    id: '5',
    nickname: 'Explorer99',
    age: 24,
    user_purpose: 'exploring',
    type_code: 'LBEF',
    archetype_name: 'Curious Explorer',
    generated_image_url: 'https://picsum.photos/150/150?random=5'
  }
];

// Get compatible users
app.get('/api/matching/compatible', simpleAuth, (req, res) => {
  const { purpose } = req.query;
  const targetPurpose = purpose || 'exploring';

  let compatibleUsers = demoUsers.filter(user => user.id !== req.user.userId);

  // Simple purpose-based filtering
  if (targetPurpose !== 'exploring') {
    compatibleUsers = compatibleUsers.filter(user => {
      switch (targetPurpose) {
        case 'dating':
          return user.user_purpose === 'dating';
        case 'family':
          return ['family', 'social'].includes(user.user_purpose);
        case 'professional':
          return ['professional', 'exploring'].includes(user.user_purpose);
        case 'social':
          return ['social', 'exploring', 'family'].includes(user.user_purpose);
        default:
          return true;
      }
    });
  }

  res.json({
    purpose: targetPurpose,
    users: compatibleUsers,
    total: compatibleUsers.length
  });
});

// Get users by specific purpose
app.get('/api/matching/purpose/:purpose', simpleAuth, (req, res) => {
  const { purpose } = req.params;

  const validPurposes = ['exploring', 'dating', 'social', 'family', 'professional'];
  if (!validPurposes.includes(purpose)) {
    return res.status(400).json({ error: 'Invalid purpose' });
  }

  const filteredUsers = demoUsers.filter(user =>
    user.id !== req.user.userId && user.user_purpose === purpose
  );

  res.json({
    purpose,
    users: filteredUsers,
    total: filteredUsers.length
  });
});

// Update user purpose
app.patch('/api/auth/purpose', simpleAuth, (req, res) => {
  const { userPurpose } = req.body;

  if (!userPurpose) {
    return res.status(400).json({ error: 'User purpose is required' });
  }

  const validPurposes = ['exploring', 'dating', 'social', 'family', 'professional'];
  if (!validPurposes.includes(userPurpose)) {
    return res.status(400).json({ error: 'Invalid user purpose' });
  }

  res.json({
    message: 'User purpose updated successfully',
    userPurpose
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found in living mode' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎨 SAYU Living Identity Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🏘️ Village System: Active`);
  console.log(`🪙 Token Economy: Active`);
  console.log(`🔄 Evolution Tracking: Active`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
