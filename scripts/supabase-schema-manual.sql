-- Supabase Schema Generated from Railway
-- Execute this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Table: activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  activity_type character varying NOT NULL,
  points_earned integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: apt_dimension_stats
CREATE TABLE IF NOT EXISTS apt_dimension_stats (
  lone_dominant bigint,
  shared_dominant bigint,
  abstract_dominant bigint,
  representational_dominant bigint,
  emotional_dominant bigint,
  meaning_dominant bigint,
  flow_dominant bigint,
  constructive_dominant bigint,
  total_mapped bigint
);

-- Table: apt_profiles
CREATE TABLE IF NOT EXISTS apt_profiles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  artist_id uuid NOT NULL,
  primary_apt character varying NOT NULL,
  secondary_apt character varying,
  tertiary_apt character varying,
  matching_reasoning text,
  confidence_score numeric DEFAULT 0.5,
  data_sources jsonb DEFAULT '{}'::jsonb,
  classification_method character varying DEFAULT 'manual'::character varying,
  is_verified boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: apt_type_distribution
CREATE TABLE IF NOT EXISTS apt_type_distribution (
  apt_type text,
  artist_count bigint,
  avg_weight numeric,
  top_artists text
);

-- Table: art_profile_likes
CREATE TABLE IF NOT EXISTS art_profile_likes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  art_profile_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: art_profiles
CREATE TABLE IF NOT EXISTS art_profiles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  original_image text NOT NULL,
  transformed_image text NOT NULL,
  style_id character varying NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: artist_apt_mappings
CREATE TABLE IF NOT EXISTS artist_apt_mappings (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  artist_id uuid,
  mapping_method character varying NOT NULL,
  apt_profile jsonb NOT NULL,
  confidence_score numeric,
  mapped_by character varying,
  mapping_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: artist_follows
CREATE TABLE IF NOT EXISTS artist_follows (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  artist_id uuid NOT NULL,
  followed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: artists
CREATE TABLE IF NOT EXISTS artists (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name character varying NOT NULL,
  name_ko character varying,
  birth_year integer,
  death_year integer,
  nationality character varying,
  nationality_ko character varying,
  bio text,
  bio_ko text,
  copyright_status character varying DEFAULT 'unknown'::character varying NOT NULL,
  follow_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  era character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  images jsonb DEFAULT '{}'::jsonb,
  sources jsonb DEFAULT '{}'::jsonb,
  license_info jsonb DEFAULT '{}'::jsonb,
  official_links jsonb DEFAULT '{}'::jsonb,
  representation jsonb DEFAULT '{}'::jsonb,
  recent_exhibitions jsonb DEFAULT '[]'::jsonb,
  media_links jsonb DEFAULT '{}'::jsonb,
  is_verified boolean DEFAULT false,
  verification_date timestamp without time zone,
  verification_method character varying,
  artist_managed jsonb DEFAULT '{}'::jsonb,
  permissions jsonb DEFAULT '{}'::jsonb,
  purchase_links jsonb DEFAULT '{}'::jsonb,
  apt_profile jsonb,
  importance_score integer DEFAULT 30,
  importance_tier integer DEFAULT 4,
  updated_by_system boolean DEFAULT false,
  popularity_score integer DEFAULT 0,
  educational_value integer DEFAULT 0,
  market_influence integer DEFAULT 0,
  external_data jsonb DEFAULT '{}'::jsonb
);

-- Table: artvee_artist_mappings
CREATE TABLE IF NOT EXISTS artvee_artist_mappings (
  id integer DEFAULT nextval('artvee_artist_mappings_id_seq'::regclass) NOT NULL,
  artvee_artist character varying NOT NULL,
  artist_id uuid,
  confidence_score double precision NOT NULL,
  mapping_method character varying NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: artvee_artwork_artists
CREATE TABLE IF NOT EXISTS artvee_artwork_artists (
  id integer DEFAULT nextval('artvee_artwork_artists_id_seq'::regclass) NOT NULL,
  artwork_id integer,
  artist_id uuid,
  role character varying DEFAULT 'artist'::character varying,
  is_primary boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: artvee_artworks
CREATE TABLE IF NOT EXISTS artvee_artworks (
  id integer DEFAULT nextval('artvee_artworks_id_seq'::regclass) NOT NULL,
  artvee_id character varying NOT NULL,
  title character varying NOT NULL,
  artist character varying NOT NULL,
  artist_slug character varying NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  full_image_url text,
  sayu_type character varying NOT NULL,
  personality_tags ARRAY DEFAULT ARRAY[]::text[],
  emotion_tags ARRAY DEFAULT ARRAY[]::text[],
  usage_tags ARRAY DEFAULT ARRAY[]::text[],
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: artwork_artists
CREATE TABLE IF NOT EXISTS artwork_artists (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  artwork_id uuid NOT NULL,
  artist_id uuid NOT NULL,
  role character varying DEFAULT 'artist'::character varying,
  is_primary boolean DEFAULT true,
  display_order integer DEFAULT 0
);

-- Table: artworks
CREATE TABLE IF NOT EXISTS artworks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  object_id character varying NOT NULL,
  title character varying NOT NULL,
  title_ko character varying,
  date_display character varying,
  year_start integer,
  year_end integer,
  medium character varying,
  medium_ko character varying,
  dimensions character varying,
  credit_line text,
  department character varying,
  classification character varying,
  image_url text,
  thumbnail_url text,
  cloudinary_url text,
  image_width integer,
  image_height integer,
  source character varying NOT NULL,
  source_url text,
  is_public_domain boolean DEFAULT false,
  is_on_view boolean DEFAULT false,
  gallery_info character varying,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  bookmark_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: challenges
CREATE TABLE IF NOT EXISTS challenges (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name character varying NOT NULL,
  description text,
  conditions jsonb NOT NULL,
  target integer NOT NULL,
  reward_points integer NOT NULL,
  reward_title_id character varying,
  is_active boolean DEFAULT true,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: city_translations
CREATE TABLE IF NOT EXISTS city_translations (
  id integer DEFAULT nextval('city_translations_id_seq'::regclass) NOT NULL,
  country character varying NOT NULL,
  city_original character varying NOT NULL,
  city_ko character varying,
  city_en character varying,
  city_ja character varying,
  city_zh character varying,
  province character varying,
  province_ko character varying,
  province_en character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: collection_logs
CREATE TABLE IF NOT EXISTS collection_logs (
  id integer DEFAULT nextval('collection_logs_id_seq'::regclass) NOT NULL,
  collection_type character varying NOT NULL,
  collected_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  duration_ms integer DEFAULT 0,
  sources_data jsonb,
  error_message text,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: current_global_exhibitions
CREATE TABLE IF NOT EXISTS current_global_exhibitions (
  id integer,
  venue_id integer,
  title character varying,
  title_local character varying,
  subtitle text,
  description text,
  description_local text,
  artists jsonb,
  curator character varying,
  curator_local character varying,
  start_date date,
  end_date date,
  opening_reception timestamp without time zone,
  ticket_required boolean,
  ticket_price jsonb,
  booking_url character varying,
  booking_required boolean,
  exhibition_type character varying,
  art_medium character varying,
  themes ARRAY,
  featured_artworks jsonb,
  official_url character varying,
  catalog_url character varying,
  press_kit_url character varying,
  virtual_tour_url character varying,
  poster_image_url character varying,
  gallery_images jsonb,
  promotional_video_url character varying,
  data_source character varying,
  data_quality_score integer,
  external_exhibition_id character varying,
  personality_matches ARRAY,
  emotion_signatures jsonb,
  ai_generated_description text,
  recommendation_score integer,
  status character varying,
  visibility character varying,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  venue_name character varying,
  city character varying,
  country character varying,
  venue_website character varying,
  latitude numeric,
  longitude numeric
);

-- Table: daily_stats
CREATE TABLE IF NOT EXISTS daily_stats (
  user_id uuid NOT NULL,
  date date NOT NULL,
  points_earned integer DEFAULT 0,
  exhibitions_visited integer DEFAULT 0,
  reviews_written integer DEFAULT 0,
  photos_uploaded integer DEFAULT 0,
  total_duration_minutes integer DEFAULT 0
);

-- Table: exhibition_artists
CREATE TABLE IF NOT EXISTS exhibition_artists (
  id integer DEFAULT nextval('exhibition_artists_id_seq'::regclass) NOT NULL,
  exhibition_id uuid,
  artist_id uuid,
  role character varying DEFAULT 'participant'::character varying,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: exhibition_artworks
CREATE TABLE IF NOT EXISTS exhibition_artworks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  exhibition_id uuid NOT NULL,
  artwork_id uuid NOT NULL,
  display_order integer DEFAULT 0,
  section character varying
);

-- Table: exhibition_raw_data
CREATE TABLE IF NOT EXISTS exhibition_raw_data (
  id integer DEFAULT nextval('exhibition_raw_data_id_seq'::regclass) NOT NULL,
  source character varying NOT NULL,
  venue_name character varying,
  raw_content text,
  parsed_data jsonb,
  processing_status character varying DEFAULT 'pending'::character varying,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: exhibition_reports
CREATE TABLE IF NOT EXISTS exhibition_reports (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  exhibition_id uuid,
  user_id uuid,
  report_content jsonb NOT NULL,
  generated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  shared_publicly boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Table: exhibition_sessions
CREATE TABLE IF NOT EXISTS exhibition_sessions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  exhibition_id uuid NOT NULL,
  exhibition_name character varying,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  duration_minutes integer,
  location jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: exhibition_submissions
CREATE TABLE IF NOT EXISTS exhibition_submissions (
  id integer DEFAULT nextval('exhibition_submissions_id_seq'::regclass) NOT NULL,
  title character varying NOT NULL,
  venue_name character varying NOT NULL,
  venue_city character varying,
  venue_country character varying DEFAULT 'KR'::character varying,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  artists text,
  admission_fee integer DEFAULT 0,
  source_url character varying,
  contact_info character varying,
  poster_image character varying,
  submitted_by uuid,
  submission_status character varying DEFAULT 'pending'::character varying,
  review_notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: exhibition_tags
CREATE TABLE IF NOT EXISTS exhibition_tags (
  id integer DEFAULT nextval('exhibition_tags_id_seq'::regclass) NOT NULL,
  exhibition_id uuid,
  tag character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now()
);

-- Table: exhibitions
CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  institution_id uuid,
  title_en character varying NOT NULL,
  title_local character varying,
  subtitle character varying,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status character varying DEFAULT 'upcoming'::character varying,
  description text,
  curator character varying,
  artists ARRAY,
  artworks_count integer,
  ticket_price jsonb,
  official_url character varying,
  press_release_url character varying,
  virtual_tour_url character varying,
  exhibition_type character varying DEFAULT 'temporary'::character varying,
  genres ARRAY,
  tags ARRAY,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  venue_id integer,
  venue_name character varying,
  venue_city character varying,
  venue_country character varying DEFAULT 'KR'::character varying,
  source character varying DEFAULT 'manual'::character varying,
  source_url character varying,
  contact_info character varying,
  collected_at timestamp without time zone,
  submission_id integer,
  ai_verified boolean DEFAULT false,
  ai_confidence numeric DEFAULT 0.0,
  website_url text,
  venue_address text,
  phone_number character varying,
  admission_fee text,
  operating_hours text
);

-- Table: gamification_events
CREATE TABLE IF NOT EXISTS gamification_events (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name character varying NOT NULL,
  description text,
  event_type character varying NOT NULL,
  conditions jsonb DEFAULT '{}'::jsonb,
  multiplier numeric DEFAULT 1.0,
  start_datetime timestamp with time zone NOT NULL,
  end_datetime timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true
);

-- Table: global_collection_logs
CREATE TABLE IF NOT EXISTS global_collection_logs (
  id integer DEFAULT nextval('global_collection_logs_id_seq'::regclass) NOT NULL,
  collection_type character varying NOT NULL,
  data_source character varying NOT NULL,
  target_city character varying,
  target_country character varying,
  records_attempted integer DEFAULT 0,
  records_successful integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  records_duplicate integer DEFAULT 0,
  duration_seconds integer,
  api_calls_made integer DEFAULT 0,
  api_quota_remaining integer,
  status character varying NOT NULL,
  error_message text,
  warnings ARRAY,
  success_rate numeric,
  started_at timestamp without time zone NOT NULL,
  completed_at timestamp without time zone,
  configuration jsonb,
  results_summary jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: global_data_quality_metrics
CREATE TABLE IF NOT EXISTS global_data_quality_metrics (
  id integer DEFAULT nextval('global_data_quality_metrics_id_seq'::regclass) NOT NULL,
  metric_date date DEFAULT CURRENT_DATE NOT NULL,
  total_venues integer DEFAULT 0,
  verified_venues integer DEFAULT 0,
  venues_with_coordinates integer DEFAULT 0,
  venues_with_contact_info integer DEFAULT 0,
  venues_with_opening_hours integer DEFAULT 0,
  venues_with_social_media integer DEFAULT 0,
  average_venue_quality_score numeric,
  total_exhibitions integer DEFAULT 0,
  active_exhibitions integer DEFAULT 0,
  exhibitions_with_images integer DEFAULT 0,
  exhibitions_with_booking_info integer DEFAULT 0,
  average_exhibition_quality_score numeric,
  google_places_venues integer DEFAULT 0,
  foursquare_venues integer DEFAULT 0,
  web_scraped_venues integer DEFAULT 0,
  manual_venues integer DEFAULT 0,
  countries_covered integer DEFAULT 0,
  cities_covered integer DEFAULT 0,
  daily_venues_collected integer DEFAULT 0,
  daily_exhibitions_collected integer DEFAULT 0,
  collection_success_rate numeric,
  average_collection_duration_minutes numeric,
  duplicate_detection_rate numeric,
  api_error_rate numeric,
  data_freshness_days numeric,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: global_exhibitions
CREATE TABLE IF NOT EXISTS global_exhibitions (
  id integer DEFAULT nextval('global_exhibitions_id_seq'::regclass) NOT NULL,
  venue_id integer,
  title character varying NOT NULL,
  title_local character varying,
  subtitle text,
  description text,
  description_local text,
  artists jsonb,
  curator character varying,
  curator_local character varying,
  start_date date NOT NULL,
  end_date date NOT NULL,
  opening_reception timestamp without time zone,
  ticket_required boolean DEFAULT false,
  ticket_price jsonb,
  booking_url character varying,
  booking_required boolean DEFAULT false,
  exhibition_type character varying,
  art_medium character varying,
  themes ARRAY,
  featured_artworks jsonb,
  official_url character varying,
  catalog_url character varying,
  press_kit_url character varying,
  virtual_tour_url character varying,
  poster_image_url character varying,
  gallery_images jsonb,
  promotional_video_url character varying,
  data_source character varying NOT NULL,
  data_quality_score integer DEFAULT 0,
  external_exhibition_id character varying,
  personality_matches ARRAY DEFAULT '{}'::integer[],
  emotion_signatures jsonb,
  ai_generated_description text,
  recommendation_score integer DEFAULT 50,
  status character varying DEFAULT 'active'::character varying,
  visibility character varying DEFAULT 'public'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: global_venues
CREATE TABLE IF NOT EXISTS global_venues (
  id integer DEFAULT nextval('global_venues_id_seq'::regclass) NOT NULL,
  name character varying NOT NULL,
  name_local character varying,
  description text,
  description_local text,
  country character varying NOT NULL,
  city character varying NOT NULL,
  address text,
  address_local text,
  latitude numeric,
  longitude numeric,
  phone character varying,
  email character varying,
  website character varying,
  social_media jsonb,
  venue_type character varying NOT NULL,
  venue_category character varying,
  art_focus character varying,
  opening_hours jsonb,
  admission_info jsonb,
  accessibility_info text,
  languages_supported ARRAY,
  google_place_id character varying,
  foursquare_venue_id character varying,
  tripadvisor_id character varying,
  facebook_page_id character varying,
  data_source character varying NOT NULL,
  data_quality_score integer DEFAULT 0,
  verification_status character varying DEFAULT 'unverified'::character varying,
  last_verified timestamp without time zone,
  personality_matches ARRAY DEFAULT '{}'::integer[],
  emotion_signatures jsonb,
  recommendation_priority integer DEFAULT 50,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  created_by character varying DEFAULT 'system'::character varying,
  name_en character varying,
  district character varying,
  tier integer,
  is_active boolean DEFAULT true,
  rating numeric,
  review_count integer,
  data_completeness integer,
  admission_fee jsonb,
  province character varying,
  city_en character varying,
  name_ko character varying,
  city_ko character varying,
  address_ko text,
  description_ko text,
  admission_info_ko text,
  address_en text,
  admission_info_en text
);

-- Table: global_venues_by_city
CREATE TABLE IF NOT EXISTS global_venues_by_city (
  country character varying,
  city character varying,
  total_venues bigint,
  museums bigint,
  galleries bigint,
  art_centers bigint,
  avg_quality_score numeric,
  verified_venues bigint
);

-- Table: importance_tiers
CREATE TABLE IF NOT EXISTS importance_tiers (
  tier integer NOT NULL,
  name character varying,
  score_range character varying,
  description text
);

-- Table: institutions
CREATE TABLE IF NOT EXISTS institutions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name_en character varying NOT NULL,
  name_local character varying,
  type character varying DEFAULT 'museum'::character varying NOT NULL,
  category character varying DEFAULT 'public'::character varying,
  country character varying,
  city character varying,
  address text,
  coordinates point,
  website character varying,
  email character varying,
  phone character varying,
  opening_hours jsonb DEFAULT '{}'::jsonb,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: leaderboard_monthly
CREATE TABLE IF NOT EXISTS leaderboard_monthly (
  user_id uuid NOT NULL,
  month_start date NOT NULL,
  points integer DEFAULT 0,
  rank integer
);

-- Table: leaderboard_weekly
CREATE TABLE IF NOT EXISTS leaderboard_weekly (
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  points integer DEFAULT 0,
  rank integer
);

-- Table: naver_search_cache
CREATE TABLE IF NOT EXISTS naver_search_cache (
  id integer DEFAULT nextval('naver_search_cache_id_seq'::regclass) NOT NULL,
  query character varying,
  response_data jsonb,
  created_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone DEFAULT (now() + '24:00:00'::interval)
);

-- Table: personality_artwork_mapping
CREATE TABLE IF NOT EXISTS personality_artwork_mapping (
  personality_type character varying NOT NULL,
  primary_artworks ARRAY DEFAULT '{}'::uuid[],
  style_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: quiz_sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  session_type character varying,
  device_info jsonb,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  time_spent integer,
  responses jsonb,
  completion_rate double precision
);

-- Table: scraping_jobs
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id integer DEFAULT nextval('scraping_jobs_id_seq'::regclass) NOT NULL,
  venue_id uuid,
  venue_name character varying,
  job_type character varying,
  status character varying DEFAULT 'pending'::character varying,
  started_at timestamp without time zone,
  completed_at timestamp without time zone,
  error_message text,
  results_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Table: system_stats
CREATE TABLE IF NOT EXISTS system_stats (
  key character varying NOT NULL,
  value text,
  updated_at timestamp without time zone DEFAULT now()
);

-- Table: title_progress
CREATE TABLE IF NOT EXISTS title_progress (
  user_id uuid NOT NULL,
  title_id character varying NOT NULL,
  progress integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: titles
CREATE TABLE IF NOT EXISTS titles (
  id character varying NOT NULL,
  name character varying NOT NULL,
  name_ko character varying NOT NULL,
  description text,
  description_ko text,
  icon character varying,
  rarity character varying DEFAULT 'common'::character varying,
  sort_order integer DEFAULT 0
);

-- Table: unified_venues
CREATE TABLE IF NOT EXISTS unified_venues (
  id integer,
  name character varying,
  name_en character varying,
  name_local character varying,
  country character varying,
  city character varying,
  district character varying,
  address text,
  latitude numeric,
  longitude numeric,
  phone character varying,
  email character varying,
  website character varying,
  social_media jsonb,
  venue_type character varying,
  venue_category character varying,
  tier integer,
  is_active boolean,
  rating numeric,
  review_count integer,
  opening_hours jsonb,
  admission_info jsonb,
  google_place_id character varying,
  data_source character varying,
  data_quality_score integer,
  verification_status character varying,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  recommendation_level text,
  venue_scope text
);

-- Table: user_artwork_entries
CREATE TABLE IF NOT EXISTS user_artwork_entries (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  exhibition_id uuid,
  user_id uuid,
  title character varying NOT NULL,
  artist character varying NOT NULL,
  year character varying,
  medium character varying,
  impression text NOT NULL,
  emotion_rating integer,
  technical_rating integer,
  image_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_artwork_interactions
CREATE TABLE IF NOT EXISTS user_artwork_interactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  artwork_id uuid NOT NULL,
  interaction_type character varying NOT NULL,
  interaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_bookmarks
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  exhibition_id uuid NOT NULL,
  bookmark_type character varying DEFAULT 'interested'::character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: user_challenges
CREATE TABLE IF NOT EXISTS user_challenges (
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL,
  progress integer DEFAULT 0,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: user_exhibitions
CREATE TABLE IF NOT EXISTS user_exhibitions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  exhibition_name character varying NOT NULL,
  venue character varying NOT NULL,
  visit_date date NOT NULL,
  overall_impression text,
  mood_tags jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_gamification
CREATE TABLE IF NOT EXISTS user_gamification (
  user_id uuid NOT NULL,
  level integer DEFAULT 1,
  current_points integer DEFAULT 0,
  total_points integer DEFAULT 0,
  weekly_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: user_notifications
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  exhibition_id uuid NOT NULL,
  notification_preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: user_preference_profiles
CREATE TABLE IF NOT EXISTS user_preference_profiles (
  user_id uuid NOT NULL,
  preferred_genres ARRAY DEFAULT '{}'::text[],
  preferred_artists ARRAY DEFAULT '{}'::text[],
  implicit_preferences jsonb DEFAULT '{}'::jsonb,
  profile_completeness double precision DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  type_code character varying,
  archetype_name character varying,
  archetype_description text,
  archetype_evolution_stage integer DEFAULT 1,
  exhibition_scores jsonb,
  artwork_scores jsonb,
  emotional_tags ARRAY,
  cognitive_vector jsonb,
  emotional_vector jsonb,
  aesthetic_vector jsonb,
  personality_confidence double precision,
  ui_customization jsonb,
  interaction_style character varying,
  generated_image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: user_recommendations
CREATE TABLE IF NOT EXISTS user_recommendations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  recommendation_type character varying NOT NULL,
  item_id uuid NOT NULL,
  recommendation_algorithm character varying NOT NULL,
  relevance_score double precision DEFAULT 0,
  final_score double precision DEFAULT 0,
  recommendation_reason text,
  was_viewed boolean DEFAULT false,
  was_liked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: user_stats_summary
CREATE TABLE IF NOT EXISTS user_stats_summary (
  user_id uuid,
  level integer,
  total_points integer,
  weekly_streak integer,
  total_exhibitions bigint,
  avg_duration numeric,
  titles_earned bigint,
  active_days bigint
);

-- Table: user_titles
CREATE TABLE IF NOT EXISTS user_titles (
  user_id uuid NOT NULL,
  title_id character varying NOT NULL,
  earned_at timestamp with time zone DEFAULT now(),
  is_main boolean DEFAULT false
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  email character varying NOT NULL,
  username character varying,
  password_hash character varying,
  personality_type character varying,
  is_premium boolean DEFAULT false,
  profile_image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  subscription_type character varying DEFAULT 'free'::character varying,
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone,
  subscription_status character varying DEFAULT 'inactive'::character varying,
  user_purpose character varying DEFAULT 'exploring'::character varying
);

-- Table: venue_translation_status
CREATE TABLE IF NOT EXISTS venue_translation_status (
  country character varying,
  total_venues bigint,
  has_name_en bigint,
  has_name_ko bigint,
  has_city_en bigint,
  has_city_ko bigint,
  name_en_coverage numeric,
  name_ko_coverage numeric
);

-- Table: venues
CREATE TABLE IF NOT EXISTS venues (
  id integer DEFAULT nextval('venues_id_seq'::regclass) NOT NULL,
  name character varying NOT NULL,
  name_en character varying,
  city character varying,
  district character varying,
  country character varying DEFAULT 'KR'::character varying,
  type character varying DEFAULT 'gallery'::character varying,
  tier integer DEFAULT 2,
  website character varying,
  address character varying,
  instagram character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  latitude numeric,
  longitude numeric,
  phone character varying,
  rating numeric,
  review_count integer DEFAULT 0,
  opening_hours jsonb,
  admission_fee jsonb,
  google_place_id character varying,
  data_completeness integer DEFAULT 0,
  last_updated timestamp without time zone DEFAULT now()
);

-- Table: waitlists
CREATE TABLE IF NOT EXISTS waitlists (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  email character varying NOT NULL,
  referralCode character varying NOT NULL,
  referredBy uuid,
  referralCount integer DEFAULT 0,
  aptTestCompleted boolean DEFAULT false,
  aptScore json,
  position integer DEFAULT nextval('waitlists_position_seq'::regclass) NOT NULL,
  accessGranted boolean DEFAULT false,
  accessGrantedAt timestamp with time zone,
  metadata json DEFAULT '{}'::json,
  createdAt timestamp with time zone,
  updatedAt timestamp with time zone
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_likes ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY IF NOT EXISTS "Users can manage own likes" ON exhibition_likes FOR ALL USING (true);
