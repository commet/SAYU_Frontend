const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock exhibitions data
const mockExhibitions = [
  {
    id: '1',
    title: '모네와 인상주의: 빛의 순간들',
    venue_name: '국립현대미술관 서울',
    venue_city: '서울 종로구',
    start_date: '2024-12-01',
    end_date: '2025-03-31',
    description: '인상파의 거장 클로드 모네의 대표작품을 만나보는 특별전',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754449/sayu/met-artworks/met-chicago-100829.jpg',
    category: '회화',
    tags: ['인상주의', '모네', '회화'],
    price: '20,000원',
    status: 'ongoing',
    view_count: 15234,
    like_count: 892,
    featured: true
  },
  {
    id: '2',
    title: '한국 현대미술의 거장들',
    venue_name: '리움미술관',
    venue_city: '서울 용산구',
    start_date: '2024-11-15',
    end_date: '2025-02-28',
    description: '이우환, 박서보 등 한국 현대미술을 이끈 거장들의 작품전',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754451/sayu/met-artworks/met-chicago-156596.jpg',
    category: '현대미술',
    tags: ['현대미술', '한국미술'],
    price: '18,000원',
    status: 'ongoing',
    view_count: 8921,
    like_count: 567
  },
  {
    id: '3',
    title: '미디어 아트: 디지털 캔버스',
    venue_name: '아모레퍼시픽미술관',
    venue_city: '서울 용산구',
    start_date: '2025-01-15',
    end_date: '2025-04-30',
    description: '최첨단 기술과 예술이 만나는 미디어 아트 특별전',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754453/sayu/met-artworks/met-chicago-120154.jpg',
    category: '미디어아트',
    tags: ['미디어아트', '디지털아트'],
    price: '15,000원',
    status: 'upcoming',
    view_count: 3421,
    like_count: 234
  },
  {
    id: '4',
    title: '피카소와 20세기 예술',
    venue_name: '예술의전당 한가람미술관',
    venue_city: '서울 서초구',
    start_date: '2024-10-01',
    end_date: '2024-12-31',
    description: '20세기 최고의 예술가 피카소의 생애와 작품을 조명하는 대규모 회고전',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754455/sayu/met-artworks/met-chicago-154496.jpg',
    category: '회화',
    tags: ['피카소', '큐비즘', '20세기'],
    price: '25,000원',
    status: 'ended',
    view_count: 42156,
    like_count: 2341
  },
  {
    id: '5',
    title: '조선의 미: 간송 컬렉션',
    venue_name: '간송미술관',
    venue_city: '서울 성북구',
    start_date: '2025-02-01',
    end_date: '2025-05-31',
    description: '간송 전형필이 수집한 조선시대 명품을 만나는 특별전',
    category: '전통미술',
    tags: ['조선', '전통미술', '간송'],
    price: '무료',
    status: 'upcoming',
    view_count: 1892,
    like_count: 156
  },
  {
    id: '6',
    title: '고흐: 영혼의 편지',
    venue_name: '예술의전당',
    venue_city: '서울 서초구',
    start_date: '2025-01-10',
    end_date: '2025-04-10',
    description: '빈센트 반 고흐의 편지와 그림을 통해 그의 영혼을 만나는 전시',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754457/sayu/met-artworks/met-chicago-65930.jpg',
    category: '회화',
    tags: ['고흐', '인상주의', '편지'],
    price: '22,000원',
    status: 'upcoming',
    view_count: 5432,
    like_count: 892,
    featured: true
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    mode: 'minimal',
    timestamp: new Date().toISOString()
  });
});

// Get exhibitions with filters
app.get('/api/exhibitions', (req, res) => {
  const { 
    limit = 50, 
    offset = 0,
    status,
    city,
    search
  } = req.query;

  let filtered = [...mockExhibitions];

  // Filter by status
  if (status && status !== 'all') {
    filtered = filtered.filter(ex => ex.status === status);
  }

  // Filter by city
  if (city) {
    filtered = filtered.filter(ex => 
      ex.venue_city?.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(ex => 
      ex.title.toLowerCase().includes(searchLower) ||
      ex.description?.toLowerCase().includes(searchLower) ||
      ex.venue_name?.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginated = filtered.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginated,
    total: filtered.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// Get single exhibition
app.get('/api/exhibitions/:id', (req, res) => {
  const { id } = req.params;
  const exhibition = mockExhibitions.find(ex => ex.id === id);

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

// Get popular exhibitions
app.get('/api/exhibitions/popular', (req, res) => {
  const { limit = 5 } = req.query;
  
  const popular = [...mockExhibitions]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, parseInt(limit));

  res.json({
    success: true,
    data: popular
  });
});

// Get ongoing exhibitions
app.get('/api/exhibitions/ongoing', (req, res) => {
  const { limit = 10 } = req.query;
  
  const ongoing = mockExhibitions
    .filter(ex => ex.status === 'ongoing')
    .slice(0, parseInt(limit));

  res.json({
    success: true,
    data: ongoing,
    total: ongoing.length
  });
});

// Like/unlike exhibition (mock)
app.post('/api/exhibitions/:id/like', (req, res) => {
  const { id } = req.params;
  const exhibition = mockExhibitions.find(ex => ex.id === id);

  if (!exhibition) {
    return res.status(404).json({
      success: false,
      error: 'Exhibition not found'
    });
  }

  // Mock increment like count
  exhibition.like_count = (exhibition.like_count || 0) + 1;

  res.json({
    success: true,
    message: 'Exhibition liked',
    like_count: exhibition.like_count
  });
});

// City stats
app.get('/api/exhibitions/stats/cities', (req, res) => {
  const cityStats = {};
  
  mockExhibitions.forEach(ex => {
    const city = ex.venue_city || 'Unknown';
    if (!cityStats[city]) {
      cityStats[city] = {
        city: city,
        count: 0,
        ongoing: 0,
        upcoming: 0
      };
    }
    cityStats[city].count++;
    if (ex.status === 'ongoing') cityStats[city].ongoing++;
    if (ex.status === 'upcoming') cityStats[city].upcoming++;
  });

  res.json({
    success: true,
    data: Object.values(cityStats)
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal Exhibition Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Exhibitions API: http://localhost:${PORT}/api/exhibitions`);
});