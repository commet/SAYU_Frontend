import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - 전시 저장/저장 취소
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { exhibitionId, action = 'save' } = await request.json();

    if (!exhibitionId) {
      return NextResponse.json(
        { error: 'Exhibition ID is required' },
        { status: 400 }
      );
    }

    if (action === 'save') {
      // 전시 저장
      const { data, error } = await supabase
        .from('user_saved_exhibitions')
        .upsert({
          user_id: user.id,
          exhibition_id: exhibitionId,
          saved_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,exhibition_id'
        });

      if (error) {
        console.error('Save exhibition error:', error);
        return NextResponse.json(
          { error: 'Failed to save exhibition' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Exhibition saved successfully' 
      });
    } else if (action === 'unsave') {
      // 저장 취소
      const { error } = await supabase
        .from('user_saved_exhibitions')
        .delete()
        .eq('user_id', user.id)
        .eq('exhibition_id', exhibitionId);

      if (error) {
        console.error('Unsave exhibition error:', error);
        return NextResponse.json(
          { error: 'Failed to unsave exhibition' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Exhibition unsaved successfully' 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Exhibition save API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - 사용자가 저장한 전시 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 저장한 전시 목록 조회
    const { data: savedExhibitions, error } = await supabase
      .from('user_saved_exhibitions')
      .select(`
        exhibition_id,
        saved_at,
        notes,
        reminder_date,
        tags
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Get saved exhibitions error:', error);
      return NextResponse.json(
        { error: 'Failed to get saved exhibitions' },
        { status: 500 }
      );
    }

    // 전시 상세 정보 가져오기
    if (savedExhibitions && savedExhibitions.length > 0) {
      const exhibitionIds = savedExhibitions.map(se => se.exhibition_id);
      
      const { data: exhibitions, error: exhibitionError } = await supabase
        .from('exhibitions')
        .select(`
          *,
          venues(name, location)
        `)
        .in('id', exhibitionIds);

      if (exhibitionError) {
        console.error('Get exhibitions error:', exhibitionError);
      }

      // 저장 정보와 전시 정보 병합
      const mergedData = savedExhibitions.map(saved => {
        const exhibition = exhibitions?.find(e => e.id === saved.exhibition_id);
        return {
          ...saved,
          exhibition
        };
      });

      return NextResponse.json({ 
        success: true, 
        data: mergedData 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: [] 
    });
  } catch (error) {
    console.error('Get saved exhibitions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}