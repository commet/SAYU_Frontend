import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    
    // Fetch popular exhibitions from Supabase ordered by view_count
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase popular exhibitions error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch popular exhibitions', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: exhibitions || [],
      total: exhibitions?.length || 0
    });
  } catch (error) {
    console.error('Popular exhibitions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}