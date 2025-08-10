const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    mode: 'database-connected',
    timestamp: new Date().toISOString()
  });
});

// Get exhibitions with filters
app.get('/api/exhibitions', async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0,
      status,
      city,
      search,
      orderBy = 'created_at',
      order = 'desc'
    } = req.query;

    console.log('Fetching exhibitions with params:', { limit, offset, status, city, search });

    // Build query
    let query = supabase
      .from('exhibitions')
      .select('*');

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (city) {
      query = query.ilike('venue_city', `%${city}%`);
    }

    if (search) {
      query = query.or(`title_en.ilike.%${search}%,title_local.ilike.%${search}%,description.ilike.%${search}%,venue_name.ilike.%${search}%`);
    }

    // Apply ordering
    query = query.order(orderBy, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Transform data to match frontend expectations
    const transformedData = (data || []).map(ex => ({
      id: ex.id,
      title: ex.title_en || ex.title_local || 'Untitled',
      venue_name: ex.venue_name || '',
      venue_city: ex.venue_city || '',
      location: ex.venue_city || '',
      start_date: ex.start_date,
      end_date: ex.end_date,
      description: ex.description || '',
      image_url: ex.image_url || null,
      category: ex.exhibition_type || '미술',
      tags: ex.tags || [],
      price: ex.admission_fee || 
        (ex.ticket_price && typeof ex.ticket_price === 'object' ? 
          (ex.ticket_price.adult || ex.ticket_price.general || '정보 없음') : 
          (ex.ticket_price || '정보 없음')),
      status: ex.status || 'ongoing',
      view_count: ex.view_count || 0,
      like_count: ex.like_count || 0,
      featured: ex.featured || false,
      source: ex.source,
      artists: ex.artists || [],
      curator: ex.curator,
      official_url: ex.official_url,
      operating_hours: ex.operating_hours
    }));

    console.log(`Found ${transformedData.length} exhibitions`);

    res.json({
      success: true,
      data: transformedData,
      total: count || transformedData.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single exhibition
app.get('/api/exhibitions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(404).json({
        success: false,
        error: 'Exhibition not found'
      });
    }

    // Transform data
    const transformed = {
      id: data.id,
      title: data.title_en || data.title_local || 'Untitled',
      venue_name: data.venue_name || '',
      venue_city: data.venue_city || '',
      location: data.venue_city || '',
      start_date: data.start_date,
      end_date: data.end_date,
      description: data.description || '',
      image_url: data.image_url || null,
      category: data.exhibition_type || '미술',
      tags: data.tags || [],
      price: data.admission_fee || '정보 없음',
      status: data.status || 'ongoing',
      view_count: data.view_count || 0,
      like_count: data.like_count || 0,
      featured: data.featured || false,
      source: data.source,
      artists: data.artists || [],
      curator: data.curator,
      official_url: data.official_url,
      operating_hours: data.operating_hours
    };

    // Increment view count
    await supabase
      .from('exhibitions')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    res.json({
      success: true,
      data: transformed
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get popular exhibitions
app.get('/api/exhibitions/popular', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Transform data
    const transformedData = (data || []).map(ex => ({
      id: ex.id,
      title: ex.title_en || ex.title_local || 'Untitled',
      venue_name: ex.venue_name || '',
      venue_city: ex.venue_city || '',
      view_count: ex.view_count || 0,
      like_count: ex.like_count || 0,
      status: ex.status || 'ongoing'
    }));

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get ongoing exhibitions
app.get('/api/exhibitions/ongoing', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('status', 'ongoing')
      .order('start_date', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Transform data
    const transformedData = (data || []).map(ex => ({
      id: ex.id,
      title: ex.title_en || ex.title_local || 'Untitled',
      venue_name: ex.venue_name || '',
      venue_city: ex.venue_city || '',
      start_date: ex.start_date,
      end_date: ex.end_date,
      status: ex.status || 'ongoing'
    }));

    res.json({
      success: true,
      data: transformedData,
      total: transformedData.length
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Like/unlike exhibition
app.post('/api/exhibitions/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current like count
    const { data: exhibition, error: fetchError } = await supabase
      .from('exhibitions')
      .select('like_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'Exhibition not found'
      });
    }

    // Increment like count
    const newLikeCount = (exhibition.like_count || 0) + 1;
    
    const { error: updateError } = await supabase
      .from('exhibitions')
      .update({ like_count: newLikeCount })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update like count'
      });
    }

    res.json({
      success: true,
      message: 'Exhibition liked',
      like_count: newLikeCount
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// City stats
app.get('/api/exhibitions/stats/cities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('venue_city, status');

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Aggregate city stats
    const cityStats = {};
    
    (data || []).forEach(ex => {
      const city = ex.venue_city || 'Unknown';
      if (!cityStats[city]) {
        cityStats[city] = {
          city: city,
          count: 0,
          ongoing: 0,
          upcoming: 0,
          ended: 0
        };
      }
      cityStats[city].count++;
      if (ex.status === 'ongoing') cityStats[city].ongoing++;
      if (ex.status === 'upcoming') cityStats[city].upcoming++;
      if (ex.status === 'ended') cityStats[city].ended++;
    });

    res.json({
      success: true,
      data: Object.values(cityStats)
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('count', { count: 'exact' });

    if (error) {
      console.error('Database test error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    res.json({
      success: true,
      message: 'Database connection successful',
      totalExhibitions: data
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Exhibition Server with Database running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database test: http://localhost:${PORT}/api/test-db`);
  console.log(`🎨 Exhibitions API: http://localhost:${PORT}/api/exhibitions`);
  console.log(`📊 Using Supabase database from: ${process.env.SUPABASE_URL}`);
});