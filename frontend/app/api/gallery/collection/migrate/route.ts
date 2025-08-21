import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, guestData } = await request.json();

    if (!userId || !guestData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const supabase = createClient();

    // Verify user exists and is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    console.log('Migrating guest data for user:', userId);
    console.log('Guest data:', JSON.stringify(guestData, null, 2));

    // Get or create user in users table
    let userRecord;
    
    // First, check if user record exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, personality_type')
      .eq('auth_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch user data' 
      }, { status: 500 });
    }

    if (!existingUser) {
      // Create user record
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_id: userId,
          personality_type: guestData.personalityType || null,
          quiz_completed: !!guestData.personalityType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create user record' 
        }, { status: 500 });
      }

      userRecord = newUser;
    } else {
      userRecord = existingUser;
      
      // Update personality type if guest has quiz results and user doesn't
      if (guestData.personalityType && !existingUser.personality_type) {
        await supabase
          .from('users')
          .update({
            personality_type: guestData.personalityType,
            quiz_completed: true
          })
          .eq('id', existingUser.id);
      }
    }

    // Migrate saved artworks to user_artworks table
    const migratedArtworks = [];
    
    if (guestData.savedArtworks && guestData.savedArtworks.length > 0) {
      console.log(`Migrating ${guestData.savedArtworks.length} saved artworks`);
      
      for (const artworkId of guestData.savedArtworks) {
        try {
          // Check if artwork already exists for user
          const { data: existing, error: checkError } = await supabase
            .from('user_artworks')
            .select('id')
            .eq('user_id', userRecord.id)
            .eq('artwork_id', artworkId)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing artwork:', checkError);
            continue;
          }

          if (!existing) {
            // Insert new artwork record
            const { data: inserted, error: insertError } = await supabase
              .from('user_artworks')
              .insert({
                user_id: userRecord.id,
                artwork_id: artworkId,
                interaction_type: 'save',
                created_at: new Date().toISOString(),
                artwork_data: {
                  // We don't have full artwork data from guest storage
                  // This will be populated when the artwork is viewed again
                  guest_migration: true,
                  migrated_at: new Date().toISOString()
                }
              })
              .select()
              .single();

            if (insertError) {
              console.error('Error inserting artwork:', insertError);
              continue;
            }

            migratedArtworks.push(inserted);
          }
        } catch (error) {
          console.error('Error processing artwork:', artworkId, error);
          continue;
        }
      }
    }

    // Store preferences if available
    if (guestData.preferences) {
      try {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: userRecord.id,
            preferences: guestData.preferences,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      } catch (error) {
        console.error('Error saving preferences:', error);
        // Don't fail migration for preference errors
      }
    }

    // Store analytics data if available
    if (guestData.analytics) {
      try {
        await supabase
          .from('user_analytics')
          .insert({
            user_id: userRecord.id,
            event_type: 'guest_migration',
            event_data: guestData.analytics,
            created_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error saving analytics:', error);
        // Don't fail migration for analytics errors
      }
    }

    console.log(`Successfully migrated ${migratedArtworks.length} artworks for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Guest data migrated successfully',
      migratedItems: {
        artworks: migratedArtworks.length,
        personalityType: guestData.personalityType,
        preferences: !!guestData.preferences
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}