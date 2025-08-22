import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Simple in-memory cache (for demo - use Redis in production)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Activities API - Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    });
    
    if (authError || !user) {
      console.log('Activities API - Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    // Check cache
    const cacheKey = `activities:${user.id}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // First check if table exists by trying to get count
    console.log('Checking user_activities table...');
    const { count, error: countError } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Table does not exist or access denied:', countError);
      // Return empty data if table doesn't exist yet
      return NextResponse.json([]);
    }
    
    console.log('Table exists, total activities:', count);
    
    // Get recent activities directly from table
    console.log('Fetching activities for user:', { userId: user.id, limit });
    
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch activities',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Format activities for frontend
    const formattedActivities = (data || []).map(activity => {
      // Calculate formatted time
      const createdAt = new Date(activity.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let formattedTime;
      if (diffMinutes < 60) {
        formattedTime = `${diffMinutes}분 전`;
      } else if (diffHours < 24) {
        formattedTime = `${diffHours}시간 전`;
      } else if (diffDays < 7) {
        formattedTime = `${diffDays}일 전`;
      } else {
        formattedTime = createdAt.toLocaleDateString('ko-KR', {
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Get activity icon
      const activityIcons = {
        'view_artwork': '👁️',
        'save_artwork': '💙',
        'like_artwork': '❤️',
        'view_exhibition': '🏛️',
        'save_exhibition': '📌',
        'record_exhibition': '✍️',
        'write_comment': '💬',
        'follow_user': '👥',
        'create_collection': '📁',
        'join_community': '🌟',
        'complete_quiz': '🎯',
        'profile_visit': '👤'
      };
      
      return {
        id: activity.id,
        type: activity.activity_type,
        targetId: activity.target_id,
        title: activity.target_title,
        subtitle: activity.target_subtitle,
        image: activity.target_image_url,
        metadata: activity.metadata,
        createdAt: activity.created_at,
        formattedTime,
        icon: activityIcons[activity.activity_type as keyof typeof activityIcons] || '📍'
      };
    });

    // Update cache
    cache.set(cacheKey, {
      data: formattedActivities,
      timestamp: Date.now()
    });

    // Clean old cache entries
    for (const [key, value] of cache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL * 10) {
        cache.delete(key);
      }
    }

    return NextResponse.json(formattedActivities);

  } catch (error) {
    console.error('Error in recent activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get activity statistics
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Activities Stats API - Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    });
    
    if (authError || !user) {
      console.log('Activities Stats API - Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    // Check if table exists first
    const { count: tableCount, error: tableError } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact', head: true });
      
    if (tableError) {
      console.error('user_activities table does not exist:', tableError);
      return NextResponse.json({
        total: 0,
        byType: {},
        period: '30days'
      });
    }
    
    // Get statistics for different activity types
    console.log('Fetching activity stats for user:', user.id);
    
    const { data, error } = await supabase
      .from('user_activities')
      .select('activity_type')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching activity stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Count activities by type
    const stats = (data || []).reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      total: data?.length || 0,
      byType: stats,
      period: '30days'
    });

  } catch (error) {
    console.error('Error in activity statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}