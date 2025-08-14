import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase environment variables are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured');
      return NextResponse.json({ 
        data: [],
        total: 0,
        error: 'Database connection not configured'
      });
    }
    
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
      // Return empty data instead of error to prevent frontend crash
      return NextResponse.json({ 
        data: [],
        total: 0,
        error: error.message
      });
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