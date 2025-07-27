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

  switch (method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'PUT':
      return handlePut(req, res, id);
    case 'DELETE':
      return handleDelete(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Get exhibition with venue details
    const { data: exhibition, error } = await supabase
      .from('exhibitions')
      .select(`
        *,
        venue:venues!inner(
          id,
          name,
          name_en,
          type,
          address,
          city,
          region,
          latitude,
          longitude,
          website,
          phone,
          opening_hours,
          facilities
        )
      `)
      .eq('id', id)
      .single();

    if (error || !exhibition) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }

    // Increment view count
    await supabase
      .from('exhibitions')
      .update({ view_count: (exhibition.view_count || 0) + 1 })
      .eq('id', id);

    // Track view if user is authenticated
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
          // Record view
          await supabase
            .from('exhibition_views')
            .insert({
              exhibition_id: id,
              user_id: profile.id
            });

          // Check if user liked this exhibition
          const { data: like } = await supabase
            .from('exhibition_likes')
            .select('id')
            .eq('exhibition_id', id)
            .eq('user_id', profile.id)
            .single();

          (exhibition as any).isLiked = !!like;
        }
      }
    }

    // Get related exhibitions
    const { data: relatedExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title, title_en, image_url, start_date, end_date')
      .eq('venue_id', exhibition.venue_id)
      .neq('id', id)
      .eq('status', 'ongoing')
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        ...exhibition,
        relatedExhibitions: relatedExhibitions || []
      }
    });
  } catch (error) {
    console.error('Get exhibition error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // TODO: Check admin permissions

    // Update exhibition
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
      status: req.body.start_date && req.body.end_date 
        ? determineStatus(req.body.start_date, req.body.end_date)
        : undefined
    };

    const { data, error } = await supabase
      .from('exhibitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update exhibition:', error);
      return res.status(500).json({ error: 'Failed to update exhibition' });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Update exhibition error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // TODO: Check admin permissions

    // Delete exhibition (cascade will handle related records)
    const { error } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete exhibition:', error);
      return res.status(500).json({ error: 'Failed to delete exhibition' });
    }

    res.status(200).json({
      success: true,
      message: 'Exhibition deleted successfully'
    });
  } catch (error) {
    console.error('Delete exhibition error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function determineStatus(startDate: string, endDate: string): string {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}