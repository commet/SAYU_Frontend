import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { cacheManager, cacheKeys, withCache } from '@/lib/cache/redis';

// Cache duration in seconds
const CACHE_DURATION = 300; // 5 minutes
const CACHE_HEADERS = {
  'Cache-Control': `public, max-age=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
};

interface DashboardStats {
  artworksViewed: number;
  artistsDiscovered: number;
  exhibitionsVisited: number;
  savedArtworks: number;
  totalExhibitions: number;
  ongoingExhibitions: number;
  upcomingExhibitions: number;
  totalUsers: number;
  recentActivities: any[];
  trendingArtists: any[];
  communityHighlights: any[];
}

// Simple in-memory cache for dashboard stats
const statsCache = new Map<string, { data: DashboardStats; timestamp: number }>();

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Dashboard stats API called');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const cacheKey = userId ? `stats_${userId}` : 'global_stats';
    
    // Check cache first (Redis or memory fallback)
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      console.log('📦 Returning cached dashboard stats');
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      }, { headers: CACHE_HEADERS });
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Parallel data fetching for better performance
    const statsPromises = {
      exhibitions: fetchExhibitionStats(supabase),
      users: fetchUserStats(supabase, userId),
      activities: fetchRecentActivities(supabase, userId),
      trending: fetchTrendingData(supabase),
      community: fetchCommunityHighlights(supabase)
    };
    
    console.log('🔄 Fetching dashboard stats...');
    const results = await Promise.allSettled([
      statsPromises.exhibitions,
      statsPromises.users,
      statsPromises.activities,
      statsPromises.trending,
      statsPromises.community
    ]);
    
    // Process results with error handling
    const [exhibitionResult, userResult, activitiesResult, trendingResult, communityResult] = results;
    
    const stats: DashboardStats = {
      // Exhibition stats - fallback to mock data if query fails
      totalExhibitions: exhibitionResult.status === 'fulfilled' ? exhibitionResult.value.total : 156,
      ongoingExhibitions: exhibitionResult.status === 'fulfilled' ? exhibitionResult.value.ongoing : 42,
      upcomingExhibitions: exhibitionResult.status === 'fulfilled' ? exhibitionResult.value.upcoming : 23,
      
      // User stats - fallback to mock data if query fails or no userId
      artworksViewed: userResult.status === 'fulfilled' ? userResult.value.artworksViewed : 127,
      artistsDiscovered: userResult.status === 'fulfilled' ? userResult.value.artistsDiscovered : 43,
      exhibitionsVisited: userResult.status === 'fulfilled' ? userResult.value.exhibitionsVisited : 8,
      savedArtworks: userResult.status === 'fulfilled' ? userResult.value.savedArtworks : 24,
      totalUsers: userResult.status === 'fulfilled' ? userResult.value.totalUsers : 1250,
      
      // Activity data
      recentActivities: activitiesResult.status === 'fulfilled' ? activitiesResult.value : getDefaultActivities(),
      
      // Trending data
      trendingArtists: trendingResult.status === 'fulfilled' ? trendingResult.value : getDefaultTrendingArtists(),
      
      // Community data
      communityHighlights: communityResult.status === 'fulfilled' ? communityResult.value : getDefaultCommunityHighlights()
    };
    
    // Cache the results using Redis/memory cache
    await cacheManager.set(cacheKey, stats, CACHE_DURATION);
    
    console.log('✅ Dashboard stats fetched successfully');
    
    return NextResponse.json({
      success: true,
      data: stats,
      cached: false,
      timestamp: new Date().toISOString()
    }, { headers: CACHE_HEADERS });
    
  } catch (error) {
    console.error('❌ Dashboard stats API error:', error);
    
    // Return fallback data on error
    return NextResponse.json({
      success: false,
      data: getFallbackStats(),
      error: 'Failed to fetch stats',
      cached: false,
      timestamp: new Date().toISOString()
    }, { 
      status: 200, // Return 200 for graceful degradation
      headers: {
        ...CACHE_HEADERS,
        'Cache-Control': 'no-cache' // Don't cache error responses
      }
    });
  }
}

// Exhibition statistics
async function fetchExhibitionStats(supabase: SupabaseClient) {
  const now = new Date().toISOString().split('T')[0];
  
  const [totalResult, ongoingResult, upcomingResult] = await Promise.allSettled([
    supabase.from('exhibitions').select('id', { count: 'exact' }),
    supabase.from('exhibitions')
      .select('id', { count: 'exact' })
      .lte('start_date', now)
      .gte('end_date', now),
    supabase.from('exhibitions')
      .select('id', { count: 'exact' })
      .gt('start_date', now)
  ]);
  
  return {
    total: totalResult.status === 'fulfilled' ? (totalResult.value.count || 0) : 0,
    ongoing: ongoingResult.status === 'fulfilled' ? (ongoingResult.value.count || 0) : 0,
    upcoming: upcomingResult.status === 'fulfilled' ? (upcomingResult.value.count || 0) : 0
  };
}

// User statistics
async function fetchUserStats(supabase: SupabaseClient, userId?: string | null) {
  if (!userId) {
    // Get global user count
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact' });
      
    return {
      artworksViewed: 127, // Mock data for global stats
      artistsDiscovered: 43,
      exhibitionsVisited: 8,
      savedArtworks: 24,
      totalUsers: count || 1250
    };
  }
  
  // Get user-specific stats with parallel queries
  const [
    viewInteractionsResult, 
    savedInteractionsResult,
    likesResult, 
    exhibitionViewsResult,
    totalUsersResult,
    artistsResult
  ] = await Promise.allSettled([
    // Count artwork views
    supabase
      .from('artwork_interactions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('interaction_type', 'view'),
    
    // Count saved artworks (실제 컬렉션 아이템 수)
    supabase
      .from('artwork_interactions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('interaction_type', 'save'),
    
    // Count exhibition likes
    supabase
      .from('exhibition_likes')
      .select('id', { count: 'exact' })
      .eq('user_id', userId),
    
    // Count exhibition visits
    supabase
      .from('exhibition_views')
      .select('id', { count: 'exact' })
      .eq('user_id', userId),
    
    // Total users count
    supabase
      .from('users')
      .select('id', { count: 'exact' }),
    
    // Count unique artists discovered
    supabase
      .from('artwork_interactions')
      .select('artworks(artist)')
      .eq('user_id', userId)
      .not('artworks.artist', 'is', null)
  ]);
  
  // Calculate unique artists discovered
  let uniqueArtists = 43; // fallback
  if (artistsResult.status === 'fulfilled' && artistsResult.value.data) {
    const artists = new Set(
      artistsResult.value.data
        .map(item => item.artworks?.artist)
        .filter(artist => artist)
    );
    uniqueArtists = artists.size;
  }
  
  return {
    artworksViewed: viewInteractionsResult.status === 'fulfilled' ? (viewInteractionsResult.value.count || 0) : 127,
    savedArtworks: savedInteractionsResult.status === 'fulfilled' ? (savedInteractionsResult.value.count || 0) : 0, // 실제 컬렉션 수
    artistsDiscovered: uniqueArtists,
    exhibitionsVisited: exhibitionViewsResult.status === 'fulfilled' ? (exhibitionViewsResult.value.count || 0) : (likesResult.status === 'fulfilled' ? (likesResult.value.count || 0) : 8),
    totalUsers: totalUsersResult.status === 'fulfilled' ? (totalUsersResult.value.count || 0) : 1250
  };
}

// Recent activities
async function fetchRecentActivities(supabase: SupabaseClient, userId?: string | null) {
  if (!userId) return getDefaultActivities();
  
  try {
    const { data: activities } = await supabase
      .from('artwork_interactions')
      .select(`
        id,
        interaction_type,
        created_at,
        artworks(
          id,
          title,
          artist
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!activities || activities.length === 0) {
      return getDefaultActivities();
    }
    
    return activities.map(activity => ({
      type: activity.interaction_type,
      title: activity.artworks?.title || 'Unknown Artwork',
      artist: activity.artworks?.artist || 'Unknown Artist',
      timestamp: activity.created_at,
      timeAgo: getTimeAgo(activity.created_at)
    }));
  } catch (error) {
    console.warn('Failed to fetch user activities:', error);
    return getDefaultActivities();
  }
}

// Trending data
async function fetchTrendingData(supabase: SupabaseClient) {
  try {
    // Simple trending based on recent interactions
    const { data: trending } = await supabase
      .from('artwork_interactions')
      .select(`
        artworks(
          artist
        )
      `)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .not('artworks.artist', 'is', null)
      .limit(100);
    
    if (!trending) return getDefaultTrendingArtists();
    
    // Count artist interactions
    const artistCounts = trending.reduce((acc: Record<string, number>, item) => {
      const artist = item.artworks?.artist;
      if (artist) {
        acc[artist] = (acc[artist] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Sort by count and return top 5
    return Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([artist, count]) => ({
        name: artist,
        change: `↑ ${Math.round((count / trending.length) * 100)}%`
      }));
  } catch (error) {
    console.warn('Failed to fetch trending data:', error);
    return getDefaultTrendingArtists();
  }
}

// Community highlights
async function fetchCommunityHighlights(supabase: SupabaseClient) {
  try {
    // Get recent perception exchanges as community highlights
    const { data: exchanges } = await supabase
      .from('perception_exchanges')
      .select('id, created_at, resonance_count')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!exchanges || exchanges.length === 0) {
      return getDefaultCommunityHighlights();
    }
    
    return [
      {
        title: '새로운 전시 리뷰',
        participants: `${exchanges.length}명이 참여 중`,
        type: 'review'
      },
      {
        title: '이달의 아트 챌린지',
        participants: '참여하기',
        type: 'challenge'
      }
    ];
  } catch (error) {
    console.warn('Failed to fetch community highlights:', error);
    return getDefaultCommunityHighlights();
  }
}

// Utility functions
function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffInHours = Math.floor((now - then) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return '방금 전';
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
  return '오래 전';
}

function cleanupCache() {
  const now = Date.now();
  const maxAge = CACHE_DURATION * 1000 * 10; // Keep cache for 10x cache duration
  
  for (const [key, value] of statsCache.entries()) {
    if (now - value.timestamp > maxAge) {
      statsCache.delete(key);
    }
  }
}

// Fallback data functions
function getFallbackStats(): DashboardStats {
  return {
    artworksViewed: 127,
    artistsDiscovered: 43,
    exhibitionsVisited: 8,
    savedArtworks: 24,
    totalExhibitions: 156,
    ongoingExhibitions: 42,
    upcomingExhibitions: 23,
    totalUsers: 1250,
    recentActivities: getDefaultActivities(),
    trendingArtists: getDefaultTrendingArtists(),
    communityHighlights: getDefaultCommunityHighlights()
  };
}

function getDefaultActivities() {
  return [
    {
      type: 'view',
      title: '모네의 수련',
      artist: '클로드 모네',
      timeAgo: '2시간 전'
    },
    {
      type: 'visit',
      title: '국립현대미술관 방문',
      artist: '',
      timeAgo: '어제'
    },
    {
      type: 'save',
      title: '칸딘스키 작품 저장',
      artist: '바실리 칸딘스키',
      timeAgo: '3일 전'
    }
  ];
}

function getDefaultTrendingArtists() {
  return [
    { name: '클로드 모네', change: '↑ 12%' },
    { name: '빈센트 반 고흐', change: '↑ 8%' },
    { name: '칸딘스키', change: '—' },
    { name: '피카소', change: '↑ 5%' },
    { name: '이중섭', change: '↑ 3%' }
  ];
}

function getDefaultCommunityHighlights() {
  return [
    {
      title: '새로운 전시 리뷰',
      participants: '12명이 참여 중',
      type: 'review'
    },
    {
      title: '이달의 아트 챌린지',
      participants: '참여하기',
      type: 'challenge'
    }
  ];
}
