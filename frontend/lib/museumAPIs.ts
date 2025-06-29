// Free museum APIs with commercial usage rights
// These APIs provide access to public domain artworks and museum collections

export const museumAPIs = {
  // Metropolitan Museum of Art - New York
  metMuseum: {
    name: 'The Met Collection API',
    baseUrl: 'https://collectionapi.metmuseum.org/public/collection/v1',
    commercialUse: true,
    documentation: 'https://metmuseum.github.io/',
    features: ['Public domain images', 'High resolution', 'No API key required'],
    
    // Get artwork by ID
    getArtwork: async (objectID: number) => {
      const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
      return response.json();
    },
    
    // Search artworks
    search: async (query: string) => {
      const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}`);
      return response.json();
    }
  },

  // Art Institute of Chicago
  artInstituteChicago: {
    name: 'Art Institute of Chicago API',
    baseUrl: 'https://api.artic.edu/api/v1',
    commercialUse: true,
    documentation: 'https://api.artic.edu/docs/',
    features: ['IIIF image support', 'CC0 licensed works', 'Rich metadata'],
    
    // Get artworks with public domain images
    getPublicDomainArtworks: async (limit = 10) => {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,image_id,thumbnail&limit=${limit}&is_public_domain=true`
      );
      return response.json();
    },
    
    // Get image URL
    getImageUrl: (imageId: string, size = '843') => {
      return `https://www.artic.edu/iiif/2/${imageId}/full/${size},/0/default.jpg`;
    }
  },

  // Rijksmuseum - Amsterdam
  rijksmuseum: {
    name: 'Rijksmuseum API',
    baseUrl: 'https://www.rijksmuseum.nl/api',
    commercialUse: true,
    apiKey: 'DEMO_KEY', // Replace with actual key for production
    documentation: 'https://data.rijksmuseum.nl/object-metadata/api/',
    features: ['High quality images', 'Public domain', 'Multiple languages'],
    
    // Get collection
    getCollection: async (query = '', culture = 'en') => {
      const key = 'DEMO_KEY'; // Use environment variable in production
      const response = await fetch(
        `https://www.rijksmuseum.nl/api/${culture}/collection?key=${key}&q=${encodeURIComponent(query)}&imgonly=true&ps=10`
      );
      return response.json();
    }
  },

  // Cleveland Museum of Art
  clevelandMuseum: {
    name: 'Cleveland Museum of Art Open Access',
    baseUrl: 'https://openaccess-api.clevelandart.org/api',
    commercialUse: true,
    documentation: 'https://openaccess-api.clevelandart.org/',
    features: ['CC0 license', 'No API key', 'High resolution'],
    
    // Get artworks
    getArtworks: async (params = {}) => {
      const queryString = new URLSearchParams({
        has_image: '1',
        cc0: '1',
        limit: '10',
        ...params
      }).toString();
      
      const response = await fetch(
        `https://openaccess-api.clevelandart.org/api/artworks?${queryString}`
      );
      return response.json();
    }
  },

  // Harvard Art Museums
  harvardMuseums: {
    name: 'Harvard Art Museums API',
    baseUrl: 'https://api.harvardartmuseums.org',
    commercialUse: true,
    apiKey: 'DEMO_KEY', // Requires free registration
    documentation: 'https://github.com/harvardartmuseums/api-docs',
    features: ['Public domain filter', 'IIIF support', 'Rich metadata'],
    
    // Get objects with images
    getObjects: async (params = {}) => {
      const key = 'DEMO_KEY'; // Use environment variable
      const queryString = new URLSearchParams({
        apikey: key,
        hasimage: '1',
        size: '10',
        ...params
      }).toString();
      
      const response = await fetch(
        `https://api.harvardartmuseums.org/object?${queryString}`
      );
      return response.json();
    }
  }
};

// Helper function to get random public domain artwork
export async function getRandomPublicDomainArtwork() {
  try {
    // Try Art Institute of Chicago first (most reliable)
    const chicagoData = await museumAPIs.artInstituteChicago.getPublicDomainArtworks(20);
    if (chicagoData.data && chicagoData.data.length > 0) {
      const randomIndex = Math.floor(Math.random() * chicagoData.data.length);
      const artwork = chicagoData.data[randomIndex];
      
      return {
        title: artwork.title,
        artist: artwork.artist_display,
        imageUrl: museumAPIs.artInstituteChicago.getImageUrl(artwork.image_id),
        source: 'Art Institute of Chicago',
        license: 'CC0 Public Domain'
      };
    }
  } catch (error) {
    console.error('Error fetching from Art Institute of Chicago:', error);
  }
  
  // Fallback to Met Museum
  try {
    // Get a random object ID from search results
    const searchData = await museumAPIs.metMuseum.search('painting');
    if (searchData.objectIDs && searchData.objectIDs.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(50, searchData.objectIDs.length));
      const objectID = searchData.objectIDs[randomIndex];
      
      const artwork = await museumAPIs.metMuseum.getArtwork(objectID);
      if (artwork.primaryImage) {
        return {
          title: artwork.title,
          artist: artwork.artistDisplayName,
          imageUrl: artwork.primaryImage,
          source: 'The Metropolitan Museum of Art',
          license: 'Public Domain'
        };
      }
    }
  } catch (error) {
    console.error('Error fetching from Met Museum:', error);
  }
  
  return null;
}

// Get artworks for specific personality type
export async function getArtworksForPersonality(personalityType: string, preferences: any) {
  const artworks = [];
  
  // Based on art preferences, search for relevant artworks
  if (preferences?.movements) {
    for (const movement of preferences.movements.slice(0, 2)) {
      try {
        const results = await museumAPIs.metMuseum.search(movement);
        if (results.objectIDs && results.objectIDs.length > 0) {
          const artwork = await museumAPIs.metMuseum.getArtwork(results.objectIDs[0]);
          if (artwork.primaryImage) {
            artworks.push({
              title: artwork.title,
              artist: artwork.artistDisplayName,
              imageUrl: artwork.primaryImageSmall || artwork.primaryImage,
              year: artwork.objectDate,
              museum: 'The Met',
              movement: movement
            });
          }
        }
      } catch (error) {
        console.error(`Error searching for ${movement}:`, error);
      }
    }
  }
  
  return artworks;
}