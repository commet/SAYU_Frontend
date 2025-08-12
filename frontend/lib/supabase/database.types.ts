export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          avatar_url: string | null
          bio: string | null
          gender: string | null
          age_range: string | null
          region: string | null
          companion_type: string | null
          profile_completed: boolean | null
          profile_completed_at: string | null
          language: string | null
          preferences: Json | null
          points: number | null
          level: number | null
          personality_type: string | null
          animal_type: string | null
          apt_scores: Json | null
          apt_completed_at: string | null
          art_preferences: Json | null
          personality_traits: Json | null
          ai_generated_image_url: string | null
          generated_prompt: string | null
          style_description: string | null
          color_palette: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          gender?: string | null
          age_range?: string | null
          region?: string | null
          companion_type?: string | null
          profile_completed?: boolean | null
          profile_completed_at?: string | null
          language?: string | null
          preferences?: Json | null
          points?: number | null
          level?: number | null
          personality_type?: string | null
          animal_type?: string | null
          apt_scores?: Json | null
          apt_completed_at?: string | null
          art_preferences?: Json | null
          personality_traits?: Json | null
          ai_generated_image_url?: string | null
          generated_prompt?: string | null
          style_description?: string | null
          color_palette?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          gender?: string | null
          age_range?: string | null
          region?: string | null
          companion_type?: string | null
          profile_completed?: boolean | null
          profile_completed_at?: string | null
          language?: string | null
          preferences?: Json | null
          points?: number | null
          level?: number | null
          personality_type?: string | null
          animal_type?: string | null
          apt_scores?: Json | null
          apt_completed_at?: string | null
          art_preferences?: Json | null
          personality_traits?: Json | null
          ai_generated_image_url?: string | null
          generated_prompt?: string | null
          style_description?: string | null
          color_palette?: Json | null
          created_at?: string
          updated_at?: string | null
        }
      }
      quiz_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          status: string
          current_question_index: number
          personality_scores: Json
          language: string
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          status?: string
          current_question_index?: number
          personality_scores?: Json
          language?: string
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          status?: string
          current_question_index?: number
          personality_scores?: Json
          language?: string
          started_at?: string
          completed_at?: string | null
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          personality_type: string
          animal_type: string
          scores: Json
          traits: Json | null
          strengths: string[] | null
          challenges: string[] | null
          art_preferences: Json | null
          recommended_artists: string[] | null
          recommended_styles: string[] | null
          detailed_analysis: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          personality_type: string
          animal_type: string
          scores: Json
          traits?: Json | null
          strengths?: string[] | null
          challenges?: string[] | null
          art_preferences?: Json | null
          recommended_artists?: string[] | null
          recommended_styles?: string[] | null
          detailed_analysis?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          personality_type?: string
          animal_type?: string
          scores?: Json
          traits?: Json | null
          strengths?: string[] | null
          challenges?: string[] | null
          art_preferences?: Json | null
          recommended_artists?: string[] | null
          recommended_styles?: string[] | null
          detailed_analysis?: string | null
          created_at?: string
        }
      }
      art_profiles: {
        Row: {
          id: string
          user_id: string | null
          personality_type: string
          profile_image_url: string | null
          profile_data: Json | null
          generation_prompt: string | null
          style_attributes: Json | null
          color_palette: Json | null
          artistic_elements: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          personality_type: string
          profile_image_url?: string | null
          profile_data?: Json | null
          generation_prompt?: string | null
          style_attributes?: Json | null
          color_palette?: Json | null
          artistic_elements?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          personality_type?: string
          profile_image_url?: string | null
          profile_data?: Json | null
          generation_prompt?: string | null
          style_attributes?: Json | null
          color_palette?: Json | null
          artistic_elements?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      exhibitions: {
        Row: {
          id: string
          venue_id: string | null
          title: string
          title_en: string | null
          artist: string | null
          curator: string | null
          start_date: string | null
          end_date: string | null
          opening_time: string | null
          closing_time: string | null
          admission_fee: string | null
          description: string | null
          image_url: string | null
          poster_url: string | null
          tags: string[] | null
          category: string | null
          status: string
          view_count: number
          like_count: number
          source: string | null
          source_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          venue_id?: string | null
          title: string
          title_en?: string | null
          artist?: string | null
          curator?: string | null
          start_date?: string | null
          end_date?: string | null
          opening_time?: string | null
          closing_time?: string | null
          admission_fee?: string | null
          description?: string | null
          image_url?: string | null
          poster_url?: string | null
          tags?: string[] | null
          category?: string | null
          status?: string
          view_count?: number
          like_count?: number
          source?: string | null
          source_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_id?: string | null
          title?: string
          title_en?: string | null
          artist?: string | null
          curator?: string | null
          start_date?: string | null
          end_date?: string | null
          opening_time?: string | null
          closing_time?: string | null
          admission_fee?: string | null
          description?: string | null
          image_url?: string | null
          poster_url?: string | null
          tags?: string[] | null
          category?: string | null
          status?: string
          view_count?: number
          like_count?: number
          source?: string | null
          source_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      exhibition_likes: {
        Row: {
          id: string
          exhibition_id: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
      user_following: {
        Row: {
          id: string
          follower_id: string | null
          following_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          follower_id?: string | null
          following_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string | null
          following_id?: string | null
          created_at?: string
        }
      }
      perception_exchanges: {
        Row: {
          id: string
          artwork_id: string | null
          creator_id: string | null
          phase: number
          emotion_primary: string | null
          emotion_secondary: string | null
          emotion_intensity: number | null
          perception_text: string | null
          perception_vector: string | null
          is_anonymous: boolean
          view_count: number
          resonance_count: number
          created_at: string
          revealed_at: string | null
        }
        Insert: {
          id?: string
          artwork_id?: string | null
          creator_id?: string | null
          phase?: number
          emotion_primary?: string | null
          emotion_secondary?: string | null
          emotion_intensity?: number | null
          perception_text?: string | null
          perception_vector?: string | null
          is_anonymous?: boolean
          view_count?: number
          resonance_count?: number
          created_at?: string
          revealed_at?: string | null
        }
        Update: {
          id?: string
          artwork_id?: string | null
          creator_id?: string | null
          phase?: number
          emotion_primary?: string | null
          emotion_secondary?: string | null
          emotion_intensity?: number | null
          perception_text?: string | null
          perception_vector?: string | null
          is_anonymous?: boolean
          view_count?: number
          resonance_count?: number
          created_at?: string
          revealed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_total_points: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
      find_similar_artworks: {
        Args: {
          target_vector: string
          limit_count?: number
        }
        Returns: {
          artwork_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}