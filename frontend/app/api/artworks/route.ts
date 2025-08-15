// API Route for artwork data and recommendations
import { NextResponse } from 'next/server';
import { ArtworkRecommendationEngine } from '@/lib/museums/recommendation-engine';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personalityType = searchParams.get('personality');
    const action = searchParams.get('action');
    
    // Handle static data requests first (no action means return all artworks)
    if (!action) {
      try {
        // Import the JSON directly (works with Vercel)
        const artworksData = await import('../../../public/data/artworks.json').then(module => module.default || module).catch(() => null);
        
        if (artworksData) {
          console.log('Successfully loaded artworks via import, count:', artworksData.artworks?.length || 0);
          return NextResponse.json(artworksData, {
            headers: {
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
            },
          });
        }
        
        // Fallback to file system read (for local development)
        const jsonPath = path.join(process.cwd(), 'public', 'data', 'artworks.json');
        console.log('Attempting to read artworks from:', jsonPath);
        const jsonData = await fs.readFile(jsonPath, 'utf8');
        const data = JSON.parse(jsonData);
        console.log('Successfully loaded artworks, count:', data.artworks?.length || 0);
        
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
          },
        });
      } catch (error) {
        console.error('Failed to load artworks:', error);
        // Return empty data structure for graceful degradation
        return NextResponse.json(
          { 
            metadata: { 
              total: 0, 
              source: 'fallback',
              message: 'Artworks data temporarily unavailable' 
            }, 
            artworks: [] 
          },
          { 
            status: 200,
            headers: {
              'Cache-Control': 'no-store',
            },
          }
        );
      }
    }
    
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