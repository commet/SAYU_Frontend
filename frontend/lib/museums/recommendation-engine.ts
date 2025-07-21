// SAYU Artwork Recommendation Engine
// Matches users with artworks based on personality type and preferences

import { Artwork, UnifiedMuseumClient } from './api-client';
import { ArtworkEnrichmentService } from './artwork-enrichment';
import { getSAYUType, isValidSAYUType, type SAYUType } from '../../../shared/SAYUTypeDefinitions';

export interface UserPreferences {
  personalityType: string;
  favoriteColors?: string[];
  preferredStyles?: string[];
  avoidStyles?: string[];
  emotionalState?: string;
  viewingContext?: 'meditation' | 'study' | 'inspiration' | 'relaxation';
}

export interface RecommendationScore {
  artwork: Artwork;
  score: number;
  matchReasons: string[];
}

export class ArtworkRecommendationEngine {
  private museumClient: UnifiedMuseumClient;
  private enrichmentService: ArtworkEnrichmentService;
  
  constructor(rijksApiKey?: string) {
    this.museumClient = new UnifiedMuseumClient(rijksApiKey);
    this.enrichmentService = new ArtworkEnrichmentService();
  }
  
  // Get personalized recommendations
  async getRecommendations(
    preferences: UserPreferences,
    count = 20
  ): Promise<RecommendationScore[]> {
    // Get base artworks for personality type
    const baseArtworks = await this.museumClient.getArtworksByPersonality(
      preferences.personalityType
    );
    
    // Enrich artworks with additional metadata
    const enrichedArtworks = await this.enrichmentService.enrichArtworkBatch(
      baseArtworks.slice(0, 50) // Limit for performance
    );
    
    // Score and rank artworks
    const scoredArtworks = enrichedArtworks.map(artwork => 
      this.scoreArtwork(artwork, preferences)
    );
    
    // Sort by score and return top results
    return scoredArtworks
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }
  
  // Score artwork based on user preferences
  private scoreArtwork(
    artwork: Artwork, 
    preferences: UserPreferences
  ): RecommendationScore {
    let score = 0;
    const matchReasons: string[] = [];
    
    // Get SAYU type information for enhanced matching
    let sayuType: SAYUType | null = null;
    if (isValidSAYUType(preferences.personalityType)) {
      sayuType = getSAYUType(preferences.personalityType);
    }
    
    // Enhanced personality match using SAYU type preferences
    if (sayuType) {
      // Style preference matching (enhanced)
      const styleMatch = sayuType.artPreferences.preferredStyles.some(preferredStyle =>
        artwork.tags.some(tag => 
          tag.toLowerCase().includes(preferredStyle.toLowerCase()) ||
          preferredStyle.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (styleMatch) {
        score += 40;
        matchReasons.push(`Matches your ${sayuType.name} style preferences`);
      }
      
      // Subject preference matching
      const subjectMatch = sayuType.artPreferences.preferredSubjects.some(subject =>
        artwork.tags.some(tag => 
          tag.toLowerCase().includes(subject.toLowerCase()) ||
          subject.toLowerCase().includes(tag.toLowerCase())
        ) || artwork.description?.toLowerCase().includes(subject.toLowerCase())
      );
      if (subjectMatch) {
        score += 30;
        matchReasons.push(`Matches your preferred subjects as a ${sayuType.name}`);
      }
      
      // Color preference matching (enhanced with SAYU preferences)
      const colorMatch = sayuType.artPreferences.preferredColors.some(preferredColor =>
        artwork.colors?.some(artworkColor => 
          artworkColor.toLowerCase().includes(preferredColor.toLowerCase()) ||
          preferredColor.toLowerCase().includes(artworkColor.toLowerCase())
        )
      );
      if (colorMatch) {
        score += 25;
        matchReasons.push(`Color palette aligns with your ${sayuType.name} preferences`);
      }
    }
    
    // Legacy personality match (for backward compatibility)
    if (artwork.personalityMatch?.includes(preferences.personalityType)) {
      score += 35;
      matchReasons.push('Direct personality type match');
    }
    
    // Color preferences
    if (preferences.favoriteColors && artwork.colors) {
      const colorMatch = preferences.favoriteColors.some(color =>
        artwork.colors?.some(artworkColor => 
          artworkColor.toLowerCase().includes(color.toLowerCase())
        )
      );
      if (colorMatch) {
        score += 20;
        matchReasons.push('Contains your favorite colors');
      }
    }
    
    // Style preferences
    if (preferences.preferredStyles) {
      const styleMatch = preferences.preferredStyles.some(style =>
        artwork.tags.some(tag => 
          tag.toLowerCase().includes(style.toLowerCase())
        )
      );
      if (styleMatch) {
        score += 30;
        matchReasons.push('Matches your preferred style');
      }
    }
    
    // Avoid certain styles
    if (preferences.avoidStyles) {
      const avoidMatch = preferences.avoidStyles.some(style =>
        artwork.tags.some(tag => 
          tag.toLowerCase().includes(style.toLowerCase())
        )
      );
      if (avoidMatch) {
        score -= 40;
        matchReasons.push('Contains style you prefer to avoid');
      }
    }
    
    // Emotional state matching
    if (preferences.emotionalState && artwork.emotionalTags) {
      const emotionalMatch = this.matchEmotionalState(
        preferences.emotionalState,
        artwork.emotionalTags
      );
      if (emotionalMatch) {
        score += 25;
        matchReasons.push('Matches your current mood');
      }
    }
    
    // Context-based scoring
    if (preferences.viewingContext) {
      score += this.getContextScore(artwork, preferences.viewingContext);
      if (score > 0) {
        matchReasons.push(`Good for ${preferences.viewingContext}`);
      }
    }
    
    // Bonus for high-quality images
    if (artwork.imageUrl && !artwork.imageUrl.includes('small')) {
      score += 5;
    }
    
    return { artwork, score, matchReasons };
  }
  
  // Match emotional states
  private matchEmotionalState(
    userState: string, 
    artworkTags: string[]
  ): boolean {
    const emotionalMap: Record<string, string[]> = {
      'calm': ['peaceful', 'serene', '평화로운', '고요한'],
      'energized': ['vibrant', 'dynamic', '활기찬', '역동적'],
      'contemplative': ['thoughtful', 'meditative', '사색적', '명상적'],
      'joyful': ['bright', 'cheerful', '밝은', '즐거운'],
      'melancholic': ['moody', 'introspective', '우울한', '내성적']
    };
    
    const relatedTags = emotionalMap[userState] || [];
    return artworkTags.some(tag => 
      relatedTags.some(related => 
        tag.toLowerCase().includes(related.toLowerCase())
      )
    );
  }
  
  // Get context-based score
  private getContextScore(
    artwork: Artwork, 
    context: string
  ): number {
    const contextScores: Record<string, (artwork: Artwork) => number> = {
      'meditation': (art) => {
        if (art.tags.some(tag => 
          ['abstract', 'minimal', 'serene', 'peaceful'].includes(tag.toLowerCase())
        )) {
          return 15;
        }
        return 0;
      },
      'study': (art) => {
        if (art.classification?.includes('print') || 
            art.tags.some(tag => ['detail', 'technical'].includes(tag.toLowerCase()))) {
          return 15;
        }
        return 0;
      },
      'inspiration': (art) => {
        if (art.tags.some(tag => 
          ['innovative', 'experimental', 'bold'].includes(tag.toLowerCase())
        )) {
          return 15;
        }
        return 0;
      },
      'relaxation': (art) => {
        if (art.tags.some(tag => 
          ['landscape', 'nature', 'calm'].includes(tag.toLowerCase())
        )) {
          return 15;
        }
        return 0;
      }
    };
    
    return contextScores[context]?.(artwork) || 0;
  }
  
  // Get similar artworks
  async getSimilarArtworks(
    artwork: Artwork, 
    count = 10
  ): Promise<Artwork[]> {
    // Search by artist
    const byArtist = await this.museumClient.searchAllMuseums(artwork.artist);
    
    // Search by style/tags
    const byStyle = artwork.tags.length > 0 
      ? await this.museumClient.searchAllMuseums(artwork.tags[0])
      : [];
    
    // Combine and deduplicate
    const allSimilar = [...byArtist, ...byStyle];
    const unique = Array.from(
      new Map(allSimilar.map(a => [a.id, a])).values()
    );
    
    // Remove the original artwork
    const filtered = unique.filter(a => a.id !== artwork.id);
    
    // Enrich and return
    return this.enrichmentService.enrichArtworkBatch(
      filtered.slice(0, count)
    );
  }
  
  // Get daily recommendation
  async getDailyRecommendation(personalityType: string): Promise<Artwork | null> {
    // Use date as seed for consistency throughout the day
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Get artworks for personality
    const artworks = await this.museumClient.getArtworksByPersonality(personalityType);
    
    if (artworks.length === 0) return null;
    
    // Select based on seeded index
    const index = seed % artworks.length;
    const selected = artworks[index];
    
    // Enrich and return
    return this.enrichmentService.enrichArtwork(selected);
  }
}