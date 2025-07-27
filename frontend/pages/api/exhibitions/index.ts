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

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      status,
      limit = 20,
      offset = 0,
      search,
      category,
      startDate,
      endDate,
      venueId,
      orderBy = 'start_date',
      orderDirection = 'desc'
    } = req.query;

    // Build query
    let query = supabase
      .from('exhibitions')
      .select(`
        *,
        venue:venues!inner(
          id,
          name,
          name_en,
          address,
          city,
          latitude,
          longitude
        )
      `);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        title_en.ilike.%${search}%,
        artist.ilike.%${search}%,
        description.ilike.%${search}%
      `);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (startDate) {
      query = query.gte('start_date', startDate);
    }

    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    if (venueId) {
      query = query.eq('venue_id', venueId);
    }

    // Count total before pagination
    const countQuery = query;
    const { count } = await countQuery.select('*', { count: 'exact', head: true });

    // Apply ordering
    query = query.order(orderBy as string, { 
      ascending: orderDirection === 'asc' 
    });

    // Apply pagination
    query = query.range(
      parseInt(offset as string), 
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch exhibitions:', error);
      return res.status(500).json({ error: 'Failed to fetch exhibitions' });
    }

    // Get user likes if authenticated
    let userLikes: string[] = [];
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
          const { data: likes } = await supabase
            .from('exhibition_likes')
            .select('exhibition_id')
            .eq('user_id', profile.id);
          
          userLikes = likes?.map(l => l.exhibition_id as string) || [];
        }
      }
    }

    // Transform data
    const exhibitions = data?.map(exhibition => ({
      ...exhibition,
      isLiked: userLikes.includes(exhibition.id),
      formattedDate: formatDateRange(exhibition.start_date, exhibition.end_date)
    })) || [];

    res.status(200).json({
      success: true,
      data: {
        exhibitions,
        pagination: {
          total: count || 0,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: (parseInt(offset as string) + parseInt(limit as string)) < (count || 0)
        }
      }
    });
  } catch (error) {
    console.error('Exhibition list error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
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

    // Check admin role (optional - implement based on your needs)
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Create exhibition
    const exhibitionData = {
      ...req.body,
      created_at: new Date().toISOString(),
      status: determineStatus(req.body.start_date, req.body.end_date)
    };

    const { data, error } = await supabase
      .from('exhibitions')
      .insert(exhibitionData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create exhibition:', error);
      return res.status(500).json({ error: 'Failed to create exhibition' });
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Create exhibition error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions
function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function determineStatus(startDate: string, endDate: string): string {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}