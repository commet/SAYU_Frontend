const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
const logger = require('../utils/logger');

class GlobalMuseumCollectorService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // City configurations with target venues and coordinates
    this.cityConfigs = {
      'New York': {
        country: 'United States',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        searchRadius: 15000, // 15km
        expectedVenues: 200,
        webSources: [
          {
            name: 'NYC-ARTS',
            url: 'https://www.nyc-arts.org/organizations',
            selector: '.organization-item'
          }
        ]
      },
      'Paris': {
        country: 'France',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        searchRadius: 12000,
        expectedVenues: 150,
        webSources: [
          {
            name: 'ParisArt',
            url: 'https://www.paris-art.com/lieux/',
            selector: '.lieu-item'
          }
        ]
      },
      'London': {
        country: 'United Kingdom',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        searchRadius: 15000,
        expectedVenues: 180,
        webSources: []
      },
      'Tokyo': {
        country: 'Japan',
        coordinates: { lat: 35.6762, lng: 139.6503 },
        searchRadius: 20000,
        expectedVenues: 250,
        webSources: [
          {
            name: 'Tokyo Art Beat',
            url: 'https://www.tokyoartbeat.com/venues',
            selector: '.venue-item'
          }
        ]
      },
      'Hong Kong': {
        country: 'Hong Kong',
        coordinates: { lat: 22.3193, lng: 114.1694 },
        searchRadius: 8000,
        expectedVenues: 80,
        webSources: []
      },
      'Seoul': {
        country: 'South Korea',
        coordinates: { lat: 37.5665, lng: 126.9780 },
        searchRadius: 15000,
        expectedVenues: 120,
        webSources: []
      },
      'Berlin': {
        country: 'Germany',
        coordinates: { lat: 52.5200, lng: 13.4050 },
        searchRadius: 12000,
        expectedVenues: 140,
        webSources: []
      },
      'Barcelona': {
        country: 'Spain',
        coordinates: { lat: 41.3851, lng: 2.1734 },
        searchRadius: 10000,
        expectedVenues: 100,
        webSources: []
      },
      'Amsterdam': {
        country: 'Netherlands',
        coordinates: { lat: 52.3676, lng: 4.9041 },
        searchRadius: 8000,
        expectedVenues: 80,
        webSources: []
      },
      'Milan': {
        country: 'Italy',
        coordinates: { lat: 45.4642, lng: 9.1900 },
        searchRadius: 10000,
        expectedVenues: 90,
        webSources: []
      }
    };

    // Rate limiting
    this.apiCallCount = {
      google: 0,
      foursquare: 0
    };
    this.dailyLimits = {
      google: parseInt(process.env.GOOGLE_PLACES_REQUESTS_PER_DAY) || 1000,
      foursquare: parseInt(process.env.FOURSQUARE_REQUESTS_PER_DAY) || 950
    };
  }

  async collectGlobalVenues(options = {}) {
    const {
      cities = Object.keys(this.cityConfigs),
      sources = ['google_places', 'foursquare', 'web_scraping'],
      batchSize = parseInt(process.env.GLOBAL_COLLECTION_BATCH_SIZE) || 50,
      testMode = false
    } = options;

    const logId = await this.createCollectionLog('venues', 'combined', {
      target_cities: cities,
      sources,
      batch_size: batchSize,
      test_mode: testMode
    });

    const results = {
      total_venues: 0,
      successful: 0,
      failed: 0,
      duplicates: 0,
      by_city: {},
      by_source: {}
    };

    try {
      for (const city of cities) {
        if (testMode && results.total_venues >= 10) break;

        logger.info(`Starting collection for ${city}`);
        const cityResults = await this.collectVenuesForCity(city, sources, testMode);

        results.by_city[city] = cityResults;
        results.total_venues += cityResults.total;
        results.successful += cityResults.successful;
        results.failed += cityResults.failed;
        results.duplicates += cityResults.duplicates;

        // Update log with progress
        await this.updateCollectionLog(logId, {
          records_attempted: results.total_venues,
          records_successful: results.successful,
          records_failed: results.failed,
          records_duplicate: results.duplicates
        });

        // Rate limiting delay
        await this.delay(parseInt(process.env.GLOBAL_COLLECTION_DELAY_MS) || 1000);
      }

      await this.completeCollectionLog(logId, 'completed', results);
      logger.info('Global venue collection completed', { results });

      return results;

    } catch (error) {
      logger.error('Global venue collection failed', error);
      await this.completeCollectionLog(logId, 'failed', results, error.message);
      throw error;
    }
  }

  async collectVenuesForCity(city, sources, testMode = false) {
    const config = this.cityConfigs[city];
    if (!config) {
      throw new Error(`No configuration found for city: ${city}`);
    }

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      duplicates: 0,
      sources: {}
    };

    // Google Places API
    if (sources.includes('google_places') && this.canMakeApiCall('google')) {
      try {
        const googleResults = await this.collectFromGooglePlaces(city, config, testMode);
        results.sources.google_places = googleResults;
        results.total += googleResults.total;
        results.successful += googleResults.successful;
        results.failed += googleResults.failed;
        results.duplicates += googleResults.duplicates;
      } catch (error) {
        logger.error(`Google Places collection failed for ${city}`, error);
        results.sources.google_places = { error: error.message };
      }
    }

    // Foursquare API
    if (sources.includes('foursquare') && this.canMakeApiCall('foursquare')) {
      try {
        const foursquareResults = await this.collectFromFoursquare(city, config, testMode);
        results.sources.foursquare = foursquareResults;
        results.total += foursquareResults.total;
        results.successful += foursquareResults.successful;
        results.failed += foursquareResults.failed;
        results.duplicates += foursquareResults.duplicates;
      } catch (error) {
        logger.error(`Foursquare collection failed for ${city}`, error);
        results.sources.foursquare = { error: error.message };
      }
    }

    // Web Scraping
    if (sources.includes('web_scraping') && config.webSources.length > 0) {
      try {
        const webResults = await this.collectFromWebSources(city, config, testMode);
        results.sources.web_scraping = webResults;
        results.total += webResults.total;
        results.successful += webResults.successful;
        results.failed += webResults.failed;
        results.duplicates += webResults.duplicates;
      } catch (error) {
        logger.error(`Web scraping failed for ${city}`, error);
        results.sources.web_scraping = { error: error.message };
      }
    }

    return results;
  }

  async collectFromGooglePlaces(city, config, testMode) {
    const results = { total: 0, successful: 0, failed: 0, duplicates: 0, venues: [] };

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const searchTypes = ['museum', 'art_gallery'];

    for (const type of searchTypes) {
      if (testMode && results.total >= 5) break;

      try {
        // Using Places API (New) - Text Search endpoint
        const url = 'https://places.googleapis.com/v1/places:searchText';
        const headers = {
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.websiteUri,places.internationalPhoneNumber,places.googleMapsUri'
        };
        const data = {
          textQuery: `${type} in ${city}`,
          locationBias: {
            circle: {
              center: {
                latitude: config.coordinates.lat,
                longitude: config.coordinates.lng
              },
              radius: config.searchRadius
            }
          },
          pageSize: testMode ? 5 : 20
        };

        const response = await axios.post(url, data, { headers });
        this.apiCallCount.google++;

        if (response.data.places) {
          const places = testMode ? response.data.places.slice(0, 3) : response.data.places;

          for (const place of places) {
            results.total++;

            try {
              const venueData = await this.processGooglePlaceData(place, city, config.country);
              const saved = await this.saveVenue(venueData);

              if (saved.duplicate) {
                results.duplicates++;
              } else {
                results.successful++;
                results.venues.push(saved.venue);
              }
            } catch (error) {
              logger.error(`Failed to process Google Place: ${place.name}`, error);
              results.failed++;
            }
          }
        }

        await this.delay(100); // Rate limiting
      } catch (error) {
        logger.error(`Google Places API error for ${city}, type ${type}`, error);
        throw error;
      }
    }

    return results;
  }

  async collectFromFoursquare(city, config, testMode) {
    const results = { total: 0, successful: 0, failed: 0, duplicates: 0, venues: [] };

    if (!process.env.FOURSQUARE_API_KEY) {
      throw new Error('Foursquare API key not configured');
    }

    const categories = ['10027', '10028']; // Museum, Art Gallery categories

    for (const categoryId of categories) {
      if (testMode && results.total >= 5) break;

      try {
        const url = 'https://api.foursquare.com/v3/places/search';
        const headers = {
          'Authorization': `Bearer ${process.env.FOURSQUARE_API_KEY}`,
          'Accept': 'application/json'
        };
        const params = {
          ll: `${config.coordinates.lat},${config.coordinates.lng}`,
          radius: config.searchRadius,
          categories: categoryId,
          limit: testMode ? 10 : 50
        };

        const response = await axios.get(url, { headers, params });
        this.apiCallCount.foursquare++;

        if (response.data.results) {
          for (const place of response.data.results) {
            results.total++;

            try {
              const venueData = await this.processFoursquareData(place, city, config.country);
              const saved = await this.saveVenue(venueData);

              if (saved.duplicate) {
                results.duplicates++;
              } else {
                results.successful++;
                results.venues.push(saved.venue);
              }
            } catch (error) {
              logger.error(`Failed to process Foursquare venue: ${place.name}`, error);
              results.failed++;
            }
          }
        }

        await this.delay(200); // Rate limiting
      } catch (error) {
        logger.error(`Foursquare API error for ${city}, category ${categoryId}`, error);
        throw error;
      }
    }

    return results;
  }

  async collectFromWebSources(city, config, testMode) {
    const results = { total: 0, successful: 0, failed: 0, duplicates: 0, venues: [] };

    for (const source of config.webSources) {
      if (testMode && results.total >= 5) break;

      try {
        logger.info(`Scraping ${source.name} for ${city}`);
        const venues = await this.scrapeWebSource(source, city, config.country, testMode);

        for (const venueData of venues) {
          results.total++;

          try {
            const saved = await this.saveVenue(venueData);

            if (saved.duplicate) {
              results.duplicates++;
            } else {
              results.successful++;
              results.venues.push(saved.venue);
            }
          } catch (error) {
            logger.error(`Failed to save scraped venue: ${venueData.name}`, error);
            results.failed++;
          }
        }

        await this.delay(parseInt(process.env.WEB_SCRAPING_DELAY_MS) || 2000);
      } catch (error) {
        logger.error(`Web scraping failed for ${source.name}`, error);
        // Continue with next source
      }
    }

    return results;
  }

  async scrapeWebSource(source, city, country, testMode) {
    const venues = [];

    try {
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const venueElements = $(source.selector);

      const limit = testMode ? 3 : Math.min(venueElements.length, 50);

      for (let i = 0; i < limit; i++) {
        const element = venueElements.eq(i);

        try {
          const venueData = this.extractVenueFromElement($, element, city, country, source.name);
          if (venueData) {
            venues.push(venueData);
          }
        } catch (error) {
          logger.error(`Failed to extract venue data from element`, error);
        }
      }
    } catch (error) {
      logger.error(`Failed to scrape ${source.url}`, error);
      throw error;
    }

    return venues;
  }

  extractVenueFromElement($, element, city, country, sourceName) {
    // Generic extraction logic - should be customized per source
    const name = element.find('h3, .name, .title').first().text().trim();
    const description = element.find('.description, .summary, p').first().text().trim();
    const address = element.find('.address, .location').first().text().trim();
    const website = element.find('a').first().attr('href');

    if (!name) return null;

    return {
      name,
      description: description || null,
      country,
      city,
      address: address || null,
      website: website ? this.normalizeUrl(website) : null,
      venue_type: this.inferVenueType(name, description),
      venue_category: 'unknown',
      data_source: 'web_scraping',
      data_quality_score: this.calculateWebScrapingQualityScore(name, description, address, website)
    };
  }

  async processGooglePlaceData(place, city, country) {
    // Process data from Places API (New) format
    return {
      name: place.displayName?.text || place.displayName || 'Unknown',
      description: null,
      country,
      city,
      address: place.formattedAddress || null,
      latitude: place.location?.latitude || null,
      longitude: place.location?.longitude || null,
      venue_type: this.mapGoogleTypeToVenueType(place.types || []),
      venue_category: 'public',
      google_place_id: place.id || place.name, // Places API (New) uses 'id' field
      website: place.websiteUri || null,
      phone: place.internationalPhoneNumber || null,
      data_source: 'google_places',
      data_quality_score: this.calculateGoogleQualityScore(place),
      opening_hours: null // Opening hours require separate API call in Places (New)
    };
  }

  async processFoursquareData(place, city, country) {
    return {
      name: place.name,
      description: place.description || null,
      country,
      city,
      address: place.location?.formatted_address || null,
      latitude: place.geocodes?.main?.latitude || null,
      longitude: place.geocodes?.main?.longitude || null,
      venue_type: this.mapFoursquareTypeToVenueType(place.categories),
      venue_category: 'unknown',
      foursquare_venue_id: place.fsq_id,
      website: place.website || null,
      data_source: 'foursquare',
      data_quality_score: this.calculateFoursquareQualityScore(place)
    };
  }

  async saveVenue(venueData) {
    const client = await this.pool.connect();

    try {
      // Check for duplicates
      const duplicateCheck = await client.query(`
                SELECT id FROM global_venues 
                WHERE (google_place_id = $1 AND google_place_id IS NOT NULL)
                   OR (foursquare_venue_id = $2 AND foursquare_venue_id IS NOT NULL)
                   OR (LOWER(name) = LOWER($3) AND city = $4 AND country = $5)
            `, [
        venueData.google_place_id,
        venueData.foursquare_venue_id,
        venueData.name,
        venueData.city,
        venueData.country
      ]);

      if (duplicateCheck.rows.length > 0) {
        return { duplicate: true, venue: duplicateCheck.rows[0] };
      }

      // Insert new venue
      const insertQuery = `
                INSERT INTO global_venues (
                    name, description, country, city, address, latitude, longitude,
                    venue_type, venue_category, google_place_id, foursquare_venue_id,
                    website, data_source, data_quality_score, opening_hours
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                ) RETURNING *
            `;

      const values = [
        venueData.name,
        venueData.description,
        venueData.country,
        venueData.city,
        venueData.address,
        venueData.latitude,
        venueData.longitude,
        venueData.venue_type,
        venueData.venue_category,
        venueData.google_place_id,
        venueData.foursquare_venue_id,
        venueData.website,
        venueData.data_source,
        venueData.data_quality_score,
        JSON.stringify(venueData.opening_hours)
      ];

      const result = await client.query(insertQuery, values);
      return { duplicate: false, venue: result.rows[0] };

    } finally {
      client.release();
    }
  }

  // Utility methods
  mapGoogleTypeToVenueType(types) {
    if (types.includes('museum')) return 'museum';
    if (types.includes('art_gallery')) return 'gallery';
    if (types.includes('tourist_attraction')) return 'museum';
    return 'cultural_center';
  }

  mapFoursquareTypeToVenueType(categories) {
    if (!categories || categories.length === 0) return 'unknown';

    const category = categories[0];
    if (category.id === '10027') return 'museum';
    if (category.id === '10028') return 'gallery';
    return 'cultural_center';
  }

  inferVenueType(name, description) {
    const text = `${name} ${description}`.toLowerCase();

    if (text.includes('museum') || text.includes('museo') || text.includes('musée')) return 'museum';
    if (text.includes('gallery') || text.includes('galerie') || text.includes('galería')) return 'gallery';
    if (text.includes('art center') || text.includes('art centre')) return 'art_center';
    if (text.includes('foundation') || text.includes('institute')) return 'cultural_center';

    return 'unknown';
  }

  calculateGoogleQualityScore(place) {
    let score = 30; // Base score

    // Adjust for Places API (New) format
    if (place.displayName || place.name) score += 15;
    if (place.formattedAddress) score += 10;
    if (place.location) score += 20;
    if (place.websiteUri) score += 10;
    if (place.internationalPhoneNumber) score += 5;
    if (place.types && place.types.length > 0) score += 10;

    return Math.min(score, 100);
  }

  calculateFoursquareQualityScore(place) {
    let score = 30; // Base score

    if (place.name) score += 15;
    if (place.location?.formatted_address) score += 15;
    if (place.geocodes?.main) score += 20;
    if (place.website) score += 10;
    if (place.description) score += 10;

    return Math.min(score, 100);
  }

  calculateWebScrapingQualityScore(name, description, address, website) {
    let score = 20; // Lower base score for scraped data

    if (name && name.length > 3) score += 20;
    if (description && description.length > 20) score += 15;
    if (address) score += 15;
    if (website) score += 15;

    return Math.min(score, 85); // Cap lower for scraped data
  }

  normalizeUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  }

  canMakeApiCall(service) {
    return this.apiCallCount[service] < this.dailyLimits[service];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Logging methods
  async createCollectionLog(type, source, config) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
                INSERT INTO global_collection_logs (
                    collection_type, data_source, started_at, status, configuration
                ) VALUES ($1, $2, $3, 'running', $4) RETURNING id
            `, [type, source, new Date(), JSON.stringify(config)]);

      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  async updateCollectionLog(logId, updates) {
    const client = await this.pool.connect();
    try {
      await client.query(`
                UPDATE global_collection_logs 
                SET records_attempted = $2, records_successful = $3, 
                    records_failed = $4, records_duplicate = $5
                WHERE id = $1
            `, [
        logId,
        updates.records_attempted,
        updates.records_successful,
        updates.records_failed,
        updates.records_duplicate
      ]);
    } finally {
      client.release();
    }
  }

  async completeCollectionLog(logId, status, results, errorMessage = null) {
    const client = await this.pool.connect();
    try {
      await client.query(`
                UPDATE global_collection_logs 
                SET status = $2, completed_at = $3, results_summary = $4, 
                    error_message = $5, success_rate = $6,
                    api_calls_made = $7, duration_seconds = $8
                WHERE id = $1
            `, [
        logId,
        status,
        new Date(),
        JSON.stringify(results),
        errorMessage,
                results.total_venues > 0 ? (results.successful / results.total_venues * 100) : 0,
                this.apiCallCount.google + this.apiCallCount.foursquare,
                Math.floor((Date.now() - new Date().getTime()) / 1000)
      ]);
    } finally {
      client.release();
    }
  }

  // Public interface methods
  async getCollectionStatus() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
                SELECT 
                    COUNT(*) as total_venues,
                    COUNT(CASE WHEN data_source = 'google_places' THEN 1 END) as google_venues,
                    COUNT(CASE WHEN data_source = 'foursquare' THEN 1 END) as foursquare_venues,
                    COUNT(CASE WHEN data_source = 'web_scraping' THEN 1 END) as scraped_venues,
                    AVG(data_quality_score) as avg_quality_score,
                    COUNT(DISTINCT city) as cities_covered,
                    COUNT(DISTINCT country) as countries_covered
                FROM global_venues
            `);

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getCityStatistics() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
                SELECT * FROM global_venues_by_city
                ORDER BY total_venues DESC
            `);

      return result.rows;
    } finally {
      client.release();
    }
  }

  async getRecentLogs(limit = 10) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
                SELECT * FROM global_collection_logs
                ORDER BY started_at DESC
                LIMIT $1
            `, [limit]);

      return result.rows;
    } finally {
      client.release();
    }
  }
}

module.exports = GlobalMuseumCollectorService;
