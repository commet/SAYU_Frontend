# 🎨 SAYU Exhibition Integration System

A comprehensive real-world exhibition data integration system that collects, processes, and serves Korean cultural exhibition data with SAYU's unique APT (Animal Personality Type) matching system.

## 🌟 Features

- **Real-time Korean Cultural APIs Integration**
  - Culture Portal (문화포털)
  - Seoul Open Data Plaza (서울열린데이터광장)  
  - Korea Culture & Tourism Institute
  - Major museum websites crawling

- **Advanced APT Compatibility Matching**
  - 16 animal personality types integration
  - Content-based exhibition categorization
  - Venue-specific personality affinity mapping

- **Automated Data Collection**
  - Daily API collection (lightweight)
  - Weekly full crawling (comprehensive)
  - Monthly data cleanup and optimization
  - Real-time status updates

- **Enhanced Map Integration**
  - Accurate Seoul venue coordinates
  - APT-based exhibition filtering
  - Real-time exhibition status
  - Interactive venue information

## 🚀 Quick Start

### 1. Environment Setup

Create `.env` file with required API keys:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional (for full functionality)
CULTURE_API_KEY=your_culture_portal_api_key
SEOUL_API_KEY=your_seoul_opendata_api_key
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 2. Database Schema

The system uses the existing `exhibitions` table from the Supabase schema. Ensure you have the exhibition companion migration applied:

```sql
-- Run in Supabase SQL Editor if not already applied
-- See: supabase/migrations/006_exhibition_companion.sql
```

### 3. System Initialization

```bash
# Test system components
cd backend
node scripts/testExhibitionSystem.js

# Initialize with sample data
node scripts/setupExhibitionSystem.js

# Run first data collection
node scripts/collectExhibitions.js
```

### 4. Frontend Integration

The exhibition map is available at `/exhibitions` and automatically uses the new API endpoint:

```typescript
// API Endpoint: /api/exhibitions/map
// Parameters:
// - status: 'all' | 'ongoing' | 'upcoming' | 'ended' | 'current'
// - apt_type: any of the 16 APT types (LAEF, SAEF, etc.)
// - limit: number of exhibitions to return
```

## 📊 Data Sources & Coverage

### Primary APIs
1. **Culture Portal (문화포털)** - Priority 1
   - Government cultural events data
   - Nationwide coverage
   - Daily limit: 1,000 requests

2. **Seoul Open Data Plaza** - Priority 1  
   - Seoul city cultural events
   - Exhibition and performance data
   - Real-time updates

3. **Korean Cultural APIs** - Priority 2
   - Tourism and cultural institute data
   - Historical and cultural exhibitions

### Secondary Sources
- Major museum websites (MMCA, SeMA, Leeum, etc.)
- Gallery crawling (selective)
- Cultural center events

### Seoul Venue Coverage

The system includes accurate coordinates and APT compatibility for:

- **National Museums**
  - 국립현대미술관 서울 (MMCA Seoul)
  - 국립중앙박물관 (National Museum of Korea)

- **Municipal Museums**  
  - 서울시립미술관 (SeMA)
  - 북서울미술관, 남서울미술관

- **Private Museums**
  - 리움미술관 (Leeum Museum)
  - 아모레퍼시픽미술관 (Amorepacific Museum)
  - 대림미술관 (Daelim Museum)

- **Major Galleries**
  - 국제갤러리, 갤러리현대, 페이스갤러리
  - 아트선재센터, 하이트컬렉션
  - 50+ additional venues

## 🐾 APT Integration System

### 16 Animal Types with Exhibition Affinity

```javascript
const APT_TYPES = {
  'LAEF': { name: '여우', traits: ['창의적', '실험적', '독립적'] },
  'LAEC': { name: '고양이', traits: ['분석적', '독립적', '신중한'] },
  'LAMF': { name: '올빼미', traits: ['분석적', '독립적', '깊이있는'] },
  'LAMC': { name: '거북이', traits: ['분석적', '독립적', '체계적'] },
  'LREF': { name: '카멜레온', traits: ['창의적', '관계지향', '적응적'] },
  'LREC': { name: '고슴도치', traits: ['분석적', '관계지향', '신중한'] },
  'LRMF': { name: '문어', traits: ['분석적', '관계지향', '깊이있는'] },
  'LRMC': { name: '비버', traits: ['분석적', '관계지향', '체계적'] },
  'SAEF': { name: '나비', traits: ['감성적', '활동적', '창의적'] },
  'SAEC': { name: '펭귄', traits: ['감성적', '활동적', '신중한'] },
  'SAMF': { name: '앵무새', traits: ['감성적', '활동적', '깊이있는'] },
  'SAMC': { name: '사슴', traits: ['감성적', '활동적', '체계적'] },
  'SREF': { name: '강아지', traits: ['감성적', '관계지향', '창의적'] },
  'SREC': { name: '오리', traits: ['감성적', '관계지향', '신중한'] },
  'SRMF': { name: '코끼리', traits: ['감성적', '관계지향', '깊이있는'] },
  'SRMC': { name: '독수리', traits: ['감성적', '관계지향', '체계적'] }
}
```

### Exhibition Categorization

- **Contemporary Art** → LAEF, SAEF, LAMF (experimental, creative types)
- **Traditional Art** → LRMC, SRMC, SAMC (systematic, respectful types)  
- **Photography** → LREC, SREC, LREF (observational, detail-oriented)
- **Interactive/Media** → SREF, SAEF, SRMF (social, engaging types)
- **Minimalism** → LAMC, LRMC, LAMF (contemplative, refined types)

### Venue Affinity Mapping

Each venue has APT compatibility scores:

```javascript
// Example: MMCA Seoul
apt_compatibility: {
  'LAEF': 0.95, // 여우 - 창의적, 실험적 전시 최고
  'SAEF': 0.90, // 나비 - 감성적, 아름다운 전시  
  'LRMC': 0.90, // 거북이 - 체계적, 학술적 전시
  'SRMC': 0.85, // 독수리 - 권위 있는 전시
}
```

## 🤖 Automated Collection System

### Cron Job Schedule

```bash
# Daily API Collection - 6:00 AM KST
node cron/exhibitionCron.js

# Schedule:
# - Daily: Korean cultural APIs (lightweight)
# - Weekly: Full museum crawling (Sunday 3 AM)  
# - Monthly: Data cleanup (1st day 2 AM)
# - Hourly: System health check (:30)
```

### Manual Collection

```bash
# Full collection with all sources
node scripts/collectExhibitions.js

# Limited collection for testing
node scripts/collectExhibitions.js --limit=50

# Dry run (no database writes)
node scripts/collectExhibitions.js --dry-run

# Force update (skip duplicate checks)
node scripts/collectExhibitions.js --force
```

## 📱 API Endpoints

### Exhibition Map API

**GET** `/api/exhibitions/map`

**Parameters:**
- `status` (optional): `'all'` | `'ongoing'` | `'upcoming'` | `'ended'` | `'current'`
- `apt_type` (optional): Any of the 16 APT types
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "exhibitions": [...],
  "venues": [...],
  "stats": {
    "total": 42,
    "ongoing": 15,
    "upcoming": 20,
    "ended": 7,
    "venues": 12
  },
  "apt_types": {...},
  "center": { "lat": 37.5665, "lng": 126.9780 },
  "filters": {
    "available_apt_types": [...],
    "available_categories": [...],
    "available_venues": [...]
  }
}
```

## 🛠️ Architecture

### Core Components

```
backend/
├── src/services/
│   ├── realExhibitionIntegrator.js    # Main integration service
│   ├── koreanCulturalAPIService.js    # Korean API collection
│   └── enhancedExhibitionCollectorService.js # Legacy enhanced collector
├── scripts/
│   ├── setupExhibitionSystem.js       # System initialization
│   ├── collectExhibitions.js          # Manual collection runner
│   └── testExhibitionSystem.js        # System testing
├── cron/
│   └── exhibitionCron.js             # Automated scheduling
└── reports/                          # Generated reports

frontend/
└── app/api/exhibitions/map/route.ts  # Enhanced map API endpoint
```

### Data Flow

1. **Collection** → Korean APIs + Museum crawling
2. **Processing** → Standardization + APT mapping + Geocoding
3. **Storage** → Supabase with deduplication
4. **API** → Enhanced endpoint with filtering
5. **Frontend** → Interactive map with APT integration

## 🔧 Configuration

### API Keys Setup

1. **Culture Portal API**
   - Visit: https://www.culture.go.kr/openapi/
   - Apply for API key
   - Add to `CULTURE_API_KEY`

2. **Seoul Open Data**
   - Visit: https://data.seoul.go.kr/
   - Register and get API key
   - Add to `SEOUL_API_KEY`

3. **Naver Search API** (optional)
   - Visit: https://developers.naver.com/
   - Create application
   - Add `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET`

### Venue Configuration

Edit `realExhibitionIntegrator.js` to add new venues:

```javascript
seoulVenues.push({
  name: '새로운 미술관',
  name_en: 'New Museum',
  lat: 37.5000,
  lng: 127.0000,
  district: '강남구',
  type: 'private_museum',
  apt_compatibility: {
    'LAEF': 0.8,
    'SAEF': 0.7
    // ... other types
  }
});
```

## 📊 Monitoring & Analytics

### Collection Reports

Reports are automatically generated in `backend/reports/`:
- Daily collection summaries
- Weekly comprehensive reports  
- Monthly analytics
- System test results

### Health Monitoring

```bash
# System status check
node scripts/testExhibitionSystem.js

# Database statistics
node -e "
const service = require('./src/services/realExhibitionIntegrator');
service.supabase
  .from('exhibitions')
  .select('status, source', { count: 'exact' })
  .then(({count}) => console.log(\`Total exhibitions: \${count}\`));
"
```

## 🎯 Performance Optimization

### Query Optimization
- Database indexes on `start_date`, `end_date`, `status`, `venue`
- GIN index on `recommended_apt` array
- Coordinates indexed for map queries

### Caching Strategy
- API response caching (client-side)
- Static venue data caching
- Computed APT recommendations caching

### Rate Limiting
- Korean APIs: Respect daily limits (1000/day)
- Museum crawling: Polite delays (2s between requests)
- Batch processing for large datasets

## 🚨 Troubleshooting

### Common Issues

1. **No exhibitions displayed**
   ```bash
   # Check database connection
   node scripts/testExhibitionSystem.js
   
   # Run manual collection
   node scripts/collectExhibitions.js --limit=10
   ```

2. **API key errors**
   ```bash
   # Verify environment variables
   echo $CULTURE_API_KEY
   
   # Test with limited scope
   node scripts/collectExhibitions.js --dry-run
   ```

3. **APT mapping issues**
   ```bash
   # Check APT recommendation generation
   node -e "
   const service = require('./src/services/realExhibitionIntegrator');
   console.log(service.generateAPTRecommendations({
     title: '현대미술전',
     description: '실험적인 작품들'
   }));
   "
   ```

### Debug Mode

Enable verbose logging:
```bash
DEBUG=sayu:* node scripts/collectExhibitions.js --verbose
```

## 🤝 Contributing

### Adding New Data Sources

1. Create collector in `services/`
2. Add to `realExhibitionIntegrator.js`  
3. Update tests in `testExhibitionSystem.js`
4. Add to cron schedule if needed

### Enhancing APT Mapping

1. Update category mappings in `generateAPTRecommendations()`
2. Add venue compatibility scores
3. Test with diverse exhibition content
4. Update documentation

## 📝 License

This exhibition integration system is part of the SAYU project and follows the same licensing terms.

---

## 🎉 Success Metrics

After setup, you should see:

- ✅ **50-200 exhibitions** in database (Seoul area)
- ✅ **15-25 venues** with accurate coordinates  
- ✅ **100% APT coverage** for all exhibitions
- ✅ **Real-time status updates** (ongoing/upcoming/ended)
- ✅ **Sub-second API responses** for map queries
- ✅ **Automated daily updates** via cron jobs

Ready to bring real Korean cultural data to SAYU! 🎨🇰🇷