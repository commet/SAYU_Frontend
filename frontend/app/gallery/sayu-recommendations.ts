interface ArtworkRecommendation {
  title: string;
  artist: string;
  year: string;
  description: string;
  image?: string;
  matchPercent: number;
  curatorNote: string;
  category?: string[];
}

export const aptRecommendations: Record<string, ArtworkRecommendation[]> = {
  'SREF': [
    {
      title: "The Starry Night",
      artist: "Vincent van Gogh",
      year: "1889",
      description: "Emotional swirls expressing deep feelings",
      matchPercent: 95,
      curatorNote: "Perfectly matches your deep sensitivity",
      category: ['paintings', 'modern']
    },
    {
      title: "Girl with a Pearl Earring",
      artist: "Johannes Vermeer",
      year: "1665",
      description: "Mysterious smile of a girl",
      matchPercent: 88,
      curatorNote: "Delicate emotional expression resembles you",
      category: ['paintings']
    },
    {
      title: "The Great Wave off Kanagawa",
      artist: "Katsushika Hokusai",
      year: "1831",
      description: "Dynamic wave movement",
      matchPercent: 82,
      curatorNote: "Nature's grandeur resonates with your inner self",
      category: ['asian-art']
    }
  ],
  'WRPY': [
    {
      title: "Guernica",
      artist: "Pablo Picasso",
      year: "1937",
      description: "Denouncing the horrors of war",
      matchPercent: 92,
      curatorNote: "Intense message matches your passion",
      category: ['paintings', 'modern']
    },
    {
      title: "The Persistence of Memory",
      artist: "Salvador Dali",
      year: "1931",
      description: "Surrealist expression of time's relativity",
      matchPercent: 85,
      curatorNote: "Creative imagination resembles yours",
      category: ['paintings', 'modern']
    }
  ],
  'DRCU': [
    {
      title: "The Birth of Venus",
      artist: "Sandro Botticelli",
      year: "1485",
      description: "Birth of beauty",
      matchPercent: 90,
      curatorNote: "Classical beauty matches your elegance",
      category: ['paintings']
    },
    {
      title: "The School of Athens",
      artist: "Raphael",
      year: "1511",
      description: "Hall of philosophy and wisdom",
      matchPercent: 87,
      curatorNote: "Intellectual depth resonates with you",
      category: ['paintings']
    }
  ],
  'LNFT': [
    {
      title: "American Gothic",
      artist: "Grant Wood",
      year: "1930",
      description: "Portrait of American rural life",
      matchPercent: 88,
      curatorNote: "Authentic life portrayal suits you",
      category: ['paintings', 'modern']
    },
    {
      title: "A Sunday on La Grande Jatte",
      artist: "Georges Seurat",
      year: "1886",
      description: "Masterpiece of pointillism",
      matchPercent: 83,
      curatorNote: "Meticulous observation resembles yours",
      category: ['paintings', 'modern']
    }
  ]
};

// Provide default recommendations for all APT types
const allTypes = ['SREF', 'WRPY', 'DRCU', 'LNFT', 'SFPY', 'WREU', 'DRCY', 'LNPY', 
                  'SRFT', 'WRFT', 'DRFT', 'LNFU', 'SRPY', 'WRFU', 'DRPU', 'LNCU'];

allTypes.forEach(type => {
  if (!aptRecommendations[type]) {
    // Use SREF recommendations as default
    aptRecommendations[type] = aptRecommendations['SREF'];
  }
});