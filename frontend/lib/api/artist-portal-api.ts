import { apiClient } from './api-client';

export interface ArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  bio?: string;
  birth_year?: number;
  death_year?: number;
  nationality?: string;
  contact_email?: string;
  website_url?: string;
  phone?: string;
  address?: string;
  specialties?: string[];
  art_movements?: string[];
  famous_works?: string[];
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  profile_image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryProfile {
  id: string;
  user_id: string;
  gallery_name: string;
  description?: string;
  website_url?: string;
  contact_email: string;
  phone?: string;
  address?: string;
  gallery_type?: 'independent' | 'commercial' | 'museum' | 'nonprofit' | 'online' | 'popup';
  established_year?: number;
  specializations?: string[];
  opening_hours?: object;
  profile_image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtworkSubmission {
  id: string;
  artist_profile_id?: string;
  gallery_profile_id?: string;
  title: string;
  artist_display_name: string;
  creation_date?: string;
  medium: string;
  dimensions?: string;
  description?: string;
  technique?: string;
  style?: string;
  subject_matter?: string[];
  color_palette?: string[];
  primary_image_url: string;
  additional_images?: string[];
  price_range?: string;
  availability_status: 'available' | 'sold' | 'on_hold' | 'not_for_sale';
  exhibition_history?: string;
  provenance?: string;
  condition_report?: string;
  tags?: string[];
  submission_status: 'pending' | 'approved' | 'rejected';
  quality_score?: number;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExhibitionSubmission {
  id: string;
  gallery_profile_id: string;
  title: string;
  description?: string;
  curator_name?: string;
  start_date: string;
  end_date: string;
  exhibition_type?: 'solo' | 'group' | 'collective' | 'retrospective' | 'thematic';
  theme?: string;
  featured_artists?: string[];
  primary_image_url?: string;
  additional_images?: string[];
  tags?: string[];
  submission_status: 'pending' | 'approved' | 'rejected';
  quality_score?: number;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ImageUploadResult {
  url: string;
  publicId: string;
  sizes: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  };
  metadata: {
    width: number;
    height: number;
    format: string;
    bytes: number;
    folder: string;
  };
}

export class ArtistPortalAPI {
  // Artist Profile Management
  static async createArtistProfile(profileData: Partial<ArtistProfile>): Promise<ArtistProfile> {
    const response = await apiClient.post('/artist-portal/artist/profile', profileData);
    return response.data;
  }

  static async getArtistProfile(): Promise<ArtistProfile | null> {
    try {
      const response = await apiClient.get('/artist-portal/artist/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async updateArtistProfile(profileId: string, updates: Partial<ArtistProfile>): Promise<ArtistProfile> {
    const response = await apiClient.put(`/artist-portal/artist/profile/${profileId}`, updates);
    return response.data;
  }

  // Gallery Profile Management
  static async createGalleryProfile(profileData: Partial<GalleryProfile>): Promise<GalleryProfile> {
    const response = await apiClient.post('/artist-portal/gallery/profile', profileData);
    return response.data;
  }

  static async getGalleryProfile(): Promise<GalleryProfile | null> {
    try {
      const response = await apiClient.get('/artist-portal/gallery/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async updateGalleryProfile(profileId: string, updates: Partial<GalleryProfile>): Promise<GalleryProfile> {
    const response = await apiClient.put(`/artist-portal/gallery/profile/${profileId}`, updates);
    return response.data;
  }

  // Artwork Submission Management
  static async submitArtwork(artworkData: Partial<ArtworkSubmission>): Promise<ArtworkSubmission> {
    const response = await apiClient.post('/artist-portal/artworks', artworkData);
    return response.data;
  }

  static async getSubmittedArtworks(
    profileId: string, 
    profileType: 'artist' | 'gallery',
    status?: 'pending' | 'approved' | 'rejected'
  ): Promise<ArtworkSubmission[]> {
    const params = new URLSearchParams({
      profileId,
      profileType,
      ...(status && { status })
    });
    
    const response = await apiClient.get(`/artist-portal/artworks?${params}`);
    return response.data;
  }

  static async updateArtworkSubmission(
    artworkId: string,
    profileId: string,
    profileType: 'artist' | 'gallery',
    updates: Partial<ArtworkSubmission>
  ): Promise<ArtworkSubmission> {
    const response = await apiClient.put(`/artist-portal/artworks/${artworkId}`, {
      ...updates,
      profileId,
      profileType
    });
    return response.data;
  }

  // Exhibition Submission Management
  static async submitExhibition(exhibitionData: Partial<ExhibitionSubmission>): Promise<ExhibitionSubmission> {
    const response = await apiClient.post('/artist-portal/exhibitions', exhibitionData);
    return response.data;
  }

  static async getSubmittedExhibitions(
    galleryProfileId: string,
    status?: 'pending' | 'approved' | 'rejected'
  ): Promise<ExhibitionSubmission[]> {
    const params = new URLSearchParams({
      galleryProfileId,
      ...(status && { status })
    });
    
    const response = await apiClient.get(`/artist-portal/exhibitions?${params}`);
    return response.data;
  }

  // Image Upload Management
  static async uploadImage(
    file: File, 
    category: 'artist_profiles' | 'artist_artworks' | 'gallery_profiles' | 'gallery_exhibitions',
    description?: string
  ): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/artist-portal/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.image;
  }

  static async uploadMultipleImages(
    files: File[],
    category: 'artist_profiles' | 'artist_artworks' | 'gallery_profiles' | 'gallery_exhibitions',
    descriptions?: string[]
  ): Promise<{
    successful: ImageUploadResult[];
    failed: { error: string; index: number }[];
    summary: { total: number; successful: number; failed: number };
  }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('category', category);
    if (descriptions) {
      formData.append('descriptions', JSON.stringify(descriptions));
    }

    const response = await apiClient.post('/artist-portal/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.results;
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    const encodedPublicId = encodeURIComponent(publicId);
    const response = await apiClient.delete(`/artist-portal/upload/image/${encodedPublicId}`);
    return response.data.success;
  }

  // Public Content Browsing
  static async getPublicArtists(params: {
    page?: number;
    limit?: number;
    specialty?: string;
  } = {}): Promise<ArtistProfile[]> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.specialty) queryParams.append('specialty', params.specialty);

    const response = await apiClient.get(`/artist-portal/public/artists?${queryParams}`);
    return response.data;
  }

  static async getPublicGalleries(params: {
    page?: number;
    limit?: number;
    type?: 'independent' | 'commercial' | 'museum' | 'nonprofit' | 'online' | 'popup';
  } = {}): Promise<GalleryProfile[]> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);

    const response = await apiClient.get(`/artist-portal/public/galleries?${queryParams}`);
    return response.data;
  }

  // Admin Functions
  static async getPendingSubmissions(type?: 'artworks' | 'exhibitions'): Promise<{
    artworks?: ArtworkSubmission[];
    exhibitions?: ExhibitionSubmission[];
  }> {
    const params = type ? `?type=${type}` : '';
    const response = await apiClient.get(`/artist-portal/admin/submissions/pending${params}`);
    return response.data;
  }

  static async reviewSubmission(
    submissionType: 'artwork' | 'exhibition',
    submissionId: string,
    reviewData: {
      status: 'approved' | 'rejected' | 'pending';
      review_notes?: string;
      quality_score?: number;
      feedback?: object;
    }
  ): Promise<ArtworkSubmission | ExhibitionSubmission> {
    const response = await apiClient.post(
      `/artist-portal/admin/submissions/${submissionType}/${submissionId}/review`,
      reviewData
    );
    return response.data;
  }

  static async getPortalStats(): Promise<{
    total_artists: number;
    total_galleries: number;
    total_artworks: number;
    total_exhibitions: number;
    pending_reviews: number;
    recent_activity: any[];
  }> {
    const response = await apiClient.get('/artist-portal/admin/stats');
    return response.data;
  }

  // Artist Submission (Public)
  static async submitArtistInfo(artistData: {
    artist_name: string;
    bio?: string;
    birth_year?: number;
    death_year?: number;
    nationality?: string;
    contact_email?: string;
    website_url?: string;
    phone?: string;
    specialties?: string[];
    art_movements?: string[];
    famous_works?: string[];
    social_links?: object;
    submitted_by_name?: string;
    submitted_by_email?: string;
    submission_reason: 'missing_artist' | 'self_registration' | 'update_info';
    additional_info?: string;
    source_references?: string[];
  }): Promise<{
    success: boolean;
    message: string;
    profile_id?: string;
    artist_name?: string;
    status?: string;
    existing_artist_id?: string;
  }> {
    // Note: This endpoint doesn't require authentication
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artist-portal/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artistData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }
}