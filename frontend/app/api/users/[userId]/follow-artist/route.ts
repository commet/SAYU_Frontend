import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { artistId } = await request.json();

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

    // Get artist data
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single();

    if (artistError) {
      console.error('Error fetching artist:', artistError);
    }

    // Update artist follow count
    if (artist) {
      await supabase
        .from('artists')
        .update({ follow_count: (artist.follow_count || 0) + 1 })
        .eq('id', artistId);
    }

    return NextResponse.json({
      follow,
      artist
    });
  } catch (error) {
    console.error('Error in follow-artist route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}