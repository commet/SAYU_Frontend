import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { method } = req;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid exhibition ID' });
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

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (profileError || !profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  switch (method) {
    case 'POST':
      return handleLike(req, res, id, profile.id);
    case 'DELETE':
      return handleUnlike(req, res, id, profile.id);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleLike(
  req: NextApiRequest, 
  res: NextApiResponse, 
  exhibitionId: string,
  userId: string
) {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('exhibition_likes')
      .select('id')
      .eq('exhibition_id', exhibitionId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      return res.status(400).json({ error: 'Already liked' });
    }

    // Create like
    const { error: likeError } = await supabase
      .from('exhibition_likes')
      .insert({
        exhibition_id: exhibitionId,
        user_id: userId
      });

    if (likeError) {
      console.error('Failed to create like:', likeError);
      return res.status(500).json({ error: 'Failed to like exhibition' });
    }

    // Increment like count
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('like_count')
      .eq('id', exhibitionId)
      .single();

    if (exhibition) {
      await supabase
        .from('exhibitions')
        .update({ like_count: (exhibition.like_count || 0) + 1 })
        .eq('id', exhibitionId);
    }

    // Award points for liking
    await supabase
      .from('gamification_points')
      .insert({
        user_id: userId,
        action_type: 'exhibition_like',
        points: 5,
        description: 'Liked an exhibition',
        metadata: { exhibition_id: exhibitionId }
      });

    res.status(200).json({
      success: true,
      message: 'Exhibition liked successfully'
    });
  } catch (error) {
    console.error('Like exhibition error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleUnlike(
  req: NextApiRequest, 
  res: NextApiResponse, 
  exhibitionId: string,
  userId: string
) {
  try {
    // Delete like
    const { error: deleteError } = await supabase
      .from('exhibition_likes')
      .delete()
      .eq('exhibition_id', exhibitionId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Failed to delete like:', deleteError);
      return res.status(500).json({ error: 'Failed to unlike exhibition' });
    }

    // Decrement like count
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('like_count')
      .eq('id', exhibitionId)
      .single();

    if (exhibition && exhibition.like_count > 0) {
      await supabase
        .from('exhibitions')
        .update({ like_count: exhibition.like_count - 1 })
        .eq('id', exhibitionId);
    }

    res.status(200).json({
      success: true,
      message: 'Exhibition unliked successfully'
    });
  } catch (error) {
    console.error('Unlike exhibition error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}