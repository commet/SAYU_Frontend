// Museum API Client for SAYU
// Handles integration with multiple museum APIs for artwork recommendations

export interface Artwork {
  id: string;
  sourceMuseum: string;
  title: string;
  titleKo?: string;
  artist: string;
  artistKo?: string;
  date: string;
  medium: string;
  mediumKo?: string;
  dimensions?: string;
  department?: string;
  culture?: string;
  period?: string;
  dynasty?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  description?: string;
  descriptionKo?: string;
  tags: string[];
  colors?: string[];
  isPublicDomain: boolean;
  license: string;
  creditLine?: string;
  accessionNumber?: string;
  classification?: string;
  personalityMatch?: string[];
  emotionalTags?: string[];
  lastVerified: Date;
}

export interface MuseumAPIResponse {
  artworks: Artwork[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

// Met Museum API Client
export class MetMuseumClient {
  private baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
  
  async searchArtworks(query: string, hasImages = true): Promise<number[]> {
    const params = new URLSearchParams({
      q: query,
      hasImages: hasImages.toString()
    });
    
    const response = await fetch(`${this.baseUrl}/search?${params}`);
    const data = await response.json();
    
    return data.objectIDs || [];
  }
  
  async getArtwork(objectId: number): Promise<Artwork | null> {
    try {
      const response = await fetch(`${this.baseUrl}/objects/${objectId}`);
      const data = await response.json();
      
      if (!data.isPublicDomain || !data.primaryImage) {
        return null;
      }
      
      return {
        id: `met-${data.objectID}`,
        sourceMuseum: 'Metropolitan Museum of Art',
        title: data.title || 'Untitled',
        artist: data.artistDisplayName || 'Unknown',
        date: data.objectDate || '',
        medium: data.medium || '',
        dimensions: data.dimensions || '',
        department: data.department || '',
        culture: data.culture || '',
        period: data.period || '',
        dynasty: data.dynasty || '',
        imageUrl: data.primaryImage,
        thumbnailUrl: data.primaryImageSmall || data.primaryImage,
        tags: [
          data.classification,
          data.objectName,
          ...data.tags || []
        ].filter(Boolean),
        isPublicDomain: true,
        license: 'CC0',
        creditLine: data.creditLine || '',
        accessionNumber: data.accessionNumber || '',
        classification: data.classification || '',
        lastVerified: new Date()
      };
    } catch (error) {
      console.error('Error fetching Met artwork:', error);
      return null;
    }
  }
  
  async getArtworksBatch(objectIds: number[]): Promise<Artwork[]> {
    const artworks: Artwork[] = [];
    
    for (const id of objectIds) {
      const artwork = await this.getArtwork(id);
      if (artwork) {
        artworks.push(artwork);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return artworks;
  }
}

// Art Institute of Chicago API Client
export class ChicagoArtClient {
  private baseUrl = 'https://api.artic.edu/api/v1';
  
  async searchArtworks(
    query: string, 
    page = 1, 
    limit = 20
  ): Promise<MuseumAPIResponse> {
    const params = new URLSearchParams({
      q: query,
      query: JSON.stringify({
        term: { is_public_domain: true }
      }),
      fields: 'id,title,artist_display,date_display,medium_display,image_id,thumbnail,department_title,classification_title,term_titles,color',
      limit: limit.toString(),
      page: page.toString()
    });
    
    const response = await fetch(`${this.baseUrl}/artworks/search?${params}`);
    const data = await response.json();
    
    const artworks = data.data
      .filter((item: any) => item.image_id)
      .map((item: any) => ({
        id: `aic-${item.id}`,
        sourceMuseum: 'Art Institute of Chicago',
        title: item.title || 'Untitled',
        artist: item.artist_display || 'Unknown',
        date: item.date_display || '',
        medium: item.medium_display || '',
        department: item.department_title || '',
        imageUrl: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
        thumbnailUrl: item.thumbnail?.lqip || '',
        tags: item.term_titles || [],
        colors: item.color ? [item.color.h, item.color.s, item.color.l].map(String) : [],
        isPublicDomain: true,
        license: 'CC0',
        classification: item.classification_title || '',
        lastVerified: new Date()
      }));
    
    return {
      artworks,
      totalCount: data.pagination.total,
      hasMore: data.pagination.current_page < data.pagination.total_pages,
      nextPage: data.pagination.current_page + 1
    };
  }
}

// Rijksmuseum API Client
export class RijksmuseumClient {
  private baseUrl = 'https://www.rijksmuseum.nl/api/en/collection';
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async searchArtworks(
    query: string, 
    page = 1, 
    limit = 20
  ): Promise<MuseumAPIResponse> {
    const params = new URLSearchParams({
      key: this.apiKey,
      q: query,
      format: 'json',
      imgonly: 'true',
      ps: limit.toString(),
      p: page.toString()
    });
    
    const response = await fetch(`${this.baseUrl}?${params}`);
    const data = await response.json();
    
    const artworks = data.artObjects.map((item: any) => ({
      id: `rijk-${item.objectNumber}`,
      sourceMuseum: 'Rijksmuseum',
      title: item.title || 'Untitled',
      artist: item.principalOrFirstMaker || 'Unknown',
      date: item.dating?.presentingDate || '',
      imageUrl: item.webImage?.url || '',
      thumbnailUrl: item.headerImage?.url || '',
      tags: [item.objectTypes?.[0], ...item.materials || []].filter(Boolean),
      colors: item.colors || [],
      isPublicDomain: true,
      license: 'CC0',
      lastVerified: new Date()
    }));
    
    return {
      artworks: artworks.filter((a: Artwork) => a.imageUrl),
      totalCount: data.count,
      hasMore: page * limit < data.count,
      nextPage: page + 1
    };
  }
}

// Unified Museum API Client
export class UnifiedMuseumClient {
  private metClient: MetMuseumClient;
  private chicagoClient: ChicagoArtClient;
  private rijksClient?: RijksmuseumClient;
  
  constructor(rijksApiKey?: string) {
    this.metClient = new MetMuseumClient();
    this.chicagoClient = new ChicagoArtClient();
    if (rijksApiKey) {
      this.rijksClient = new RijksmuseumClient(rijksApiKey);
    }
  }
  
  async searchAllMuseums(query: string): Promise<Artwork[]> {
    const results: Artwork[] = [];
    
    // Search Met Museum
    try {
      const metIds = await this.metClient.searchArtworks(query);
      const metArtworks = await this.metClient.getArtworksBatch(metIds.slice(0, 10));
      results.push(...metArtworks);
    } catch (error) {
      console.error('Met Museum search error:', error);
    }
    
    // Search Chicago Art Institute
    try {
      const chicagoResponse = await this.chicagoClient.searchArtworks(query);
      results.push(...chicagoResponse.artworks);
    } catch (error) {
      console.error('Chicago Art search error:', error);
    }
    
    // Search Rijksmuseum if API key available
    if (this.rijksClient) {
      try {
        const rijksResponse = await this.rijksClient.searchArtworks(query);
        results.push(...rijksResponse.artworks);
      } catch (error) {
        console.error('Rijksmuseum search error:', error);
      }
    }
    
    return results;
  }
  
  // Get artworks by personality type
  async getArtworksByPersonality(personalityType: string): Promise<Artwork[]> {
    const personalityQueries: Record<string, string[]> = {
      // Large Abstract
      'LAEF': ['abstract expressionism', 'color field', 'rothko'],
      'LAEC': ['kandinsky', 'abstract', 'spiritual'],
      'LAMF': ['mondrian', 'geometric', 'bauhaus'],
      'LAMC': ['minimalism', 'constructivism', 'suprematism'],
      
      // Large Representational  
      'LREF': ['impressionism', 'monet', 'landscape'],
      'LREC': ['portrait', 'rembrandt', 'vermeer'],
      'LRMF': ['realism', 'courbet', 'millet'],
      'LRMC': ['renaissance', 'classical', 'academic'],
      
      // Small Abstract
      'SAEF': ['klee', 'miro', 'playful abstract'],
      'SAEC': ['surrealism', 'dali', 'magritte'],
      'SAMF': ['cubism', 'picasso', 'braque'],
      'SAMC': ['futurism', 'duchamp', 'dada'],
      
      // Small Representational
      'SREF': ['ukiyo-e', 'hokusai', 'japanese prints'],
      'SREC': ['miniature', 'illuminated manuscript', 'detail'],
      'SRMF': ['still life', 'botanical', 'scientific illustration'],
      'SRMC': ['etching', 'durer', 'printmaking']
    };
    
    const queries = personalityQueries[personalityType] || ['art'];
    const allArtworks: Artwork[] = [];
    
    for (const query of queries) {
      const results = await this.searchAllMuseums(query);
      allArtworks.push(...results);
    }
    
    // Deduplicate and add personality match
    const uniqueArtworks = Array.from(
      new Map(allArtworks.map(a => [a.id, a])).values()
    );
    
    return uniqueArtworks.map(artwork => ({
      ...artwork,
      personalityMatch: [personalityType]
    }));
  }
}