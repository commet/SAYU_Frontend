import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { artistId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { artistId } = params;

    // Check if already following
    const { data: existing } = await supabase
      .from('artist_follows')
      .select('id')
      .eq('user_id', userId)
      .eq('artist_id', artistId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already following this artist' },
        { status: 400 }
      );
    }

    // Create follow record
    const { data: follow, error: followError } = await supabase
      .from('artist_follows')
      .insert({
        user_id: userId,
        artist_id: artistId,
        followed_at: new Date().toISOString(),
        notification_settings: {
          newExhibitions: true,
          mediaUpdates: true,
          socialUpdates: false
        }
      })
      .select()
      .single();

    if (followError) {
      console.error('Error creating follow:', followError);
      return NextResponse.json(
        { error: 'Failed to follow artist' },
        { status: 500 }
      );
    }

    // Update artist follow count
    const { data: artist } = await supabase
      .from('artists')
      .select('follow_count')
      .eq('id', artistId)
      .single();

    if (artist) {
      await supabase
        .from('artists')
        .update({ follow_count: (artist.follow_count || 0) + 1 })
        .eq('id', artistId);
    }

    return NextResponse.json({
      success: true,
      message: 'Artist followed successfully',
      follow
    });
  } catch (error) {
    console.error('Error in follow artist route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}