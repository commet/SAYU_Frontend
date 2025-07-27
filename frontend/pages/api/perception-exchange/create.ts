import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// OpenAI for emotion vector generation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

    const {
      artworkId,
      phase = 1,
      emotionPrimary,
      emotionSecondary,
      emotionIntensity,
      perceptionText
    } = req.body;

    // Validate input
    if (!artworkId || !emotionPrimary || !perceptionText) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Check if artwork exists
    const { data: artwork } = await supabase
      .from('artworks')
      .select('id, title')
      .eq('id', artworkId)
      .single();

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    // Generate perception vector
    let perceptionVector = null;
    if (OPENAI_API_KEY) {
      perceptionVector = await generatePerceptionVector(perceptionText);
    }

    // Create perception exchange
    const { data: exchange, error: exchangeError } = await supabase
      .from('perception_exchanges')
      .insert({
        artwork_id: artworkId,
        creator_id: profile.id,
        phase,
        emotion_primary: emotionPrimary,
        emotion_secondary: emotionSecondary,
        emotion_intensity: emotionIntensity || 0.5,
        perception_text: perceptionText,
        perception_vector: perceptionVector ? `[${perceptionVector.join(',')}]` : null,
        is_anonymous: phase < 4 // Phases 1-3 are anonymous
      })
      .select()
      .single();

    if (exchangeError) {
      console.error('Failed to create perception exchange:', exchangeError);
      return res.status(500).json({ error: 'Failed to create perception exchange' });
    }

    // Award points
    await supabase
      .from('gamification_points')
      .insert({
        user_id: profile.id,
        action_type: 'perception_exchange_create',
        points: 20,
        description: `Created phase ${phase} perception exchange`,
        metadata: { 
          exchange_id: exchange.id,
          artwork_id: artworkId,
          phase 
        }
      });

    // Get creator info for response (if not anonymous)
    let creatorInfo = null;
    if (!exchange.is_anonymous) {
      creatorInfo = {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url
      };
    }

    res.status(201).json({
      success: true,
      data: {
        ...exchange,
        creator: creatorInfo
      }
    });
  } catch (error) {
    console.error('Create perception exchange error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function generatePerceptionVector(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 768
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Vector generation error:', error);
    return null;
  }
}