import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      activity_type,
      target_id,
      target_type,
      target_title,
      target_subtitle,
      target_image_url,
      metadata = {}
    } = body;

    // Validate required fields
    if (!activity_type) {
      return NextResponse.json(
        { error: 'activity_type is required' },
        { status: 400 }
      );
    }

    // Track activity using stored function
    const { data, error } = await supabase
      .rpc('track_activity', {
        p_activity_type: activity_type,
        p_target_id: target_id,
        p_target_type: target_type,
        p_target_title: target_title,
        p_target_subtitle: target_subtitle,
        p_target_image_url: target_image_url,
        p_metadata: metadata
      });

    if (error) {
      console.error('Error tracking activity:', error);
      return NextResponse.json(
        { error: 'Failed to track activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activity_id: data
    });

  } catch (error) {
    console.error('Error in activity tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Batch tracking endpoint
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { activities } = await request.json();
    
    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json(
        { error: 'activities array is required' },
        { status: 400 }
      );
    }

    // Process activities in batch
    const results = await Promise.all(
      activities.map(async (activity) => {
        const { data, error } = await supabase
          .rpc('track_activity', {
            p_activity_type: activity.activity_type,
            p_target_id: activity.target_id,
            p_target_type: activity.target_type,
            p_target_title: activity.target_title,
            p_target_subtitle: activity.target_subtitle,
            p_target_image_url: activity.target_image_url,
            p_metadata: activity.metadata || {}
          });
        
        return { success: !error, activity_id: data, error };
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      processed: activities.length,
      successful,
      failed,
      results
    });

  } catch (error) {
    console.error('Error in batch activity tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}