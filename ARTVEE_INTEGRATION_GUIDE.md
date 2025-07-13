# 🎨 Artvee 통합 가이드 - SAYU 이미지 시스템

## 📋 개요

Artvee.com의 퍼블릭 도메인 고품질 예술 작품을 SAYU 서비스에 통합하여 법적으로 안전하고 시각적으로 풍부한 사용자 경험을 제공합니다.

### Artvee 장점
- ✅ 100% 퍼블릭 도메인 (상업적 사용 가능)
- ✅ 고해상도 이미지
- ✅ 체계적 분류 (시대, 작가, 스타일별)
- ✅ 출처 표시 의무 없음
- ✅ 자유로운 수정/편집 가능

## 🗂️ 데이터베이스 스키마

```sql
-- Artvee 아트웍 컬렉션
CREATE TABLE artvee_artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 기본 정보
  artvee_id VARCHAR(100) UNIQUE,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(200),
  year_created VARCHAR(50),
  
  -- 분류
  period VARCHAR(100), -- 'Renaissance', 'Impressionism', etc.
  style VARCHAR(100),
  genre VARCHAR(100), -- 'Portrait', 'Landscape', 'Still Life'
  medium VARCHAR(200), -- 'Oil on canvas', etc.
  
  -- 이미지 URL
  artvee_url TEXT,
  cdn_url TEXT,
  thumbnail_url TEXT,
  
  -- SAYU 맞춤 태그
  personality_tags TEXT[], -- ['LAEF', 'SRMC', ...]
  emotion_tags TEXT[], -- ['serene', 'dramatic', 'joyful']
  color_palette JSONB, -- 주요 색상 정보
  usage_tags TEXT[], -- ['quiz_bg', 'card', 'loading']
  
  -- 메타데이터
  source_museum VARCHAR(200),
  dimensions VARCHAR(100),
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAYU 이미지 사용 기록
CREATE TABLE image_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID REFERENCES artvee_artworks(id),
  
  usage_type VARCHAR(50), -- 'quiz', 'exhibition_card', 'personality_result'
  usage_context JSONB,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 성격 유형별 아트웍 매핑
CREATE TABLE personality_artwork_mapping (
  personality_type VARCHAR(4) PRIMARY KEY,
  primary_artworks UUID[], -- 대표 작품들
  style_preferences JSONB, -- 선호 스타일
  color_preferences JSONB, -- 선호 색상
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_artvee_artist ON artvee_artworks(artist);
CREATE INDEX idx_artvee_period ON artvee_artworks(period);
CREATE INDEX idx_artvee_tags ON artvee_artworks USING GIN(personality_tags);
CREATE INDEX idx_artvee_emotions ON artvee_artworks USING GIN(emotion_tags);
```

## 🔧 기술 구현

### 1. Artvee 수집기 (Collector)

```javascript
// services/artveeCollector.js
const puppeteer = require('puppeteer');
const sharp = require('sharp');
const { uploadToCloudinary } = require('./cloudinary');

class ArtveeCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  // 카테고리별 수집
  async collectByCategory(category, limit = 50) {
    const page = await this.browser.newPage();
    const artworks = [];
    
    try {
      // 카테고리 페이지 접속
      await page.goto(`${this.baseUrl}/category/${category}/`, {
        waitUntil: 'networkidle2'
      });
      
      // 무한 스크롤 처리
      await this.autoScroll(page, limit);
      
      // 아트웍 정보 추출
      const items = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.product')).map(item => ({
          title: item.querySelector('.product-title')?.textContent,
          artist: item.querySelector('.product-artist')?.textContent,
          thumbnailUrl: item.querySelector('img')?.src,
          detailUrl: item.querySelector('a')?.href
        }));
      });
      
      // 각 아트웍 상세 정보 수집
      for (const item of items.slice(0, limit)) {
        const artwork = await this.collectArtworkDetail(item.detailUrl);
        artworks.push(artwork);
        
        // Rate limiting
        await this.delay(1000);
      }
      
    } finally {
      await page.close();
    }
    
    return artworks;
  }

  // 아트웍 상세 정보 수집
  async collectArtworkDetail(url) {
    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      const artwork = await page.evaluate(() => {
        const getTextContent = (selector) => 
          document.querySelector(selector)?.textContent?.trim() || '';
        
        return {
          title: getTextContent('h1.product-title'),
          artist: getTextContent('.product-artist'),
          year: getTextContent('.product-year'),
          medium: getTextContent('.product-medium'),
          dimensions: getTextContent('.product-dimensions'),
          imageUrl: document.querySelector('.product-image img')?.src,
          downloadUrl: document.querySelector('.download-button')?.href,
          description: getTextContent('.product-description')
        };
      });
      
      // Artvee ID 추출
      artwork.artveeId = url.split('/').pop().replace('/', '');
      artwork.artveeUrl = url;
      
      return artwork;
      
    } finally {
      await page.close();
    }
  }

  // 이미지 처리 및 CDN 업로드
  async processAndUploadImage(artwork) {
    try {
      // 이미지 다운로드
      const imageBuffer = await this.downloadImage(artwork.downloadUrl);
      
      // 다양한 크기로 최적화
      const sizes = {
        thumbnail: { width: 300, height: 300 },
        medium: { width: 800, height: 800 },
        large: { width: 1920, height: 1080 }
      };
      
      const processedImages = {};
      
      for (const [size, dimensions] of Object.entries(sizes)) {
        const processed = await sharp(imageBuffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toBuffer();
          
        // Cloudinary 업로드
        const result = await uploadToCloudinary(processed, {
          folder: `artvee/${size}`,
          public_id: `${artwork.artveeId}_${size}`
        });
        
        processedImages[size] = result.secure_url;
      }
      
      // 색상 팔레트 추출
      const colorPalette = await this.extractColorPalette(imageBuffer);
      
      return {
        ...artwork,
        cdnUrl: processedImages.large,
        thumbnailUrl: processedImages.thumbnail,
        mediumUrl: processedImages.medium,
        colorPalette
      };
      
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  // 색상 팔레트 추출
  async extractColorPalette(imageBuffer) {
    const { dominant, palette } = await sharp(imageBuffer)
      .stats()
      .then(stats => ({
        dominant: stats.dominant,
        palette: stats.channels.map(c => ({
          mean: Math.round(c.mean),
          min: c.min,
          max: c.max
        }))
      }));
      
    return { dominant, palette };
  }

  // SAYU 태그 자동 생성
  generateSayuTags(artwork) {
    const tags = {
      personality: [],
      emotion: [],
      usage: []
    };
    
    // 성격 유형 매칭
    const personalityMapping = {
      'Impressionism': ['LAEF', 'CREF'],
      'Renaissance': ['SRMC', 'GFEF'],
      'Abstract': ['LAEF', 'GREF'],
      'Baroque': ['SREF', 'GRMC']
    };
    
    if (personalityMapping[artwork.period]) {
      tags.personality = personalityMapping[artwork.period];
    }
    
    // 감정 태그
    const emotionKeywords = {
      serene: ['peaceful', 'calm', 'tranquil'],
      dramatic: ['dark', 'storm', 'battle'],
      joyful: ['bright', 'celebration', 'dance']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => 
        artwork.title?.toLowerCase().includes(keyword) ||
        artwork.description?.toLowerCase().includes(keyword)
      )) {
        tags.emotion.push(emotion);
      }
    }
    
    // 사용 용도 태그
    if (artwork.genre === 'Landscape') tags.usage.push('quiz_bg');
    if (artwork.genre === 'Portrait') tags.usage.push('personality_result');
    if (artwork.colorPalette?.dominant) tags.usage.push('card_bg');
    
    return tags;
  }

  // 유틸리티 함수들
  async autoScroll(page, maxItems) {
    await page.evaluate(async (maxItems) => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          const currentItems = document.querySelectorAll('.product').length;
          
          if (totalHeight >= scrollHeight || currentItems >= maxItems) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    }, maxItems);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = ArtveeCollector;
```

### 2. SAYU 통합 서비스

```javascript
// services/artworkService.js
class ArtworkService {
  constructor() {
    this.collector = new ArtveeCollector();
  }

  // 성격 유형별 아트웍 매칭
  async getArtworksForPersonality(personalityType) {
    const mapping = {
      LAEF: {
        periods: ['Impressionism', 'Romanticism'],
        keywords: ['dream', 'mist', 'ethereal'],
        colors: ['blue', 'purple', 'soft']
      },
      SRMC: {
        periods: ['Renaissance', 'Neoclassicism'],
        keywords: ['precise', 'detailed', 'classical'],
        colors: ['brown', 'gold', 'muted']
      },
      GREF: {
        periods: ['Expressionism', 'Fauvism'],
        keywords: ['bold', 'vibrant', 'emotional'],
        colors: ['red', 'orange', 'bright']
      },
      CREF: {
        periods: ['Surrealism', 'Contemporary'],
        keywords: ['unique', 'innovative', 'unconventional'],
        colors: ['mixed', 'contrast', 'unusual']
      }
    };

    const preferences = mapping[personalityType];
    
    const artworks = await db.query(`
      SELECT * FROM artvee_artworks
      WHERE 
        period = ANY($1::text[])
        AND $2::text[] && personality_tags
      ORDER BY 
        CASE 
          WHEN emotion_tags && $3::text[] THEN 1
          ELSE 2
        END,
        created_at DESC
      LIMIT 10
    `, [
      preferences.periods,
      [personalityType],
      preferences.keywords
    ]);

    return artworks.rows;
  }

  // 전시 관련 아트웍 찾기
  async findRelatedArtworks(exhibition) {
    const { artists, period, genre, tags } = exhibition;
    
    // 1. 같은 작가 작품
    const sameArtist = await this.findByArtist(artists);
    
    // 2. 같은 시대/스타일
    const samePeriod = await this.findByPeriod(period);
    
    // 3. 유사한 테마
    const similarTheme = await this.findBySimilarTags(tags);
    
    return {
      featured: sameArtist[0] || samePeriod[0],
      related: [...sameArtist, ...samePeriod, ...similarTheme]
        .filter(unique)
        .slice(0, 6)
    };
  }

  // 퀴즈 배경 이미지 선택
  async getQuizBackgrounds(quizTheme) {
    const themeMapping = {
      'baroque': {
        keywords: ['dramatic', 'dark'],
        artists: ['Caravaggio', 'Rembrandt']
      },
      'impressionism': {
        keywords: ['light', 'color'],
        artists: ['Monet', 'Renoir']
      },
      'modern': {
        keywords: ['abstract', 'geometric'],
        artists: ['Kandinsky', 'Mondrian']
      }
    };

    const config = themeMapping[quizTheme] || themeMapping.modern;
    
    const backgrounds = await db.query(`
      SELECT * FROM artvee_artworks
      WHERE 
        artist = ANY($1::text[])
        OR emotion_tags && $2::text[]
        AND usage_tags @> ARRAY['quiz_bg']
      ORDER BY RANDOM()
      LIMIT 5
    `, [config.artists, config.keywords]);

    return backgrounds.rows;
  }

  // 색상 기반 아트웍 검색
  async findByColorMood(colorMood) {
    const colorMoods = {
      warm: ['red', 'orange', 'yellow'],
      cool: ['blue', 'green', 'purple'],
      neutral: ['gray', 'brown', 'beige'],
      vibrant: ['bright', 'saturated'],
      muted: ['soft', 'pastel']
    };

    const colors = colorMoods[colorMood];
    
    const artworks = await db.query(`
      SELECT * FROM artvee_artworks
      WHERE color_palette->>'dominant' ILIKE ANY($1::text[])
      ORDER BY view_count DESC
      LIMIT 20
    `, [colors.map(c => `%${c}%`)]);

    return artworks.rows;
  }
}
```

### 3. 프론트엔드 컴포넌트

```tsx
// components/artvee/ArtworkBackground.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArtworkBackgroundProps {
  personalityType?: string;
  mood?: 'serene' | 'dramatic' | 'joyful';
  overlay?: boolean;
  blur?: number;
}

export function ArtworkBackground({ 
  personalityType, 
  mood, 
  overlay = true,
  blur = 0 
}: ArtworkBackgroundProps) {
  const [artwork, setArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArtwork();
  }, [personalityType, mood]);

  const loadArtwork = async () => {
    try {
      const response = await fetch('/api/artworks/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalityType, mood })
      });
      
      const data = await response.json();
      setArtwork(data.artwork);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="artwork-background">
      <AnimatePresence mode="wait">
        {artwork && (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="background-wrapper"
          >
            {/* 메인 이미지 */}
            <img
              src={artwork.cdnUrl}
              alt={artwork.title}
              className="background-image"
              style={{
                filter: blur > 0 ? `blur(${blur}px)` : undefined
              }}
            />
            
            {/* 오버레이 */}
            {overlay && (
              <div className="background-overlay" />
            )}
            
            {/* 아트웍 정보 (옵션) */}
            <div className="artwork-credit">
              <span className="artist">{artwork.artist}</span>
              <span className="title">{artwork.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="loading-placeholder">
          <div className="shimmer" />
        </div>
      )}
    </div>
  );
}

// components/artvee/PersonalityArtCard.tsx
export function PersonalityArtCard({ personalityType, result }) {
  const [artworks, setArtworks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadPersonalityArtworks();
  }, [personalityType]);

  const loadPersonalityArtworks = async () => {
    const response = await fetch(
      `/api/artworks/personality/${personalityType}`
    );
    const data = await response.json();
    setArtworks(data.artworks);
  };

  const currentArtwork = artworks[currentIndex];

  return (
    <Card className="personality-art-card">
      {currentArtwork && (
        <>
          {/* 아트웍 이미지 */}
          <div className="artwork-container">
            <img
              src={currentArtwork.mediumUrl}
              alt={currentArtwork.title}
              className="artwork-image"
            />
            
            {/* 네비게이션 */}
            {artworks.length > 1 && (
              <div className="artwork-navigation">
                <button
                  onClick={() => setCurrentIndex((i) => 
                    i > 0 ? i - 1 : artworks.length - 1
                  )}
                >
                  <ChevronLeft />
                </button>
                <span>{currentIndex + 1} / {artworks.length}</span>
                <button
                  onClick={() => setCurrentIndex((i) => 
                    i < artworks.length - 1 ? i + 1 : 0
                  )}
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>
          
          {/* 설명 */}
          <div className="artwork-description">
            <h3>당신의 성격과 어울리는 작품</h3>
            <p className="artwork-info">
              <strong>{currentArtwork.artist}</strong> - {currentArtwork.title}
              {currentArtwork.year && ` (${currentArtwork.year})`}
            </p>
            <p className="match-reason">
              {getMatchReason(personalityType, currentArtwork)}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}

// 매칭 이유 생성
function getMatchReason(personalityType: string, artwork: any): string {
  const reasons = {
    LAEF: {
      Impressionism: "인상주의의 몽환적이고 감성적인 표현이 당신의 예술적 감수성과 잘 어울립니다.",
      Romanticism: "낭만주의의 감정적 깊이가 당신의 내면세계와 공명합니다."
    },
    SRMC: {
      Renaissance: "르네상스의 정교함과 균형미가 당신의 체계적인 사고방식과 일치합니다.",
      Neoclassicism: "신고전주의의 절제된 아름다움이 당신의 완벽주의적 성향을 반영합니다."
    }
    // ... 다른 성격 유형들
  };

  return reasons[personalityType]?.[artwork.period] || 
    "이 작품의 독특한 매력이 당신의 개성과 잘 어울립니다.";
}
```

### 4. API 엔드포인트

```javascript
// routes/artworkRoutes.js
const router = express.Router();

// 배경 이미지 추천
router.post('/background', async (req, res) => {
  const { personalityType, mood, context } = req.body;
  
  try {
    const artwork = await artworkService.getBackgroundArtwork({
      personalityType,
      mood,
      context
    });
    
    // 사용 기록
    await artworkService.logUsage(artwork.id, 'background', {
      personalityType,
      mood,
      context
    });
    
    res.json({ success: true, artwork });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 성격별 아트웍 목록
router.get('/personality/:type', async (req, res) => {
  const { type } = req.params;
  const { limit = 10 } = req.query;
  
  try {
    const artworks = await artworkService.getArtworksForPersonality(
      type, 
      { limit }
    );
    
    res.json({ success: true, artworks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 전시 관련 아트웍
router.get('/exhibition/:id/related', async (req, res) => {
  const { id } = req.params;
  
  try {
    const exhibition = await exhibitionService.getById(id);
    const artworks = await artworkService.findRelatedArtworks(exhibition);
    
    res.json({ success: true, artworks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 색상 무드별 검색
router.get('/mood/:colorMood', async (req, res) => {
  const { colorMood } = req.params;
  
  try {
    const artworks = await artworkService.findByColorMood(colorMood);
    res.json({ success: true, artworks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 🎯 활용 시나리오

### 1. 퀴즈 배경
```javascript
const quizBackgrounds = {
  "바로크 시대": ["Caravaggio", "Rembrandt", "Rubens"],
  "인상주의": ["Monet", "Renoir", "Degas"],
  "현대미술": ["Picasso", "Kandinsky", "Pollock"]
};
```

### 2. 성격 결과 카드
```javascript
const personalityArtworks = {
  LAEF: "Turner - 비와 증기와 속도",
  SRMC: "Vermeer - 진주 귀걸이를 한 소녀",
  GREF: "Van Gogh - 별이 빛나는 밤",
  CREF: "Dali - 기억의 지속"
};
```

### 3. 전시 추천 카드
```javascript
const exhibitionCards = {
  background: "관련 시대 대표작",
  overlay: "그라데이션 + 텍스트",
  animation: "페이드 인/아웃"
};
```

## 📊 수집 계획

### Phase 1: 핵심 컬렉션 (1주)
- Renaissance (100개)
- Impressionism (150개)
- Modern Art (100개)
- Asian Art (50개)

### Phase 2: 확장 (2주)
- Baroque & Rococo
- Romanticism
- Post-Impressionism
- Contemporary

### Phase 3: 특별 컬렉션
- 한국 전통 미술
- 계절별 테마
- 색상별 큐레이션

## 🚀 실행 스크립트

```bash
# 1. 초기 수집
npm run collect:artvee -- --category=impressionism --limit=50

# 2. 이미지 처리
npm run process:images -- --optimize --tag

# 3. DB 임포트
npm run import:artworks

# 4. CDN 동기화
npm run sync:cdn
```

## 📈 모니터링

```javascript
const metrics = {
  totalArtworks: "SELECT COUNT(*) FROM artvee_artworks",
  popularArtworks: "SELECT * FROM image_usage_log ORDER BY view_count DESC",
  personalityMatch: "SELECT personality_type, COUNT(*) FROM image_usage_log GROUP BY personality_type"
};
```