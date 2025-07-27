import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Replicate API for image generation
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Check if user has completed quiz
    if (!profile.quiz_completed || !profile.personality_type) {
      return res.status(400).json({ 
        error: 'Please complete the personality quiz first' 
      });
    }

    // Get user's quiz results
    const { data: quizResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!quizResult) {
      return res.status(404).json({ error: 'Quiz results not found' });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('art_profiles')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (existingProfile && !req.body.regenerate) {
      return res.status(200).json({
        success: true,
        data: existingProfile,
        message: 'Profile already exists'
      });
    }

    // Generate art profile image prompt
    const prompt = generateArtPrompt(
      profile.personality_type,
      quizResult.animal_type,
      quizResult.art_preferences as any
    );

    // Create profile generation record
    const { data: artProfile } = await supabase
      .from('art_profiles')
      .insert({
        user_id: profile.id,
        personality_type: profile.personality_type,
        generation_prompt: prompt,
        profile_data: {
          animalType: quizResult.animal_type,
          scores: quizResult.scores,
          traits: quizResult.traits
        },
        style_attributes: quizResult.art_preferences,
        color_palette: getColorPalette(profile.personality_type),
        artistic_elements: (quizResult.art_preferences as any)?.topTags || []
      })
      .select()
      .single();

    if (!artProfile) {
      return res.status(500).json({ error: 'Failed to create art profile' });
    }

    // Generate image with Replicate
    if (REPLICATE_API_TOKEN) {
      const generationId = await generateImage(prompt, artProfile.id);
      
      if (generationId) {
        // Record generation attempt
        await supabase
          .from('art_profile_generations')
          .insert({
            user_id: profile.id,
            profile_id: artProfile.id,
            generation_id: generationId,
            status: 'processing',
            model_used: 'stable-diffusion-xl',
            prompt_used: prompt,
            parameters: {
              num_outputs: 1,
              guidance_scale: 7.5,
              num_inference_steps: 50
            }
          });

        // Return immediately, image will be processed async
        return res.status(200).json({
          success: true,
          data: {
            ...artProfile,
            generationId,
            status: 'generating'
          }
        });
      }
    }

    // Fallback to pre-defined images if AI generation fails
    const fallbackImage = getFallbackImage(
      profile.personality_type,
      quizResult.animal_type
    );

    await supabase
      .from('art_profiles')
      .update({ profile_image_url: fallbackImage })
      .eq('id', artProfile.id);

    res.status(200).json({
      success: true,
      data: {
        ...artProfile,
        profile_image_url: fallbackImage,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Generate art profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateArtPrompt(
  personalityType: string,
  animalType: string,
  artPreferences: any
): string {
  const styleKeywords = artPreferences?.dominantStyle || 'abstract';
  const colorMood = getColorMood(personalityType);
  const artisticElements = artPreferences?.topTags?.slice(0, 3).join(', ') || 'creative, expressive';

  return `A sophisticated artistic portrait of a ${animalType} character embodying ${personalityType} personality, 
    ${styleKeywords} art style, ${colorMood} color palette, ${artisticElements} elements, 
    high quality digital art, museum quality, personality visualization, 
    symbolic representation, no text, no watermarks`;
}

function getColorPalette(personalityType: string): any {
  const palettes: Record<string, any> = {
    'GAMF': { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#45B7D1' },
    'GAMC': { primary: '#F7B731', secondary: '#5F27CD', accent: '#EE5A24' },
    'GRMF': { primary: '#6C5CE7', secondary: '#A29BFE', accent: '#74B9FF' },
    'GRMC': { primary: '#00B894', secondary: '#00CEC9', accent: '#6C5CE7' },
    // ... add all 16 types
  };

  return palettes[personalityType] || palettes['GAMF'];
}

function getColorMood(personalityType: string): string {
  const firstLetter = personalityType[0];
  const moods: Record<string, string> = {
    'G': 'vibrant and energetic',
    'S': 'soft and harmonious'
  };
  return moods[firstLetter] || 'balanced and dynamic';
}

function getFallbackImage(personalityType: string, animalType: string): string {
  // Map to pre-generated images (128 combinations)
  const imageMap: Record<string, string> = {
    'GAMF_호랑이': '/art-profiles/GAMF_tiger.jpg',
    'GAMC_사자': '/art-profiles/GAMC_lion.jpg',
    // ... add all combinations
  };
  
  const key = `${personalityType}_${animalType}`;
  return imageMap[key] || '/art-profiles/default.jpg';
}

async function generateImage(prompt: string, profileId: string): Promise<string | null> {
  if (!REPLICATE_API_TOKEN) return null;

  try {
    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt,
          negative_prompt: "text, watermark, signature, low quality, blurry",
          width: 1024,
          height: 1024,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50
        }
      })
    });

    if (!response.ok) {
      console.error('Replicate API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}