const axios = require('axios');
const Exhibition = require('../models/exhibition');
const Venue = require('../models/venue');
const { Op } = require('sequelize');
const crypto = require('crypto');

class ExhibitionCollectorService {
  constructor() {
    this.naverClientId = process.env.NAVER_CLIENT_ID;
    this.naverClientSecret = process.env.NAVER_CLIENT_SECRET;
    this.naverHeaders = {
      'X-Naver-Client-Id': this.naverClientId,
      'X-Naver-Client-Secret': this.naverClientSecret
    };
  }

  // Main collection orchestrator
  async collectExhibitions(options = {}) {
    const results = {
      naver: { success: 0, failed: 0, exhibitions: [] },
      instagram: { success: 0, failed: 0, exhibitions: [] },
      scraping: { success: 0, failed: 0, exhibitions: [] }
    };

    try {
      // 1. Collect from Naver
      if (options.includeNaver !== false) {
        const naverResults = await this.collectFromNaver();
        results.naver = naverResults;
      }

      // 2. Collect from Instagram (if implemented)
      if (options.includeInstagram) {
        // results.instagram = await this.collectFromInstagram();
      }

      // 3. Collect from web scraping (if implemented)
      if (options.includeScraping) {
        // results.scraping = await this.collectFromScraping();
      }

      return results;
    } catch (error) {
      console.error('Exhibition collection error:', error);
      throw error;
    }
  }

  // Naver Search API collection
  async collectFromNaver() {
    const results = { success: 0, failed: 0, exhibitions: [] };
    
    // Get active venues for searching
    const venues = await Venue.findAll({
      where: { 
        isActive: true,
        country: 'KR'
      },
      order: [['tier', 'ASC']]
    });

    for (const venue of venues) {
      try {
        const exhibitions = await this.searchNaverForVenue(venue);
        
        for (const exhibitionData of exhibitions) {
          try {
            const exhibition = await this.createOrUpdateExhibition(exhibitionData, venue);
            results.exhibitions.push(exhibition);
            results.success++;
          } catch (error) {
            console.error(`Failed to save exhibition: ${error.message}`);
            results.failed++;
          }
        }
        
        // Respect API rate limits
        await this.delay(100);
      } catch (error) {
        console.error(`Failed to search for venue ${venue.name}:`, error);
        results.failed++;
      }
    }

    return results;
  }

  // Search Naver for a specific venue
  async searchNaverForVenue(venue) {
    const exhibitions = [];
    const queries = this.generateSearchQueries(venue);

    for (const query of queries) {
      try {
        // Search blogs
        const blogResults = await this.searchNaverBlogs(query);
        const parsedBlogs = this.parseNaverResults(blogResults, 'blog');
        exhibitions.push(...parsedBlogs);

        // Search news
        const newsResults = await this.searchNaverNews(query);
        const parsedNews = this.parseNaverResults(newsResults, 'news');
        exhibitions.push(...parsedNews);

        await this.delay(50);
      } catch (error) {
        console.error(`Search failed for query "${query}":`, error);
      }
    }

    return this.deduplicateExhibitions(exhibitions);
  }

  // Generate search queries for a venue
  generateSearchQueries(venue) {
    const currentMonth = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    const queries = [
      `${venue.name} 현재전시`,
      `${venue.name} ${currentMonth} 전시`,
      `${venue.name} 전시 일정`,
      `${venue.name} 기획전`,
      `${venue.name} 특별전`
    ];

    // Add English queries for international exhibitions
    if (venue.nameEn) {
      queries.push(`${venue.nameEn} exhibition`);
    }

    return queries;
  }

  // Search Naver Blog API
  async searchNaverBlogs(query) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/search/blog', {
        headers: this.naverHeaders,
        params: {
          query: query,
          display: 20,
          sort: 'date'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Naver blog search error:', error);
      return { items: [] };
    }
  }

  // Search Naver News API
  async searchNaverNews(query) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/search/news', {
        headers: this.naverHeaders,
        params: {
          query: query,
          display: 10,
          sort: 'date'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Naver news search error:', error);
      return { items: [] };
    }
  }

  // Parse Naver search results
  parseNaverResults(searchResults, type) {
    const exhibitions = [];
    const patterns = {
      title: /\[(.*?)\]|「(.*?)」|"(.*?)"|'(.*?)'/,
      dateRange: /(\d{4})[.\s]?(\d{1,2})[.\s]?(\d{1,2})\s*[-~]\s*(\d{4})[.\s]?(\d{1,2})[.\s]?(\d{1,2})/,
      singleDate: /(\d{4})[.\s]?(\d{1,2})[.\s]?(\d{1,2})/g,
      artist: /작가[:\s]*(.*?)(?:\.|,|전시|展)/,
      admission: /(\d{1,2},?\d{3}원|무료|free)/i
    };

    searchResults.items?.forEach(item => {
      try {
        const content = this.stripHtml(item.description || item.title);
        
        // Extract exhibition title
        const titleMatch = content.match(patterns.title);
        const title = titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3] || titleMatch[4]) : null;
        
        if (!title) return;

        // Extract dates
        const dateMatch = content.match(patterns.dateRange);
        let startDate = null, endDate = null;
        
        if (dateMatch) {
          startDate = new Date(dateMatch[1], dateMatch[2] - 1, dateMatch[3]);
          endDate = new Date(dateMatch[4], dateMatch[5] - 1, dateMatch[6]);
        }

        // Skip if no valid dates or dates are in the past
        if (!startDate || !endDate || endDate < new Date()) return;

        // Extract artists
        const artistMatch = content.match(patterns.artist);
        const artistsText = artistMatch ? artistMatch[1].trim() : '';
        const artists = artistsText ? artistsText.split(/[,、]/).map(a => ({ name: a.trim() })) : [];

        // Extract admission fee
        const admissionMatch = content.match(patterns.admission);
        const admissionFee = admissionMatch ? 
          (admissionMatch[1].includes('무료') || admissionMatch[1].toLowerCase() === 'free' ? 0 : 
           parseInt(admissionMatch[1].replace(/[^\d]/g, ''))) : null;

        exhibitions.push({
          title,
          description: content.substring(0, 500),
          startDate,
          endDate,
          artists,
          admissionFee,
          source: `naver_${type}`,
          sourceUrl: item.link,
          postDate: type === 'blog' ? item.postdate : item.pubDate
        });
      } catch (error) {
        console.error('Error parsing item:', error);
      }
    });

    return exhibitions;
  }

  // Create or update exhibition in database
  async createOrUpdateExhibition(exhibitionData, venue) {
    // Check for existing exhibition
    const existingExhibition = await Exhibition.findOne({
      where: {
        title: exhibitionData.title,
        venueId: venue.id,
        startDate: exhibitionData.startDate
      }
    });

    if (existingExhibition) {
      // Update if new information
      return await existingExhibition.update({
        description: exhibitionData.description || existingExhibition.description,
        artists: exhibitionData.artists.length > 0 ? exhibitionData.artists : existingExhibition.artists,
        sourceUrl: exhibitionData.sourceUrl,
        verificationStatus: 'pending'
      });
    }

    // Create new exhibition
    return await Exhibition.create({
      ...exhibitionData,
      venueId: venue.id,
      venueName: venue.name,
      venueCity: venue.city,
      venueCountry: venue.country,
      verificationStatus: 'pending',
      status: this.determineStatus(exhibitionData.startDate, exhibitionData.endDate)
    });
  }

  // Determine exhibition status
  determineStatus(startDate, endDate) {
    const now = new Date();
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'ongoing';
  }

  // Remove duplicate exhibitions
  deduplicateExhibitions(exhibitions) {
    const seen = new Set();
    return exhibitions.filter(exhibition => {
      const key = `${exhibition.title}-${exhibition.startDate?.getTime()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Strip HTML tags
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  }

  // Delay helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Collect international exhibitions from art media sites
  async collectInternationalExhibitions() {
    const results = { success: 0, failed: 0, exhibitions: [] };
    
    // This would be implemented with puppeteer or playwright
    // for scraping international art media sites
    
    return results;
  }
}

module.exports = new ExhibitionCollectorService();