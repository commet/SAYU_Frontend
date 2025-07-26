const { getSupabaseAdmin } = require('../config/supabase');
const redisClient = require('../config/redis');
const { logger } = require('../config/logger');
const cron = require('node-cron');

class ArtPulseService {
  constructor() {
    this.currentSession = null;
    this.sessionParticipants = new Map(); // sessionId -> Set of userIds
    this.emotionDistribution = new Map(); // sessionId -> emotion counts
    this.realTimeReflections = new Map(); // sessionId -> reflection array
    this.votingResults = new Map(); // sessionId -> voting data
    
    // Schedule daily Art Pulse sessions at 7 PM KST
    this.scheduleDailySessions();
  }

  // Daily session scheduler
  scheduleDailySessions() {
    // Run at 7 PM KST every day
    cron.schedule('0 19 * * *', async () => {
      try {
        await this.startDailyArtPulse();
        logger.info('Daily Art Pulse session started automatically');
      } catch (error) {
        logger.error('Failed to start daily Art Pulse session:', error);
      }
    }, {
      timezone: "Asia/Seoul"
    });

    logger.info('Art Pulse daily scheduler initialized (7 PM KST)');
  }

  // Start a new Art Pulse session
  async startDailyArtPulse() {
    try {
      const artwork = await this.selectTodaysArtwork();
      const sessionId = `art-pulse-${Date.now()}`;
      
      const session = {
        id: sessionId,
        artwork,
        startTime: new Date(),
        endTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
        status: 'active',
        phase: 'contemplation', // contemplation -> sharing -> voting
        participantCount: 0,
        emotionDistribution: {},
        reflections: []
      };

      // Save to database
      const supabase = getSupabaseAdmin();
      await supabase.from('art_pulse_sessions').insert({
        id: sessionId,
        artwork_id: artwork.id,
        artwork_data: artwork,
        start_time: session.startTime,
        end_time: session.endTime,
        status: 'active',
        phase: 'contemplation'
      });

      // Cache in Redis
      await redisClient.setex(`art-pulse:session:${sessionId}`, 1800, JSON.stringify(session));
      await redisClient.set('art-pulse:current-session', sessionId);

      this.currentSession = session;
      this.sessionParticipants.set(sessionId, new Set());
      this.emotionDistribution.set(sessionId, {});
      this.realTimeReflections.set(sessionId, []);
      
      // Schedule phase transitions
      this.schedulePhaseTransitions(sessionId);
      
      return session;
    } catch (error) {
      logger.error('Error starting Art Pulse session:', error);
      throw error;
    }
  }

  // Schedule phase transitions for a session
  schedulePhaseTransitions(sessionId) {
    // Transition to sharing phase after 8 minutes
    setTimeout(async () => {
      await this.transitionPhase(sessionId, 'sharing');
    }, 8 * 60 * 1000);

    // Transition to voting phase after 15 minutes
    setTimeout(async () => {
      await this.transitionPhase(sessionId, 'voting');
    }, 15 * 60 * 1000);

    // End session after 20 minutes
    setTimeout(async () => {
      await this.endSession(sessionId);
    }, 20 * 60 * 1000);
  }

  // Select today's artwork using intelligent algorithm
  async selectTodaysArtwork() {
    try {
      const supabase = getSupabaseAdmin();
      
      // Get artwork that hasn't been featured recently
      const { data: recentSessions } = await supabase
        .from('art_pulse_sessions')
        .select('artwork_id')
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .order('start_time', { ascending: false });

      const recentArtworkIds = recentSessions?.map(s => s.artwork_id) || [];

      // Selection criteria: emotional depth, visual impact, discussion potential
      const { data: candidates } = await supabase
        .from('artworks')
        .select(`
          *,
          artwork_analytics (
            emotional_depth_score,
            visual_impact_score,
            discussion_potential_score
          )
        `)
        .not('id', 'in', `(${recentArtworkIds.join(',') || '0'})`)
        .gte('artwork_analytics.emotional_depth_score', 0.7)
        .order('artwork_analytics.discussion_potential_score', { ascending: false })
        .limit(10);

      if (!candidates?.length) {
        // Fallback to any available artwork
        const { data: fallback } = await supabase
          .from('artworks')
          .select('*')
          .limit(1);
        return fallback[0];
      }

      // Weight by time of day and seasonal factors
      const now = new Date();
      const hour = now.getHours();
      const season = this.getCurrentSeason();
      
      const weighted = candidates.map(artwork => {
        let score = artwork.artwork_analytics?.discussion_potential_score || 0.5;
        
        // Evening preference for contemplative pieces
        if (hour >= 18 && artwork.mood_tags?.includes('contemplative')) {
          score += 0.2;
        }
        
        // Seasonal adjustments
        if (artwork.season_tags?.includes(season)) {
          score += 0.1;
        }
        
        return { ...artwork, weighted_score: score };
      });

      // Select with weighted randomness
      weighted.sort((a, b) => b.weighted_score - a.weighted_score);
      const topCandidates = weighted.slice(0, 3);
      const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
      
      logger.info(`Selected artwork for Art Pulse: ${selected.title} by ${selected.artist}`);
      return selected;
    } catch (error) {
      logger.error('Error selecting artwork:', error);
      throw error;
    }
  }

  // Get current season for artwork selection
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  // User joins Art Pulse session
  async joinSession(userId, sessionId = null) {
    try {
      const targetSessionId = sessionId || await redisClient.get('art-pulse:current-session');
      if (!targetSessionId) {
        throw new Error('No active Art Pulse session');
      }

      // Get user profile for personalization
      const supabase = getSupabaseAdmin();
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, sayu_type, emotion_preferences, art_preferences')
        .eq('id', userId)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Add to participants
      if (!this.sessionParticipants.has(targetSessionId)) {
        this.sessionParticipants.set(targetSessionId, new Set());
      }
      this.sessionParticipants.get(targetSessionId).add(userId);

      // Update Redis
      await redisClient.sadd(`art-pulse:participants:${targetSessionId}`, userId);
      
      // Log participation
      await supabase.from('art_pulse_participations').insert({
        session_id: targetSessionId,
        user_id: userId,
        joined_at: new Date(),
        sayu_type: profile.sayu_type
      });

      const session = await this.getSession(targetSessionId);
      return {
        session,
        userProfile: profile,
        participantCount: this.sessionParticipants.get(targetSessionId).size
      };
    } catch (error) {
      logger.error('Error joining Art Pulse session:', error);
      throw error;
    }
  }

  // Submit emotion during contemplation phase
  async submitEmotion(userId, sessionId, emotion, intensity = 1) {
    try {
      const session = await this.getSession(sessionId);
      if (session.phase !== 'contemplation') {
        throw new Error('Emotion submission only available during contemplation phase');
      }

      // Validate emotion
      const validEmotions = [
        'wonder', 'melancholy', 'joy', 'contemplation', 'nostalgia', 
        'awe', 'serenity', 'passion', 'mystery', 'hope'
      ];
      
      if (!validEmotions.includes(emotion)) {
        throw new Error('Invalid emotion');
      }

      // Update emotion distribution
      if (!this.emotionDistribution.has(sessionId)) {
        this.emotionDistribution.set(sessionId, {});
      }
      
      const distribution = this.emotionDistribution.get(sessionId);
      if (!distribution[emotion]) {
        distribution[emotion] = [];
      }
      
      // Remove previous emotion from this user
      Object.keys(distribution).forEach(key => {
        distribution[key] = distribution[key].filter(entry => entry.userId !== userId);
      });
      
      // Add new emotion
      distribution[emotion].push({
        userId,
        intensity,
        timestamp: new Date()
      });

      // Update Redis
      await redisClient.hset(
        `art-pulse:emotions:${sessionId}`, 
        emotion, 
        JSON.stringify(distribution[emotion])
      );

      // Save to database
      const supabase = getSupabaseAdmin();
      await supabase.from('art_pulse_emotions').upsert({
        session_id: sessionId,
        user_id: userId,
        emotion,
        intensity,
        submitted_at: new Date()
      });

      return this.getEmotionDistribution(sessionId);
    } catch (error) {
      logger.error('Error submitting emotion:', error);
      throw error;
    }
  }

  // Submit reflection during sharing phase
  async submitReflection(userId, sessionId, reflection, isAnonymous = false) {
    try {
      const session = await this.getSession(sessionId);
      if (session.phase !== 'sharing') {
        throw new Error('Reflection submission only available during sharing phase');
      }

      const supabase = getSupabaseAdmin();
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, sayu_type, profile_image')
        .eq('id', userId)
        .single();

      const reflectionData = {
        id: `reflection-${Date.now()}-${userId}`,
        userId: isAnonymous ? null : userId,
        username: isAnonymous ? null : profile.username,
        sayuType: isAnonymous ? null : profile.sayu_type,
        profileImage: isAnonymous ? null : profile.profile_image,
        reflection: reflection.trim(),
        timestamp: new Date(),
        likes: 0,
        likedBy: [],
        isAnonymous
      };

      // Add to real-time reflections
      if (!this.realTimeReflections.has(sessionId)) {
        this.realTimeReflections.set(sessionId, []);
      }
      this.realTimeReflections.get(sessionId).push(reflectionData);

      // Save to database
      await supabase.from('art_pulse_reflections').insert({
        id: reflectionData.id,
        session_id: sessionId,
        user_id: userId,
        reflection,
        is_anonymous: isAnonymous,
        created_at: new Date()
      });

      // Update Redis
      await redisClient.lpush(
        `art-pulse:reflections:${sessionId}`,
        JSON.stringify(reflectionData)
      );

      return reflectionData;
    } catch (error) {
      logger.error('Error submitting reflection:', error);
      throw error;
    }
  }

  // Like a reflection
  async likeReflection(userId, sessionId, reflectionId) {
    try {
      const reflections = this.realTimeReflections.get(sessionId) || [];
      const reflection = reflections.find(r => r.id === reflectionId);
      
      if (!reflection) {
        throw new Error('Reflection not found');
      }

      // Toggle like
      const likedIndex = reflection.likedBy.indexOf(userId);
      if (likedIndex === -1) {
        reflection.likedBy.push(userId);
        reflection.likes++;
      } else {
        reflection.likedBy.splice(likedIndex, 1);
        reflection.likes--;
      }

      // Update database
      const supabase = getSupabaseAdmin();
      await supabase.from('art_pulse_reflection_likes').upsert({
        reflection_id: reflectionId,
        user_id: userId,
        liked_at: likedIndex === -1 ? new Date() : null
      });

      return reflection;
    } catch (error) {
      logger.error('Error liking reflection:', error);
      throw error;
    }
  }

  // Transition session phase
  async transitionPhase(sessionId, newPhase) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return;

      session.phase = newPhase;
      
      // Update database
      const supabase = getSupabaseAdmin();
      await supabase.from('art_pulse_sessions')
        .update({ phase: newPhase })
        .eq('id', sessionId);

      // Update Redis
      await redisClient.setex(`art-pulse:session:${sessionId}`, 1800, JSON.stringify(session));

      // Broadcast phase change to all participants
      const socketService = require('./socketService');
      socketService.broadcastArtPulsePhaseChange(sessionId, newPhase);

      logger.info(`Art Pulse session ${sessionId} transitioned to ${newPhase} phase`);
      return session;
    } catch (error) {
      logger.error('Error transitioning phase:', error);
      throw error;
    }
  }

  // End session and calculate results
  async endSession(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return;

      // Calculate session results
      const results = await this.calculateSessionResults(sessionId);
      
      session.status = 'completed';
      session.results = results;

      // Update database
      const supabase = getSupabaseAdmin();
      await supabase.from('art_pulse_sessions')
        .update({ 
          status: 'completed',
          results,
          ended_at: new Date()
        })
        .eq('id', sessionId);

      // Broadcast session end to all participants
      const socketService = require('./socketService');
      socketService.broadcastArtPulseSessionEnd(sessionId, results);

      // Award achievements
      await this.awardSessionAchievements(sessionId, results);

      // Clean up memory
      this.sessionParticipants.delete(sessionId);
      this.emotionDistribution.delete(sessionId);
      this.realTimeReflections.delete(sessionId);
      this.votingResults.delete(sessionId);

      // Clear current session if this was it
      const currentSessionId = await redisClient.get('art-pulse:current-session');
      if (currentSessionId === sessionId) {
        await redisClient.del('art-pulse:current-session');
        this.currentSession = null;
      }

      logger.info(`Art Pulse session ${sessionId} ended with ${results.totalParticipants} participants`);
      return results;
    } catch (error) {
      logger.error('Error ending session:', error);
      throw error;
    }
  }

  // Calculate session results
  async calculateSessionResults(sessionId) {
    try {
      const participants = this.sessionParticipants.get(sessionId) || new Set();
      const emotions = this.emotionDistribution.get(sessionId) || {};
      const reflections = this.realTimeReflections.get(sessionId) || [];

      // Top emotions
      const emotionCounts = {};
      Object.keys(emotions).forEach(emotion => {
        emotionCounts[emotion] = emotions[emotion].length;
      });

      const topEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([emotion, count]) => ({ emotion, count }));

      // Top reflections (by likes)
      const topReflections = reflections
        .filter(r => !r.isAnonymous) // Only public reflections for awards
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3);

      // Participation stats
      const supabase = getSupabaseAdmin();
      const { data: sayuTypeStats } = await supabase
        .from('art_pulse_participations')
        .select('sayu_type')
        .eq('session_id', sessionId);

      const sayuDistribution = {};
      sayuTypeStats?.forEach(({ sayu_type }) => {
        sayuDistribution[sayu_type] = (sayuDistribution[sayu_type] || 0) + 1;
      });

      return {
        totalParticipants: participants.size,
        topEmotions,
        topReflections,
        sayuDistribution,
        totalReflections: reflections.length,
        emotionDiversity: Object.keys(emotions).length,
        averageEngagement: reflections.reduce((sum, r) => sum + r.likes, 0) / Math.max(reflections.length, 1)
      };
    } catch (error) {
      logger.error('Error calculating session results:', error);
      throw error;
    }
  }

  // Award achievements for session participation
  async awardSessionAchievements(sessionId, results) {
    try {
      const supabase = getSupabaseAdmin();
      
      // Award "Deep Reflection" achievement to top reflection authors
      for (const reflection of results.topReflections) {
        if (reflection.userId) {
          await supabase.from('user_achievements').upsert({
            user_id: reflection.userId,
            achievement_id: 'art-pulse-deep-reflection',
            earned_at: new Date(),
            session_id: sessionId
          });
        }
      }

      // Award "Emotion Pioneer" to users who selected unique emotions
      const participants = this.sessionParticipants.get(sessionId) || new Set();
      for (const userId of participants) {
        // Check if user contributed to emotional diversity
        const userEmotions = await supabase
          .from('art_pulse_emotions')
          .select('emotion')
          .eq('session_id', sessionId)
          .eq('user_id', userId);

        if (userEmotions.data?.length > 0) {
          await supabase.from('user_achievements').upsert({
            user_id: userId,
            achievement_id: 'art-pulse-emotion-pioneer',
            earned_at: new Date(),
            session_id: sessionId
          });
        }
      }
    } catch (error) {
      logger.error('Error awarding achievements:', error);
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const sessionId = await redisClient.get('art-pulse:current-session');
      if (!sessionId) return null;

      return await this.getSession(sessionId);
    } catch (error) {
      logger.error('Error getting current session:', error);
      return null;
    }
  }

  // Get session by ID
  async getSession(sessionId) {
    try {
      // Try Redis first
      const cached = await redisClient.get(`art-pulse:session:${sessionId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fallback to database
      const supabase = getSupabaseAdmin();
      const { data: session } = await supabase
        .from('art_pulse_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      return session;
    } catch (error) {
      logger.error('Error getting session:', error);
      return null;
    }
  }

  // Get real-time emotion distribution
  getEmotionDistribution(sessionId) {
    const emotions = this.emotionDistribution.get(sessionId) || {};
    const distribution = {};
    
    Object.keys(emotions).forEach(emotion => {
      distribution[emotion] = {
        count: emotions[emotion].length,
        intensity: emotions[emotion].reduce((sum, e) => sum + e.intensity, 0) / emotions[emotion].length || 0
      };
    });

    return distribution;
  }

  // Get real-time reflections
  getReflections(sessionId) {
    return this.realTimeReflections.get(sessionId) || [];
  }

  // Get participant count
  getParticipantCount(sessionId) {
    return this.sessionParticipants.get(sessionId)?.size || 0;
  }

  // Weekly reflection league
  async getWeeklyLeague() {
    try {
      const supabase = getSupabaseAdmin();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
      
      const { data: topReflections } = await supabase
        .from('art_pulse_reflections')
        .select(`
          *,
          profiles!user_id (username, sayu_type, profile_image),
          art_pulse_reflection_likes (count)
        `)
        .gte('created_at', weekStart.toISOString())
        .eq('is_anonymous', false)
        .order('art_pulse_reflection_likes.count', { ascending: false })
        .limit(10);

      return topReflections || [];
    } catch (error) {
      logger.error('Error getting weekly league:', error);
      return [];
    }
  }
}

module.exports = new ArtPulseService();