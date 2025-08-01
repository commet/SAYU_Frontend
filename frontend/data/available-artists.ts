/**
 * Artvee DB에 실제로 존재하는 작가 목록
 * 이 작가들의 작품은 Cloudinary에 업로드되어 있음
 */

// 티어별 유명 작가 (백엔드 famous-artists-priority-system.js와 동기화)
export const FAMOUS_ARTISTS_TIERS = {
  tier1: [
    'Leonardo da Vinci', 'Vincent van Gogh', 'Pablo Picasso', 'Michelangelo',
    'Claude Monet', 'Salvador Dalí', 'Frida Kahlo', 'Andy Warhol',
    'Henri Matisse', 'Jackson Pollock'
  ],
  tier2: [
    'Mary Cassatt', 'El Greco', 'Utagawa Hiroshige', 'Pierre-Auguste Renoir',
    'Georgia O\'Keeffe', 'Edgar Degas', 'Paul Cézanne', 'Wassily Kandinsky',
    'Johannes Vermeer', 'Rembrandt van Rijn'
  ],
  tier3: [
    'Gustav Klimt', 'Édouard Manet', 'Paul Gauguin', 'Caravaggio',
    'Henri de Toulouse-Lautrec', 'Marc Chagall', 'Jean-Michel Basquiat',
    'Francis Bacon', 'David Hockney', 'Yves Klein'
  ]
};

// DB에 실제로 있고 Artvee에 작품이 있는 작가들 
export const availableArtistsInDB = [
  'Vincent van Gogh',
  'Claude Monet',
  'Pierre-Auguste Renoir',
  'Edgar Degas',
  'Paul Cézanne',
  'Paul Gauguin',
  'Wassily Kandinsky',
  'Paul Klee',
  'Piet Mondrian',
  'Henri Matisse',
  'Pablo Picasso',
  'Georges Braque',
  'Édouard Manet',
  'Camille Pissarro',
  'Alfred Sisley',
  'Berthe Morisot',
  'Gustav Klimt',
  'Egon Schiele',
  'Edvard Munch',
  'Caspar David Friedrich',
  'Joseph Mallord William Turner',
  'William Blake',
  'Odilon Redon',
  'Gustave Moreau',
  'Eugène Delacroix',
  'Théodore Géricault',
  'Jean-Auguste-Dominique Ingres',
  'Jacques-Louis David',
  'Francisco Goya',
  'Diego Velázquez',
  'Peter Paul Rubens',
  'Rembrandt van Rijn',
  'Johannes Vermeer',
  'Caravaggio',
  'Titian',
  'Raphael',
  'Michelangelo',
  'Sandro Botticelli',
  'Leonardo da Vinci',
  'Albrecht Dürer',
  'Jan van Eyck',
  'Hieronymus Bosch',
  'Pieter Bruegel the Elder',
  'Anthony van Dyck',
  'François Boucher',
  'Jean-Baptiste-Siméon Chardin',
  'Thomas Gainsborough',
  'William Hogarth',
  'John Constable',
  'Dante Gabriel Rossetti',
  'John William Waterhouse',
  'Frederic Leighton',
  'Lawrence Alma-Tadema',
  'Edward Burne-Jones',
  'William Morris',
  'Alphonse Mucha',
  'Henri de Toulouse-Lautrec',
  'Georges Seurat',
  'Paul Signac',
  'André Derain',
  'Maurice de Vlaminck',
  'Raoul Dufy',
  'Kees van Dongen',
  'Ernst Ludwig Kirchner',
  'Emil Nolde',
  'Max Beckmann',
  'Otto Dix',
  'George Grosz',
  'Chaïm Soutine',
  'Amedeo Modigliani',
  'Marc Chagall',
  'Joan Miró',
  'Salvador Dalí',
  'René Magritte',
  'Max Ernst',
  'Giorgio de Chirico',
  'Edward Hopper',
  'Grant Wood',
  'Thomas Hart Benton',
  'Georgia O\'Keeffe',
  'Stuart Davis',
  'Charles Demuth',
  'Marsden Hartley',
  'Arthur Dove',
  'John Marin',
  'Winslow Homer',
  'Thomas Eakins',
  'James McNeill Whistler',
  'John Singer Sargent',
  'Mary Cassatt',
  'William Merritt Chase',
  'Childe Hassam',
  'Maurice Prendergast',
  'Robert Henri',
  'George Bellows',
  'Edward Steichen',
  'Alfred Stieglitz',
  'Man Ray',
  'László Moholy-Nagy',
  'El Lissitzky',
  'Alexander Rodchenko',
  'Kazimir Malevich',
  'Theo van Doesburg',
  'Robert Delaunay',
  'Sonia Delaunay',
  'František Kupka',
  'Francis Picabia',
  'Marcel Duchamp',
  'Kurt Schwitters',
  'Hans Arp',
  'Sophie Taeuber-Arp',
  'N. C. Wyeth',
  'Howard Pyle',
  'Maxfield Parrish',
  'Norman Rockwell',
  'J. C. Leyendecker',
  'Dean Cornwell',
  'Arthur Rackham',
  'Edmund Dulac',
  'Kay Nielsen',
  'William Bouguereau',
  'Jean-Léon Gérôme',
  'Alexandre Cabanel',
  'Adolphe-William Bouguereau',
  'Jules Bastien-Lepage',
  'Jules Breton',
  'Léon Bonnat',
  'Carolus-Duran',
  'Ernest Meissonier',
  'Jean-Baptiste-Camille Corot',
  'Gustave Courbet',
  'Honoré Daumier',
  'Jean-François Millet',
  'Théodore Rousseau',
  'Charles-François Daubigny',
  'Narcisse Virgilio Díaz',
  'Jules Dupré',
  'Constant Troyon',
  'Rosa Bonheur',
  'Gustave Doré'
];

export const availableArtists = availableArtistsInDB;

/**
 * Artvee DB에 있는 작가와 유명 작가 매칭
 * Tier 1,2,3 작가 중 실제로 DB에 있는 작가들 반환
 */
export function getAvailableFamousArtists(): { tier1: string[], tier2: string[], tier3: string[] } {
  return {
    tier1: FAMOUS_ARTISTS_TIERS.tier1.filter(artist => 
      availableArtistsInDB.some(dbArtist => 
        dbArtist.toLowerCase().includes(artist.toLowerCase()) || 
        artist.toLowerCase().includes(dbArtist.toLowerCase())
      )
    ),
    tier2: FAMOUS_ARTISTS_TIERS.tier2.filter(artist => 
      availableArtistsInDB.some(dbArtist => 
        dbArtist.toLowerCase().includes(artist.toLowerCase()) || 
        artist.toLowerCase().includes(dbArtist.toLowerCase())
      )
    ),
    tier3: FAMOUS_ARTISTS_TIERS.tier3.filter(artist => 
      availableArtistsInDB.some(dbArtist => 
        dbArtist.toLowerCase().includes(artist.toLowerCase()) || 
        artist.toLowerCase().includes(dbArtist.toLowerCase())
      )
    )
  };
}

/**
 * 성격 유형별 추천 작가 매핑
 * 각 성격 유형에 맞는 작가를 DB에 실제로 있는 작가로 매핑
 */
export const personalityArtistMapping: Record<string, string[]> = {
  // Lone + Abstract + Emotional + Flow
  LAEF: ['Vincent van Gogh', 'Odilon Redon', 'Caspar David Friedrich'],
  
  // Lone + Abstract + Emotional + Constructive
  LAEC: ['Wassily Kandinsky', 'Paul Klee', 'Piet Mondrian'],
  
  // Lone + Abstract + Meaning-driven + Flow
  LAMF: ['Pablo Picasso', 'William Blake', 'Odilon Redon'],
  
  // Lone + Abstract + Meaning-driven + Constructive
  LAMC: ['Wassily Kandinsky', 'Paul Klee', 'Kazimir Malevich'],
  
  // Lone + Representational + Emotional + Flow
  LREF: ['Vincent van Gogh', 'Claude Monet', 'Edvard Munch'],
  
  // Lone + Representational + Emotional + Constructive
  LREC: ['Edward Hopper', 'Johannes Vermeer', 'René Magritte'],
  
  // Lone + Representational + Meaning-driven + Flow
  LRMF: ['Michelangelo', 'Caravaggio', 'Francisco Goya'],
  
  // Lone + Representational + Meaning-driven + Constructive
  LRMC: ['Leonardo da Vinci', 'Johannes Vermeer', 'Albrecht Dürer'],
  
  // Social + Abstract + Emotional + Flow
  SAEF: ['Henri Matisse', 'Paul Gauguin', 'André Derain'],
  
  // Social + Abstract + Emotional + Constructive
  SAEC: ['Wassily Kandinsky', 'Robert Delaunay', 'Paul Signac'],
  
  // Social + Abstract + Meaning-driven + Flow
  SAMF: ['Pablo Picasso', 'Henri Matisse', 'Georges Braque'],
  
  // Social + Abstract + Meaning-driven + Constructive
  SAMC: ['Piet Mondrian', 'Wassily Kandinsky', 'El Lissitzky'],
  
  // Social + Representational + Emotional + Flow
  SREF: ['Pierre-Auguste Renoir', 'Claude Monet', 'Edgar Degas'],
  
  // Social + Representational + Emotional + Constructive
  SREC: ['Mary Cassatt', 'Edgar Degas', 'Édouard Manet'],
  
  // Social + Representational + Meaning-driven + Flow
  SRMF: ['Rembrandt van Rijn', 'Peter Paul Rubens', 'Titian'],
  
  // Social + Representational + Meaning-driven + Constructive  
  SRMC: ['Leonardo da Vinci', 'Michelangelo', 'Raphael']
};

/**
 * 성격 유형에 맞는 유명 작가 우선 추천
 * Tier 1 작가를 우선적으로 반환
 */
export function getRecommendedArtistsForPersonality(personalityType: string): string[] {
  const availableFamous = getAvailableFamousArtists();
  const mappedArtists = personalityArtistMapping[personalityType] || [];
  
  // 매핑된 작가 중 Tier 1 작가를 맨 앞으로
  const tier1Artists = mappedArtists.filter(artist => 
    availableFamous.tier1.some(famous => 
      famous.toLowerCase().includes(artist.toLowerCase()) || 
      artist.toLowerCase().includes(famous.toLowerCase())
    )
  );
  
  const otherArtists = mappedArtists.filter(artist => 
    !tier1Artists.includes(artist)
  );
  
  return [...tier1Artists, ...otherArtists];
}