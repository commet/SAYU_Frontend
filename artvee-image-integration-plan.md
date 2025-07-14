# Artvee 이미지 통합 계획

## 1. 이미지 서빙 아키텍처

### 옵션 1: CDN 활용 (권장)
```
Frontend → Cloudinary CDN → Cached Images
```
- 장점: 빠른 로딩, 자동 리사이징, 글로벌 배포
- 단점: 초기 업로드 필요, 월간 대역폭 제한

### 옵션 2: 로컬 서버 직접 서빙
```
Frontend → Backend Express → Local Images
```
- 장점: 완전한 제어, 무제한 사용
- 단점: 서버 부하, 느린 로딩

### 옵션 3: 하이브리드 (최적)
```
Frontend → Backend API → 
  ├─ Thumbnails: Cloudinary
  └─ Full Images: S3/Local with signed URLs
```

## 2. 프론트엔드 구현 계획

### A. 이미지 컴포넌트 개선
```typescript
// components/artvee/ArtworkImage.tsx
interface ArtworkImageProps {
  artveeId: string;
  size: 'thumbnail' | 'medium' | 'full';
  artwork: ArtworkData;
  loading?: 'lazy' | 'eager';
}

const ArtworkImage = ({ artveeId, size, artwork, loading = 'lazy' }: ArtworkImageProps) => {
  const { data: imageUrl } = useArtworkImage(artveeId, size);
  
  return (
    <Image
      src={imageUrl || '/placeholder.jpg'}
      alt={`${artwork.title} by ${artwork.artist}`}
      loading={loading}
      sizes={getSizes(size)}
      className={getImageClasses(size)}
    />
  );
};
```

### B. 이미지 갤러리 개선
```typescript
// components/artvee/PersonalityArtworkGallery.tsx
const PersonalityArtworkGallery = ({ sayuType }: { sayuType: string }) => {
  const { data: artworks, isLoading } = usePersonalityArtworks(sayuType);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel' | 'masonry'>('grid');
  const [filter, setFilter] = useState({ artist: '', period: '', style: '' });
  
  return (
    <div>
      <GalleryControls 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        filters={filter}
        onFilterChange={setFilter}
      />
      
      {viewMode === 'grid' && <GridView artworks={filteredArtworks} />}
      {viewMode === 'carousel' && <CarouselView artworks={filteredArtworks} />}
      {viewMode === 'masonry' && <MasonryView artworks={filteredArtworks} />}
    </div>
  );
};
```

### C. 퀴즈 결과 페이지 개선
```typescript
// app/results/page.tsx 개선
const ResultsPage = () => {
  const { quizResult } = useQuizResult();
  const { data: recommendedArtworks } = useRecommendedArtworks(quizResult.sayuType);
  const { data: similarUsers } = useSimilarUsers(quizResult.sayuType);
  
  return (
    <div>
      {/* 1. 성격 분석 결과 */}
      <PersonalityAnalysis result={quizResult} />
      
      {/* 2. 맞춤 작품 추천 */}
      <section>
        <h2>당신을 위한 작품 추천</h2>
        <ArtworkCarousel 
          artworks={recommendedArtworks}
          onArtworkClick={(artwork) => {
            // 상세 모달 또는 페이지로 이동
          }}
        />
      </section>
      
      {/* 3. 좋아할 만한 작가들 */}
      <section>
        <h2>추천 작가</h2>
        <ArtistGrid artists={getUniqueArtists(recommendedArtworks)} />
      </section>
      
      {/* 4. 비슷한 취향의 사용자 */}
      <section>
        <h2>비슷한 예술 취향을 가진 사람들</h2>
        <UserList users={similarUsers} />
      </section>
    </div>
  );
};
```

### D. 작품 상세 페이지
```typescript
// app/artwork/[id]/page.tsx (새로 생성)
const ArtworkDetailPage = ({ params }: { params: { id: string } }) => {
  const { data: artwork } = useArtwork(params.id);
  const { data: relatedArtworks } = useRelatedArtworks(params.id);
  
  return (
    <div>
      {/* 고해상도 이미지 뷰어 */}
      <ArtworkViewer artwork={artwork} />
      
      {/* 작품 정보 */}
      <ArtworkInfo artwork={artwork} />
      
      {/* AI 작품 해설 */}
      <AIArtworkAnalysis artwork={artwork} />
      
      {/* 사용자 반응 */}
      <UserReactions artworkId={params.id} />
      
      {/* 관련 작품 */}
      <RelatedArtworks artworks={relatedArtworks} />
    </div>
  );
};
```

## 3. API 엔드포인트 정리

### 필요한 백엔드 엔드포인트:
```
GET /api/artvee/artworks/:id
GET /api/artvee/artworks/:id/image?size=thumbnail|medium|full
GET /api/artvee/personalities/:sayuType/artworks
GET /api/artvee/artists/:artistSlug/artworks
GET /api/artvee/recommendations?userId=&sayuType=
POST /api/artvee/artworks/:id/reactions
GET /api/artvee/search?q=&artist=&style=&period=
```

## 4. 캐싱 전략

### 이미지 캐싱:
- Thumbnails: 브라우저 캐시 + Service Worker
- Medium: 1주일 캐시
- Full: 온디맨드 로딩, 1시간 캐시

### 데이터 캐싱:
- React Query로 작품 메타데이터 캐싱
- staleTime: 5분, cacheTime: 30분

## 5. 성능 최적화

### 이미지 최적화:
1. Next.js Image 컴포넌트 활용
2. 레이지 로딩
3. 프로그레시브 로딩 (blur placeholder)
4. WebP 포맷 자동 변환

### 데이터 최적화:
1. 무한 스크롤 구현
2. 가상 스크롤 (대량 목록)
3. 프리페칭 전략

## 6. 구현 우선순위

### Phase 1 (즉시):
1. ✅ ArtworkImage 컴포넌트 생성
2. ✅ 퀴즈 결과 페이지에 작품 추천 통합
3. ✅ 기본 갤러리 뷰 구현

### Phase 2 (1주):
1. 작품 상세 페이지
2. 검색 및 필터링
3. 사용자 반응 시스템

### Phase 3 (2주):
1. AI 작품 해설
2. 소셜 기능 연동
3. 개인화 추천 고도화

## 7. 미해결 이슈 해결

### API 엔드포인트 불일치:
- `/api/community/users/:userId/follow` → `/api/users/:userId/follow` 통일
- 백엔드 라우트 정리 필요

### WebSocket 실시간 업데이트:
- Socket.io 서버 구현
- 게이미피케이션 실시간 포인트 업데이트
- 새 팔로워 알림

### 환경 변수 표준화:
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_IMAGE_CDN_URL=https://res.cloudinary.com/sayu
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```