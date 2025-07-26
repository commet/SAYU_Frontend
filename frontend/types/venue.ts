// Venue 관련 타입 정의

export interface Venue {
  id: string;
  name: string;
  name_en?: string;
  name_ko?: string;
  name_local?: string;
  city: string;
  city_en?: string;
  city_ko?: string;
  country: string;
  district?: string;
  province?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  venue_type: 'museum' | 'gallery' | 'art_center' | 'cultural_center';
  venue_category: 'public' | 'commercial' | 'private';
  tier?: number;
  rating?: number;
  review_count?: number;
  opening_hours?: {
    [key: string]: string;
  };
  admission_info?: string;
  admission_fee?: {
    adult?: number;
    child?: number;
    senior?: number;
    group?: number;
  };
  features?: string[];
  images?: string[];
  description?: string;
  description_en?: string;
  description_ko?: string;
  google_place_id?: string;
  google_maps_uri?: string;
  data_quality_score?: number;
  verification_status?: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
}

export interface VenueListResponse {
  success: boolean;
  data: Venue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  language: 'ko' | 'en';
}

export interface VenueDetailResponse {
  success: boolean;
  data: Venue;
  language: 'ko' | 'en';
}

export interface CityWithCount {
  city: string;
  city_original: string;
  city_ko?: string;
  city_en?: string;
  country: string;
  venue_count: number;
  museum_count: number;
  gallery_count: number;
}

export interface CountryWithCount {
  country: string;
  country_display: string;
  country_ko: string;
  country_en: string;
  venue_count: number;
  city_count: number;
  museum_count: number;
  gallery_count: number;
}

export interface VenueSearchResult {
  id: string;
  name: string;
  city: string;
  country: string;
  venue_type: string;
  rating?: number;
  relevance: number;
}

export interface VenueFilters {
  country?: string;
  city?: string;
  type?: 'museum' | 'gallery' | 'art_center' | 'cultural_center';
  tier?: number;
  search?: string;
  sortBy?: 'rating' | 'name' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface VenueQueryParams extends VenueFilters {
  page?: number;
  limit?: number;
  lang?: 'ko' | 'en';
}