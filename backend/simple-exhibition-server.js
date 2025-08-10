const express = require('express');
const cors = require('cors');
const fs = require('fs');
const imageService = require('./image-service');
const app = express();

app.use(cors());
app.use(express.json());

// Load real exhibition data from Supabase
let exhibitions = [];
try {
  const data = fs.readFileSync('./real-exhibitions.json', 'utf8');
  const rawExhibitions = JSON.parse(data);
  
  // Smart category mapping function
  const mapToCategory = (ex) => {
    const genres = ex.genres || [];
    const type = ex.exhibition_type || '';
    const title = (ex.title_local || ex.title_en || '').toLowerCase();
    const tags = ex.tags || [];
    const artists = ex.artists || [];
    const venue = (ex.venue_name || '').toLowerCase();
    const description = (ex.description || '').toLowerCase();
    
    // Create comprehensive text for analysis
    const allText = [...genres, ...tags, title, type, venue, description].join(' ').toLowerCase();
    const artistNames = artists.map(a => (a.name || '').toLowerCase()).join(' ');
    
    // Priority 1: Direct genre matches
    if (genres.includes('사진')) return '사진';
    if (genres.includes('조각') || genres.includes('조소')) return '조각';
    if (genres.includes('뉴미디어') || genres.includes('비디오아트')) return '미디어아트';
    if (genres.includes('한국화') || genres.includes('도자') || genres.includes('직물공예') || 
        genres.includes('섬유공예') || genres.includes('칠공예') || genres.includes('나무공예')) {
      return '전통미술';
    }
    if (genres.includes('회화') || genres.includes('드로잉&판화') || genres.includes('드로잉')) {
      return '회화';
    }
    
    // Priority 2: Title-based detection with improved keywords
    if (title.includes('사진') || title.includes('photo') || title.includes('포토그') || 
        title.includes('photography') || title.includes('렌즈')) {
      return '사진';
    }
    if (title.includes('조각') || title.includes('sculpture') || title.includes('조소') ||
        title.includes('彫刻') || title.includes('입체')) {
      return '조각';
    }
    if (title.includes('미디어') || title.includes('디지털') || title.includes('media') ||
        title.includes('video') || title.includes('영상') || title.includes('비디오') ||
        title.includes('인터랙') || title.includes('interactive') || title.includes('뉴미디어') ||
        title.includes('빛의') || title.includes('라이트') || title.includes('프로젝션')) {
      return '미디어아트';
    }
    if (title.includes('도자') || title.includes('도예') || title.includes('ceramic') ||
        title.includes('공예') || title.includes('craft') || title.includes('전통') ||
        title.includes('민화') || title.includes('한국화') || title.includes('동양화') ||
        title.includes('수묵') || title.includes('먹') || title.includes('서예') ||
        title.includes('고려') || title.includes('조선') || title.includes('백자')) {
      return '전통미술';
    }
    if (title.includes('회화') || title.includes('painting') || title.includes('그림') ||
        title.includes('페인팅') || title.includes('드로잉') || title.includes('drawing') ||
        title.includes('수채') || title.includes('유화') || title.includes('아크릴') ||
        title.includes('초상') || title.includes('풍경')) {
      return '회화';
    }
    
    // Priority 3: Venue-based detection with more specific patterns
    if (venue.includes('사진') || venue.includes('photo') || venue.includes('카메라')) {
      return '사진';
    }
    if (venue.includes('공예') || venue.includes('craft') || venue.includes('도자') ||
        venue.includes('도예') || venue.includes('전통')) {
      return '전통미술';
    }
    if (venue.includes('미디어') || venue.includes('디지털')) {
      return '미디어아트';
    }
    
    // Priority 4: Artist name analysis
    const famousPhotographers = ['김중만', '구본창', '배병우', '민병헌'];
    const famousPainters = ['이우환', '박서보', '김환기', '이중섭', '박수근'];
    const famousSculptors = ['최만린', '박석원', '이승택'];
    const mediaArtists = ['백남준', '이이남', '정연두'];
    const traditionalArtists = ['김홍도', '신윤복', '정선', '안견'];
    
    if (famousPhotographers.some(name => artistNames.includes(name))) return '사진';
    if (famousPainters.some(name => artistNames.includes(name))) return '회화';
    if (famousSculptors.some(name => artistNames.includes(name))) return '조각';
    if (mediaArtists.some(name => artistNames.includes(name))) return '미디어아트';
    if (traditionalArtists.some(name => artistNames.includes(name))) return '전통미술';
    
    // Priority 5: Description and tag analysis
    if (allText.includes('photograph') || allText.includes('lens') || allText.includes('카메라') ||
        allText.includes('촬영') || allText.includes('필름')) {
      return '사진';
    }
    if (allText.includes('sculpt') || allText.includes('3d') || allText.includes('입체') ||
        allText.includes('브론즈') || allText.includes('석고') || allText.includes('대리석')) {
      return '조각';
    }
    if (allText.includes('digital') || allText.includes('interactive') || allText.includes('vr') ||
        allText.includes('ar') || allText.includes('projection') || allText.includes('led') ||
        allText.includes('sound') || allText.includes('사운드') || allText.includes('인공지능')) {
      return '미디어아트';
    }
    if (allText.includes('heritage') || allText.includes('ancient') || allText.includes('dynasty') ||
        allText.includes('왕조') || allText.includes('고대') || allText.includes('문화재') ||
        allText.includes('국보') || allText.includes('보물')) {
      return '전통미술';
    }
    if (allText.includes('canvas') || allText.includes('brush') || allText.includes('palette') ||
        allText.includes('붓') || allText.includes('캔버스') || allText.includes('물감')) {
      return '회화';
    }
    
    // Priority 6: Exhibition type analysis
    if (type === 'media_art') return '미디어아트';
    if (type === 'collection' && venue.includes('국립')) return '전통미술';
    
    // Priority 7: Special venue patterns for better distribution
    const majorVenues = {
      '리움': ['현대미술', '회화', '조각'],
      '호암': ['전통미술', '회화'],
      '국립현대': ['현대미술', '회화', '조각'],
      '국립중앙': ['전통미술', '회화'],
      '서울시립': ['현대미술', '사진'],
      '아모레': ['현대미술', '회화'],
      '대림': ['사진', '현대미술'],
      '삼성': ['회화', '현대미술'],
      '갤러리현대': ['회화', '현대미술'],
      '국제갤러리': ['현대미술', '조각'],
      'pkm': ['회화', '사진'],
      '아라리오': ['현대미술', '조각'],
      '학고재': ['전통미술', '회화'],
      '가나': ['회화', '조각']
    };
    
    for (const [venueKey, categories] of Object.entries(majorVenues)) {
      if (venue.includes(venueKey.toLowerCase())) {
        // Just return the first appropriate category for this venue
        return categories[0];
      }
    }
    
    // Priority 8: Period-based categorization
    const currentYear = 2025;
    const startYear = new Date(ex.start_date).getFullYear();
    
    // For very old exhibitions (likely historical), lean towards traditional
    if (startYear < 2000 && Math.random() > 0.5) {
      return '전통미술';
    }
    
    // Final fallback: More intelligent distribution based on common patterns
    // Check for installation or group exhibitions (likely contemporary art)
    if (genres.includes('설치') || genres.includes('복합매체') || type === 'group' || type === 'international') {
      return '현대미술';
    }
    
    // Check if it's a collection or permanent exhibition (often traditional)
    if (type === 'collection' || type === 'permanent' || type === '상설전' || type === '소장품전') {
      // Museums often have traditional collections
      if (venue.includes('국립') || venue.includes('시립')) {
        return '전통미술';
      }
      return '회화';
    }
    
    // Special exhibitions tend to be contemporary
    if (type === 'special' || type === '특별전' || type === 'popup') {
      return '현대미술';
    }
    
    // Default based on venue type
    if (venue.includes('갤러리')) {
      return '회화';  // Galleries often show paintings
    }
    if (venue.includes('미술관')) {
      return '현대미술';  // Art museums tend toward contemporary
    }
    
    return '현대미술';
  };

  // Transform Supabase data to match our API format
  exhibitions = rawExhibitions.map(ex => {
    // Calculate status based on actual dates
    const today = new Date('2025-08-10'); // Current date
    const startDate = new Date(ex.start_date);
    const endDate = new Date(ex.end_date);
    
    let calculatedStatus;
    if (today < startDate) {
      calculatedStatus = 'upcoming';
    } else if (today > endDate) {
      calculatedStatus = 'ended';
    } else {
      calculatedStatus = 'ongoing';
    }
    
    // Smart category assignment
    const category = mapToCategory(ex);
    
    return {
      id: ex.id,
      title: ex.title_local || ex.title_en,
      venue_name: ex.venue_name,
      venue_city: ex.venue_city,
      start_date: ex.start_date,
      end_date: ex.end_date,
      description: ex.subtitle || ex.description?.substring(0, 200) || '',
      image_url: null, // 임시로 이미지 비활성화
      category: category, // Use smart mapped category
      price: ex.admission_fee || '정보 없음',
      status: calculatedStatus, // Use calculated status instead of Supabase status
      view_count: ex.view_count || Math.floor(Math.random() * 50000),
      like_count: Math.floor(Math.random() * 5000),
      distance: `${(Math.random() * 15).toFixed(1)}km`,
      featured: Math.random() > 0.7,
      venue_address: ex.venue_address,
      operating_hours: ex.operating_hours,
      phone_number: ex.phone_number,
      tags: ex.tags,
      artists: ex.artists,
      original_genres: ex.genres, // Keep original for reference
      original_type: ex.exhibition_type
    };
  });
  console.log(`Loaded ${exhibitions.length} exhibitions from Supabase data`);
} catch (error) {
  console.error('Error loading exhibitions:', error);
  // Fallback data if file doesn't exist
  exhibitions = [
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
    price: '20,000원',
    status: 'ongoing',
    view_count: 15234,
    like_count: 892,
    distance: '2.5km',
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
    price: '18,000원',
    status: 'ongoing',
    view_count: 8921,
    like_count: 567,
    distance: '5.2km'
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
    price: '15,000원',
    status: 'upcoming',
    view_count: 3421,
    like_count: 234,
    distance: '5.5km'
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
    price: '25,000원',
    status: 'ended',
    view_count: 42156,
    like_count: 2341,
    distance: '8.1km'
  },
  {
    id: '5',
    title: '조선의 미: 간송 컬렉션',
    venue_name: '간송미술관',
    venue_city: '서울 성북구',
    start_date: '2025-02-01',
    end_date: '2025-05-31',
    description: '간송 전형필이 수집한 조선시대 명품을 만나는 특별전',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754457/sayu/met-artworks/met-chicago-181617.jpg',
    category: '전통미술',
    price: '무료',
    status: 'upcoming',
    view_count: 1892,
    like_count: 156,
    distance: '7.3km'
  },
  {
    id: '6',
    title: '빛과 그림자: 렘브란트 특별전',
    venue_name: '서울시립미술관',
    venue_city: '서울 중구',
    start_date: '2025-01-10',
    end_date: '2025-04-10',
    description: '네덜란드 황금시대의 거장 렘브란트의 명작들',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754459/sayu/met-artworks/met-chicago-201764.jpg',
    category: '회화',
    price: '15,000원',
    status: 'upcoming',
    view_count: 5234,
    like_count: 423,
    distance: '3.2km'
  },
  {
    id: '7',
    title: '아시아 현대미술: 경계를 넘어',
    venue_name: '대림미술관',
    venue_city: '서울 종로구',
    start_date: '2024-12-15',
    end_date: '2025-03-15',
    description: '아시아 현대미술의 다양한 흐름과 실험적 작품들',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754461/sayu/met-artworks/met-chicago-222221.jpg',
    category: '현대미술',
    price: '12,000원',
    status: 'ongoing',
    view_count: 7823,
    like_count: 612,
    distance: '2.8km'
  },
  {
    id: '8',
    title: '서울 사진 비엔날레 2025',
    venue_name: '서울 문화비축기지',
    venue_city: '서울 마포구',
    start_date: '2025-03-01',
    end_date: '2025-05-31',
    description: '국내외 사진작가들의 실험적이고 도전적인 작품 전시',
    image_url: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754463/sayu/met-artworks/met-chicago-241967.jpg',
    category: '사진',
    price: '10,000원',
    status: 'upcoming',
    view_count: 2156,
    like_count: 189,
    distance: '6.5km'
  }
  ];
}

// GET /api/exhibitions
app.get('/api/exhibitions', (req, res) => {
  const { limit = 50, status, category } = req.query;
  
  let filtered = [...exhibitions];
  
  if (status && status !== 'all') {
    filtered = filtered.filter(ex => ex.status === status);
  }
  
  if (category && category !== 'all') {
    filtered = filtered.filter(ex => ex.category === category);
  }
  
  const limited = filtered.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    data: limited,
    total: limited.length
  });
});

// GET /api/exhibitions/popular
app.get('/api/exhibitions/popular', (req, res) => {
  const { limit = 5 } = req.query;
  
  const popular = [...exhibitions]
    .sort((a, b) => (b.view_count + b.like_count) - (a.view_count + a.like_count))
    .slice(0, parseInt(limit));
  
  res.json({
    success: true,
    data: popular
  });
});

// GET /api/exhibitions/:id
app.get('/api/exhibitions/:id', (req, res) => {
  const exhibition = exhibitions.find(ex => ex.id === req.params.id);
  
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

// POST /api/exhibitions/:id/like
app.post('/api/exhibitions/:id/like', (req, res) => {
  const exhibition = exhibitions.find(ex => ex.id === req.params.id);
  
  if (!exhibition) {
    return res.status(404).json({
      success: false,
      error: 'Exhibition not found'
    });
  }
  
  exhibition.like_count = (exhibition.like_count || 0) + 1;
  
  res.json({
    success: true,
    data: {
      id: exhibition.id,
      like_count: exhibition.like_count
    }
  });
});

// GET /api/exhibitions/:id/image - 개별 전시 이미지 생성
app.get('/api/exhibitions/:id/image', async (req, res) => {
  try {
    const exhibition = exhibitions.find(ex => ex.id === req.params.id);
    
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        error: 'Exhibition not found'
      });
    }

    const imageData = await imageService.getExhibitionImage(exhibition);
    
    res.json({
      success: true,
      data: {
        exhibition_id: exhibition.id,
        ...imageData
      }
    });
  } catch (error) {
    console.error('Error generating exhibition image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate image'
    });
  }
});

// GET /api/exhibitions/images/batch - 여러 전시의 이미지를 배치로 생성
app.get('/api/exhibitions/images/batch', async (req, res) => {
  try {
    const { ids, limit = 20 } = req.query;
    
    let targetExhibitions = [];
    
    if (ids) {
      // 특정 ID들의 전시만
      const exhibitionIds = ids.split(',');
      targetExhibitions = exhibitions.filter(ex => exhibitionIds.includes(ex.id));
    } else {
      // 최신 전시들을 기본으로
      targetExhibitions = exhibitions
        .filter(ex => ex.status === 'ongoing')
        .slice(0, parseInt(limit));
    }

    if (targetExhibitions.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No exhibitions found'
      });
    }

    console.log(`Processing images for ${targetExhibitions.length} exhibitions...`);
    const imageResults = await imageService.preloadImages(targetExhibitions);
    
    res.json({
      success: true,
      data: imageResults,
      total: imageResults.length
    });
  } catch (error) {
    console.error('Error in batch image generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate batch images'
    });
  }
});

// GET /api/images/cache/stats - 캐시 통계
app.get('/api/images/cache/stats', (req, res) => {
  try {
    const stats = imageService.getCacheStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/images/cache - 캐시 클리어
app.delete('/api/images/cache', (req, res) => {
  try {
    const result = imageService.clearImageCache();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Simple Exhibition API Server running on http://localhost:${PORT}`);
  console.log(`   - GET /api/exhibitions`);
  console.log(`   - GET /api/exhibitions/popular`);
  console.log(`   - GET /api/exhibitions/:id`);
  console.log(`   - POST /api/exhibitions/:id/like`);
  console.log(`   - GET /api/exhibitions/:id/image`);
  console.log(`   - GET /api/exhibitions/images/batch`);
  console.log(`   - GET /api/images/cache/stats`);
  console.log(`   - DELETE /api/images/cache`);
  console.log(`\n📸 Image Service: Unsplash API integration ready`);
  console.log(`   Remember to set UNSPLASH_ACCESS_KEY environment variable`);
});