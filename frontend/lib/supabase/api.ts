import { createClient } from './client';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

/**
 * Supabase API wrapper for SAYU
 * Provides type-safe database operations
 */
export class SupabaseAPI {
  private supabase = createClient();

  // Auth operations
  auth = {
    signIn: async (email: string, password: string) => {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    signUp: async (email: string, password: string, metadata?: any) => {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;
      return data;
    },

    signOut: async () => {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    },

    getSession: async () => {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  };

  // User operations
  users = {
    getProfile: async (authId: string) => {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    updateProfile: async (userId: string, updates: Partial<Tables['users']['Update']>) => {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    searchUsers: async (query: string) => {
      const { data, error } = await this.supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  };

  // Quiz operations
  quiz = {
    startSession: async (userId: string, language: string = 'ko') => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await this.supabase
        .from('quiz_sessions')
        .insert({
          user_id: userId,
          session_id: sessionId,
          language,
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    submitAnswer: async (sessionId: string, answer: any) => {
      const { data, error } = await this.supabase
        .from('quiz_answers')
        .insert({
          session_id: sessionId,
          question_id: answer.questionId,
          choice_id: answer.choiceId,
          dimension: answer.dimension,
          score_impact: answer.scoreImpact,
        })
        .select();
      
      if (error) throw error;
      return data;
    },

    completeSession: async (sessionId: string, result: any) => {
      const { error: sessionError } = await this.supabase
        .from('quiz_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          personality_scores: result.scores,
        })
        .eq('session_id', sessionId);
      
      if (sessionError) throw sessionError;

      const { data, error } = await this.supabase
        .from('quiz_results')
        .insert({
          session_id: sessionId,
          user_id: result.userId,
          personality_type: result.personalityType,
          animal_type: result.animalType,
          scores: result.scores,
          traits: result.traits,
          strengths: result.strengths,
          challenges: result.challenges,
          art_preferences: result.artPreferences,
          recommended_artists: result.recommendedArtists,
          recommended_styles: result.recommendedStyles,
          detailed_analysis: result.detailedAnalysis,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getResults: async (userId: string) => {
      const { data, error } = await this.supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  };

  // Art Profile operations
  artProfiles = {
    create: async (userId: string, personalityType: string, profileData: any) => {
      const { data, error } = await this.supabase
        .from('art_profiles')
        .insert({
          user_id: userId,
          personality_type: personalityType,
          profile_data: profileData,
          generation_prompt: profileData.prompt,
          style_attributes: profileData.styleAttributes,
          color_palette: profileData.colorPalette,
          artistic_elements: profileData.artisticElements,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    get: async (userId: string) => {
      const { data, error } = await this.supabase
        .from('art_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    update: async (profileId: string, updates: any) => {
      const { data, error } = await this.supabase
        .from('art_profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  };

  // Exhibition operations
  exhibitions = {
    list: async (filters?: {
      status?: 'upcoming' | 'ongoing' | 'ended';
      limit?: number;
      offset?: number;
    }) => {
      let query = this.supabase
        .from('exhibitions')
        .select('*, venue:venues(*)');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      query = query.order('start_date', { ascending: false });
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },

    get: async (id: string) => {
      const { data, error } = await this.supabase
        .from('exhibitions')
        .select('*, venue:venues(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    search: async (query: string) => {
      const { data, error } = await this.supabase
        .from('exhibitions')
        .select('*, venue:venues(*)')
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);
      
      if (error) throw error;
      return data;
    },

    like: async (exhibitionId: string, userId: string) => {
      const { error } = await this.supabase
        .from('exhibition_likes')
        .insert({
          exhibition_id: exhibitionId,
          user_id: userId,
        });
      
      if (error && error.code !== '23505') throw error; // Ignore duplicate
      
      // Update like count
      await this.supabase.rpc('increment', {
        table_name: 'exhibitions',
        column_name: 'like_count',
        row_id: exhibitionId,
      });
    },

    unlike: async (exhibitionId: string, userId: string) => {
      const { error } = await this.supabase
        .from('exhibition_likes')
        .delete()
        .eq('exhibition_id', exhibitionId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update like count
      await this.supabase.rpc('decrement', {
        table_name: 'exhibitions',
        column_name: 'like_count',
        row_id: exhibitionId,
      });
    },
  };

  // Social operations
  social = {
    follow: async (followerId: string, followingId: string) => {
      const { error } = await this.supabase
        .from('user_following')
        .insert({
          follower_id: followerId,
          following_id: followingId,
        });
      
      if (error && error.code !== '23505') throw error; // Ignore duplicate
    },

    unfollow: async (followerId: string, followingId: string) => {
      const { error } = await this.supabase
        .from('user_following')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      if (error) throw error;
    },

    getFollowers: async (userId: string) => {
      const { data, error } = await this.supabase
        .from('user_following')
        .select('*, follower:users!follower_id(*)')
        .eq('following_id', userId);
      
      if (error) throw error;
      return data;
    },

    getFollowing: async (userId: string) => {
      const { data, error } = await this.supabase
        .from('user_following')
        .select('*, following:users!following_id(*)')
        .eq('follower_id', userId);
      
      if (error) throw error;
      return data;
    },
  };

  // Perception Exchange operations
  perceptionExchange = {
    create: async (data: {
      artworkId: string;
      creatorId: string;
      emotionPrimary: string;
      emotionSecondary: string;
      emotionIntensity: number;
      perceptionText: string;
      phase: number;
    }) => {
      const { data: result, error } = await this.supabase
        .from('perception_exchanges')
        .insert({
          artwork_id: data.artworkId,
          creator_id: data.creatorId,
          emotion_primary: data.emotionPrimary,
          emotion_secondary: data.emotionSecondary,
          emotion_intensity: data.emotionIntensity,
          perception_text: data.perceptionText,
          phase: data.phase,
          is_anonymous: data.phase < 4,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },

    list: async (artworkId: string, phase?: number) => {
      let query = this.supabase
        .from('perception_exchanges')
        .select('*, creator:users!creator_id(id, username, avatar_url)')
        .eq('artwork_id', artworkId);
      
      if (phase) {
        query = query.eq('phase', phase);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    addReaction: async (exchangeId: string, userId: string, reactionType: string) => {
      const { error } = await this.supabase
        .from('perception_exchange_reactions')
        .insert({
          exchange_id: exchangeId,
          user_id: userId,
          reaction_type: reactionType,
        });
      
      if (error && error.code !== '23505') throw error; // Ignore duplicate
    },
  };

  // Realtime subscriptions
  realtime = {
    subscribeToExhibition: (exhibitionId: string, callback: (payload: any) => void) => {
      return this.supabase
        .channel(`exhibition:${exhibitionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'exhibition_likes',
            filter: `exhibition_id=eq.${exhibitionId}`,
          },
          callback
        )
        .subscribe();
    },

    subscribeToPerceptionExchange: (artworkId: string, callback: (payload: any) => void) => {
      return this.supabase
        .channel(`perception:${artworkId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'perception_exchanges',
            filter: `artwork_id=eq.${artworkId}`,
          },
          callback
        )
        .subscribe();
    },

    unsubscribe: (channel: any) => {
      this.supabase.removeChannel(channel);
    },
  };
}

// Export singleton instance
export const supabaseAPI = new SupabaseAPI();