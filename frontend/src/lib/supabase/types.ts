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
          email: string
          personality_type: string | null
          animal_type: string | null
          is_premium: boolean
          is_admin: boolean
          profile_image: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email: string
          personality_type?: string | null
          animal_type?: string | null
          is_premium?: boolean
          is_admin?: boolean
          profile_image?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string
          personality_type?: string | null
          animal_type?: string | null
          is_premium?: boolean
          is_admin?: boolean
          profile_image?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      art_profiles: {
        Row: {
          id: string
          user_id: string
          original_image: string
          transformed_image: string
          style_id: string
          style_name: string | null
          settings: Json
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_image: string
          transformed_image: string
          style_id: string
          style_name?: string | null
          settings?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_image?: string
          transformed_image?: string
          style_id?: string
          style_name?: string | null
          settings?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          quiz_type: string
          personality_type: string | null
          animal_type: string | null
          scores: Json
          analysis: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_type: string
          personality_type?: string | null
          animal_type?: string | null
          scores: Json
          analysis?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_type?: string
          personality_type?: string | null
          animal_type?: string | null
          scores?: Json
          analysis?: Json | null
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          title: string
          artist: string | null
          description: string | null
          image_url: string | null
          museum_source: string | null
          museum_id: string | null
          year_created: string | null
          medium: string | null
          dimensions: string | null
          metadata: Json
          embedding: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist?: string | null
          description?: string | null
          image_url?: string | null
          museum_source?: string | null
          museum_id?: string | null
          year_created?: string | null
          medium?: string | null
          dimensions?: string | null
          metadata?: Json
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string | null
          description?: string | null
          image_url?: string | null
          museum_source?: string | null
          museum_id?: string | null
          year_created?: string | null
          medium?: string | null
          dimensions?: string | null
          metadata?: Json
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_points: {
        Row: {
          id: string
          user_id: string
          total_points: number
          quiz_points: number
          social_points: number
          artwork_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_points?: number
          quiz_points?: number
          social_points?: number
          artwork_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_points?: number
          quiz_points?: number
          social_points?: number
          artwork_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          points_required: number | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          points_required?: number | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          points_required?: number | null
          category?: string | null
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}