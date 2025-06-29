const CacheService = require('../services/cacheService');
const fetch = require('node-fetch');

class MuseumAPIService {
  constructor() {
    this.baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
  }

  async searchArtworks(query, departmentId, options = {}) {
    // Check cache first
    const cached = await CacheService.getMuseumSearch(query, departmentId, options);
    if (cached) {
      return cached.results;
    }

    try {
      const params = new URLSearchParams({
        q: query,
        ...(departmentId && { departmentId }),
        hasImages: options.hasImages || true,
        ...(options.isHighlight && { isHighlight: true })
      });

      const response = await fetch(`${this.baseUrl}/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Museum API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache for 2 hours (Met Museum data doesn't change frequently)
      await CacheService.setMuseumSearch(query, departmentId, options, data, 7200);
      
      return data;
    } catch (error) {
      console.error('Museum search error:', error);
      throw error;
    }
  }

  async getArtworkDetails(artworkId) {
    // Check cache first
    const cached = await CacheService.getArtworkDetails(artworkId);
    if (cached) {
      return cached.artwork;
    }

    try {
      const response = await fetch(`${this.baseUrl}/objects/${artworkId}`);
      
      if (!response.ok) {
        throw new Error(`Artwork API error: ${response.status}`);
      }

      const artwork = await response.json();
      
      // Cache for 24 hours (artwork details rarely change)
      await CacheService.setArtworkDetails(artworkId, artwork, 86400);
      
      return artwork;
    } catch (error) {
      console.error('Artwork details error:', error);
      throw error;
    }
  }

  async getBatchArtworkDetails(artworkIds) {
    const results = [];
    const uncachedIds = [];
    
    // Check cache for each artwork
    for (const id of artworkIds) {
      const cached = await CacheService.getArtworkDetails(id);
      if (cached) {
        results.push({ id, artwork: cached.artwork, fromCache: true });
      } else {
        uncachedIds.push(id);
      }
    }

    // Fetch uncached artworks in parallel (with rate limiting)
    const batchSize = 5; // Limit concurrent requests
    for (let i = 0; i < uncachedIds.length; i += batchSize) {
      const batch = uncachedIds.slice(i, i + batchSize);
      const promises = batch.map(async (id) => {
        try {
          const artwork = await this.getArtworkDetails(id);
          return { id, artwork, fromCache: false };
        } catch (error) {
          console.error(`Failed to fetch artwork ${id}:`, error);
          return { id, artwork: null, error: error.message };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      // Small delay between batches to be respectful to the API
      if (i + batchSize < uncachedIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  async getValidArtworks(artworkIds, maxResults = 20) {
    const validArtworks = [];
    let processedCount = 0;

    for (const id of artworkIds) {
      if (validArtworks.length >= maxResults) break;
      
      try {
        const artwork = await this.getArtworkDetails(id);
        
        // Filter for artworks with required data
        if (artwork.primaryImage && artwork.title && artwork.artistDisplayName) {
          validArtworks.push({
            id: artwork.objectID.toString(),
            title: artwork.title,
            artist: artwork.artistDisplayName || 'Unknown Artist',
            year: artwork.objectDate || 'Unknown Date',
            imageUrl: artwork.primaryImageSmall || artwork.primaryImage,
            museum: 'Metropolitan Museum of Art',
            medium: artwork.medium || 'Unknown Medium',
            department: artwork.department || 'Art',
            culture: artwork.culture,
            period: artwork.period,
            dimensions: artwork.dimensions,
            museumUrl: artwork.objectURL
          });
        }
        
        processedCount++;
        
        // Add delay every 10 requests to be respectful
        if (processedCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`Error processing artwork ${id}:`, error);
      }
    }

    return validArtworks;
  }
}

// Middleware for caching Museum API responses
const museumCacheMiddleware = (req, res, next) => {
  // Add museum service to request object
  req.museumAPI = new MuseumAPIService();
  next();
};

module.exports = {
  MuseumAPIService,
  museumCacheMiddleware
};