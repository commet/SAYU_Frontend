import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      artworkId, 
      interactionType,
      artworkData,
      userAptType,
      metadata = {}
    } = body;

    // 좋아요 추가/제거
    if (interactionType === 'like') {
      const { remove } = body;
      
      if (remove) {
        // 좋아요 제거
        const { error } = await supabase
          .from('user_artwork_preferences')
          .delete()
          .eq('user_id', user.id)
          .eq('artwork_id', artworkId)
          .eq('interaction_type', 'like');
          
        if (error) throw error;
        
        return NextResponse.json({ 
          success: true, 
          action: 'removed',
          message: '취향 데이터에서 제외되었습니다' 
        });
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('user_artwork_preferences')
          .upsert({
            user_id: user.id,
            artwork_id: artworkId,
            interaction_type: 'like',
            artwork_title: artworkData?.title,
            artwork_artist: artworkData?.artist,
            artwork_year: artworkData?.year,
            artwork_style: artworkData?.style,
            artwork_sayu_type: artworkData?.sayuType,
            user_apt_type: userAptType,
            ...metadata
          }, {
            onConflict: 'user_id,artwork_id,interaction_type'
          });
          
        if (error) throw error;
        
        // 현재 좋아요 개수 조회
        const { count } = await supabase
          .from('user_artwork_preferences')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('interaction_type', 'like');
        
        return NextResponse.json({ 
          success: true, 
          action: 'added',
          totalLikes: count || 0,
          message: `AI가 당신의 취향을 학습했습니다! (${count}개 학습)` 
        });
      }
    }
    
    // 조회 기록
    if (interactionType === 'view') {
      const { viewDuration, detailModalOpened } = metadata;
      
      await supabase
        .from('user_artwork_preferences')
        .upsert({
          user_id: user.id,
          artwork_id: artworkId,
          interaction_type: 'view',
          view_duration: viewDuration,
          detail_modal_opened: detailModalOpened,
          artwork_title: artworkData?.title,
          artwork_artist: artworkData?.artist,
          artwork_year: artworkData?.year,
          artwork_style: artworkData?.style,
          artwork_sayu_type: artworkData?.sayuType,
          user_apt_type: userAptType
        }, {
          onConflict: 'user_id,artwork_id,interaction_type'
        });
      
      return NextResponse.json({ success: true, action: 'view_recorded' });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Preference tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track preference' },
      { status: 500 }
    );
  }
}

// GET: 사용자의 선호도 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 좋아요한 작품 목록 조회
    const { data: likes, error } = await supabase
      .from('user_artwork_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('interaction_type', 'like')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // 선호도 벡터 조회
    const { data: vector } = await supabase
      .from('user_preference_vectors')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    return NextResponse.json({
      success: true,
      likes: likes || [],
      vector: vector || null,
      totalLikes: likes?.length || 0
    });
    
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}