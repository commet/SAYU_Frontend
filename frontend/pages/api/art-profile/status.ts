import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { generationId } = req.query;

    if (!generationId || typeof generationId !== 'string') {
      return res.status(400).json({ error: 'Generation ID required' });
    }

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

    // Get generation record
    const { data: generation, error: genError } = await supabase
      .from('art_profile_generations')
      .select('*')
      .eq('generation_id', generationId)
      .single();

    if (genError || !generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    // Check if already completed
    if (generation.status === 'completed' || generation.status === 'failed') {
      return res.status(200).json({
        success: true,
        data: generation
      });
    }

    // Check Replicate status
    if (REPLICATE_API_TOKEN) {
      const replicateResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${generationId}`,
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          }
        }
      );

      if (replicateResponse.ok) {
        const replicateData = await replicateResponse.json();
        
        // Update generation status
        if (replicateData.status === 'succeeded' && replicateData.output) {
          const imageUrl = replicateData.output[0];
          
          // Update generation record
          await supabase
            .from('art_profile_generations')
            .update({
              status: 'completed',
              result_url: imageUrl,
              processing_time_ms: Date.now() - new Date(generation.created_at).getTime()
            })
            .eq('id', generation.id);

          // Update art profile
          await supabase
            .from('art_profiles')
            .update({ profile_image_url: imageUrl })
            .eq('id', generation.profile_id);

          return res.status(200).json({
            success: true,
            data: {
              ...generation,
              status: 'completed',
              result_url: imageUrl
            }
          });
        } else if (replicateData.status === 'failed') {
          // Update as failed
          await supabase
            .from('art_profile_generations')
            .update({
              status: 'failed',
              error_message: replicateData.error || 'Generation failed'
            })
            .eq('id', generation.id);

          return res.status(200).json({
            success: true,
            data: {
              ...generation,
              status: 'failed',
              error_message: replicateData.error
            }
          });
        }
      }
    }

    // Still processing
    res.status(200).json({
      success: true,
      data: generation
    });
  } catch (error) {
    console.error('Check generation status error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}