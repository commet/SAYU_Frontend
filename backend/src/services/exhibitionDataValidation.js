/**
 * Exhibition Data Validation Service
 * 
 * Comprehensive validation, cleaning, and quality assurance for exhibition data
 */

const axios = require('axios');
const { pool } = require('../config/database');
const { logger } = require('../config/logger');

class ExhibitionDataValidation {
  constructor() {
    this.validationRules = {
      // Required fields
      required: ['title', 'venue_name', 'start_date', 'end_date'],
      
      // Date validation
      dateFields: ['start_date', 'end_date', 'opening_date'],
      
      // URL validation
      urlFields: ['official_url', 'ticket_url', 'source_url'],
      
      // Text length limits
      lengthLimits: {
        title: 500,
        title_en: 500,
        description: 2000,
        venue_name: 255,
        admission_note: 255
      },
      
      // Valid status values
      validStatuses: ['upcoming', 'ongoing', 'ended', 'cancelled', 'unknown'],
      
      // Valid countries
      validCountries: ['KR', 'US', 'GB', 'FR', 'DE', 'JP', 'CN', 'NL'],
      
      // Venue types for auto-detection
      venueKeywords: {
        museum: ['박물관', '미술관', 'museum', 'gallery'],
        gallery: ['갤러리', '화랑', 'gallery', 'space'],
        art_center: ['문화회관', '아트센터', 'art center', 'cultural center'],
        alternative_space: ['대안공간', '프로젝트 스페이스', 'alternative', 'project space']
      }
    };
    
    this.cleaningPatterns = {
      // Title cleaning patterns
      titlePatterns: [
        { pattern: /^전시\s*[:：]\s*/, replacement: '' },
        { pattern: /\s*전시회?$/, replacement: '' },
        { pattern: /『([^』]+)』/, replacement: '$1' },
        { pattern: /「([^」]+)」/, replacement: '$1' },
        { pattern: /<([^>]+)>/, replacement: '$1' },
        { pattern: /\[([^\]]+)\]/, replacement: '$1' }
      ],
      
      // Venue name cleaning
      venuePatterns: [
        { pattern: /\s*전시장$/, replacement: '' },
        { pattern: /\s*갤러리$/, replacement: ' 갤러리' },
        { pattern: /\s+(미술관|박물관)$/, replacement: ' $1' }
      ],
      
      // Description cleaning
      descriptionPatterns: [
        { pattern: /<[^>]*>/g, replacement: '' }, // HTML tags
        { pattern: /&[a-zA-Z0-9]+;/g, replacement: ' ' }, // HTML entities
        { pattern: /\s{2,}/g, replacement: ' ' } // Multiple spaces
      ]
    };
  }

  /**
   * Main validation method
   */
  async validateExhibition(exhibition) {
    const result = {
      isValid: true,
      originalData: { ...exhibition },
      cleanedData: null,
      errors: [],
      warnings: [],
      confidence: 100,
      suggestions: []
    };

    try {
      // Step 1: Clean the data
      const cleaned = await this.cleanExhibitionData(exhibition);
      result.cleanedData = cleaned;

      // Step 2: Validate required fields
      const requiredCheck = this.validateRequiredFields(cleaned);
      this.mergeValidationResult(result, requiredCheck);

      // Step 3: Validate dates
      const dateCheck = await this.validateDates(cleaned);
      this.mergeValidationResult(result, dateCheck);

      // Step 4: Validate venues
      const venueCheck = await this.validateVenue(cleaned);
      this.mergeValidationResult(result, venueCheck);

      // Step 5: Validate URLs
      const urlCheck = await this.validateUrls(cleaned);
      this.mergeValidationResult(result, urlCheck);

      // Step 6: Check for duplicates
      const duplicateCheck = await this.checkDuplicates(cleaned);
      this.mergeValidationResult(result, duplicateCheck);

      // Step 7: Data enrichment suggestions
      const enrichmentSuggestions = await this.generateEnrichmentSuggestions(cleaned);
      result.suggestions.push(...enrichmentSuggestions);

      // Step 8: Calculate overall confidence
      result.confidence = this.calculateConfidence(result);

    } catch (error) {
      logger.error('Validation error:', error);
      result.isValid = false;
      result.errors.push(`Validation failed: ${error.message}`);
      result.confidence = 0;
    }

    return result;
  }

  /**
   * Clean exhibition data
   */
  async cleanExhibitionData(exhibition) {
    const cleaned = { ...exhibition };

    // Clean title
    if (cleaned.title) {
      for (const { pattern, replacement } of this.cleaningPatterns.titlePatterns) {
        cleaned.title = cleaned.title.replace(pattern, replacement);
      }
      cleaned.title = cleaned.title.trim();
    }

    // Clean venue name
    if (cleaned.venue_name) {
      for (const { pattern, replacement } of this.cleaningPatterns.venuePatterns) {
        cleaned.venue_name = cleaned.venue_name.replace(pattern, replacement);
      }
      cleaned.venue_name = cleaned.venue_name.trim();
    }

    // Clean description
    if (cleaned.description) {
      for (const { pattern, replacement } of this.cleaningPatterns.descriptionPatterns) {
        cleaned.description = cleaned.description.replace(pattern, replacement);
      }
      cleaned.description = cleaned.description.trim();
    }

    // Normalize dates
    cleaned.start_date = this.normalizeDate(cleaned.start_date);
    cleaned.end_date = this.normalizeDate(cleaned.end_date);

    // Normalize admission fee
    if (cleaned.admission_fee) {
      cleaned.admission_fee = this.normalizeAdmissionFee(cleaned.admission_fee);
    }

    // Auto-detect venue type
    cleaned.venue_type = this.detectVenueType(cleaned.venue_name);

    return cleaned;
  }

  /**
   * Validate required fields
   */
  validateRequiredFields(exhibition) {
    const result = { isValid: true, errors: [], warnings: [], confidence: 100 };

    for (const field of this.validationRules.required) {
      if (!exhibition[field] || exhibition[field].toString().trim() === '') {
        result.isValid = false;
        result.errors.push(`Missing required field: ${field}`);
        result.confidence -= 25;
      }
    }

    // Check field lengths
    for (const [field, maxLength] of Object.entries(this.validationRules.lengthLimits)) {
      if (exhibition[field] && exhibition[field].length > maxLength) {
        result.warnings.push(`Field ${field} exceeds recommended length (${maxLength})`);
        result.confidence -= 5;
      }
    }

    return result;
  }

  /**
   * Validate dates
   */
  async validateDates(exhibition) {
    const result = { isValid: true, errors: [], warnings: [], confidence: 100 };

    const startDate = new Date(exhibition.start_date);
    const endDate = new Date(exhibition.end_date);
    const now = new Date();

    // Check if dates are valid
    if (isNaN(startDate.getTime())) {
      result.isValid = false;
      result.errors.push('Invalid start_date format');
      result.confidence -= 30;
    }

    if (isNaN(endDate.getTime())) {
      result.isValid = false;
      result.errors.push('Invalid end_date format');
      result.confidence -= 30;
    }

    if (result.isValid) {
      // Check date logic
      if (startDate > endDate) {
        result.isValid = false;
        result.errors.push('Start date is after end date');
        result.confidence -= 40;
      }

      // Check for reasonable date ranges (exhibitions shouldn't be too far in the past or future)
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      const twoYearsFromNow = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);

      if (endDate < oneYearAgo) {
        result.warnings.push('Exhibition ended more than a year ago');
        result.confidence -= 10;
      }

      if (startDate > twoYearsFromNow) {
        result.warnings.push('Exhibition is scheduled more than 2 years in the future');
        result.confidence -= 10;
      }

      // Determine and validate status
      const calculatedStatus = this.calculateStatus(startDate, endDate, now);
      if (exhibition.status && exhibition.status !== calculatedStatus) {
        result.warnings.push(`Status mismatch: provided '${exhibition.status}', calculated '${calculatedStatus}'`);
        result.confidence -= 5;
      }
    }

    return result;
  }

  /**
   * Validate venue information
   */
  async validateVenue(exhibition) {
    const result = { isValid: true, errors: [], warnings: [], confidence: 100 };

    try {
      // Check if venue exists in our database
      const venueQuery = await pool.query(
        'SELECT id, name, city, country FROM venues WHERE name ILIKE $1 OR name_en ILIKE $1',
        [exhibition.venue_name]
      );

      if (venueQuery.rows.length === 0) {
        result.warnings.push(`Unknown venue: ${exhibition.venue_name}`);
        result.confidence -= 15;
        
        // Suggest similar venues
        const similarVenues = await this.findSimilarVenues(exhibition.venue_name);
        if (similarVenues.length > 0) {
          result.warnings.push(`Similar venues found: ${similarVenues.slice(0, 3).map(v => v.name).join(', ')}`);
        }
      } else {
        const venue = venueQuery.rows[0];
        
        // Check city consistency
        if (exhibition.venue_city && venue.city !== exhibition.venue_city) {
          result.warnings.push(`City mismatch: venue database shows '${venue.city}', provided '${exhibition.venue_city}'`);
          result.confidence -= 5;
        }
      }

      // Validate city format
      if (exhibition.venue_city) {
        const validCities = await this.getValidCities();
        if (!validCities.includes(exhibition.venue_city)) {
          result.warnings.push(`Unknown city: ${exhibition.venue_city}`);
          result.confidence -= 5;
        }
      }

    } catch (error) {
      logger.error('Venue validation error:', error);
      result.warnings.push('Could not validate venue information');
      result.confidence -= 10;
    }

    return result;
  }

  /**
   * Validate URLs
   */
  async validateUrls(exhibition) {
    const result = { isValid: true, errors: [], warnings: [], confidence: 100 };

    for (const field of this.validationRules.urlFields) {
      const url = exhibition[field];
      
      if (url) {
        // Basic URL format check
        if (!this.isValidUrl(url)) {
          result.errors.push(`Invalid URL format in ${field}: ${url}`);
          result.confidence -= 10;
          continue;
        }

        // Check if URL is accessible (with timeout)
        try {
          const response = await axios.head(url, {
            timeout: 5000,
            validateStatus: (status) => status < 500 // Accept redirects and client errors
          });
          
          if (response.status >= 400) {
            result.warnings.push(`URL ${field} returned status ${response.status}: ${url}`);
            result.confidence -= 5;
          }
        } catch (error) {
          if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            result.warnings.push(`URL ${field} is not accessible: ${url}`);
            result.confidence -= 10;
          }
          // Don't penalize for timeouts or other network issues
        }
      }
    }

    return result;
  }

  /**
   * Check for duplicates
   */
  async checkDuplicates(exhibition) {
    const result = { isValid: true, errors: [], warnings: [], confidence: 100 };

    try {
      // Check for exact duplicates
      const exactDuplicates = await pool.query(`
        SELECT id, title, venue_name, start_date 
        FROM exhibitions 
        WHERE title = $1 AND venue_name = $2 AND start_date = $3
      `, [exhibition.title, exhibition.venue_name, exhibition.start_date]);

      if (exactDuplicates.rows.length > 0) {
        result.isValid = false;
        result.errors.push('Exact duplicate found in database');
        result.confidence = 0;
        return result;
      }

      // Check for similar exhibitions (fuzzy matching)
      const similarExhibitions = await pool.query(`
        SELECT id, title, venue_name, start_date,
               similarity(title, $1) as title_similarity,
               similarity(venue_name, $2) as venue_similarity
        FROM exhibitions
        WHERE start_date = $3
          AND (similarity(title, $1) > 0.7 OR similarity(venue_name, $2) > 0.8)
        ORDER BY title_similarity DESC, venue_similarity DESC
        LIMIT 5
      `, [exhibition.title, exhibition.venue_name, exhibition.start_date]);

      if (similarExhibitions.rows.length > 0) {
        result.warnings.push(`Found ${similarExhibitions.rows.length} similar exhibition(s)`);
        result.confidence -= 15;
        
        // Add details about similar exhibitions
        similarExhibitions.rows.forEach(similar => {
          result.warnings.push(
            `Similar: "${similar.title}" at ${similar.venue_name} ` +
            `(title: ${Math.round(similar.title_similarity * 100)}%, venue: ${Math.round(similar.venue_similarity * 100)}%)`
          );
        });
      }

    } catch (error) {
      logger.error('Duplicate check error:', error);
      result.warnings.push('Could not check for duplicates');
      result.confidence -= 5;
    }

    return result;
  }

  /**
   * Generate data enrichment suggestions
   */
  async generateEnrichmentSuggestions(exhibition) {
    const suggestions = [];

    // Missing English title
    if (!exhibition.title_en && exhibition.title) {
      suggestions.push({
        type: 'translation',
        field: 'title_en',
        message: 'Consider adding English translation of title'
      });
    }

    // Missing description
    if (!exhibition.description) {
      suggestions.push({
        type: 'content',
        field: 'description',
        message: 'Exhibition would benefit from a description'
      });
    }

    // Missing admission fee info
    if (!exhibition.admission_fee) {
      suggestions.push({
        type: 'pricing',
        field: 'admission_fee',
        message: 'Admission fee information would be helpful'
      });
    }

    // No official URL
    if (!exhibition.official_url) {
      suggestions.push({
        type: 'link',
        field: 'official_url',
        message: 'Official exhibition URL would improve user experience'
      });
    }

    // Could benefit from categorization
    if (!exhibition.type) {
      const suggestedType = this.suggestExhibitionType(exhibition);
      if (suggestedType) {
        suggestions.push({
          type: 'categorization',
          field: 'type',
          message: `Suggested exhibition type: ${suggestedType}`,
          value: suggestedType
        });
      }
    }

    return suggestions;
  }

  /**
   * Utility methods
   */
  normalizeDate(dateStr) {
    if (!dateStr) return null;

    // Handle various date formats
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
      /^(\d{4})(\d{2})(\d{2})/,    // YYYYMMDD
      /^(\d{4})[.](\d{2})[.](\d{2})/, // YYYY.MM.DD
      /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/ // Korean format
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    return dateStr; // Return as-is if no format matches
  }

  normalizeAdmissionFee(feeStr) {
    if (!feeStr) return null;

    const str = feeStr.toString().toLowerCase();
    
    // Free exhibition patterns
    if (str.includes('무료') || str.includes('free') || str.includes('무료관람')) {
      return '무료';
    }

    // Extract numeric values
    const numMatch = str.match(/[\d,]+/);
    if (numMatch) {
      const num = parseInt(numMatch[0].replace(/,/g, ''));
      if (!isNaN(num)) {
        return `${num.toLocaleString()}원`;
      }
    }

    return feeStr; // Return original if can't normalize
  }

  detectVenueType(venueName) {
    if (!venueName) return null;

    const name = venueName.toLowerCase();
    
    for (const [type, keywords] of Object.entries(this.validationRules.venueKeywords)) {
      for (const keyword of keywords) {
        if (name.includes(keyword.toLowerCase())) {
          return type;
        }
      }
    }

    return null;
  }

  calculateStatus(startDate, endDate, now) {
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'ongoing';
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  async findSimilarVenues(venueName) {
    try {
      const result = await pool.query(`
        SELECT name, city, similarity(name, $1) as sim
        FROM venues
        WHERE similarity(name, $1) > 0.3
        ORDER BY sim DESC
        LIMIT 10
      `, [venueName]);

      return result.rows;
    } catch (error) {
      return [];
    }
  }

  async getValidCities() {
    try {
      const result = await pool.query(`
        SELECT DISTINCT city FROM venues WHERE city IS NOT NULL
        UNION
        SELECT DISTINCT venue_city FROM exhibitions WHERE venue_city IS NOT NULL
      `);

      return result.rows.map(row => row.city || row.venue_city);
    } catch (error) {
      return ['서울', '부산', '대구', '인천', '광주', '대전', '울산']; // Fallback to major Korean cities
    }
  }

  suggestExhibitionType(exhibition) {
    const title = exhibition.title?.toLowerCase() || '';
    const description = exhibition.description?.toLowerCase() || '';
    const text = `${title} ${description}`;

    if (text.includes('개인전') || text.includes('solo')) return 'solo';
    if (text.includes('기획전') || text.includes('특별전') || text.includes('special')) return 'special';
    if (text.includes('소장품') || text.includes('collection')) return 'collection';
    if (text.includes('단체전') || text.includes('group')) return 'group';

    // Default to group if multiple artists mentioned
    const artistCount = (exhibition.artists || []).length;
    if (artistCount > 1) return 'group';
    if (artistCount === 1) return 'solo';

    return null;
  }

  calculateConfidence(validationResult) {
    let confidence = 100;

    // Major errors significantly reduce confidence
    confidence -= validationResult.errors.length * 20;

    // Minor warnings slightly reduce confidence
    confidence -= validationResult.warnings.length * 2;

    // Ensure confidence is within bounds
    return Math.max(0, Math.min(100, confidence));
  }

  mergeValidationResult(target, source) {
    if (!source.isValid) target.isValid = false;
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
  }

  /**
   * Batch validation method
   */
  async validateExhibitionBatch(exhibitions, options = {}) {
    const results = [];
    const { maxConcurrent = 5, stopOnFirstError = false } = options;

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < exhibitions.length; i += maxConcurrent) {
      const batch = exhibitions.slice(i, i + maxConcurrent);
      
      const batchResults = await Promise.all(
        batch.map(async (exhibition, index) => {
          try {
            const result = await this.validateExhibition(exhibition);
            return { index: i + index, ...result };
          } catch (error) {
            return {
              index: i + index,
              isValid: false,
              errors: [`Validation failed: ${error.message}`],
              warnings: [],
              confidence: 0
            };
          }
        })
      );

      results.push(...batchResults);

      // Stop processing if we hit a critical error and stopOnFirstError is true
      if (stopOnFirstError && batchResults.some(r => !r.isValid)) {
        break;
      }

      // Small delay between batches to be nice to external services
      if (i + maxConcurrent < exhibitions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

module.exports = ExhibitionDataValidation;