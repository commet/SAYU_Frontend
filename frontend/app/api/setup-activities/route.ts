import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Create user_activities table
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS public.user_activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        activity_type TEXT NOT NULL,
        target_id TEXT,
        target_type TEXT,
        target_title TEXT,
        target_subtitle TEXT,
        target_image_url TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
      CREATE INDEX IF NOT EXISTS idx_user_activities_target ON public.user_activities(target_id, target_type);
      
      -- Enable RLS
      ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
      DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
      
      -- RLS policies
      CREATE POLICY "Users can view own activities" ON public.user_activities
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert own activities" ON public.user_activities
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `;
    
    const { error } = await supabase.rpc('exec', { sql: createTableSql });
    
    if (error) {
      console.error('Error creating table:', error);
      return NextResponse.json({ error: 'Failed to create table', details: error.message }, { status: 500 });
    }
    
    // Create the track_activity function
    const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.track_activity(
        p_activity_type TEXT,
        p_target_id TEXT DEFAULT NULL,
        p_target_type TEXT DEFAULT NULL,
        p_target_title TEXT DEFAULT NULL,
        p_target_subtitle TEXT DEFAULT NULL,
        p_target_image_url TEXT DEFAULT NULL,
        p_metadata JSONB DEFAULT '{}'::JSONB
      ) RETURNS UUID AS $$
      DECLARE
        v_user_id UUID;
        v_activity_id UUID;
      BEGIN
        -- Get current user
        v_user_id := auth.uid();
        
        IF v_user_id IS NULL THEN
          RAISE EXCEPTION 'Not authenticated';
        END IF;
        
        -- Insert activity
        INSERT INTO public.user_activities (
          user_id,
          activity_type,
          target_id,
          target_type,
          target_title,
          target_subtitle,
          target_image_url,
          metadata
        ) VALUES (
          v_user_id,
          p_activity_type,
          p_target_id,
          p_target_type,
          p_target_title,
          p_target_subtitle,
          p_target_image_url,
          p_metadata
        ) RETURNING id INTO v_activity_id;
        
        RETURN v_activity_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      -- Grant necessary permissions
      GRANT EXECUTE ON FUNCTION public.track_activity TO authenticated;
    `;
    
    const { error: functionError } = await supabase.rpc('exec', { sql: createFunctionSql });
    
    if (functionError) {
      console.error('Error creating function:', functionError);
      return NextResponse.json({ error: 'Failed to create function', details: functionError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'user_activities table and functions created successfully' 
    });
    
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}