// Exhibition Detection Service
// Automatically identifies exhibitions based on location or user input

export interface Exhibition {
  id: string;
  title: string;
  titleKo?: string;
  gallery: Gallery;
  artists: Artist[];
  artworks: Artwork[];
  startDate: Date;
  endDate: Date;
  description?: string;
  descriptionKo?: string;
  tags: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    addressKo?: string;
  };
}

export interface Gallery {
  id: string;
  name: string;
  nameKo?: string;
  type: 'museum' | 'gallery' | 'alternative_space' | 'art_fair';
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
  };
}

export interface Artist {
  id: string;
  name: string;
  nameKo?: string;
  nationality?: string;
  birthYear?: number;
}

export interface Artwork {
  id: string;
  title: string;
  titleKo?: string;
  artist: Artist;
  year?: number;
  medium?: string;
  mediumKo?: string;
  imageUrl?: string;
}

export class ExhibitionDetector {
  private locationTimeout: number = 10000; // 10 seconds
  
  // Detect exhibition by current location
  async detectByLocation(): Promise<Exhibition[]> {
    try {
      const position = await this.getCurrentPosition();
      return await this.searchNearbyExhibitions(
        position.coords.latitude,
        position.coords.longitude
      );
    } catch (error) {
      console.error('Location detection failed:', error);
      throw new Error('Failed to detect location');
    }
  }
  
  // Get current GPS position
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: this.locationTimeout,
          maximumAge: 0
        }
      );
    });
  }
  
  // Search exhibitions near location
  async searchNearbyExhibitions(
    lat: number, 
    lng: number, 
    radiusKm: number = 1
  ): Promise<Exhibition[]> {
    // In production, this would call your backend API
    // For now, using mock data with distance calculation
    
    const mockExhibitions = this.getMockExhibitions();
    
    // Filter by distance
    const nearbyExhibitions = mockExhibitions.filter(exhibition => {
      const distance = this.calculateDistance(
        lat, lng,
        exhibition.location.lat,
        exhibition.location.lng
      );
      return distance <= radiusKm;
    });
    
    // Sort by distance
    return nearbyExhibitions.sort((a, b) => {
      const distA = this.calculateDistance(lat, lng, a.location.lat, a.location.lng);
      const distB = this.calculateDistance(lat, lng, b.location.lat, b.location.lng);
      return distA - distB;
    });
  }
  
  // Search exhibitions by text query
  async searchExhibitions(query: string): Promise<Exhibition[]> {
    const mockExhibitions = this.getMockExhibitions();
    
    const lowercaseQuery = query.toLowerCase();
    
    return mockExhibitions.filter(exhibition => 
      exhibition.title.toLowerCase().includes(lowercaseQuery) ||
      exhibition.titleKo?.toLowerCase().includes(lowercaseQuery) ||
      exhibition.gallery.name.toLowerCase().includes(lowercaseQuery) ||
      exhibition.gallery.nameKo?.toLowerCase().includes(lowercaseQuery) ||
      exhibition.artists.some(artist => 
        artist.name.toLowerCase().includes(lowercaseQuery) ||
        artist.nameKo?.toLowerCase().includes(lowercaseQuery)
      )
    );
  }
  
  // Get exhibition by QR code or ID
  async getExhibitionById(id: string): Promise<Exhibition | null> {
    const mockExhibitions = this.getMockExhibitions();
    return mockExhibitions.find(e => e.id === id) || null;
  }
  
  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }
  
  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  // Mock data for development
  private getMockExhibitions(): Exhibition[] {
    return [
      {
        id: 'leeum-2024-01',
        title: 'WORLD CLASSROOM: Contemporary Art through School Collection',
        titleKo: '월드 클래스룸: 학교 미술관 소장품전',
        gallery: {
          id: 'leeum',
          name: 'Leeum Museum of Art',
          nameKo: '리움미술관',
          type: 'museum',
          location: {
            lat: 37.5384,
            lng: 126.9989,
            address: '60-16 Itaewon-ro 55-gil, Yongsan-gu, Seoul',
            city: 'Seoul',
            country: 'South Korea'
          }
        },
        artists: [
          { id: 'damien-hirst', name: 'Damien Hirst', nameKo: '데미안 허스트' },
          { id: 'jeff-koons', name: 'Jeff Koons', nameKo: '제프 쿤스' }
        ],
        artworks: [],
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-30'),
        description: 'An exploration of contemporary art education',
        descriptionKo: '현대미술 교육의 탐구',
        tags: ['contemporary', 'education', 'collection'],
        location: {
          lat: 37.5384,
          lng: 126.9989,
          address: '60-16 Itaewon-ro 55-gil, Yongsan-gu, Seoul',
          addressKo: '서울시 용산구 이태원로55길 60-16'
        }
      },
      {
        id: 'mmca-2024-02',
        title: 'Korean Contemporary Art: New Voices',
        titleKo: '한국 현대미술: 새로운 목소리',
        gallery: {
          id: 'mmca',
          name: 'National Museum of Modern and Contemporary Art',
          nameKo: '국립현대미술관',
          type: 'museum',
          location: {
            lat: 37.5787,
            lng: 126.9776,
            address: '30 Samcheong-ro, Jongno-gu, Seoul',
            city: 'Seoul',
            country: 'South Korea'
          }
        },
        artists: [
          { id: 'lee-ufan', name: 'Lee Ufan', nameKo: '이우환' },
          { id: 'kim-sooja', name: 'Kimsooja', nameKo: '김수자' }
        ],
        artworks: [],
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-05-31'),
        description: 'Showcasing emerging Korean contemporary artists',
        descriptionKo: '떠오르는 한국 현대미술 작가들',
        tags: ['korean', 'contemporary', 'emerging'],
        location: {
          lat: 37.5787,
          lng: 126.9776,
          address: '30 Samcheong-ro, Jongno-gu, Seoul',
          addressKo: '서울시 종로구 삼청로 30'
        }
      }
    ];
  }
}