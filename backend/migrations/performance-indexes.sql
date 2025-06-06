-- Performance optimization indexes for SAYU platform
-- Run after main schema is applied

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_type_code ON user_profiles(type_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Quiz sessions indexes
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_type ON quiz_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_started_at ON quiz_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at ON quiz_sessions(completed_at DESC);

-- Forum performance indexes
CREATE INDEX IF NOT EXISTS idx_forum_topics_forum_id ON forum_topics(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user_id ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_reply_at ON forum_topics(last_reply_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at DESC);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_interaction_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at DESC);

-- Reservations indexes
CREATE INDEX IF NOT EXISTS idx_user_reservations_user_id ON user_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reservations_exhibition_id ON user_reservations(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_user_reservations_visit_date ON user_reservations(visit_date);
CREATE INDEX IF NOT EXISTS idx_user_reservations_status ON user_reservations(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_type ON quiz_sessions(user_id, session_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned ON user_achievements(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_forum_last_reply ON forum_topics(forum_id, last_reply_at DESC);

-- Email verification index
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- JSONB indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_exhibition_scores ON user_profiles USING GIN (exhibition_scores);
CREATE INDEX IF NOT EXISTS idx_user_profiles_artwork_scores ON user_profiles USING GIN (artwork_scores);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_responses ON quiz_sessions USING GIN (responses);