import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('🎯 exhibitions API called');
  
  try {
    // Check if Supabase environment variables are configured
    console.log('🔧 Checking environment variables...');
    console.log('SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase environment variables not configured');
      return NextResponse.json({
        data: [],
        exhibitions: [],
        total: 0,
        error: 'Database connection not configured'
      });
    }
    
    console.log('🔗 Creating Supabase client...');
    const supabase = await createClient();
    console.log('✅ Supabase client created');
    
    // Test Supabase connection first
    console.log('🔍 Testing Supabase connection...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('exhibitions')
        .select('count')
        .limit(1);
      
      console.log('🔍 Connection test - Error:', testError);
      console.log('🔍 Connection test - Data:', testData);
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        return NextResponse.json({
          data: [],
          exhibitions: [],
          total: 0,
          error: `Database connection failed: ${testError.message}`
        });
      }
    } catch (connectionError) {
      console.error('❌ Supabase connection error:', connectionError);
      return NextResponse.json({
        data: [],
        exhibitions: [],
        total: 0,
        error: `Database connection error: ${connectionError}`
      });
    }
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    console.log('📊 Query limit:', limit);
    
    // Fetch exhibitions from Supabase with timeout
    console.log('📡 Fetching exhibitions from database...');
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    console.log('📦 Database response received');
    console.log('Error:', error);
    console.log('Data count:', exhibitions?.length || 0);

    if (error) {
      console.error('❌ Supabase exhibitions query error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      // Return empty data instead of error to prevent frontend crash
      return NextResponse.json({
        success: false,
        data: [],
        exhibitions: [],
        total: 0,
        error: `Query failed: ${error.message}`,
        errorCode: error.code
      });
    }

    console.log('✅ Query successful, processing data...');

    // Helper function to extract title from description
    const extractTitle = (description: string, venue: string): string => {
      if (!description) return `${venue} 전시`;
      
      // 1. HIGHEST PRIORITY: Extract title from any bracket type - NO validation needed if in brackets
      const allBracketMatches = description.matchAll(/《([^》]+)》|<([^>]+)>|「([^」]+)」|『([^』]+)』/g);
      
      for (const match of allBracketMatches) {
        const title = (match[1] || match[2] || match[3] || match[4])?.trim();
        if (title && title.length >= 2 && title.length <= 60) {
          // Brackets usually contain real titles, so trust them more
          console.log('Found bracketed title:', title);
          return title;
        }
      }
      
      // 2. Split description and look through ALL text for bracket patterns
      const fullText = description.replace(/\n/g, ' ');
      const bracketMatch = fullText.match(/《([^》]+)》|<([^>]+)>|「([^」]+)」|『([^』]+)』/);
      if (bracketMatch) {
        const title = (bracketMatch[1] || bracketMatch[2] || bracketMatch[3] || bracketMatch[4])?.trim();
        if (title && title.length >= 2 && title.length <= 60) {
          console.log('Found title in full text:', title);
          return title;
        }
      }
      
      // 3. Special handling for specific exhibitions (like DAF)
      if (description.includes('DAF') && description.includes('SUMMER FESTIVAL')) {
        console.log('Found DAF exhibition title');
        return 'DAF 2025 SUMMER FESTIVAL';
      }
      
      // 4. Last resort: look for reasonable lines, but be very picky
      const lines = description.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      for (const line of lines) {
        // Absolutely skip these section headers
        if (line === '주요 전시품' || line === '전시 구성' || line === '주요 작품' || 
            line === '주요 섹션' || line === '특별 프로그램' || line === '관람 포인트' ||
            line === '전시 소개' || line === '전시 특징' || line === '작가 소개' ||
            line.includes('Section') || line.match(/^Section \d+:/) ||
            line === '신진작가 기획전') {
          continue;
        }
        
        // Skip obvious patterns
        if (line.match(/^\[.*\]$/) || line.endsWith(':') || line.length > 30 || line.length < 3) continue;
        if (line.includes('예매') || line.includes('네이버') || line.includes('스마트')) continue;
        if (line.includes('년부터') || line.includes('개최') || line.includes('펼쳐지는')) continue;
        if (line.match(/(됩니다|습니다|합니다)$/)) continue;
        
        // Only accept very clean, short titles
        if (line.length <= 20 && 
            (line.includes('전시') || line.includes('전') || line.match(/[A-Za-z]/) || line.includes(':'))) {
          return line;
        }
      }
      
      // 5. Ultimate fallback
      return `${venue} 전시`;
    };

    // Transform data to match frontend interface
    const transformedData = (exhibitions || []).map((ex: any) => ({
      id: ex.id,
      title: extractTitle(ex.description, ex.venue_name || ex.venue),
      venue: ex.venue_name || ex.venue,
      location: ex.venue_city || ex.location || '서울',
      startDate: ex.start_date,
      endDate: ex.end_date,
      description: ex.description,
      image: ex.image_url,
      category: ex.category || '미술',
      price: ex.price || ex.admission_fee || '정보 없음',
      status: determineStatus(ex.start_date, ex.end_date), // Always calculate status based on dates
      viewCount: ex.view_count || 0,
      likeCount: ex.like_count || 0,
      distance: ex.distance,
      featured: ex.featured || false,
      artist: ex.artist,
      curator: ex.curator,
      opening_hours: ex.opening_hours,
      website: ex.website,
      contact: ex.contact
    }));

    console.log('🎯 Returning', transformedData.length, 'exhibitions');
    console.log('📋 Sample exhibition:', transformedData[0]);
    
    const response = {
      success: true,
      data: transformedData,
      exhibitions: transformedData, // Also include in exhibitions key for compatibility
      total: transformedData.length,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ API response ready:', Object.keys(response));
    return NextResponse.json(response);
  } catch (error) {
    console.error('Exhibitions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

// API route for popular exhibitions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { pathname } = new URL(request.url);
    
    // Handle popular exhibitions request
    if (pathname.includes('popular')) {
      const { data: exhibitions, error } = await supabase
        .from('exhibitions')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Supabase popular exhibitions error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch popular exhibitions' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: exhibitions });
    }

    // Handle like action
    const body = await request.json();
    if (body.action === 'like' && body.exhibitionId) {
      const { data, error } = await supabase
        .from('exhibitions')
        .update({ 
          like_count: supabase.raw('like_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', body.exhibitionId)
        .select()
        .single();

      if (error) {
        console.error('Like update error:', error);
        return NextResponse.json(
          { error: 'Failed to update like count' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    }

    // Create new exhibition
    const { data, error } = await supabase
      .from('exhibitions')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create exhibition' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine exhibition status
function determineStatus(startDate: string, endDate: string): 'ongoing' | 'upcoming' | 'ended' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}