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
  const { method } = req;

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
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  switch (method) {
    case 'POST':
      return handleFollow(req, res, profile.id);
    case 'DELETE':
      return handleUnfollow(req, res, profile.id);
    case 'GET':
      return handleGetFollowing(req, res, profile.id);
    default:
      res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleFollow(
  req: NextApiRequest,
  res: NextApiResponse,
  followerId: string
) {
  try {
    const { userId: followingId } = req.body;

    if (!followingId) {
      return res.status(400).json({ error: 'User ID to follow is required' });
    }

    // Check if trying to follow self
    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('user_following')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    const { error } = await supabase
      .from('user_following')
      .insert({
        follower_id: followerId,
        following_id: followingId
      });

    if (error) {
      console.error('Failed to create follow:', error);
      return res.status(500).json({ error: 'Failed to follow user' });
    }

    // Award points
    await supabase
      .from('gamification_points')
      .insert({
        user_id: followerId,
        action_type: 'user_follow',
        points: 10,
        description: 'Followed a user',
        metadata: { following_id: followingId }
      });

    // TODO: Create notification for followed user

    res.status(200).json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleUnfollow(
  req: NextApiRequest,
  res: NextApiResponse,
  followerId: string
) {
  try {
    const { userId: followingId } = req.body;

    if (!followingId) {
      return res.status(400).json({ error: 'User ID to unfollow is required' });
    }

    // Delete follow relationship
    const { error } = await supabase
      .from('user_following')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Failed to unfollow:', error);
      return res.status(500).json({ error: 'Failed to unfollow user' });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGetFollowing(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { targetUserId = userId } = req.query;

    // Get following list
    const { data: following, error: followingError } = await supabase
      .from('user_following')
      .select(`
        following:users!following_id(
          id,
          username,
          full_name,
          avatar_url,
          bio,
          personality_type
        )
      `)
      .eq('follower_id', targetUserId as string);

    if (followingError) {
      console.error('Failed to fetch following:', followingError);
      return res.status(500).json({ error: 'Failed to fetch following' });
    }

    // Get followers list
    const { data: followers, error: followersError } = await supabase
      .from('user_following')
      .select(`
        follower:users!follower_id(
          id,
          username,
          full_name,
          avatar_url,
          bio,
          personality_type
        )
      `)
      .eq('following_id', targetUserId as string);

    if (followersError) {
      console.error('Failed to fetch followers:', followersError);
      return res.status(500).json({ error: 'Failed to fetch followers' });
    }

    // Get mutual follows if looking at own profile
    const mutualFollows = userId === targetUserId 
      ? following?.filter(f => 
          followers?.some(follower => 
            (follower.follower as any)?.id === (f.following as any)?.id
          )
        ).map(f => (f.following as any)?.id)
      : [];

    res.status(200).json({
      success: true,
      data: {
        following: following?.map(f => f.following) || [],
        followers: followers?.map(f => f.follower) || [],
        followingCount: following?.length || 0,
        followersCount: followers?.length || 0,
        mutualFollows
      }
    });
  } catch (error) {
    console.error('Get following/followers error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}