import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const exhibitionId = params.id;

    // First get current like count
    const { data: exhibition, error: fetchError } = await supabase
      .from('exhibitions')
      .select('like_count')
      .eq('id', exhibitionId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch exhibition:', fetchError);
      return NextResponse.json(
        { error: 'Exhibition not found' },
        { status: 404 }
      );
    }

    // Update like count
    const newLikeCount = (exhibition?.like_count || 0) + 1;
    const { data, error } = await supabase
      .from('exhibitions')
      .update({ 
        like_count: newLikeCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', exhibitionId)
      .select()
      .single();

    if (error) {
      console.error('Like update error:', error);
      return NextResponse.json(
        { error: 'Failed to update like count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      likeCount: newLikeCount 
    });
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}