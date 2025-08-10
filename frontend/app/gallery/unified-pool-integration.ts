// 통합 작품 풀과 SAYU 추천 시스템 연결
// 기존 sayu-recommendations.ts와 새로운 artwork-pool-builder.ts를 통합

import { 
  getAllArtworks, 
  getArtworksForPersonalityType, 
  getRandomArtworks,
  searchArtworks,
  UnifiedArtwork,
  ArtworkPool
} from './artwork-pool-builder';

// SAYU 추천 형식에 맞춘 작품 인터페이스
export interface SayuRecommendation {
  title: string;
  artist: string;
  year: string;
  description: string;
  category?: string[];
  image?: string;
  matchPercent?: number;
  curatorNote?: string;
  source?: 'cloudinary' | 'wikimedia' | 'manual';
  originalData?: any;
}

// 통합 풀 기반 SAYU 추천 엔진
export class UnifiedRecommendationEngine {
  private artworkPool: ArtworkPool | null = null;

  // 풀 초기화
  async initialize(): Promise<void> {
    if (!this.artworkPool) {
      console.log('🎨 통합 작품 풀 초기화 중...');
      this.artworkPool = await getAllArtworks();
      console.log(`✅ ${this.artworkPool.total}개 작품으로 추천 엔진 준비 완료`);
    }
  }

  // SAYU 16가지 유형별 개인화 추천
  async getPersonalizedRecommendations(
    animalType: string, 
    count: number = 12
  ): Promise<SayuRecommendation[]> {
    await this.initialize();
    
    console.log(`🦊 ${animalType} 유형을 위한 추천 작품 생성 중...`);
    
    // 1. 개성 맞춤 작품 추출
    const personalityWorks = await getArtworksForPersonalityType(animalType);
    
    // 2. 다양성을 위한 랜덤 작품 추가
    const randomWorks = await getRandomArtworks(count * 2, animalType);
    
    // 3. 통합 및 중복 제거
    const combinedWorks = this.mergeDeDuplicate([
      ...personalityWorks.slice(0, Math.ceil(count * 0.7)), // 70% 개성 맞춤
      ...randomWorks.slice(0, Math.ceil(count * 0.3))       // 30% 다양성
    ]);
    
    // 4. SAYU 추천 형식으로 변환
    const recommendations = combinedWorks
      .slice(0, count)
      .map(work => this.convertToSayuRecommendation(work, animalType));
    
    console.log(`✅ ${recommendations.length}개 개인화 추천 완료`);
    return recommendations;
  }

  // 테마별 추천
  async getThemeRecommendations(
    theme: string, 
    count: number = 8
  ): Promise<SayuRecommendation[]> {
    await this.initialize();
    
    const themeWorks = await searchArtworks(theme);
    const recommendations = themeWorks
      .slice(0, count)
      .map(work => this.convertToSayuRecommendation(work, 'theme-based'));
    
    console.log(`🎭 "${theme}" 테마 추천 ${recommendations.length}개 생성`);
    return recommendations;
  }

  // 작가별 추천
  async getArtistRecommendations(
    artistName: string, 
    count: number = 6
  ): Promise<SayuRecommendation[]> {
    await this.initialize();
    
    const artistWorks = await searchArtworks(artistName);
    const recommendations = artistWorks
      .slice(0, count)
      .map(work => this.convertToSayuRecommendation(work, 'artist-based'));
    
    console.log(`👨‍🎨 "${artistName}" 작품 추천 ${recommendations.length}개 생성`);
    return recommendations;
  }

  // 무드별 추천
  async getMoodRecommendations(
    mood: string, 
    count: number = 10
  ): Promise<SayuRecommendation[]> {
    await this.initialize();
    
    if (!this.artworkPool) return [];
    
    const allWorks = [...this.artworkPool.cloudinaryWorks, ...this.artworkPool.wikimediaWorks];
    const moodWorks = allWorks.filter(work => 
      work.mood.some(m => m.toLowerCase().includes(mood.toLowerCase()))
    );
    
    const recommendations = moodWorks
      .slice(0, count)
      .map(work => this.convertToSayuRecommendation(work, 'mood-based'));
    
    console.log(`🌈 "${mood}" 무드 추천 ${recommendations.length}개 생성`);
    return recommendations;
  }

  // 통합 풀 통계
  async getPoolStats(): Promise<any> {
    await this.initialize();
    if (!this.artworkPool) return null;
    
    const allWorks = [...this.artworkPool.cloudinaryWorks, ...this.artworkPool.wikimediaWorks];
    
    return {
      total: allWorks.length,
      sources: {
        cloudinary: this.artworkPool.metadata.cloudinaryCount,
        wikimedia: this.artworkPool.metadata.wikimediaCount
      },
      topArtists: this.getTopArtists(allWorks, 10),
      topThemes: this.getTopThemes(allWorks, 15),
      topMoods: this.getTopMoods(allWorks, 12),
      mediumDistribution: this.getMediumDistribution(allWorks),
      complexityDistribution: this.getComplexityDistribution(allWorks)
    };
  }

  // === 유틸리티 메서드들 ===

  private convertToSayuRecommendation(
    work: UnifiedArtwork, 
    context: string
  ): SayuRecommendation {
    // 매치 퍼센트 계산 (임시 알고리즘)
    const matchPercent = this.calculateMatchPercent(work, context);
    
    // 큐레이터 노트 생성
    const curatorNote = this.generateCuratorNote(work, context);
    
    return {
      title: work.title,
      artist: work.artist,
      year: work.year || 'Unknown',
      description: work.description || this.generateDescription(work),
      category: this.mapToCategories(work),
      image: work.imageUrl,
      matchPercent,
      curatorNote,
      source: work.source,
      originalData: work.originalData
    };
  }

  private calculateMatchPercent(work: UnifiedArtwork, context: string): number {
    // 복잡한 매칭 알고리즘을 단순화
    let score = 85; // 기본 점수
    
    // 소스별 가중치
    if (work.source === 'wikimedia') score += 5; // 걸작들에 보너스
    
    // 테마 다양성 보너스
    if (work.themes.length > 3) score += 3;
    
    // 개성 맞춤 보너스
    if (context.includes('LAEF') || context.includes('SREF')) score += 5;
    
    return Math.min(98, Math.max(75, score + Math.floor(Math.random() * 10)));
  }

  private generateCuratorNote(work: UnifiedArtwork, context: string): string {
    // 간단한 큐레이터 노트 템플릿들
    const templates = [
      `${work.themes.join(', ')} 요소가 ${context}의 감성과 완벽하게 조화됩니다`,
      `${work.artist}의 독특한 시각이 당신의 개성을 반영합니다`,
      `${work.mood.join(', ')} 무드가 현재 당신의 상태와 공명합니다`,
      `이 작품의 ${work.complexity} 복잡성이 당신의 취향에 딱 맞습니다`,
      `${work.medium}의 질감이 당신의 감각을 자극할 것입니다`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateDescription(work: UnifiedArtwork): string {
    const themes = work.themes.slice(0, 2).join('과 ');
    const mood = work.mood[0] || '감성적';
    return `${themes} 요소가 조화롭게 어우러진 ${mood}인 작품`;
  }

  private mapToCategories(work: UnifiedArtwork): string[] {
    const categories = [];
    
    // 매체별 카테고리
    if (work.medium.toLowerCase().includes('oil')) categories.push('paintings');
    if (work.medium.toLowerCase().includes('sculpture')) categories.push('sculptures');
    if (work.medium.toLowerCase().includes('print')) categories.push('prints');
    if (work.medium.toLowerCase().includes('photo')) categories.push('photography');
    
    // 시대별 카테고리
    if (work.period) {
      if (work.period.includes('modern') || work.period.includes('contemporary')) {
        categories.push('modern');
      } else if (work.period.includes('renaissance') || work.period.includes('classical')) {
        categories.push('classical');
      }
    }
    
    return categories.length > 0 ? categories : ['artworks'];
  }

  private mergeDeDuplicate(works: UnifiedArtwork[]): UnifiedArtwork[] {
    const uniqueWorks = new Map<string, UnifiedArtwork>();
    
    works.forEach(work => {
      const key = `${work.title}-${work.artist}`.toLowerCase();
      if (!uniqueWorks.has(key)) {
        uniqueWorks.set(key, work);
      }
    });
    
    return Array.from(uniqueWorks.values());
  }

  private getTopArtists(works: UnifiedArtwork[], count: number): Array<{name: string, count: number}> {
    const artistCounts = new Map<string, number>();
    
    works.forEach(work => {
      const count = artistCounts.get(work.artist) || 0;
      artistCounts.set(work.artist, count + 1);
    });
    
    return Array.from(artistCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }

  private getTopThemes(works: UnifiedArtwork[], count: number): Array<{theme: string, count: number}> {
    const themeCounts = new Map<string, number>();
    
    works.forEach(work => {
      work.themes.forEach(theme => {
        const count = themeCounts.get(theme) || 0;
        themeCounts.set(theme, count + 1);
      });
    });
    
    return Array.from(themeCounts.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }

  private getTopMoods(works: UnifiedArtwork[], count: number): Array<{mood: string, count: number}> {
    const moodCounts = new Map<string, number>();
    
    works.forEach(work => {
      work.mood.forEach(mood => {
        const count = moodCounts.get(mood) || 0;
        moodCounts.set(mood, count + 1);
      });
    });
    
    return Array.from(moodCounts.entries())
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }

  private getMediumDistribution(works: UnifiedArtwork[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    works.forEach(work => {
      const medium = work.medium.toLowerCase();
      if (medium.includes('oil')) distribution['oil'] = (distribution['oil'] || 0) + 1;
      else if (medium.includes('watercolor')) distribution['watercolor'] = (distribution['watercolor'] || 0) + 1;
      else if (medium.includes('sculpture')) distribution['sculpture'] = (distribution['sculpture'] || 0) + 1;
      else if (medium.includes('print')) distribution['print'] = (distribution['print'] || 0) + 1;
      else distribution['other'] = (distribution['other'] || 0) + 1;
    });
    
    return distribution;
  }

  private getComplexityDistribution(works: UnifiedArtwork[]): Record<string, number> {
    const distribution: Record<string, number> = {
      simple: 0,
      moderate: 0,
      complex: 0
    };
    
    works.forEach(work => {
      distribution[work.complexity]++;
    });
    
    return distribution;
  }
}

// 전역 추천 엔진 인스턴스
export const unifiedRecommendationEngine = new UnifiedRecommendationEngine();

// 편의 함수들
export async function getRecommendationsForUser(animalType: string, count?: number) {
  return unifiedRecommendationEngine.getPersonalizedRecommendations(animalType, count);
}

export async function searchArtworksByKeyword(keyword: string, count?: number) {
  return unifiedRecommendationEngine.getThemeRecommendations(keyword, count);
}

export async function getArtworkPoolStatistics() {
  return unifiedRecommendationEngine.getPoolStats();
}