import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get followed artists for user
    const { data: follows, error: followError } = await supabase
      .from('artist_follows')
      .select(`
        *,
        artist:artists(*)
      `)
      .eq('user_id', userId);

    if (followError) {
      console.error('Error fetching follows:', followError);
      return NextResponse.json(
        { error: 'Failed to fetch followed artists' },
        { status: 500 }
      );
    }

    const artists = follows?.map(follow => follow.artist) || [];
    const followings = follows || [];

    return NextResponse.json({
      artists,
      followings
    });
  } catch (error) {
    console.error('Error in followed-artists route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}