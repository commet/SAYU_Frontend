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
  const { artworkId } = req.query;
  const { method } = req;

  if (!artworkId || typeof artworkId !== 'string') {
    return res.status(400).json({ error: 'Invalid artwork ID' });
  }

  switch (method) {
    case 'GET':
      return handleGet(req, res, artworkId);
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  artworkId: string
) {
  try {
    const { 
      phase,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = supabase
      .from('perception_exchanges')
      .select(`
        *,
        creator:users!creator_id(
          id,
          username,
          avatar_url,
          personality_type
        ),
        reactions:perception_exchange_reactions(
          id,
          reaction_type,
          user_id
        ),
        replies:perception_exchange_replies(
          id,
          reply_text,
          emotion_response,
          is_anonymous,
          created_at,
          replier:users!replier_id(
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('artwork_id', artworkId);

    // Filter by phase if specified
    if (phase) {
      query = query.eq('phase', parseInt(phase as string));
    }

    // Get user's reactions if authenticated
    let userReactions: Record<string, string[]> = {};
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (profile) {
          // Get all user's reactions for these exchanges
          const { data: reactions } = await supabase
            .from('perception_exchange_reactions')
            .select('exchange_id, reaction_type')
            .eq('user_id', profile.id);

          if (reactions) {
            reactions.forEach(r => {
              if (!userReactions[r.exchange_id]) {
                userReactions[r.exchange_id] = [];
              }
              userReactions[r.exchange_id].push(r.reaction_type);
            });
          }
        }
      }
    }

    // Apply sorting
    query = query.order(sortBy as string, { 
      ascending: sortOrder === 'asc' 
    });

    // Apply pagination
    query = query.range(
      parseInt(offset as string), 
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to fetch perception exchanges:', error);
      return res.status(500).json({ error: 'Failed to fetch perception exchanges' });
    }

    // Transform data
    const exchanges = data?.map(exchange => {
      // Hide creator info if anonymous
      const creatorInfo = exchange.is_anonymous 
        ? null 
        : exchange.creator;

      // Count reactions by type
      const reactionCounts: Record<string, number> = {};
      (exchange.reactions as any[])?.forEach(r => {
        reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
      });

      // Process replies
      const replies = (exchange.replies as any[])?.map(reply => ({
        ...reply,
        replier: reply.is_anonymous ? null : reply.replier
      }));

      return {
        ...exchange,
        creator: creatorInfo,
        reactionCounts,
        userReactions: userReactions[exchange.id] || [],
        replies,
        totalReplies: replies?.length || 0
      };
    }) || [];

    // Get phase statistics
    const { data: phaseStats } = await supabase
      .from('perception_exchanges')
      .select('phase')
      .eq('artwork_id', artworkId);

    const phaseCounts = phaseStats?.reduce((acc, item) => {
      acc[item.phase] = (acc[item.phase] || 0) + 1;
      return acc;
    }, {} as Record<number, number>) || {};

    res.status(200).json({
      success: true,
      data: {
        exchanges,
        pagination: {
          total: count || 0,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: (parseInt(offset as string) + parseInt(limit as string)) < (count || 0)
        },
        phaseStatistics: {
          total: phaseStats?.length || 0,
          byPhase: phaseCounts
        }
      }
    });
  } catch (error) {
    console.error('Get perception exchanges error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}