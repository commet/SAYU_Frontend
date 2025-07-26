const { getSupabaseAdmin } = require('../config/supabase');
const { logger } = require('../config/logger');

async function setupArtPulseDatabase() {
  const supabase = getSupabaseAdmin();

  try {
    logger.info('Setting up Art Pulse database tables...');

    // Create art_pulse_sessions table
    const { error: sessionsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS art_pulse_sessions (
          id VARCHAR(255) PRIMARY KEY,
          artwork_id UUID REFERENCES artworks(id),
          artwork_data JSONB NOT NULL,
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_time TIMESTAMP WITH TIME ZONE NOT NULL,
          ended_at TIMESTAMP WITH TIME ZONE,
          status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
          phase VARCHAR(50) DEFAULT 'contemplation' CHECK (phase IN ('contemplation', 'sharing', 'voting')),
          results JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_art_pulse_sessions_status ON art_pulse_sessions(status);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_sessions_start_time ON art_pulse_sessions(start_time);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_sessions_artwork_id ON art_pulse_sessions(artwork_id);
      `
    });

    if (sessionsError) {
      logger.error('Error creating art_pulse_sessions table:', sessionsError);
    } else {
      logger.info('✅ art_pulse_sessions table created successfully');
    }

    // Create art_pulse_participations table
    const { error: participationsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS art_pulse_participations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR(255) REFERENCES art_pulse_sessions(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          sayu_type VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(session_id, user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_art_pulse_participations_session ON art_pulse_participations(session_id);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_participations_user ON art_pulse_participations(user_id);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_participations_sayu_type ON art_pulse_participations(sayu_type);
      `
    });

    if (participationsError) {
      logger.error('Error creating art_pulse_participations table:', participationsError);
    } else {
      logger.info('✅ art_pulse_participations table created successfully');
    }

    // Create art_pulse_emotions table
    const { error: emotionsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS art_pulse_emotions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR(255) REFERENCES art_pulse_sessions(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          emotion VARCHAR(50) NOT NULL CHECK (emotion IN (
            'wonder', 'melancholy', 'joy', 'contemplation', 'nostalgia', 
            'awe', 'serenity', 'passion', 'mystery', 'hope'
          )),
          intensity DECIMAL(3,2) DEFAULT 1.0 CHECK (intensity >= 0.1 AND intensity <= 1.0),
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(session_id, user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_art_pulse_emotions_session ON art_pulse_emotions(session_id);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_emotions_user ON art_pulse_emotions(user_id);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_emotions_emotion ON art_pulse_emotions(emotion);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_emotions_submitted_at ON art_pulse_emotions(submitted_at);
      `
    });

    if (emotionsError) {
      logger.error('Error creating art_pulse_emotions table:', emotionsError);
    } else {
      logger.info('✅ art_pulse_emotions table created successfully');
    }

    // Create art_pulse_reflections table
    const { error: reflectionsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS art_pulse_reflections (
          id VARCHAR(255) PRIMARY KEY,
          session_id VARCHAR(255) REFERENCES art_pulse_sessions(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          reflection TEXT NOT NULL CHECK (length(reflection) >= 10 AND length(reflection) <= 500),
          is_anonymous BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_art_pulse_reflections_session ON art_pulse_reflections(session_id);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_reflections_user ON art_pulse_reflections(user_id);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_reflections_created_at ON art_pulse_reflections(created_at);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_reflections_anonymous ON art_pulse_reflections(is_anonymous);
      `
    });

    if (reflectionsError) {
      logger.error('Error creating art_pulse_reflections table:', reflectionsError);
    } else {
      logger.info('✅ art_pulse_reflections table created successfully');
    }

    // Create art_pulse_reflection_likes table
    const { error: likesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS art_pulse_reflection_likes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          reflection_id VARCHAR(255) REFERENCES art_pulse_reflections(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(reflection_id, user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_art_pulse_likes_reflection ON art_pulse_reflection_likes(reflection_id);
        CREATE INDEX IF NOT EXISTS idx_art_pulse_likes_user ON art_pulse_reflection_likes(user_id);
      `
    });

    if (likesError) {
      logger.error('Error creating art_pulse_reflection_likes table:', likesError);
    } else {
      logger.info('✅ art_pulse_reflection_likes table created successfully');
    }

    // Create artwork analytics table for selection algorithm
    const { error: analyticsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS artwork_analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE UNIQUE,
          emotional_depth_score DECIMAL(3,2) DEFAULT 0.5 CHECK (emotional_depth_score >= 0 AND emotional_depth_score <= 1),
          visual_impact_score DECIMAL(3,2) DEFAULT 0.5 CHECK (visual_impact_score >= 0 AND visual_impact_score <= 1),
          discussion_potential_score DECIMAL(3,2) DEFAULT 0.5 CHECK (discussion_potential_score >= 0 AND discussion_potential_score <= 1),
          historical_engagement JSONB DEFAULT '{}',
          mood_tags TEXT[],
          season_tags TEXT[],
          last_featured_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_artwork_analytics_artwork ON artwork_analytics(artwork_id);
        CREATE INDEX IF NOT EXISTS idx_artwork_analytics_discussion_score ON artwork_analytics(discussion_potential_score);
        CREATE INDEX IF NOT EXISTS idx_artwork_analytics_emotional_score ON artwork_analytics(emotional_depth_score);
        CREATE INDEX IF NOT EXISTS idx_artwork_analytics_last_featured ON artwork_analytics(last_featured_at);
      `
    });

    if (analyticsError) {
      logger.error('Error creating artwork_analytics table:', analyticsError);
    } else {
      logger.info('✅ artwork_analytics table created successfully');
    }

    // Create achievements for Art Pulse
    const { error: achievementsError } = await supabase.rpc('execute_sql', {
      sql: `
        INSERT INTO achievements (id, name, description, category, requirement_type, requirement_value, reward_points, icon_url, created_at)
        VALUES 
          ('art-pulse-deep-reflection', 'Deep Reflection Master', 'Your reflection received the most likes in an Art Pulse session', 'art_pulse', 'reflection_likes', 1, 100, '/icons/achievements/deep-reflection.svg', NOW()),
          ('art-pulse-emotion-pioneer', 'Emotion Pioneer', 'Participated in 10 Art Pulse sessions', 'art_pulse', 'session_count', 10, 50, '/icons/achievements/emotion-pioneer.svg', NOW()),
          ('art-pulse-contemplative-soul', 'Contemplative Soul', 'Shared reflections in 5 consecutive Art Pulse sessions', 'art_pulse', 'consecutive_reflections', 5, 75, '/icons/achievements/contemplative-soul.svg', NOW()),
          ('art-pulse-community-builder', 'Community Builder', 'Your reflections received 100 total likes across all sessions', 'art_pulse', 'total_reflection_likes', 100, 200, '/icons/achievements/community-builder.svg', NOW())
        ON CONFLICT (id) DO NOTHING;
      `
    });

    if (achievementsError) {
      logger.error('Error creating Art Pulse achievements:', achievementsError);
    } else {
      logger.info('✅ Art Pulse achievements created successfully');
    }

    // Create RLS policies
    const { error: rlsError } = await supabase.rpc('execute_sql', {
      sql: `
        -- Enable RLS on all Art Pulse tables
        ALTER TABLE art_pulse_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE art_pulse_participations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE art_pulse_emotions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE art_pulse_reflections ENABLE ROW LEVEL SECURITY;
        ALTER TABLE art_pulse_reflection_likes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE artwork_analytics ENABLE ROW LEVEL SECURITY;

        -- Policies for art_pulse_sessions (readable by all authenticated users)
        CREATE POLICY "Art Pulse sessions are viewable by authenticated users" ON art_pulse_sessions
          FOR SELECT USING (auth.role() = 'authenticated');

        -- Policies for art_pulse_participations (users can read all, insert their own)
        CREATE POLICY "Art Pulse participations are viewable by authenticated users" ON art_pulse_participations
          FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Users can join Art Pulse sessions" ON art_pulse_participations
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Policies for art_pulse_emotions (users can read all, insert/update their own)
        CREATE POLICY "Art Pulse emotions are viewable by authenticated users" ON art_pulse_emotions
          FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Users can submit their own emotions" ON art_pulse_emotions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own emotions" ON art_pulse_emotions
          FOR UPDATE USING (auth.uid() = user_id);

        -- Policies for art_pulse_reflections (users can read all public, insert their own)
        CREATE POLICY "Public Art Pulse reflections are viewable by authenticated users" ON art_pulse_reflections
          FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Users can submit their own reflections" ON art_pulse_reflections
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Policies for art_pulse_reflection_likes (users can read all, manage their own)
        CREATE POLICY "Art Pulse reflection likes are viewable by authenticated users" ON art_pulse_reflection_likes
          FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Users can like reflections" ON art_pulse_reflection_likes
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can unlike reflections" ON art_pulse_reflection_likes
          FOR DELETE USING (auth.uid() = user_id);

        -- Policies for artwork_analytics (readable by all, manageable by admins)
        CREATE POLICY "Artwork analytics are viewable by authenticated users" ON artwork_analytics
          FOR SELECT USING (auth.role() = 'authenticated');
      `
    });

    if (rlsError) {
      logger.error('Error setting up RLS policies:', rlsError);
    } else {
      logger.info('✅ RLS policies created successfully');
    }

    logger.info('🎉 Art Pulse database setup completed successfully!');

  } catch (error) {
    logger.error('Error setting up Art Pulse database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupArtPulseDatabase()
    .then(() => {
      console.log('Art Pulse database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Art Pulse database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupArtPulseDatabase };