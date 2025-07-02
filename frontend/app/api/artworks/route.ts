// API Route for artwork recommendations
import { NextResponse } from 'next/server';
import { ArtworkRecommendationEngine } from '@/lib/museums/recommendation-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personalityType = searchParams.get('personality');
    const action = searchParams.get('action');
    
    // Initialize recommendation engine (in production, use env var for API key)
    const engine = new ArtworkRecommendationEngine(
      process.env.RIJKSMUSEUM_API_KEY
    );
    
    // Handle different actions
    switch (action) {
      case 'daily':
        if (!personalityType) {
          return NextResponse.json(
            { error: 'Personality type required' },
            { status: 400 }
          );
        }
        
        const dailyArtwork = await engine.getDailyRecommendation(personalityType);
        return NextResponse.json({ artwork: dailyArtwork });
        
      case 'recommendations':
        if (!personalityType) {
          return NextResponse.json(
            { error: 'Personality type required' },
            { status: 400 }
          );
        }
        
        const preferences = {
          personalityType,
          favoriteColors: searchParams.get('colors')?.split(','),
          preferredStyles: searchParams.get('styles')?.split(','),
          emotionalState: searchParams.get('mood') || undefined,
          viewingContext: searchParams.get('context') as any || undefined
        };
        
        const recommendations = await engine.getRecommendations(preferences);
        return NextResponse.json({ recommendations });
        
      case 'similar':
        const artworkId = searchParams.get('artworkId');
        if (!artworkId) {
          return NextResponse.json(
            { error: 'Artwork ID required' },
            { status: 400 }
          );
        }
        
        // For similar artworks, we'd need to fetch the original first
        // This is simplified for now
        return NextResponse.json({ 
          message: 'Similar artwork endpoint not fully implemented' 
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Artwork API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}