import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Exhibition not found', details: error.message },
        { status: 404 }
      );
    }

    // Helper function to extract title from description (same as main API)
    const extractTitle = (description: string, venue: string): string => {
      if (!description) return `${venue} 전시`;
      
      // 1. Extract from brackets
      const allBracketMatches = description.matchAll(/《([^》]+)》|<([^>]+)>|「([^」]+)」|『([^』]+)』/g);
      for (const match of allBracketMatches) {
        const title = (match[1] || match[2] || match[3] || match[4])?.trim();
        if (title && title.length >= 2 && title.length <= 60) {
          return title;
        }
      }
      
      // 2. Special handling for DAF
      if (description.includes('DAF') && description.includes('SUMMER FESTIVAL')) {
        return 'DAF 2025 SUMMER FESTIVAL';
      }
      
      // 3. Fallback
      return `${venue} 전시`;
    };

    // Helper function to determine exhibition status
    const determineStatus = (startDate: string, endDate: string): 'ongoing' | 'upcoming' | 'ended' => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (now < start) return 'upcoming';
      if (now > end) return 'ended';
      return 'ongoing';
    };

    // Transform data to match frontend interface
    const transformedData = {
      id: data.id,
      title: extractTitle(data.description, data.venue_name || data.venue),
      venue: data.venue || data.venue_name || '',
      location: data.location || data.venue_city || '',
      startDate: data.start_date || data.startDate || '',
      endDate: data.end_date || data.endDate || '',
      description: data.description || '',
      image: data.image_url || data.image || null,
      category: data.category || '미술',
      price: data.price || data.admission_fee || '정보 없음',
      status: determineStatus(data.start_date, data.end_date),
      viewCount: data.view_count || 0,
      likeCount: data.like_count || 0,
      distance: data.distance || null,
      featured: data.featured || false
    };

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('exhibitions')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update exhibition', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    const { error } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete exhibition', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exhibition deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}