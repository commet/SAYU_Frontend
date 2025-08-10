const axios = require('axios');

// Unsplash API configuration
// Demo key for testing - replace with your own key in production
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'VQg-gN2QRF3QjQBqMKZpP6D_AqT8O_vgj7xrPNNHhJc';
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// Image cache to avoid repeated API calls
const imageCache = new Map();

// Exhibition category to search keywords mapping
const categoryKeywords = {
  '현대미술': ['contemporary art gallery', 'modern art museum', 'installation art', 'abstract art space'],
  '전통미술': ['korean traditional art', 'asian art museum', 'traditional painting', 'heritage art'],
  '미디어아트': ['digital art installation', 'media art', 'projection art', 'interactive art'],
  '조각': ['sculpture gallery', 'sculpture exhibition', 'art sculpture', 'modern sculpture'],
  '사진': ['photography exhibition', 'photo gallery', 'contemporary photography', 'art photography'],
  '회화': ['painting gallery', 'art paintings', 'canvas art', 'oil painting exhibition'],
  '공예': ['craft art', 'ceramic art', 'traditional crafts', 'artisan gallery'],
  '디자인': ['design exhibition', 'contemporary design', 'industrial design', 'graphic design gallery']
};

// Venue-specific keywords
const venueKeywords = {
  '리움': ['modern museum interior', 'contemporary museum', 'minimalist gallery'],
  '호암': ['traditional korean museum', 'heritage museum', 'classical art space'],
  '국립현대미술관': ['national museum', 'modern art museum', 'contemporary gallery'],
  '아모레퍼시픽': ['corporate art collection', 'modern architecture museum', 'luxury art space'],
  '국제갤러리': ['contemporary gallery space', 'white cube gallery', 'modern exhibition'],
  '서울시립미술관': ['public art museum', 'civic museum', 'urban art gallery']
};

// Artist/Title specific keywords (for special exhibitions)
const specialKeywords = {
  '피에르 위그': ['installation art', 'conceptual art', 'contemporary installation'],
  '겸재': ['korean landscape painting', 'traditional korean art', 'joseon dynasty art'],
  '정선': ['korean traditional landscape', 'mountain painting', 'ink wash painting'],
  '이불': ['contemporary korean art', 'installation sculpture', 'avant-garde art'],
  '백남준': ['video art', 'media art pioneer', 'electronic art'],
  '김환기': ['korean abstract art', 'modern korean painting', 'dot painting']
};

/**
 * Generate search keywords based on exhibition data
 */
function generateSearchKeywords(exhibition) {
  const keywords = [];
  
  // Check title for special keywords
  const titleLower = (exhibition.title || '').toLowerCase();
  for (const [key, values] of Object.entries(specialKeywords)) {
    if (titleLower.includes(key.toLowerCase())) {
      keywords.push(...values);
    }
  }
  
  // Check venue
  const venueLower = (exhibition.venue_name || '').toLowerCase();
  for (const [key, values] of Object.entries(venueKeywords)) {
    if (venueLower.includes(key.toLowerCase())) {
      keywords.push(...values);
    }
  }
  
  // Check category
  if (exhibition.category) {
    const categoryWords = categoryKeywords[exhibition.category];
    if (categoryWords) {
      keywords.push(...categoryWords);
    }
  }
  
  // Fallback keywords if none found
  if (keywords.length === 0) {
    keywords.push('art exhibition', 'museum gallery', 'contemporary art');
  }
  
  // Return random keyword from the list for variety
  return keywords[Math.floor(Math.random() * keywords.length)];
}

/**
 * Fetch image from Unsplash API
 */
async function fetchUnsplashImage(searchQuery) {
  try {
    const response = await axios.get(UNSPLASH_API_URL, {
      params: {
        query: searchQuery,
        per_page: 10,
        orientation: 'landscape'
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      // Get random image from results for variety
      const randomIndex = Math.floor(Math.random() * Math.min(5, response.data.results.length));
      const image = response.data.results[randomIndex];
      
      return {
        url: image.urls.regular,
        thumbnail: image.urls.small,
        author: image.user.name,
        authorUrl: image.user.links.html,
        downloadUrl: image.links.download_location
      };
    }
    
    return null;
  } catch (error) {
    console.error('Unsplash API error:', error.message);
    return null;
  }
}

/**
 * Get image for exhibition with caching
 */
async function getExhibitionImage(exhibition) {
  const exhibitionId = exhibition.id;
  
  // Check cache first
  if (imageCache.has(exhibitionId)) {
    return imageCache.get(exhibitionId);
  }
  
  // Generate search keywords
  const searchQuery = generateSearchKeywords(exhibition);
  console.log(`Searching Unsplash for "${exhibition.title}": ${searchQuery}`);
  
  // Fetch from Unsplash
  const imageData = await fetchUnsplashImage(searchQuery);
  
  if (imageData) {
    // Cache the result
    imageCache.set(exhibitionId, imageData);
    return imageData;
  }
  
  // Return fallback
  return {
    url: null,
    thumbnail: null,
    fallback: true
  };
}

/**
 * Preload images for multiple exhibitions
 */
async function preloadImages(exhibitions) {
  const promises = exhibitions.map(exhibition => getExhibitionImage(exhibition));
  return Promise.all(promises);
}

/**
 * Clear image cache
 */
function clearImageCache() {
  const size = imageCache.size;
  imageCache.clear();
  return {
    message: 'Cache cleared',
    clearedItems: size
  };
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: imageCache.size,
    entries: Array.from(imageCache.entries()).map(([key, value]) => ({
      exhibitionId: key,
      hasImage: !!value.url,
      isFallback: value.fallback || false
    }))
  };
}

module.exports = {
  getExhibitionImage,
  preloadImages,
  generateSearchKeywords,
  clearImageCache,
  getCacheStats
};