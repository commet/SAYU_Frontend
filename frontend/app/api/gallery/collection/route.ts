import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID required',
        count: 0,
        items: []
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Get saved artworks count and details
    const { data: savedArtworks, error: savedError, count } = await supabase
      .from('artwork_interactions')
      .select(`
        id,
        artwork_id,
        created_at,
        artworks:artwork_id (
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
          emotion_tags,
          tags
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .eq('interaction_type', 'save')
      .order('created_at', { ascending: false });

    if (savedError) {
      console.error('Supabase error:', savedError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch saved artworks',
        count: 0,
        items: []
      }, { status: 500 });
    }

    // Format the response - use external_id if available, otherwise internal id
    const formattedItems = (savedArtworks || []).map(item => ({
      id: item.artworks?.external_id || item.artwork_id,  // Use external_id for client
      title: item.artworks?.title || 'Untitled',
      artist: item.artworks?.artist || 'Unknown Artist',
      year: item.artworks?.year_created || '',
      imageUrl: item.artworks?.image_url || '',
      medium: item.artworks?.medium || 'Mixed Media',
      style: item.artworks?.style || '',
      museum: item.artworks?.museum || '',
      department: item.artworks?.department || '',
      description: item.artworks?.description || '',
      isPublicDomain: item.artworks?.is_public_domain || true,
      license: item.artworks?.license || 'CC0',
      curatorNote: item.artworks?.description || '',
      emotionTags: item.artworks?.emotion_tags || [],
      tags: item.artworks?.tags || [],
      savedAt: item.created_at
    }));

    return NextResponse.json({
      success: true,
      count: count || 0,
      items: formattedItems
    });

  } catch (error) {
    console.error('Gallery collection API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      count: 0,
      items: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, artworkId, action, artworkData } = body;

    console.log('POST /api/gallery/collection - Request:', { userId, artworkId, action, hasArtworkData: !!artworkData });

    if (!userId || !artworkId || !['save', 'remove'].includes(action)) {
      console.error('Invalid parameters:', { userId, artworkId, action });
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters'
      }, { status: 400 });
    }

    const supabase = await createClient();

    if (action === 'save') {
      // First check if artwork exists in artworks table by external_id
      const { data: existingArtwork, error: checkError } = await supabase
        .from('artworks')
        .select('id')
        .eq('external_id', artworkId)
        .single();

      console.log('Checking artwork exists by external_id:', { artworkId, exists: !!existingArtwork, checkError });

      let internalArtworkId: string;

      // If artwork doesn't exist and we have artwork data, create it first
      if (!existingArtwork && artworkData) {
        console.log('Creating new artwork in database with external_id:', artworkId);
        
        const { data: newArtwork, error: insertArtworkError } = await supabase
          .from('artworks')
          .insert({
            external_id: artworkId,  // Store the original ID
            title: artworkData.title || 'Untitled',
            artist: artworkData.artist || 'Unknown Artist',
            year_created: artworkData.year || '',
            image_url: artworkData.imageUrl || '',
            medium: artworkData.medium || 'Mixed Media',
            style: artworkData.style || artworkData.medium || '',
            description: artworkData.description || artworkData.curatorNote || '',
            museum: artworkData.museum || '',
            department: artworkData.department || '',
            is_public_domain: artworkData.isPublicDomain || true,
            license: artworkData.license || 'CC0'
          })
          .select()
          .single();

        if (insertArtworkError) {
          console.error('Failed to insert artwork:', insertArtworkError);
          return NextResponse.json({
            success: false,
            error: `Failed to create artwork: ${insertArtworkError.message}`
          }, { status: 500 });
        }
        
        console.log('Successfully created artwork in database:', newArtwork);
        internalArtworkId = newArtwork.id;
      } else if (existingArtwork) {
        // Use existing artwork's internal UUID
        internalArtworkId = existingArtwork.id;
      } else {
        console.error('Artwork not found and no artwork data provided');
        return NextResponse.json({
          success: false,
          error: 'Artwork not found in database and no artwork data provided'
        }, { status: 400 });
      }

      // Check if already saved (using internal UUID)
      const { data: existing } = await supabase
        .from('artwork_interactions')
        .select('id')
        .eq('user_id', userId)
        .eq('artwork_id', internalArtworkId)
        .eq('interaction_type', 'save')
        .single();

      if (existing) {
        console.log('Artwork already saved by user');
        return NextResponse.json({
          success: true,
          action,
          message: 'Already saved',
          newCount: 0
        });
      }

      // Add to collection (using internal UUID)
      const { error: insertError, data: insertData } = await supabase
        .from('artwork_interactions')
        .insert({
          user_id: userId,
          artwork_id: internalArtworkId,
          interaction_type: 'save',
          created_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.error('Insert error details:', {
          error: insertError,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        return NextResponse.json({
          success: false,
          error: `Failed to save artwork: ${insertError.message}`
        }, { status: 500 });
      }

      console.log('Successfully saved artwork:', insertData);

    } else if (action === 'remove') {
      // First find the artwork by external_id to get internal id
      const { data: artwork } = await supabase
        .from('artworks')
        .select('id')
        .eq('external_id', artworkId)
        .single();

      if (artwork) {
        // Remove from collection using internal UUID
        const { error: deleteError } = await supabase
          .from('artwork_interactions')
          .delete()
          .eq('user_id', userId)
          .eq('artwork_id', artwork.id)
          .eq('interaction_type', 'save');

        if (deleteError) {
          console.error('Delete error:', deleteError);
          return NextResponse.json({
            success: false,
            error: 'Failed to remove artwork'
          }, { status: 500 });
        }
      }
    }

    // Return updated count
    const { count } = await supabase
      .from('artwork_interactions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('interaction_type', 'save');

    return NextResponse.json({
      success: true,
      action,
      newCount: count || 0
    });

  } catch (error) {
    console.error('Collection API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}