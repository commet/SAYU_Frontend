const router = require('express').Router();
const ProfileModel = require('../models/Profile');
const authMiddleware = require('../middleware/auth');
const { getSupabaseAdmin } = require('../config/supabase');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const profile = await ProfileModel.findByUserId(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get linked OAuth accounts
router.get('/oauth-accounts', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('user_oauth_accounts')
      .select('provider, profile_image, created_at')
      .eq('user_id', req.userId);

    if (error) {
      console.error('Get OAuth accounts error:', error);
      return res.status(500).json({ error: 'Failed to get OAuth accounts' });
    }

    // Build response with all providers
    const providers = ['google', 'github', 'apple'];
    const linkedProviders = (data || []).map(row => row.provider);

    const accounts = providers.map(provider => ({
      provider,
      linked: linkedProviders.includes(provider),
      profileImage: (data || []).find(r => r.provider === provider)?.profile_image
    }));

    res.json({ accounts });
  } catch (error) {
    console.error('Get OAuth accounts error:', error);
    res.status(500).json({ error: 'Failed to get OAuth accounts' });
  }
});

// Exhibition Visits endpoints

// Get exhibition visits
router.get('/visits', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      museum,
      rating,
      sortBy = 'visit_date',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * parseInt(limit);

    // Build the query
    let query = supabase
      .from('exhibition_visits')
      .select(`
        id,
        exhibition_id,
        exhibition_title,
        museum,
        visit_date,
        duration,
        rating,
        notes,
        photos,
        points,
        badges,
        artworks,
        created_at,
        updated_at
      `)
      .eq('user_id', req.userId);

    // Add filters
    if (startDate) {
      query = query.gte('visit_date', startDate);
    }
    if (endDate) {
      query = query.lte('visit_date', endDate);
    }
    if (museum) {
      query = query.ilike('museum', `%${museum}%`);
    }
    if (rating) {
      query = query.gte('rating', parseInt(rating));
    }

    // Add sorting
    const validSortFields = ['visit_date', 'rating', 'duration', 'created_at'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'visit_date';
    const finalSortOrder = sortOrder === 'asc' ? false : true; // true = descending

    query = query.order(finalSortBy, { ascending: !finalSortOrder });

    // Add pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Get exhibition visits error:', error);
      return res.status(500).json({ error: 'Failed to get exhibition visits' });
    }

    // Get total count for pagination
    const { count: total, error: countError } = await supabase
      .from('exhibition_visits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);

    if (countError) {
      console.error('Count error:', countError);
    }

    res.json({
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        totalPages: Math.ceil((total || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get exhibition visits error:', error);
    res.status(500).json({ error: 'Failed to get exhibition visits' });
  }
});

// Create exhibition visit
router.post('/visits', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const {
      exhibitionId,
      exhibitionTitle,
      museum,
      visitDate,
      duration,
      rating,
      notes,
      artworks = [],
      photos = [],
      badges = [],
      points = 0
    } = req.body;

    // Validate required fields
    if (!exhibitionTitle || !museum || !visitDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: exhibitionTitle, museum, visitDate' 
      });
    }

    // Validate rating range
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    const visitData = {
      user_id: req.userId,
      exhibition_id: exhibitionId || `exhibition_${Date.now()}`,
      exhibition_title: exhibitionTitle,
      museum,
      visit_date: visitDate,
      duration: duration || 0,
      rating: rating || 5,
      notes: notes || '',
      artworks: artworks,
      photos: photos,
      badges: badges,
      points: points || 0
    };

    const { data: visit, error } = await supabase
      .from('exhibition_visits')
      .insert(visitData)
      .select()
      .single();

    if (error) {
      console.error('Create exhibition visit error:', error);
      return res.status(500).json({ error: 'Failed to create exhibition visit' });
    }

    console.log('Exhibition visit created:', visit.id);
    res.status(201).json(visit);
  } catch (error) {
    console.error('Create exhibition visit error:', error);
    res.status(500).json({ error: 'Failed to create exhibition visit' });
  }
});

// Get single exhibition visit
router.get('/visits/:visitId', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { visitId } = req.params;

    const { data: visit, error } = await supabase
      .from('exhibition_visits')
      .select(`
        id,
        exhibition_id,
        exhibition_title,
        museum,
        visit_date,
        duration,
        rating,
        notes,
        photos,
        points,
        badges,
        artworks,
        created_at,
        updated_at
      `)
      .eq('id', visitId)
      .eq('user_id', req.userId)
      .single();

    if (error) {
      console.error('Get exhibition visit error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Exhibition visit not found' });
      }
      return res.status(500).json({ error: 'Failed to get exhibition visit' });
    }

    res.json(visit);
  } catch (error) {
    console.error('Get exhibition visit error:', error);
    res.status(500).json({ error: 'Failed to get exhibition visit' });
  }
});

// Update exhibition visit
router.put('/visits/:visitId', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { visitId } = req.params;
    const {
      exhibitionTitle,
      museum,
      visitDate,
      duration,
      rating,
      notes,
      artworks,
      photos,
      badges,
      points
    } = req.body;

    // Build update object
    const updateData = {};

    if (exhibitionTitle !== undefined) updateData.exhibition_title = exhibitionTitle;
    if (museum !== undefined) updateData.museum = museum;
    if (visitDate !== undefined) updateData.visit_date = visitDate;
    if (duration !== undefined) updateData.duration = duration;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      updateData.rating = rating;
    }
    if (notes !== undefined) updateData.notes = notes;
    if (artworks !== undefined) updateData.artworks = artworks;
    if (photos !== undefined) updateData.photos = photos;
    if (badges !== undefined) updateData.badges = badges;
    if (points !== undefined) updateData.points = points;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: visit, error } = await supabase
      .from('exhibition_visits')
      .update(updateData)
      .eq('id', visitId)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      console.error('Update exhibition visit error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Exhibition visit not found' });
      }
      return res.status(500).json({ error: 'Failed to update exhibition visit' });
    }

    res.json(visit);
  } catch (error) {
    console.error('Update exhibition visit error:', error);
    res.status(500).json({ error: 'Failed to update exhibition visit' });
  }
});

// Delete exhibition visit
router.delete('/visits/:visitId', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { visitId } = req.params;

    const { error } = await supabase
      .from('exhibition_visits')
      .delete()
      .eq('id', visitId)
      .eq('user_id', req.userId);

    if (error) {
      console.error('Delete exhibition visit error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Exhibition visit not found' });
      }
      return res.status(500).json({ error: 'Failed to delete exhibition visit' });
    }

    res.json({ 
      success: true, 
      message: 'Exhibition visit deleted successfully' 
    });
  } catch (error) {
    console.error('Delete exhibition visit error:', error);
    res.status(500).json({ error: 'Failed to delete exhibition visit' });
  }
});

module.exports = router;
