import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const copyrightStatus = searchParams.get('copyrightStatus');
    const nationality = searchParams.get('nationality');
    const era = searchParams.get('era');
    const search = searchParams.get('search');

    // Build query
    let query = supabase.from('artists').select('*', { count: 'exact' });

    // Apply filters
    if (copyrightStatus) {
      query = query.eq('copyright_status', copyrightStatus);
    }
    if (nationality) {
      query = query.eq('nationality', nationality);
    }
    if (era) {
      query = query.eq('era', era);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy === 'follow_count' ? 'follow_count' : sortBy, { ascending });

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching artists:', error);
      return NextResponse.json(
        { error: 'Failed to fetch artists' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error in artists route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}