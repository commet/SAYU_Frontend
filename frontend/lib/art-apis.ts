// 🎨 SAYU Art API Integration - Public Domain & Contemporary Art Sources

// API Configuration
export const artAPIs = {
  // Metropolitan Museum of Art - No API key required
  met: {
    baseURL: 'https://collectionapi.metmuseum.org/public/collection/v1',
    name: 'Metropolitan Museum of Art',
    features: ['400k+ objects', 'Public domain images', 'Detailed metadata'],
    rateLimit: '80 requests per second',
  },
  
  // Rijksmuseum - Requires free API key
  rijksmuseum: {
    baseURL: 'https://www.rijksmuseum.nl/api',
    name: 'Rijksmuseum',
    features: ['Dutch masters', 'High-res images', 'Rich metadata'],
    requiresKey: true,
    keyRegistration: 'https://data.rijksmuseum.nl/object-metadata/api/',
  },
  
  // Harvard Art Museums - Requires free API key
  harvard: {
    baseURL: 'https://api.harvardartmuseums.org',
    name: 'Harvard Art Museums',
    features: ['Detailed records', 'Conservation data', 'Exhibition history'],
    requiresKey: true,
    keyRegistration: 'https://www.harvardartmuseums.org/collections/api',
  },
  
  // Art Institute of Chicago - No API key required
  artic: {
    baseURL: 'https://api.artic.edu/api/v1',
    name: 'Art Institute of Chicago',
    features: ['Modern art', 'American art', 'IIIF images'],
    rateLimit: 'Reasonable use',
  },
  
  // Cleveland Museum of Art - No API key required
  cleveland: {
    baseURL: 'https://openaccess-api.clevelandart.org/api',
    name: 'Cleveland Museum of Art',
    features: ['Open access', 'Diverse collection', 'CC0 license'],
    rateLimit: 'Unlimited for non-commercial',
  },
  
  // Europeana - Requires free API key
  europeana: {
    baseURL: 'https://api.europeana.eu/record/v2',
    name: 'Europeana',
    features: ['European heritage', 'Multiple languages', 'Cross-institutional'],
    requiresKey: true,
    keyRegistration: 'https://pro.europeana.eu/page/get-api',
  },
};

// Artist Schema
export interface Artist {
  id: string;
  name: string;
  nationality?: string;
  birthYear?: number;
  deathYear?: number | null;
  movements?: string[];
  personalityMatches: {
    primary: string[];
    secondary: string[];
  };
  keyWorks: ArtWork[];
  contemporaryInfo?: {
    website?: string;
    instagram?: string;
    representedBy?: string[];
    recentExhibitions?: Exhibition[];
  };
  description: {
    en: string;
    kr?: string;
  };
  source: string; // Which API/database this came from
}

export interface ArtWork {
  id: string;
  title: string;
  year?: number;
  medium?: string;
  dimensions?: string;
  imageUrl?: string; // Only for public domain
  thumbnailUrl?: string;
  museum: string;
  museumUrl?: string;
  accessionNumber?: string;
  isPublicDomain: boolean;
  creditLine?: string;
}

export interface Exhibition {
  id: string;
  title: string;
  venue: string;
  city: string;
  country: string;
  startDate: Date;
  endDate: Date;
  artists?: string[];
  description?: string;
  url?: string;
}

// Met Museum API Client
export const metMuseumAPI = {
  async searchArtworks(query: string, hasImages = true): Promise<number[]> {
    const params = new URLSearchParams({
      q: query,
      hasImages: hasImages.toString(),
    });
    
    const response = await fetch(`${artAPIs.met.baseURL}/search?${params}`);
    const data = await response.json();
    return data.objectIDs || [];
  },
  
  async getArtwork(objectID: number): Promise<ArtWork | null> {
    try {
      const response = await fetch(`${artAPIs.met.baseURL}/objects/${objectID}`);
      const data = await response.json();
      
      return {
        id: data.objectID.toString(),
        title: data.title,
        year: data.objectEndDate,
        medium: data.medium,
        dimensions: data.dimensions,
        imageUrl: data.isPublicDomain ? data.primaryImage : undefined,
        thumbnailUrl: data.isPublicDomain ? data.primaryImageSmall : undefined,
        museum: 'Metropolitan Museum of Art',
        museumUrl: data.objectURL,
        accessionNumber: data.accessionNumber,
        isPublicDomain: data.isPublicDomain,
        creditLine: data.creditLine,
      };
    } catch (error) {
      console.error('Error fetching Met artwork:', error);
      return null;
    }
  },
  
  async getArtistWorks(artistName: string): Promise<ArtWork[]> {
    const objectIDs = await this.searchArtworks(artistName);
    const works = await Promise.all(
      objectIDs.slice(0, 10).map(id => this.getArtwork(id))
    );
    return works.filter((work): work is ArtWork => work !== null);
  },
};

// Art Institute of Chicago API Client
export const articAPI = {
  async searchArtworks(query: string, page = 1, limit = 10) {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      fields: 'id,title,artist_display,date_display,medium_display,image_id,is_public_domain',
    });
    
    const response = await fetch(`${artAPIs.artic.baseURL}/artworks/search?${params}`);
    const data = await response.json();
    return data.data;
  },
  
  async getArtwork(id: string): Promise<ArtWork | null> {
    try {
      const response = await fetch(`${artAPIs.artic.baseURL}/artworks/${id}`);
      const { data } = await response.json();
      
      const imageUrl = data.image_id 
        ? `https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg`
        : undefined;
      
      return {
        id: data.id.toString(),
        title: data.title,
        year: data.date_end,
        medium: data.medium_display,
        dimensions: data.dimensions,
        imageUrl: data.is_public_domain ? imageUrl : undefined,
        thumbnailUrl: data.is_public_domain && data.image_id
          ? `https://www.artic.edu/iiif/2/${data.image_id}/full/200,/0/default.jpg`
          : undefined,
        museum: 'Art Institute of Chicago',
        museumUrl: `https://www.artic.edu/artworks/${data.id}`,
        accessionNumber: data.main_reference_number,
        isPublicDomain: data.is_public_domain,
        creditLine: data.credit_line,
      };
    } catch (error) {
      console.error('Error fetching ARTIC artwork:', error);
      return null;
    }
  },
};

// Cleveland Museum API Client
export const clevelandAPI = {
  async searchArtworks(query: string, limit = 10) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      has_image: '1',
    });
    
    const response = await fetch(`${artAPIs.cleveland.baseURL}/artworks?${params}`);
    const { data } = await response.json();
    return data;
  },
  
  async getArtwork(id: string): Promise<ArtWork | null> {
    try {
      const response = await fetch(`${artAPIs.cleveland.baseURL}/artworks/${id}`);
      const { data } = await response.json();
      
      return {
        id: data.id.toString(),
        title: data.title,
        year: data.creation_date_latest,
        medium: data.technique,
        dimensions: data.measurements,
        imageUrl: data.images?.web?.url,
        thumbnailUrl: data.images?.thumb?.url,
        museum: 'Cleveland Museum of Art',
        museumUrl: data.url,
        accessionNumber: data.accession_number,
        isPublicDomain: true, // Cleveland Museum is open access
        creditLine: data.creditline,
      };
    } catch (error) {
      console.error('Error fetching Cleveland artwork:', error);
      return null;
    }
  },
};

// Aggregate search across multiple museums
export async function searchArtworksAcrossMuseums(
  query: string,
  options: {
    museums?: string[];
    limit?: number;
    publicDomainOnly?: boolean;
  } = {}
): Promise<ArtWork[]> {
  const { museums = ['met', 'artic', 'cleveland'], limit = 20 } = options;
  
  const searchPromises = [];
  
  if (museums.includes('met')) {
    searchPromises.push(
      metMuseumAPI.searchArtworks(query)
        .then(ids => Promise.all(ids.slice(0, 5).map(id => metMuseumAPI.getArtwork(id))))
    );
  }
  
  if (museums.includes('artic')) {
    searchPromises.push(
      articAPI.searchArtworks(query, 1, 5)
        .then(results => Promise.all(results.map((r: any) => articAPI.getArtwork(r.id))))
    );
  }
  
  if (museums.includes('cleveland')) {
    searchPromises.push(
      clevelandAPI.searchArtworks(query, 5)
        .then(results => Promise.all(results.map((r: any) => clevelandAPI.getArtwork(r.id))))
    );
  }
  
  const allResults = await Promise.all(searchPromises);
  const artworks = allResults
    .flat()
    .filter((work): work is ArtWork => work !== null)
    .slice(0, limit);
  
  return artworks;
}

// Contemporary artist handler (no images, just metadata and links)
export function createContemporaryArtistProfile(artistData: {
  name: string;
  nationality?: string;
  birthYear?: number;
  website?: string;
  instagram?: string;
  galleries?: string[];
  description: string;
}): Artist {
  return {
    id: artistData.name.toLowerCase().replace(/\s+/g, '-'),
    name: artistData.name,
    nationality: artistData.nationality,
    birthYear: artistData.birthYear,
    deathYear: null,
    movements: ['Contemporary'],
    personalityMatches: {
      primary: [],
      secondary: [],
    },
    keyWorks: [], // Will be populated with metadata only
    contemporaryInfo: {
      website: artistData.website,
      instagram: artistData.instagram,
      representedBy: artistData.galleries,
      recentExhibitions: [],
    },
    description: {
      en: artistData.description,
    },
    source: 'manual',
  };
}

// Helper to match artworks to personality types
export function matchArtworkToPersonality(artwork: ArtWork, personalityType: string): number {
  // This is a simplified matching algorithm
  // In production, would use more sophisticated matching based on:
  // - Art movement
  // - Color analysis
  // - Subject matter
  // - Historical period
  // - Emotional tone
  
  let score = 0;
  
  // Example matching logic
  if (personalityType.includes('A')) { // Abstract preference
    if (artwork.medium?.toLowerCase().includes('abstract')) score += 2;
    if (artwork.title.toLowerCase().includes('untitled')) score += 1;
  }
  
  if (personalityType.includes('R')) { // Realistic preference
    if (artwork.medium?.toLowerCase().includes('portrait')) score += 2;
    if (artwork.medium?.toLowerCase().includes('landscape')) score += 1;
  }
  
  // Add more sophisticated matching logic here
  
  return score;
}