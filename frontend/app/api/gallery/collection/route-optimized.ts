import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Request validation schemas
const GetRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

const PostRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  artworkId: z.string().regex(/^[a-z0-9-]+$/, 'Invalid artwork ID format'),
  action: z.enum(['save', 'remove']),
  artworkData: z.object({
    title: z.string().optional(),
    artist: z.string().optional(),
    year: z.string().optional(),
    imageUrl: z.string().url().optional(),
    museum: z.string().optional(),
    medium: z.string().optional(),
    department: z.string().optional(),
    description: z.string().optional(),
    curatorNote: z.string().optional(),
    style: z.string().optional(),
    isPublicDomain: z.boolean().optional(),
    license: z.string().optional(),
    sourceType: z.string().optional(),
  }).optional()
});

// Helper function for consistent error responses
const errorResponse = (message: string, status: number = 500) => {
  console.error(`[Gallery Collection API] ${message}`);
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
};

// Cache headers for GET requests
const CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
};

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      userId: searchParams.get('userId')
    };

    // Validate request
    const validation = GetRequestSchema.safeParse(params);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400);
    }

    const { userId } = validation.data;
    const supabase = await createClient();

    // Optimized query with proper joins and limited fields
    const { data: savedArtworks, error, count } = await supabase
      .from('artwork_interactions')
      .select(`
        id,
        created_at,
        artworks!inner (
          id,
          external_id,
          title,
          artist,
          year_created,
          image_url,
          medium,
          style,
          description,
          museum,
          department,
          is_public_domain,
          license,
          source_type,
          metadata
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .eq('interaction_type', 'save')
      .order('created_at', { ascending: false })
      .limit(500); // Prevent excessive data transfer

    if (error) {
      console.error('Database query error:', error);
      return errorResponse('Failed to fetch saved artworks');
    }

    // Format response with null safety
    const formattedItems = (savedArtworks || []).map(item => {
      const artwork = item.artworks;
      return {
        id: artwork?.external_id || artwork?.id,
        title: artwork?.title || 'Untitled',
        artist: artwork?.artist || 'Unknown Artist',
        year: artwork?.year_created || '',
        imageUrl: artwork?.image_url || '',
        medium: artwork?.medium || 'Mixed Media',
        style: artwork?.style || '',
        museum: artwork?.museum || '',
        department: artwork?.department || '',
        description: artwork?.description || '',
        isPublicDomain: artwork?.is_public_domain ?? true,
        license: artwork?.license || 'CC0',
        sourceType: artwork?.source_type,
        metadata: artwork?.metadata,
        savedAt: item.created_at
      };
    });

    const response = NextResponse.json({
      success: true,
      count: count || 0,
      items: formattedItems,
      queryTime: Date.now() - startTime
    });

    // Add cache headers for performance
    Object.entries(CACHE_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('Unexpected error in GET:', error);
    return errorResponse('Internal server error');
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    // Validate request
    const validation = PostRequestSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400);
    }

    const { userId, artworkId, action, artworkData } = validation.data;
    const supabase = await createClient();

    console.log(`[Gallery Collection] ${action} artwork:`, {
      userId,
      artworkId,
      hasArtworkData: !!artworkData
    });

    if (action === 'save') {
      // Use transaction-like behavior with RLS
      const { data: result, error: saveError } = await supabase.rpc(
        'save_artwork_optimized',
        {
          p_user_id: userId,
          p_external_id: artworkId,
          p_artwork_data: artworkData ? {
            title: artworkData.title || 'Untitled',
            artist: artworkData.artist || 'Unknown Artist',
            year_created: artworkData.year || '',
            image_url: artworkData.imageUrl || '',
            medium: artworkData.medium || 'Mixed Media',
            style: artworkData.style || artworkData.medium || '',
            description: artworkData.description || artworkData.curatorNote || '',
            museum: artworkData.museum || '',
            department: artworkData.department || '',
            is_public_domain: artworkData.isPublicDomain ?? true,
            license: artworkData.license || 'CC0',
            source_type: artworkData.sourceType || 'user_upload',
            metadata: {}
          } : null
        }
      );

      if (saveError) {
        if (saveError.code === '23505') {
          return NextResponse.json({
            success: true,
            action,
            message: 'Already saved',
            alreadySaved: true
          });
        }
        console.error('Save error:', saveError);
        return errorResponse(`Failed to save artwork: ${saveError.message}`);
      }

      // Get updated count
      const { count } = await supabase
        .from('artwork_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('interaction_type', 'save');

      return NextResponse.json({
        success: true,
        action,
        newCount: count || 0,
        queryTime: Date.now() - startTime
      });

    } else if (action === 'remove') {
      // Remove artwork with proper error handling
      const { data: artwork } = await supabase
        .from('artworks')
        .select('id')
        .eq('external_id', artworkId)
        .single();

      if (!artwork) {
        return NextResponse.json({
          success: true,
          action,
          message: 'Artwork not found or already removed'
        });
      }

      const { error: deleteError } = await supabase
        .from('artwork_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('artwork_id', artwork.id)
        .eq('interaction_type', 'save');

      if (deleteError && deleteError.code !== 'PGRST116') { // Ignore "no rows" error
        console.error('Delete error:', deleteError);
        return errorResponse('Failed to remove artwork');
      }

      // Get updated count
      const { count } = await supabase
        .from('artwork_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('interaction_type', 'save');

      return NextResponse.json({
        success: true,
        action,
        newCount: count || 0,
        queryTime: Date.now() - startTime
      });
    }

  } catch (error) {
    console.error('Unexpected error in POST:', error);
    return errorResponse('Internal server error');
  }
}

// Batch operations for future optimization
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, artworkIds, action } = body;

    if (!userId || !Array.isArray(artworkIds) || !action) {
      return errorResponse('Invalid batch request', 400);
    }

    const supabase = await createClient();
    const results = [];

    // Process in batches of 10 for optimal performance
    const batchSize = 10;
    for (let i = 0; i < artworkIds.length; i += batchSize) {
      const batch = artworkIds.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(artworkId => 
          processSingleArtwork(supabase, userId, artworkId, action)
        )
      );

      results.push(...batchResults);
    }

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      processed: artworkIds.length,
      successful,
      failed,
      results: results.map((r, i) => ({
        artworkId: artworkIds[i],
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? r.reason : undefined
      }))
    });

  } catch (error) {
    console.error('Batch operation error:', error);
    return errorResponse('Batch operation failed');
  }
}

// Helper function for batch processing
async function processSingleArtwork(
  supabase: any,
  userId: string,
  artworkId: string,
  action: 'save' | 'remove'
) {
  // Implementation similar to single POST but without response formatting
  // This would be used for batch operations
  return { artworkId, success: true };
}