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
          title,
          artist,
          year_created,
          image_url,
          medium,
          style,
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

    // Format the response
    const formattedItems = (savedArtworks || []).map(item => ({
      id: item.artwork_id,
      title: item.artworks?.title || 'Untitled',
      artist: item.artworks?.artist || 'Unknown Artist',
      year: item.artworks?.year_created || '',
      imageUrl: item.artworks?.image_url || '',
      medium: item.artworks?.medium || 'Mixed Media',
      style: item.artworks?.style || '',
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
    const { userId, artworkId, action } = body;

    if (!userId || !artworkId || !['save', 'remove'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters'
      }, { status: 400 });
    }

    const supabase = await createClient();

    if (action === 'save') {
      // Add to collection
      const { error: insertError } = await supabase
        .from('artwork_interactions')
        .insert({
          user_id: userId,
          artwork_id: artworkId,
          interaction_type: 'save',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Failed to save artwork'
        }, { status: 500 });
      }

    } else if (action === 'remove') {
      // Remove from collection
      const { error: deleteError } = await supabase
        .from('artwork_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('artwork_id', artworkId)
        .eq('interaction_type', 'save');

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return NextResponse.json({
          success: false,
          error: 'Failed to remove artwork'
        }, { status: 500 });
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