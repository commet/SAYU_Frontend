// 🌍 SAYU Global Museum & Gallery Database

export interface Museum {
  id: string;
  name: string;
  type: 'museum' | 'gallery' | 'art-center' | 'foundation';
  size: 'major' | 'mid-size' | 'boutique';
  location: {
    city: string;
    country: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  website: string;
  description: string;
  specializations: string[];
  admission: {
    general?: number;
    currency?: string;
    freeDay?: string;
    notes?: string;
  };
  hours: {
    [key: string]: string; // e.g., "monday": "10:00-18:00"
  };
  social?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  personalityMatch: string[]; // Which personality types would love this venue
}

export interface Gallery extends Museum {
  artists?: string[]; // Represented artists
  exhibitions?: {
    current: Exhibition[];
    upcoming: Exhibition[];
  };
}

export interface Exhibition {
  id: string;
  title: string;
  artists: string[];
  startDate: Date;
  endDate: Date;
  description?: string;
  url?: string;
  personalityMatch?: string[];
}

// Global Museums Database
export const globalMuseums: Record<string, Museum[]> = {
  // North America
  'new-york': [
    {
      id: 'moma-nyc',
      name: 'Museum of Modern Art (MoMA)',
      type: 'museum',
      size: 'major',
      location: {
        city: 'New York',
        country: 'USA',
        address: '11 West 53 Street, New York, NY 10019',
        coordinates: { lat: 40.7614, lng: -73.9776 }
      },
      website: 'https://www.moma.org',
      description: 'Premier modern and contemporary art from around the world',
      specializations: ['Modern Art', 'Contemporary Art', 'Design', 'Film'],
      admission: {
        general: 25,
        currency: 'USD',
        freeDay: 'Fridays 5:30-9:00pm',
        notes: 'Free for NYC residents first Friday of each month'
      },
      hours: {
        monday: '10:30-17:30',
        tuesday: '10:30-17:30',
        wednesday: '10:30-17:30',
        thursday: '10:30-17:30',
        friday: '10:30-21:00',
        saturday: '10:30-19:00',
        sunday: '10:30-17:30'
      },
      social: {
        instagram: 'themuseumofmodernart',
        twitter: 'MuseumModernArt'
      },
      personalityMatch: ['SAEF', 'LAMF', 'SAMF', 'LAEF']
    },
    {
      id: 'met-nyc',
      name: 'The Metropolitan Museum of Art',
      type: 'museum',
      size: 'major',
      location: {
        city: 'New York',
        country: 'USA',
        address: '1000 Fifth Avenue, New York, NY 10028',
        coordinates: { lat: 40.7794, lng: -73.9632 }
      },
      website: 'https://www.metmuseum.org',
      description: 'One of the world\'s largest and most comprehensive art museums',
      specializations: ['Ancient Art', 'European Masters', 'American Art', 'Global Collections'],
      admission: {
        general: 30,
        currency: 'USD',
        notes: 'Suggested admission for NY State residents'
      },
      hours: {
        monday: 'Closed',
        tuesday: '10:00-17:00',
        wednesday: '10:00-17:00',
        thursday: '10:00-17:00',
        friday: '10:00-21:00',
        saturday: '10:00-21:00',
        sunday: '10:00-17:00'
      },
      social: {
        instagram: 'metmuseum',
        twitter: 'metmuseum'
      },
      personalityMatch: ['LRMC', 'SRMC', 'LREC', 'SREC']
    },
    {
      id: 'guggenheim-nyc',
      name: 'Solomon R. Guggenheim Museum',
      type: 'museum',
      size: 'major',
      location: {
        city: 'New York',
        country: 'USA',
        address: '1071 Fifth Avenue, New York, NY 10128',
        coordinates: { lat: 40.7830, lng: -73.9590 }
      },
      website: 'https://www.guggenheim.org',
      description: 'Iconic Frank Lloyd Wright building housing modern masterpieces',
      specializations: ['Modern Art', 'Contemporary Art', 'Architecture'],
      admission: {
        general: 25,
        currency: 'USD',
        freeDay: 'Saturdays 5:00-8:00pm'
      },
      hours: {
        monday: '11:00-18:00',
        tuesday: '11:00-18:00',
        wednesday: '11:00-18:00',
        thursday: 'Closed',
        friday: '11:00-18:00',
        saturday: '11:00-20:00',
        sunday: '11:00-18:00'
      },
      social: {
        instagram: 'guggenheim',
        twitter: 'Guggenheim'
      },
      personalityMatch: ['LAEF', 'LAMF', 'SAEF', 'SAMF']
    },
    {
      id: 'whitney-nyc',
      name: 'Whitney Museum of American Art',
      type: 'museum',
      size: 'major',
      location: {
        city: 'New York',
        country: 'USA',
        address: '99 Gansevoort Street, New York, NY 10014',
        coordinates: { lat: 40.7396, lng: -74.0089 }
      },
      website: 'https://whitney.org',
      description: 'Leading museum of American art with focus on living artists',
      specializations: ['American Art', 'Contemporary Art', 'Video Art'],
      admission: {
        general: 25,
        currency: 'USD',
        freeDay: 'Fridays 7:00-10:00pm'
      },
      hours: {
        monday: '10:30-18:00',
        tuesday: 'Closed',
        wednesday: '10:30-18:00',
        thursday: '10:30-18:00',
        friday: '10:30-22:00',
        saturday: '10:30-18:00',
        sunday: '10:30-18:00'
      },
      social: {
        instagram: 'whitneymuseum',
        twitter: 'whitneymuseum'
      },
      personalityMatch: ['SREF', 'SRMF', 'SAEF', 'SAMF']
    }
  ],
  
  'london': [
    {
      id: 'tate-modern',
      name: 'Tate Modern',
      type: 'museum',
      size: 'major',
      location: {
        city: 'London',
        country: 'UK',
        address: 'Bankside, London SE1 9TG',
        coordinates: { lat: 51.5076, lng: -0.0994 }
      },
      website: 'https://www.tate.org.uk/visit/tate-modern',
      description: 'International modern and contemporary art in a former power station',
      specializations: ['Modern Art', 'Contemporary Art', 'Performance Art'],
      admission: {
        general: 0,
        currency: 'GBP',
        notes: 'Free admission to collection, charges for special exhibitions'
      },
      hours: {
        monday: '10:00-18:00',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-22:00',
        saturday: '10:00-22:00',
        sunday: '10:00-18:00'
      },
      social: {
        instagram: 'tate',
        twitter: 'Tate'
      },
      personalityMatch: ['SAEF', 'SAMF', 'LAEF', 'LAMF']
    },
    {
      id: 'national-gallery-london',
      name: 'The National Gallery',
      type: 'museum',
      size: 'major',
      location: {
        city: 'London',
        country: 'UK',
        address: 'Trafalgar Square, London WC2N 5DN',
        coordinates: { lat: 51.5089, lng: -0.1283 }
      },
      website: 'https://www.nationalgallery.org.uk',
      description: 'Western European paintings from the 13th to 19th centuries',
      specializations: ['European Masters', 'Renaissance', 'Impressionism'],
      admission: {
        general: 0,
        currency: 'GBP',
        notes: 'Free admission, donations welcome'
      },
      hours: {
        monday: '10:00-18:00',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-21:00',
        saturday: '10:00-18:00',
        sunday: '10:00-18:00'
      },
      social: {
        instagram: 'nationalgallery',
        twitter: 'NationalGallery'
      },
      personalityMatch: ['LRMC', 'SRMC', 'LREC', 'SREC']
    },
    {
      id: 'va-london',
      name: 'Victoria and Albert Museum',
      type: 'museum',
      size: 'major',
      location: {
        city: 'London',
        country: 'UK',
        address: 'Cromwell Road, London SW7 2RL',
        coordinates: { lat: 51.4966, lng: -0.1722 }
      },
      website: 'https://www.vam.ac.uk',
      description: 'World\'s leading museum of art, design and performance',
      specializations: ['Design', 'Decorative Arts', 'Fashion', 'Photography'],
      admission: {
        general: 0,
        currency: 'GBP',
        notes: 'Free admission, charges for special exhibitions'
      },
      hours: {
        monday: '10:00-18:00',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-22:00',
        saturday: '10:00-18:00',
        sunday: '10:00-18:00'
      },
      social: {
        instagram: 'vamuseum',
        twitter: 'V_and_A'
      },
      personalityMatch: ['LAMC', 'SAMC', 'LRMC', 'SRMC']
    }
  ],
  
  'paris': [
    {
      id: 'louvre',
      name: 'Musée du Louvre',
      type: 'museum',
      size: 'major',
      location: {
        city: 'Paris',
        country: 'France',
        address: 'Rue de Rivoli, 75001 Paris',
        coordinates: { lat: 48.8606, lng: 2.3376 }
      },
      website: 'https://www.louvre.fr',
      description: 'World\'s largest art museum and historic monument',
      specializations: ['Ancient Art', 'European Masters', 'Islamic Art'],
      admission: {
        general: 17,
        currency: 'EUR',
        freeDay: 'First Sunday of each month (Oct-Mar)'
      },
      hours: {
        monday: '09:00-18:00',
        tuesday: 'Closed',
        wednesday: '09:00-21:45',
        thursday: '09:00-18:00',
        friday: '09:00-21:45',
        saturday: '09:00-18:00',
        sunday: '09:00-18:00'
      },
      social: {
        instagram: 'museelouvre',
        twitter: 'MuseeLouvre'
      },
      personalityMatch: ['LRMC', 'SRMC', 'LREC', 'SREC']
    },
    {
      id: 'orsay',
      name: 'Musée d\'Orsay',
      type: 'museum',
      size: 'major',
      location: {
        city: 'Paris',
        country: 'France',
        address: '1 Rue de la Légion d\'Honneur, 75007 Paris',
        coordinates: { lat: 48.8600, lng: 2.3266 }
      },
      website: 'https://www.musee-orsay.fr',
      description: 'French art from 1848 to 1914, including Impressionist masterpieces',
      specializations: ['Impressionism', 'Post-Impressionism', 'Art Nouveau'],
      admission: {
        general: 16,
        currency: 'EUR',
        freeDay: 'First Sunday of each month'
      },
      hours: {
        monday: 'Closed',
        tuesday: '09:30-18:00',
        wednesday: '09:30-18:00',
        thursday: '09:30-21:45',
        friday: '09:30-18:00',
        saturday: '09:30-18:00',
        sunday: '09:30-18:00'
      },
      social: {
        instagram: 'museeorsay',
        twitter: 'MuseeOrsay'
      },
      personalityMatch: ['LREF', 'SREF', 'LAEF', 'SAEF']
    },
    {
      id: 'pompidou',
      name: 'Centre Pompidou',
      type: 'art-center',
      size: 'major',
      location: {
        city: 'Paris',
        country: 'France',
        address: 'Place Georges-Pompidou, 75004 Paris',
        coordinates: { lat: 48.8606, lng: 2.3522 }
      },
      website: 'https://www.centrepompidou.fr',
      description: 'Modern and contemporary art in iconic high-tech architecture',
      specializations: ['Modern Art', 'Contemporary Art', 'New Media'],
      admission: {
        general: 15,
        currency: 'EUR',
        freeDay: 'First Sunday of each month'
      },
      hours: {
        monday: '11:00-21:00',
        tuesday: 'Closed',
        wednesday: '11:00-21:00',
        thursday: '11:00-23:00',
        friday: '11:00-21:00',
        saturday: '11:00-21:00',
        sunday: '11:00-21:00'
      },
      social: {
        instagram: 'centrepompidou',
        twitter: 'CentrePompidou'
      },
      personalityMatch: ['LAMF', 'SAMF', 'LAEF', 'SAEF']
    }
  ],
  
  'tokyo': [
    {
      id: 'mori-art',
      name: 'Mori Art Museum',
      type: 'museum',
      size: 'major',
      location: {
        city: 'Tokyo',
        country: 'Japan',
        address: '6-10-1 Roppongi, Minato-ku, Tokyo 106-6150',
        coordinates: { lat: 35.6605, lng: 139.7292 }
      },
      website: 'https://www.mori.art.museum',
      description: 'Contemporary art with spectacular city views from 53rd floor',
      specializations: ['Contemporary Art', 'Asian Art', 'International Art'],
      admission: {
        general: 1800,
        currency: 'JPY',
        notes: 'Includes Tokyo City View observation deck'
      },
      hours: {
        monday: '10:00-22:00',
        tuesday: '10:00-17:00',
        wednesday: '10:00-22:00',
        thursday: '10:00-22:00',
        friday: '10:00-22:00',
        saturday: '10:00-22:00',
        sunday: '10:00-22:00'
      },
      social: {
        instagram: 'moriartmuseum',
        twitter: 'mori_art_museum'
      },
      personalityMatch: ['SAEF', 'SAMF', 'SREF', 'SRMF']
    },
    {
      id: 'teamlab-borderless',
      name: 'teamLab Borderless',
      type: 'museum',
      size: 'major',
      location: {
        city: 'Tokyo',
        country: 'Japan',
        address: '1-3-8 Ariake, Koto-ku, Tokyo 135-0063',
        coordinates: { lat: 35.6269, lng: 139.7835 }
      },
      website: 'https://borderless.teamlab.art',
      description: 'Digital art museum with immersive, interactive installations',
      specializations: ['Digital Art', 'Interactive Art', 'Immersive Experience'],
      admission: {
        general: 3200,
        currency: 'JPY',
        notes: 'Timed entry tickets recommended'
      },
      hours: {
        monday: '10:00-19:00',
        tuesday: '10:00-19:00',
        wednesday: '10:00-19:00',
        thursday: '10:00-19:00',
        friday: '10:00-21:00',
        saturday: '10:00-21:00',
        sunday: '10:00-19:00'
      },
      social: {
        instagram: 'teamlab',
        twitter: 'teamLab_net'
      },
      personalityMatch: ['LAEF', 'SAEF', 'LAMF', 'SAMF']
    }
  ],
  
  'seoul': [
    {
      id: 'mmca-seoul',
      name: 'National Museum of Modern and Contemporary Art, Seoul',
      type: 'museum',
      size: 'major',
      location: {
        city: 'Seoul',
        country: 'South Korea',
        address: '30 Samcheong-ro, Jongno-gu, Seoul',
        coordinates: { lat: 37.5789, lng: 126.9800 }
      },
      website: 'https://www.mmca.go.kr',
      description: 'Korea\'s premier modern and contemporary art institution',
      specializations: ['Korean Contemporary Art', 'International Art', 'New Media'],
      admission: {
        general: 4000,
        currency: 'KRW',
        notes: 'Free admission last Wednesday of each month'
      },
      hours: {
        monday: '10:00-18:00',
        tuesday: '10:00-18:00',
        wednesday: '10:00-21:00',
        thursday: '10:00-18:00',
        friday: '10:00-21:00',
        saturday: '10:00-21:00',
        sunday: '10:00-18:00'
      },
      social: {
        instagram: 'mmcakorea',
        twitter: 'MMCAKorea'
      },
      personalityMatch: ['SAEF', 'SAMF', 'LAEF', 'LAMF']
    },
    {
      id: 'leeum',
      name: 'Leeum, Samsung Museum of Art',
      type: 'museum',
      size: 'major',
      location: {
        city: 'Seoul',
        country: 'South Korea',
        address: '60-16 Itaewon-ro 55-gil, Yongsan-gu, Seoul',
        coordinates: { lat: 37.5385, lng: 126.9988 }
      },
      website: 'https://www.leeum.org',
      description: 'Traditional Korean and contemporary international art',
      specializations: ['Korean Traditional Art', 'Contemporary Art', 'International Masters'],
      admission: {
        general: 10000,
        currency: 'KRW',
        notes: 'Advance booking required'
      },
      hours: {
        monday: 'Closed',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-18:00',
        saturday: '10:00-18:00',
        sunday: '10:00-18:00'
      },
      social: {
        instagram: 'leeummuseumofart',
        twitter: 'leeummuseum'
      },
      personalityMatch: ['LAMC', 'SAMC', 'LRMC', 'SRMC']
    }
  ]
};

// Gallery Database (Commercial and Non-profit Galleries)
export const globalGalleries: Record<string, Gallery[]> = {
  'new-york': [
    {
      id: 'zwirner-nyc',
      name: 'David Zwirner',
      type: 'gallery',
      size: 'major',
      location: {
        city: 'New York',
        country: 'USA',
        address: '537 West 20th Street, New York, NY 10011',
        coordinates: { lat: 40.7466, lng: -74.0071 }
      },
      website: 'https://www.davidzwirner.com',
      description: 'Leading contemporary art gallery with international artists',
      specializations: ['Contemporary Art', 'Modern Masters'],
      admission: {
        general: 0,
        currency: 'USD',
        notes: 'Free admission'
      },
      hours: {
        monday: 'Closed',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-18:00',
        saturday: '10:00-18:00',
        sunday: 'Closed'
      },
      social: {
        instagram: 'davidzwirner',
        twitter: 'davidzwirner'
      },
      personalityMatch: ['SAMF', 'SAMC', 'SRMF', 'SRMC'],
      artists: ['Yayoi Kusama', 'Jeff Koons', 'Luc Tuymans']
    },
    {
      id: 'gagosian-nyc',
      name: 'Gagosian',
      type: 'gallery',
      size: 'major',
      location: {
        city: 'New York',
        country: 'USA',
        address: '555 West 24th Street, New York, NY 10011',
        coordinates: { lat: 40.7486, lng: -74.0065 }
      },
      website: 'https://www.gagosian.com',
      description: 'Global gallery network representing established and emerging artists',
      specializations: ['Contemporary Art', 'Modern Art', 'Estates'],
      admission: {
        general: 0,
        currency: 'USD',
        notes: 'Free admission'
      },
      hours: {
        monday: 'Closed',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-18:00',
        saturday: '10:00-18:00',
        sunday: 'Closed'
      },
      social: {
        instagram: 'gagosian',
        twitter: 'Gagosian'
      },
      personalityMatch: ['SRMC', 'SREC', 'SAMC', 'SAEC'],
      artists: ['Damien Hirst', 'Takashi Murakami', 'Jenny Saville']
    }
  ],
  
  'london': [
    {
      id: 'white-cube-london',
      name: 'White Cube',
      type: 'gallery',
      size: 'major',
      location: {
        city: 'London',
        country: 'UK',
        address: '25-26 Mason\'s Yard, London SW1Y 6BU',
        coordinates: { lat: 51.5084, lng: -0.1356 }
      },
      website: 'https://www.whitecube.com',
      description: 'Influential gallery showcasing international contemporary artists',
      specializations: ['Contemporary Art', 'Installations', 'Sculpture'],
      admission: {
        general: 0,
        currency: 'GBP',
        notes: 'Free admission'
      },
      hours: {
        monday: 'Closed',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-18:00',
        saturday: '10:00-18:00',
        sunday: 'Closed'
      },
      social: {
        instagram: 'whitecube',
        twitter: '_WhiteCube'
      },
      personalityMatch: ['LAEF', 'SAEF', 'LAMF', 'SAMF'],
      artists: ['Antony Gormley', 'Tracey Emin', 'Anselm Kiefer']
    }
  ],
  
  'paris': [
    {
      id: 'perrotin-paris',
      name: 'Perrotin',
      type: 'gallery',
      size: 'major',
      location: {
        city: 'Paris',
        country: 'France',
        address: '76 Rue de Turenne, 75003 Paris',
        coordinates: { lat: 48.8607, lng: 2.3665 }
      },
      website: 'https://www.perrotin.com',
      description: 'Contemporary gallery with playful, provocative exhibitions',
      specializations: ['Contemporary Art', 'Street Art', 'Pop Art'],
      admission: {
        general: 0,
        currency: 'EUR',
        notes: 'Free admission'
      },
      hours: {
        monday: 'Closed',
        tuesday: '11:00-19:00',
        wednesday: '11:00-19:00',
        thursday: '11:00-19:00',
        friday: '11:00-19:00',
        saturday: '11:00-19:00',
        sunday: 'Closed'
      },
      social: {
        instagram: 'galerieperrotin',
        twitter: 'Perrotin'
      },
      personalityMatch: ['SAEF', 'SAMF', 'SREF', 'SRMF'],
      artists: ['KAWS', 'Daniel Arsham', 'JR']
    }
  ],
  
  'seoul': [
    {
      id: 'kukje-seoul',
      name: 'Kukje Gallery',
      type: 'gallery',
      size: 'major',
      location: {
        city: 'Seoul',
        country: 'South Korea',
        address: '54 Samcheong-ro, Jongno-gu, Seoul',
        coordinates: { lat: 37.5804, lng: 126.9793 }
      },
      website: 'https://www.kukjegallery.com',
      description: 'Leading Korean gallery representing international artists',
      specializations: ['Contemporary Art', 'Korean Art', 'International Art'],
      admission: {
        general: 0,
        currency: 'KRW',
        notes: 'Free admission'
      },
      hours: {
        monday: '10:00-18:00',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-18:00',
        saturday: '10:00-18:00',
        sunday: '10:00-18:00'
      },
      social: {
        instagram: 'kukjegallery',
        twitter: 'kukjegallery'
      },
      personalityMatch: ['LAMC', 'SAMC', 'LAEC', 'SAEC'],
      artists: ['Anish Kapoor', 'Haegue Yang', 'Lee Ufan']
    }
  ]
};

// Helper function to find museums by personality type
export function getMuseumsForPersonality(personalityType: string, city?: string): Museum[] {
  const museums: Museum[] = [];
  
  const citiesToSearch = city ? [city] : Object.keys(globalMuseums);
  
  citiesToSearch.forEach(cityKey => {
    const cityMuseums = globalMuseums[cityKey] || [];
    const matchingMuseums = cityMuseums.filter(museum => 
      museum.personalityMatch.includes(personalityType)
    );
    museums.push(...matchingMuseums);
  });
  
  return museums;
}

// Helper function to get upcoming exhibitions
export function getUpcomingExhibitions(city?: string): Exhibition[] {
  // In production, this would fetch from a live API or database
  // For now, returning sample data structure
  return [
    {
      id: 'sample-1',
      title: 'Contemporary Voices: New Perspectives',
      artists: ['Various Artists'],
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
      description: 'A group exhibition featuring emerging artists',
      personalityMatch: ['SAEF', 'SAMF']
    }
  ];
}

// Museum search function
export function searchMuseums(query: string, filters?: {
  city?: string;
  type?: string;
  specialization?: string;
}): Museum[] {
  let results: Museum[] = [];
  
  // Search across all cities
  Object.values(globalMuseums).forEach(cityMuseums => {
    const matches = cityMuseums.filter(museum => {
      const matchesQuery = museum.name.toLowerCase().includes(query.toLowerCase()) ||
                          museum.description.toLowerCase().includes(query.toLowerCase()) ||
                          museum.specializations.some(s => s.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCity = !filters?.city || museum.location.city.toLowerCase() === filters.city.toLowerCase();
      const matchesType = !filters?.type || museum.type === filters.type;
      const matchesSpecialization = !filters?.specialization || 
                                   museum.specializations.includes(filters.specialization);
      
      return matchesQuery && matchesCity && matchesType && matchesSpecialization;
    });
    
    results.push(...matches);
  });
  
  return results;
}