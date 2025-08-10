// 통합 작품 풀 사용 예시
// 기존 갤러리 컴포넌트에서 새로운 통합 시스템을 활용하는 방법

'use client';

import React, { useState, useEffect } from 'react';
import { 
  unifiedRecommendationEngine, 
  getRecommendationsForUser, 
  searchArtworksByKeyword,
  getArtworkPoolStatistics,
  SayuRecommendation 
} from './unified-pool-integration';

// 갤러리 컴포넌트 예시
export function UnifiedGalleryExample() {
  const [recommendations, setRecommendations] = useState<SayuRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 사용자 개성 유형 (실제로는 인증 시스템에서 가져옴)
  const userAnimalType = 'LAEF'; // 여우 유형 예시

  // 초기 추천 로드
  useEffect(() => {
    loadPersonalizedRecommendations();
    loadPoolStatistics();
  }, []);

  const loadPersonalizedRecommendations = async () => {
    setLoading(true);
    try {
      const personalizedRecs = await getRecommendationsForUser(userAnimalType, 12);
      setRecommendations(personalizedRecs);
    } catch (error) {
      console.error('추천 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPoolStatistics = async () => {
    try {
      const poolStats = await getArtworkPoolStatistics();
      setStats(poolStats);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchArtworksByKeyword(searchQuery, 8);
      setRecommendations(searchResults);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unified-gallery-container">
      {/* 헤더 섹션 */}
      <div className="gallery-header">
        <h1>SAYU 통합 갤러리</h1>
        <p className="subtitle">
          {stats ? `${stats.total.toLocaleString()}개 작품` : '로딩 중...'} • 
          Cloudinary + Wikimedia 통합
        </p>
      </div>

      {/* 검색 섹션 */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="작가, 작품, 테마로 검색..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading}>
            🔍 검색
          </button>
        </div>
        
        <div className="quick-actions">
          <button onClick={loadPersonalizedRecommendations}>
            🦊 내 취향 추천
          </button>
          <button onClick={() => searchArtworksByKeyword('impressionist').then(setRecommendations)}>
            🎨 인상주의
          </button>
          <button onClick={() => searchArtworksByKeyword('portrait').then(setRecommendations)}>
            👤 초상화
          </button>
          <button onClick={() => searchArtworksByKeyword('landscape').then(setRecommendations)}>
            🏞️ 풍경화
          </button>
        </div>
      </div>

      {/* 통계 섹션 */}
      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <h3>작품 풀 현황</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <span className="label">Cloudinary</span>
                <span className="value">{stats.sources.cloudinary}</span>
              </div>
              <div className="stat-item">
                <span className="label">Wikimedia</span>
                <span className="value">{stats.sources.wikimedia}</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <h3>인기 테마</h3>
            <div className="theme-tags">
              {stats.topThemes?.slice(0, 8).map((theme: any, index: number) => (
                <button 
                  key={index}
                  className="theme-tag"
                  onClick={() => searchArtworksByKeyword(theme.theme).then(setRecommendations)}
                >
                  {theme.theme} ({theme.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 추천 작품 그리드 */}
      <div className="recommendations-section">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>맞춤 추천을 준비하고 있습니다...</p>
          </div>
        ) : (
          <div className="artwork-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="artwork-card">
                <div className="image-container">
                  {rec.image ? (
                    <img 
                      src={rec.image} 
                      alt={rec.title}
                      loading="lazy"
                      onError={(e) => {
                        // 이미지 로드 실패시 대체 이미지
                        e.currentTarget.src = '/placeholder-artwork.jpg';
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      🎨 <span>이미지 없음</span>
                    </div>
                  )}
                  
                  {rec.matchPercent && (
                    <div className="match-badge">
                      {rec.matchPercent}% 매치
                    </div>
                  )}
                  
                  <div className="source-badge">
                    {rec.source === 'cloudinary' ? '📁' : '🌐'}
                  </div>
                </div>
                
                <div className="artwork-info">
                  <h3 className="title">{rec.title}</h3>
                  <p className="artist">{rec.artist} • {rec.year}</p>
                  <p className="description">{rec.description}</p>
                  
                  {rec.curatorNote && (
                    <div className="curator-note">
                      <span className="curator-icon">💭</span>
                      <p>{rec.curatorNote}</p>
                    </div>
                  )}
                  
                  {rec.category && (
                    <div className="categories">
                      {rec.category.map((cat, idx) => (
                        <span key={idx} className="category-tag">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 스타일링 예시 (실제로는 별도 CSS 파일에서)
const styles = `
.unified-gallery-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-header {
  text-align: center;
  margin-bottom: 3rem;
}

.gallery-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-bar input {
  flex: 1;
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
}

.search-bar button {
  padding: 0.8rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-actions button {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.stats-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #667eea;
}

.theme-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.theme-tag {
  padding: 0.4rem 0.8rem;
  background: #f1f3f4;
  border: none;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
}

.artwork-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.artwork-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.artwork-card:hover {
  transform: translateY(-4px);
}

.image-container {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 1.2rem;
}

.match-badge, .source-badge {
  position: absolute;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
}

.match-badge {
  top: 0.5rem;
  right: 0.5rem;
  background: #28a745;
  color: white;
}

.source-badge {
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(255,255,255,0.9);
}

.artwork-info {
  padding: 1.5rem;
}

.title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.artist {
  color: #666;
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.description {
  color: #555;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.curator-note {
  background: #f8f9ff;
  padding: 0.8rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  margin-bottom: 1rem;
}

.curator-note p {
  margin: 0;
  font-size: 0.9rem;
  color: #4a5568;
  font-style: italic;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.category-tag {
  padding: 0.2rem 0.6rem;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #495057;
}

.loading-spinner {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .artwork-grid {
    grid-template-columns: 1fr;
  }
  
  .search-bar {
    flex-direction: column;
  }
}
`;

export default UnifiedGalleryExample;