/**
 * Vector Similarity Service
 * Implements true semantic search using pgvector
 * Provides user similarity, artwork recommendations, and semantic search
 */

const { pool } = require('../config/database');
const { log } = require('../config/logger');
const { getRedisClient } = require('../config/redis');
const openaiService = require('./openai');

class VectorSimilarityService {
  constructor() {
    this.redis = getRedisClient();
    this.cachePrefix = 'vector_sim:';
    this.cacheTTL = 300; // 5 minutes
  }

  /**
   * Find users with similar personality vectors
   * @param {string} userId - Target user ID
   * @param {Object} options - Search options
   * @returns {Array} Similar users with similarity scores
   */
  async findSimilarUsers(userId, options = {}) {
    const {
      threshold = 0.7,
      limit = 10,
      includeScores = true
    } = options;

    const cacheKey = `${this.cachePrefix}users:${userId}:${threshold}:${limit}`;

    try {
      // Check cache first
      if (this.redis) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          log.debug('Vector similarity cache hit', { userId, cacheKey });
          return JSON.parse(cached);
        }
      }

      // Query database using vector similarity function
      const query = `
        SELECT * FROM find_similar_users($1, $2, $3)
      `;

      const result = await pool.query(query, [userId, threshold, limit]);

      const similarUsers = result.rows.map(row => ({
        userId: row.user_id,
        similarities: {
          cognitive: parseFloat(row.cognitive_similarity),
          emotional: parseFloat(row.emotional_similarity),
          aesthetic: parseFloat(row.aesthetic_similarity),
          overall: parseFloat(row.overall_similarity)
        },
        matchType: this.categorizeMatch(row)
      }));

      // Cache the results
      if (this.redis && similarUsers.length > 0) {
        await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(similarUsers));
      }

      log.info('Vector similarity search completed', {
        userId,
        foundUsers: similarUsers.length,
        avgSimilarity: similarUsers.length > 0
          ? (similarUsers.reduce((sum, u) => sum + u.similarities.overall, 0) / similarUsers.length).toFixed(3)
          : 0
      });

      return similarUsers;

    } catch (error) {
      log.error('Vector similarity search failed', error, { userId, options });
      throw new Error('Failed to find similar users');
    }
  }

  /**
   * Find artworks similar to a given text or embedding
   * @param {string} searchText - Text to search for
   * @param {Array} embedding - Optional pre-computed embedding
   * @param {Object} options - Search options
   * @returns {Array} Similar artworks
   */
  async findSimilarArtworks(searchText, embedding = null, options = {}) {
    const {
      threshold = 0.7,
      limit = 20
    } = options;

    const cacheKey = `${this.cachePrefix}artworks:${Buffer.from(searchText).toString('base64')}:${threshold}:${limit}`;

    try {
      // Check cache first
      if (this.redis) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          log.debug('Artwork similarity cache hit', { searchText: searchText.substring(0, 50) });
          return JSON.parse(cached);
        }
      }

      // Generate embedding if not provided
      let searchEmbedding = embedding;
      if (!searchEmbedding) {
        searchEmbedding = await openaiService.generateEmbedding(searchText);
      }

      // Convert array to vector format for PostgreSQL
      const vectorString = `[${searchEmbedding.join(',')}]`;

      const query = `
        SELECT * FROM find_similar_artworks($1, $2::vector, $3, $4)
      `;

      const result = await pool.query(query, [searchText, vectorString, threshold, limit]);

      const similarArtworks = result.rows.map(row => ({
        artworkId: row.artwork_id,
        title: row.title,
        artist: row.artist_name,
        similarityScore: parseFloat(row.similarity_score),
        relevanceCategory: this.categorizeRelevance(row.similarity_score)
      }));

      // Cache the results
      if (this.redis && similarArtworks.length > 0) {
        await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(similarArtworks));
      }

      log.info('Artwork similarity search completed', {
        searchText: searchText.substring(0, 50),
        foundArtworks: similarArtworks.length,
        avgSimilarity: similarArtworks.length > 0
          ? (similarArtworks.reduce((sum, a) => sum + a.similarityScore, 0) / similarArtworks.length).toFixed(3)
          : 0
      });

      return similarArtworks;

    } catch (error) {
      log.error('Artwork similarity search failed', error, { searchText: searchText.substring(0, 50) });
      throw new Error('Failed to find similar artworks');
    }
  }

  /**
   * Update user's personality vectors
   * @param {string} userId - User ID
   * @param {Object} vectors - Vector data
   * @returns {boolean} Success status
   */
  async updateUserVectors(userId, vectors) {
    const { cognitive, emotional, aesthetic } = vectors;

    try {
      // Convert arrays to vector format
      const cognitiveVector = `[${cognitive.join(',')}]`;
      const emotionalVector = `[${emotional.join(',')}]`;
      const aestheticVector = `[${aesthetic.join(',')}]`;

      const query = `
        SELECT update_user_vectors($1, $2::vector, $3::vector, $4::vector)
      `;

      const result = await pool.query(query, [
        userId,
        cognitiveVector,
        emotionalVector,
        aestheticVector
      ]);

      const success = result.rows[0].update_user_vectors;

      if (success) {
        // Invalidate cache for this user
        if (this.redis) {
          const pattern = `${this.cachePrefix}users:${userId}:*`;
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        }

        log.info('User vectors updated successfully', { userId });
      }

      return success;

    } catch (error) {
      log.error('Failed to update user vectors', error, { userId });
      throw new Error('Failed to update user vectors');
    }
  }

  /**
   * Get vector statistics and health metrics
   * @returns {Object} Vector system statistics
   */
  async getVectorStats() {
    try {
      const query = `SELECT * FROM vector_stats`;
      const result = await pool.query(query);

      const stats = {
        tables: result.rows,
        timestamp: new Date().toISOString(),
        cacheStatus: this.redis ? 'connected' : 'disconnected'
      };

      log.debug('Vector stats retrieved', stats);
      return stats;

    } catch (error) {
      log.error('Failed to get vector stats', error);
      throw new Error('Failed to get vector statistics');
    }
  }

  /**
   * Semantic search across all content
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Object} Search results from multiple sources
   */
  async semanticSearch(query, options = {}) {
    const { limit = 10, threshold = 0.6 } = options;

    try {
      // Generate embedding for the search query
      const queryEmbedding = await openaiService.generateEmbedding(query);

      // Search in parallel across different content types
      const [artworks, users] = await Promise.all([
        this.findSimilarArtworks(query, queryEmbedding, { limit, threshold }),
        // Could add user search based on profile text
        Promise.resolve([]) // Placeholder for user search
      ]);

      const results = {
        query,
        results: {
          artworks: artworks.slice(0, limit),
          users: users.slice(0, limit)
        },
        metadata: {
          totalResults: artworks.length + users.length,
          searchTime: Date.now(),
          threshold
        }
      };

      log.info('Semantic search completed', {
        query: query.substring(0, 50),
        artworkResults: artworks.length,
        userResults: users.length
      });

      return results;

    } catch (error) {
      log.error('Semantic search failed', error, { query: query.substring(0, 50) });
      throw new Error('Semantic search failed');
    }
  }

  /**
   * Categorize user match type based on similarity scores
   * @private
   */
  categorizeMatch(row) {
    const { cognitive_similarity, emotional_similarity, aesthetic_similarity } = row;

    if (cognitive_similarity > 0.9) return 'cognitive_twin';
    if (emotional_similarity > 0.9) return 'emotional_match';
    if (aesthetic_similarity > 0.9) return 'aesthetic_soulmate';
    if (row.overall_similarity > 0.85) return 'strong_match';
    if (row.overall_similarity > 0.75) return 'good_match';
    return 'potential_match';
  }

  /**
   * Categorize artwork relevance based on similarity score
   * @private
   */
  categorizeRelevance(score) {
    if (score > 0.9) return 'highly_relevant';
    if (score > 0.8) return 'very_relevant';
    if (score > 0.7) return 'relevant';
    if (score > 0.6) return 'somewhat_relevant';
    return 'loosely_relevant';
  }

  /**
   * Clear vector similarity cache
   * @param {string} pattern - Cache key pattern to clear
   */
  async clearCache(pattern = '*') {
    if (!this.redis) return false;

    try {
      const fullPattern = `${this.cachePrefix}${pattern}`;
      const keys = await this.redis.keys(fullPattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        log.info('Vector similarity cache cleared', { pattern: fullPattern, keysCleared: keys.length });
      }

      return true;
    } catch (error) {
      log.error('Failed to clear vector cache', error, { pattern });
      return false;
    }
  }
}

module.exports = new VectorSimilarityService();
