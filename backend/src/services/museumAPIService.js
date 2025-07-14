const axios = require('axios');
const { pool } = require('../config/database');
const { logger } = require("../config/logger");

class MuseumAPIService {
  constructor() {
    // Only APIs that allow commercial use
    this.apis = {
      met: {
        name: 'Metropolitan Museum of Art',
        baseUrl: 'https://collectionapi.metmuseum.org/public/collection/v1',
        rateLimit: 100, // requests per minute
        commercialUse: true,
        license: 'Open Access - Commercial use allowed'
      },
      cleveland: {
        name: 'Cleveland Museum of Art',
        baseUrl: 'https://openaccess-api.clevelandart.org/api',
        rateLimit: 4000, // requests per day
        commercialUse: true,
        license: 'Open Access - Commercial use allowed'
      },
      rijks: {
        name: 'Rijksmuseum',
        baseUrl: 'https://www.rijksmuseum.nl/api/en/collection',
        apiKey: process.env.RIJKS_API_KEY,
        rateLimit: 10000, // requests per day
        commercialUse: true,
        license: 'Commercial use allowed for public domain works'
      }
    };

    // Removed APIs that restrict commercial use:
    // - Harvard Art Museums (non-commercial only)
    // - Brooklyn Museum (unclear terms)
    // - Cooper Hewitt Smithsonian (non-commercial only)
  }

  // Rate limiting helper
  async rateLimitDelay(apiSource) {
    const delayMap = {
      met: 600, // 100 per minute = 600ms between requests
      cleveland: 22, // ~4000 per day = 22ms between requests
      rijks: 9 // ~10000 per day = 9ms between requests
    };
    
    const delay = delayMap[apiSource] || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Met Museum API
  async syncMetMuseum() {
    try {
      await this.updateSyncStatus('met', 'artworks', 'running');
      
      // Get all object IDs
      const objectsResponse = await axios.get(`${this.apis.met.baseUrl}/objects`);
      const objectIDs = objectsResponse.data.objectIDs;
      
      await this.updateSyncStatus('met', 'artworks', 'running', {
        total_records: objectIDs.length
      });

      let processed = 0;
      const batchSize = 100;
      
      for (let i = 0; i < objectIDs.length; i += batchSize) {
        const batch = objectIDs.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (id) => {
          try {
            await this.rateLimitDelay('met');
            const objectResponse = await axios.get(`${this.apis.met.baseUrl}/objects/${id}`);
            const artwork = objectResponse.data;
            
            if (artwork.isPublicDomain && artwork.primaryImage) {
              await this.saveArtwork('met', artwork, this.transformMetArtwork(artwork));
            }
            
            processed++;
          } catch (error) {
            logger.error(`Failed to sync Met object ${id}:`, error.message);
          }
        }));
        
        await this.updateSyncStatus('met', 'artworks', 'running', {
          processed_records: processed
        });
        
        logger.info(`Met Museum sync: ${processed}/${objectIDs.length} processed`);
      }
      
      await this.updateSyncStatus('met', 'artworks', 'completed');
      
    } catch (error) {
      logger.error('Met Museum sync failed:', error);
      await this.updateSyncStatus('met', 'artworks', 'failed', { error: error.message });
    }
  }

  // Removed Harvard Art Museums sync - non-commercial license

  // Cleveland Museum API
  async syncClevelandMuseum() {
    try {
      await this.updateSyncStatus('cleveland', 'artworks', 'running');
      
      let skip = 0;
      const limit = 100;
      let hasMore = true;
      let processed = 0;
      
      while (hasMore) {
        await this.rateLimitDelay('cleveland');
        
        const response = await axios.get(`${this.apis.cleveland.baseUrl}/artworks`, {
          params: {
            has_image: 1,
            limit,
            skip
          }
        });
        
        const artworks = response.data.data;
        
        if (artworks.length === 0) {
          hasMore = false;
          break;
        }
        
        for (const artwork of artworks) {
          try {
            if (artwork.images && artwork.images.web) {
              await this.saveArtwork('cleveland', artwork, this.transformClevelandArtwork(artwork));
              processed++;
            }
          } catch (error) {
            logger.error(`Failed to save Cleveland artwork ${artwork.id}:`, error.message);
          }
        }
        
        await this.updateSyncStatus('cleveland', 'artworks', 'running', {
          processed_records: processed
        });
        
        skip += limit;
        logger.info(`Cleveland Museum sync: ${processed} processed`);
        
        // Limit for demo
        if (skip >= 5000) hasMore = false;
      }
      
      await this.updateSyncStatus('cleveland', 'artworks', 'completed');
      
    } catch (error) {
      logger.error('Cleveland Museum sync failed:', error);
      await this.updateSyncStatus('cleveland', 'artworks', 'failed', { error: error.message });
    }
  }

  // Rijksmuseum API
  async syncRijksmuseum() {
    if (!this.apis.rijks.apiKey) {
      logger.warn('Rijksmuseum API key not configured');
      return;
    }

    try {
      await this.updateSyncStatus('rijks', 'artworks', 'running');
      
      let page = 1;
      let processed = 0;
      
      while (page <= 100) { // Limit pages for demo
        await this.rateLimitDelay('rijks');
        
        const response = await axios.get(this.apis.rijks.baseUrl, {
          params: {
            key: this.apis.rijks.apiKey,
            ps: 100,
            p: page,
            imgonly: true,
            toppieces: true
          }
        });
        
        const data = response.data;
        
        if (page === 1) {
          await this.updateSyncStatus('rijks', 'artworks', 'running', {
            total_records: Math.min(data.count, 10000) // Limit total
          });
        }
        
        for (const artwork of data.artObjects) {
          try {
            // Get detailed object info
            await this.rateLimitDelay('rijks');
            const detailResponse = await axios.get(`${this.apis.rijks.baseUrl}/${artwork.objectNumber}`, {
              params: { key: this.apis.rijks.apiKey }
            });
            
            const detailedArtwork = detailResponse.data.artObject;
            await this.saveArtwork('rijks', detailedArtwork, this.transformRijksArtwork(detailedArtwork));
            processed++;
            
          } catch (error) {
            logger.error(`Failed to save Rijks artwork ${artwork.objectNumber}:`, error.message);
          }
        }
        
        await this.updateSyncStatus('rijks', 'artworks', 'running', {
          processed_records: processed
        });
        
        if (data.artObjects.length < 100) break;
        page++;
        
        logger.info(`Rijksmuseum sync: page ${page}, ${processed} processed`);
      }
      
      await this.updateSyncStatus('rijks', 'artworks', 'completed');
      
    } catch (error) {
      logger.error('Rijksmuseum sync failed:', error);
      await this.updateSyncStatus('rijks', 'artworks', 'failed', { error: error.message });
    }
  }

  // Data transformation methods
  transformMetArtwork(artwork) {
    return {
      title: artwork.title,
      artist_display_name: artwork.artistDisplayName,
      artist_nationality: artwork.artistNationality,
      artist_birth_year: artwork.artistBeginDate ? parseInt(artwork.artistBeginDate) : null,
      artist_death_year: artwork.artistEndDate ? parseInt(artwork.artistEndDate) : null,
      creation_date: artwork.objectDate,
      period: artwork.period,
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      culture: artwork.culture,
      classification: artwork.classification,
      department: artwork.department,
      object_number: artwork.accessionNumber,
      accession_year: artwork.accessionYear,
      is_highlight: artwork.isHighlight,
      is_public_domain: artwork.isPublicDomain,
      primary_image_url: artwork.primaryImage,
      additional_images: artwork.additionalImages ? artwork.additionalImages.slice(0, 5) : [],
      location_gallery: artwork.GalleryNumber,
      tags: artwork.tags ? artwork.tags.map(tag => tag.term) : [],
      external_url: artwork.objectURL
    };
  }

  // Removed Harvard transformation - non-commercial license

  transformClevelandArtwork(artwork) {
    return {
      title: artwork.title,
      artist_display_name: artwork.creators ? artwork.creators.map(c => c.description).join(', ') : null,
      creation_date: artwork.creation_date,
      medium: artwork.medium,
      dimensions: artwork.dimensions?.overall?.with_frame || artwork.dimensions?.overall?.without_frame,
      culture: artwork.culture?.join(', '),
      classification: artwork.type,
      department: artwork.department,
      object_number: artwork.accession_number,
      primary_image_url: artwork.images?.web?.url,
      additional_images: artwork.images ? Object.values(artwork.images).slice(1, 6).map(img => img.url) : [],
      external_url: artwork.url
    };
  }

  transformRijksArtwork(artwork) {
    return {
      title: artwork.title,
      artist_display_name: artwork.principalOrFirstMaker,
      creation_date: artwork.dating?.presentingDate,
      period: artwork.dating?.period,
      medium: artwork.physicalMedium,
      dimensions: artwork.subTitle,
      classification: artwork.objectTypes?.join(', '),
      object_number: artwork.objectNumber,
      description: artwork.description,
      primary_image_url: artwork.webImage?.url,
      tags: artwork.objectTypes || [],
      external_url: artwork.links?.web
    };
  }

  // Database operations
  async saveArtwork(apiSource, originalData, transformedData) {
    const query = `
      INSERT INTO artworks_extended (
        api_source, api_id, title, artist_display_name, artist_nationality,
        artist_birth_year, artist_death_year, creation_date, period, medium,
        dimensions, description, culture, classification, department,
        object_number, accession_year, is_highlight, is_public_domain,
        primary_image_url, additional_images, location_gallery, tags,
        external_url, metadata, last_synced
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, CURRENT_TIMESTAMP)
      ON CONFLICT (api_source, api_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        artist_display_name = EXCLUDED.artist_display_name,
        primary_image_url = EXCLUDED.primary_image_url,
        last_synced = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const values = [
      apiSource,
      originalData.id || originalData.objectID || originalData.objectNumber,
      transformedData.title,
      transformedData.artist_display_name,
      transformedData.artist_nationality,
      transformedData.artist_birth_year,
      transformedData.artist_death_year,
      transformedData.creation_date,
      transformedData.period,
      transformedData.medium,
      transformedData.dimensions,
      transformedData.description,
      transformedData.culture,
      transformedData.classification,
      transformedData.department,
      transformedData.object_number,
      transformedData.accession_year,
      transformedData.is_highlight,
      transformedData.is_public_domain,
      transformedData.primary_image_url,
      transformedData.additional_images,
      transformedData.location_gallery,
      transformedData.tags,
      transformedData.external_url,
      originalData
    ];

    await pool.query(query, values);
  }

  async updateSyncStatus(apiSource, resourceType, status, updates = {}) {
    const baseQuery = `
      INSERT INTO api_sync_status (api_source, resource_type, last_sync_status)
      VALUES ($1, $2, $3)
      ON CONFLICT (api_source, resource_type)
      DO UPDATE SET last_sync_status = $3
    `;

    let query = baseQuery;
    const values = [apiSource, resourceType, status];

    if (status === 'running') {
      if (updates.total_records) {
        query = `
          INSERT INTO api_sync_status (api_source, resource_type, last_sync_start, last_sync_status, total_records)
          VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)
          ON CONFLICT (api_source, resource_type)
          DO UPDATE SET 
            last_sync_start = CURRENT_TIMESTAMP,
            last_sync_status = $3,
            total_records = $4
        `;
        values.push(updates.total_records);
      } else if (updates.processed_records) {
        query = `
          UPDATE api_sync_status 
          SET processed_records = $4, last_sync_status = $3
          WHERE api_source = $1 AND resource_type = $2
        `;
        values.push(updates.processed_records);
      }
    } else if (status === 'completed') {
      query = `
        UPDATE api_sync_status 
        SET last_sync_complete = CURRENT_TIMESTAMP, last_sync_status = $3
        WHERE api_source = $1 AND resource_type = $2
      `;
    } else if (status === 'failed') {
      query = `
        UPDATE api_sync_status 
        SET last_sync_status = $3, error_log = jsonb_build_array($4)
        WHERE api_source = $1 AND resource_type = $2
      `;
      values.push(updates.error || 'Unknown error');
    }

    await pool.query(query, values);
  }

  // Public methods for scheduled syncing
  async syncAllMuseums() {
    logger.info('Starting museum API sync for all commercially-licensed sources...');
    
    const syncPromises = [
      this.syncMetMuseum(),
      this.syncClevelandMuseum(),
      this.syncRijksmuseum()
    ];

    await Promise.allSettled(syncPromises);
    logger.info('Museum API sync completed for all commercially-licensed sources');
  }

  async getSyncStatus() {
    const query = `
      SELECT api_source, resource_type, last_sync_start, last_sync_complete,
             last_sync_status, total_records, processed_records, error_count
      FROM api_sync_status
      ORDER BY api_source, resource_type
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Search across all museum collections
  async searchArtworks(searchParams) {
    const {
      query,
      artist,
      medium,
      culture,
      department,
      period,
      hasImage = true,
      isPublicDomain,
      limit = 20,
      offset = 0
    } = searchParams;

    let whereConditions = [];
    let values = [];
    let paramCount = 1;

    if (hasImage) {
      whereConditions.push('primary_image_url IS NOT NULL');
    }

    if (query) {
      // Use full-text search instead of ILIKE for better performance
      whereConditions.push(`(
        to_tsvector('english', COALESCE(title, '')) @@ plainto_tsquery('english', $${paramCount}) OR
        to_tsvector('english', COALESCE(artist_display_name, '')) @@ plainto_tsquery('english', $${paramCount}) OR
        artist_display_name % $${paramCount}
      )`);
      values.push(query);
      paramCount++;
    }

    if (artist) {
      whereConditions.push(`artist_display_name ILIKE $${paramCount}`);
      values.push(`%${artist}%`);
      paramCount++;
    }

    if (medium) {
      whereConditions.push(`medium ILIKE $${paramCount}`);
      values.push(`%${medium}%`);
      paramCount++;
    }

    if (culture) {
      whereConditions.push(`culture ILIKE $${paramCount}`);
      values.push(`%${culture}%`);
      paramCount++;
    }

    if (department) {
      whereConditions.push(`department ILIKE $${paramCount}`);
      values.push(`%${department}%`);
      paramCount++;
    }

    if (period) {
      whereConditions.push(`period ILIKE $${paramCount}`);
      values.push(`%${period}%`);
      paramCount++;
    }

    if (isPublicDomain !== undefined) {
      whereConditions.push(`is_public_domain = $${paramCount}`);
      values.push(isPublicDomain);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const searchQuery = `
      SELECT ae.*, m.name as museum_name, m.short_name as museum_short_name
      FROM artworks_extended ae
      LEFT JOIN museums m ON ae.museum_id = m.id
      ${whereClause}
      ORDER BY 
        CASE WHEN ae.is_highlight THEN 1 ELSE 2 END,
        ae.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);

    const result = await pool.query(searchQuery, values);
    return result.rows;
  }
}

module.exports = new MuseumAPIService();