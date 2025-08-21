import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { personalityType, scores, responses, completedAt } = await request.json();

    // Create Supabase client with server-side auth
    const supabase = await createClient();
    
    // Get current user (optional - allow guest mode)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // If no user, just return success (data saved in localStorage)
    if (!user) {
      console.log('Quiz API - Guest mode, skipping DB save');
      return NextResponse.json({ 
        success: true, 
        message: 'Quiz results saved locally (guest mode)',
        guest: true
      });
    }

    console.log('Quiz API - User ID:', user.id);
    console.log('Quiz API - Personality Type:', personalityType);

    // First find or create the user in our users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    let userId = existingUser?.id;

    if (!existingUser) {
      // Create user record if doesn't exist
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          auth_id: user.id,
          email: user.email,
          username: user.email?.split('@')[0],
          personality_type: personalityType,
          quiz_completed: true,
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createUserError) {
        console.error('User creation error:', createUserError);
        return NextResponse.json({ error: 'User creation error', details: createUserError.message }, { status: 500 });
      }
      
      userId = newUser.id;
    } else {
      // Update existing user
      await supabase
        .from('users')
        .update({
          personality_type: personalityType,
          quiz_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }

    // Save quiz results to database
    const { data, error } = await supabase
      .from('quiz_results')
      .upsert({
        user_id: userId,
        personality_type: personalityType,
        animal_type: personalityType, // Using personality_type as animal_type for now
        scores,
        traits: {},
        strengths: [],
        challenges: [],
        art_preferences: {},
        recommended_artists: [],
        recommended_styles: [],
        detailed_analysis: `Analysis for ${personalityType} personality type`
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Quiz results saved successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with server-side auth
    const supabase = await createClient();
    
    // Get current user (optional - allow guest mode)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // If no user, return no results (guest mode)
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'No quiz results (guest mode)',
        guest: true
      });
    }

    // First find the user in our users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Fetch quiz results from database
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', existingUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        message: 'No quiz results found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        personalityType: data.personality_type,
        animalType: data.animal_type,
        scores: data.scores,
        traits: data.traits,
        strengths: data.strengths,
        challenges: data.challenges,
        artPreferences: data.art_preferences,
        recommendedArtists: data.recommended_artists,
        recommendedStyles: data.recommended_styles,
        detailedAnalysis: data.detailed_analysis,
        completedAt: data.created_at
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}