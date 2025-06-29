require('dotenv').config();
const { pool } = require('../config/database');
const { Achievement } = require('../models/Achievement');

// Create achievements table
async function createAchievementsTable() {
  const createAchievementsSQL = `
    CREATE TABLE IF NOT EXISTS achievements (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      requirements JSONB NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      badge_icon VARCHAR(100),
      badge_color VARCHAR(20),
      rarity VARCHAR(20) DEFAULT 'common',
      unlock_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUserAchievementsSQL = `
    CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      achievement_id VARCHAR(50) REFERENCES achievements(id) ON DELETE CASCADE,
      progress JSONB DEFAULT '{}',
      unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id)
    );
  `;

  const createUserProgressSQL = `
    CREATE TABLE IF NOT EXISTS user_progress (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      quizzes_completed INTEGER DEFAULT 0,
      artworks_viewed INTEGER DEFAULT 0,
      artworks_liked INTEGER DEFAULT 0,
      chat_messages INTEGER DEFAULT 0,
      login_streak INTEGER DEFAULT 0,
      total_logins INTEGER DEFAULT 0,
      exploration_days INTEGER DEFAULT 0,
      exhibitions_archived INTEGER DEFAULT 0,
      artworks_documented INTEGER DEFAULT 0,
      profile_completed BOOLEAN DEFAULT FALSE,
      last_login TIMESTAMP WITH TIME ZONE,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(createAchievementsSQL);
  await pool.query(createUserAchievementsSQL);
  await pool.query(createUserProgressSQL);
  
  console.log('✅ Achievement tables created successfully');
}

// Seed initial achievements
async function seedAchievements() {
  const achievements = [
    // Profile & Quiz Achievements
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Complete your first aesthetic quiz',
      category: 'profile',
      requirements: { quizzes_completed: 1 },
      points: 10,
      badge_icon: 'Sparkles',
      badge_color: '#8B5CF6',
      rarity: 'common',
      unlock_message: 'Welcome to your aesthetic journey!'
    },
    {
      id: 'aesthetic_explorer',
      name: 'Aesthetic Explorer',
      description: 'Complete both artwork and exhibition quizzes',
      category: 'profile',
      requirements: { quizzes_completed: 2 },
      points: 25,
      badge_icon: 'Compass',
      badge_color: '#06B6D4',
      rarity: 'common',
      unlock_message: 'You\'re becoming a true aesthetic explorer!'
    },
    {
      id: 'profile_master',
      name: 'Profile Master',
      description: 'Complete your full aesthetic profile',
      category: 'profile',
      requirements: { profile_completed: true },
      points: 50,
      badge_icon: 'User',
      badge_color: '#10B981',
      rarity: 'rare',
      unlock_message: 'Your aesthetic identity is now complete!'
    },

    // Art Discovery Achievements
    {
      id: 'art_lover',
      name: 'Art Lover',
      description: 'View 10 artworks in the gallery',
      category: 'discovery',
      requirements: { artworks_viewed: 10 },
      points: 15,
      badge_icon: 'Eye',
      badge_color: '#F59E0B',
      rarity: 'common',
      unlock_message: 'Your appreciation for art is growing!'
    },
    {
      id: 'gallery_explorer',
      name: 'Gallery Explorer',
      description: 'View 50 artworks in the gallery',
      category: 'discovery',
      requirements: { artworks_viewed: 50 },
      points: 40,
      badge_icon: 'Image',
      badge_color: '#8B5CF6',
      rarity: 'rare',
      unlock_message: 'You\'re a dedicated art explorer!'
    },
    {
      id: 'art_connoisseur',
      name: 'Art Connoisseur',
      description: 'View 100 artworks in the gallery',
      category: 'discovery',
      requirements: { artworks_viewed: 100 },
      points: 75,
      badge_icon: 'Crown',
      badge_color: '#DC2626',
      rarity: 'epic',
      unlock_message: 'Your knowledge of art is truly impressive!'
    },
    {
      id: 'art_scholar',
      name: 'Art Scholar',
      description: 'View 250 artworks in the gallery',
      category: 'discovery',
      requirements: { artworks_viewed: 250 },
      points: 150,
      badge_icon: 'GraduationCap',
      badge_color: '#7C3AED',
      rarity: 'legendary',
      unlock_message: 'You are a true scholar of the arts!'
    },

    // Engagement Achievements
    {
      id: 'first_favorite',
      name: 'First Favorite',
      description: 'Like your first artwork',
      category: 'engagement',
      requirements: { artworks_liked: 1 },
      points: 5,
      badge_icon: 'Heart',
      badge_color: '#EF4444',
      rarity: 'common',
      unlock_message: 'You\'ve found something you love!'
    },
    {
      id: 'curator_in_training',
      name: 'Curator in Training',
      description: 'Like 10 artworks',
      category: 'engagement',
      requirements: { artworks_liked: 10 },
      points: 20,
      badge_icon: 'Bookmark',
      badge_color: '#F59E0B',
      rarity: 'common',
      unlock_message: 'You\'re developing your curatorial eye!'
    },
    {
      id: 'taste_maker',
      name: 'Taste Maker',
      description: 'Like 25 artworks',
      category: 'engagement',
      requirements: { artworks_liked: 25 },
      points: 50,
      badge_icon: 'Star',
      badge_color: '#8B5CF6',
      rarity: 'rare',
      unlock_message: 'Your aesthetic taste is refined and discerning!'
    },

    // Chat & AI Achievements
    {
      id: 'first_conversation',
      name: 'First Conversation',
      description: 'Send your first message to the AI curator',
      category: 'social',
      requirements: { chat_messages: 1 },
      points: 10,
      badge_icon: 'MessageCircle',
      badge_color: '#06B6D4',
      rarity: 'common',
      unlock_message: 'Welcome to your personal art conversations!'
    },
    {
      id: 'chatty_explorer',
      name: 'Chatty Explorer',
      description: 'Send 25 messages to the AI curator',
      category: 'social',
      requirements: { chat_messages: 25 },
      points: 35,
      badge_icon: 'MessageSquare',
      badge_color: '#10B981',
      rarity: 'rare',
      unlock_message: 'You love deep conversations about art!'
    },
    {
      id: 'ai_best_friend',
      name: 'AI Best Friend',
      description: 'Send 100 messages to the AI curator',
      category: 'social',
      requirements: { chat_messages: 100 },
      points: 80,
      badge_icon: 'Bot',
      badge_color: '#8B5CF6',
      rarity: 'epic',
      unlock_message: 'You and your AI curator are best friends!'
    },

    // Consistency Achievements
    {
      id: 'daily_visitor',
      name: 'Daily Visitor',
      description: 'Login for 3 consecutive days',
      category: 'consistency',
      requirements: { login_streak: 3 },
      points: 15,
      badge_icon: 'Calendar',
      badge_color: '#F59E0B',
      rarity: 'common',
      unlock_message: 'Consistency is key to aesthetic growth!'
    },
    {
      id: 'dedicated_aesthete',
      name: 'Dedicated Aesthete',
      description: 'Login for 7 consecutive days',
      category: 'consistency',
      requirements: { login_streak: 7 },
      points: 40,
      badge_icon: 'Flame',
      badge_color: '#EF4444',
      rarity: 'rare',
      unlock_message: 'Your dedication to art is inspiring!'
    },
    {
      id: 'aesthetic_devotee',
      name: 'Aesthetic Devotee',
      description: 'Login for 30 consecutive days',
      category: 'consistency',
      requirements: { login_streak: 30 },
      points: 100,
      badge_icon: 'Trophy',
      badge_color: '#F59E0B',
      rarity: 'epic',
      unlock_message: 'You are truly devoted to your aesthetic journey!'
    },
    {
      id: 'eternal_explorer',
      name: 'Eternal Explorer',
      description: 'Login for 100 consecutive days',
      category: 'consistency',
      requirements: { login_streak: 100 },
      points: 250,
      badge_icon: 'Infinity',
      badge_color: '#7C3AED',
      rarity: 'legendary',
      unlock_message: 'Your commitment to art transcends time itself!'
    },

    // Archive & Documentation Achievements
    {
      id: 'first_archive',
      name: 'First Archive',
      description: 'Create your first exhibition archive',
      category: 'archive',
      requirements: { exhibitions_archived: 1 },
      points: 20,
      badge_icon: 'Archive',
      badge_color: '#06B6D4',
      rarity: 'common',
      unlock_message: 'You\'ve started building your personal art archive!'
    },
    {
      id: 'museum_explorer',
      name: 'Museum Explorer',
      description: 'Archive 5 different exhibitions',
      category: 'archive',
      requirements: { exhibitions_archived: 5 },
      points: 50,
      badge_icon: 'Map',
      badge_color: '#8B5CF6',
      rarity: 'rare',
      unlock_message: 'You\'re becoming a dedicated museum explorer!'
    },
    {
      id: 'art_documentarian',
      name: 'Art Documentarian',
      description: 'Archive impressions of 50 artworks',
      category: 'archive',
      requirements: { artworks_documented: 50 },
      points: 75,
      badge_icon: 'FileText',
      badge_color: '#F59E0B',
      rarity: 'epic',
      unlock_message: 'Your documentation skills are impressive!'
    },
    {
      id: 'exhibition_historian',
      name: 'Exhibition Historian',
      description: 'Archive 20 different exhibitions',
      category: 'archive',
      requirements: { exhibitions_archived: 20 },
      points: 150,
      badge_icon: 'Library',
      badge_color: '#7C3AED',
      rarity: 'legendary',
      unlock_message: 'You\'ve created an incredible historical record!'
    },

    // Special Achievements
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'One of the first to join SAYU',
      category: 'special',
      requirements: { total_logins: 1 },
      points: 25,
      badge_icon: 'Zap',
      badge_color: '#8B5CF6',
      rarity: 'rare',
      unlock_message: 'Thank you for being an early supporter!'
    },
    {
      id: 'aesthetic_pioneer',
      name: 'Aesthetic Pioneer',
      description: 'Help shape the future of aesthetic discovery',
      category: 'special',
      requirements: { exploration_days: 10 },
      points: 60,
      badge_icon: 'Flag',
      badge_color: '#10B981',
      rarity: 'epic',
      unlock_message: 'You\'re pioneering new ways to discover art!'
    }
  ];

  console.log('🌱 Seeding achievements...');
  
  for (const achievement of achievements) {
    try {
      await Achievement.create(achievement);
      console.log(`✅ Created achievement: ${achievement.name}`);
    } catch (error) {
      if (error.code === '23505') {
        console.log(`⚠️  Achievement already exists: ${achievement.name}`);
      } else {
        console.error(`❌ Error creating achievement ${achievement.name}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Achievement seeding completed!');
}

async function setupAchievements() {
  try {
    console.log('🚀 Setting up achievement system...');
    
    await createAchievementsTable();
    await seedAchievements();
    
    console.log('✅ Achievement system setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up achievements:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupAchievements();
}

module.exports = { setupAchievements };