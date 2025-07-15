#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

class ImprovedExhibitionCollector {
  constructor() {
    this.naverClientId = process.env.NAVER_CLIENT_ID;
    this.naverClientSecret = process.env.NAVER_CLIENT_SECRET;
    this.naverHeaders = {
      'X-Naver-Client-Id': this.naverClientId,
      'X-Naver-Client-Secret': this.naverClientSecret
    };
  }

  // Test venues with more flexible search
  testVenues = [
    { name: '국립현대미술관', searchName: 'MMCA', city: '서울' },
    { name: '서울시립미술관', searchName: 'SeMA', city: '서울' },
    { name: '리움미술관', searchName: '리움', city: '서울' },
    { name: '대림미술관', searchName: '대림미술관', city: '서울' },
    { name: '아모레퍼시픽미술관', searchName: 'APMA', city: '서울' }
  ];

  async collectExhibitions() {
    console.log('🎨 Improved Exhibition Collection Test...\n');

    const allExhibitions = [];
    const allRawResults = [];

    for (const venue of this.testVenues) {
      console.log(`\n📍 Searching for exhibitions at: ${venue.name}`);
      console.log('━'.repeat(60));

      try {
        const results = await this.searchNaverForVenue(venue);
        
        console.log(`📰 Found ${results.rawResults.length} search results`);
        
        // Show sample raw results for debugging
        if (results.rawResults.length > 0) {
          console.log('\n🔍 Sample search results:');
          results.rawResults.slice(0, 3).forEach((item, idx) => {
            console.log(`\n${idx + 1}. ${item.title}`);
            console.log(`   📝 ${item.description.substring(0, 150)}...`);
          });
        }

        if (results.exhibitions.length > 0) {
          console.log(`\n✅ Parsed ${results.exhibitions.length} exhibitions:`);
          results.exhibitions.forEach((ex, index) => {
            console.log(`\n${index + 1}. ${ex.title}`);
            if (ex.startDate) {
              console.log(`   📅 ${this.formatDate(ex.startDate)} ~ ${this.formatDate(ex.endDate)}`);
            }
            if (ex.artists.length > 0) {
              console.log(`   🎨 Artists: ${ex.artists.map(a => a.name).join(', ')}`);
            }
            if (ex.admissionFee !== undefined) {
              console.log(`   💰 ${ex.admissionFee === 0 ? '무료' : `${ex.admissionFee.toLocaleString()}원`}`);
            }
          });
          allExhibitions.push(...results.exhibitions);
        } else {
          console.log('\n⚠️ No structured exhibitions found, but here are potential matches:');
          
          // Show potential exhibitions even if parsing failed
          results.potentialExhibitions.slice(0, 5).forEach((item, idx) => {
            console.log(`\n${idx + 1}. ${item.title}`);
            console.log(`   🔗 ${item.link}`);
          });
        }

        allRawResults.push(...results.rawResults);

        // Rate limiting
        await this.delay(1000);
      } catch (error) {
        console.error(`❌ Error searching ${venue.name}:`, error.message);
      }
    }

    // Summary
    console.log('\n\n📊 Collection Summary');
    console.log('━'.repeat(60));
    console.log(`Total search results analyzed: ${allRawResults.length}`);
    console.log(`Structured exhibitions found: ${allExhibitions.length}`);
    
    // Save results
    const fs = require('fs').promises;
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    // Save structured exhibitions
    const exhibitionsFile = `exhibitions-${timestamp}.json`;
    await fs.writeFile(exhibitionsFile, JSON.stringify(allExhibitions, null, 2));
    console.log(`\n💾 Exhibitions saved to: ${exhibitionsFile}`);
    
    // Save raw results for analysis
    const rawFile = `raw-results-${timestamp}.json`;
    await fs.writeFile(rawFile, JSON.stringify(allRawResults, null, 2));
    console.log(`💾 Raw results saved to: ${rawFile}`);

    return { exhibitions: allExhibitions, rawResults: allRawResults };
  }

  async searchNaverForVenue(venue) {
    const exhibitions = [];
    const rawResults = [];
    const potentialExhibitions = [];
    
    // More varied search queries
    const queries = [
      `${venue.name} 전시`,
      `${venue.searchName} exhibition`,
      `${venue.name} 2024 2025`,
      `${venue.searchName} 현재 전시중`
    ];

    for (const query of queries) {
      try {
        console.log(`   🔎 Searching: "${query}"`);
        
        // Search blogs
        const blogResults = await this.searchNaverBlogs(query);
        rawResults.push(...(blogResults.items || []));
        
        // Parse exhibitions with flexible patterns
        const parsed = this.parseNaverResults(blogResults, 'blog', venue);
        exhibitions.push(...parsed.exhibitions);
        potentialExhibitions.push(...parsed.potential);

        await this.delay(200);
      } catch (error) {
        console.error(`   ⚠️ Search failed for query "${query}"`);
      }
    }

    return {
      exhibitions: this.deduplicateExhibitions(exhibitions),
      rawResults,
      potentialExhibitions: this.deduplicatePotential(potentialExhibitions)
    };
  }

  async searchNaverBlogs(query) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/search/blog', {
        headers: this.naverHeaders,
        params: {
          query: query,
          display: 30,
          sort: 'date'
        }
      });
      return response.data;
    } catch (error) {
      return { items: [] };
    }
  }

  parseNaverResults(searchResults, type, venue) {
    const exhibitions = [];
    const potential = [];
    
    // More flexible patterns
    const patterns = {
      // Various title formats
      titleBrackets: /\[(.*?)\]/g,
      titleQuotes: /[「"'](.*?)[」"']/g,
      titleColon: /전시[:\s]*(.*?)(?:\.|,|$)/i,
      
      // Date patterns - more flexible
      dateRange: /(\d{4})[년.\s]*(\d{1,2})[월.\s]*(\d{1,2})[일]?\s*[-~]\s*(?:(\d{4})[년.\s]*)?(\d{1,2})[월.\s]*(\d{1,2})[일]?/,
      dateUntil: /~\s*(\d{4})[년.\s]*(\d{1,2})[월.\s]*(\d{1,2})[일]?/,
      yearMonth: /(\d{4})[년.\s]*(\d{1,2})월/,
      
      // Artist patterns
      artist: /(?:작가|작품|artist)[:\s]*(.*?)(?:\.|,|전시|$)/i,
      
      // Admission patterns
      admission: /(?:입장료|관람료|admission)[:\s]*(\d{1,2},?\d{3}원|무료|free)/i,
      freeAdmission: /무료\s*(?:입장|관람|전시)/i
    };

    searchResults.items?.forEach(item => {
      try {
        const content = this.stripHtml(item.description);
        const fullText = this.stripHtml(item.title + ' ' + item.description);
        
        // Check if this might be exhibition-related
        const exhibitionKeywords = ['전시', '展', 'exhibition', '개인전', '특별전', '기획전'];
        const hasExhibitionKeyword = exhibitionKeywords.some(keyword => 
          fullText.toLowerCase().includes(keyword)
        );

        if (!hasExhibitionKeyword) return;

        // Try to extract structured data
        let title = null;
        let startDate = null;
        let endDate = null;

        // Extract title - try multiple patterns
        const titleMatches = [
          ...Array.from(fullText.matchAll(patterns.titleBrackets)),
          ...Array.from(fullText.matchAll(patterns.titleQuotes))
        ];
        
        if (titleMatches.length > 0) {
          title = titleMatches[0][1];
        } else {
          // Use the blog title as fallback
          title = this.stripHtml(item.title)
            .replace(/\s*\|.*$/, '') // Remove site names
            .replace(/^\s*\[.*?\]\s*/, ''); // Remove prefixes
        }

        // Extract dates
        const dateMatch = fullText.match(patterns.dateRange);
        if (dateMatch) {
          const year1 = parseInt(dateMatch[1]);
          const month1 = parseInt(dateMatch[2]);
          const day1 = parseInt(dateMatch[3]);
          const year2 = dateMatch[4] ? parseInt(dateMatch[4]) : year1;
          const month2 = parseInt(dateMatch[5]);
          const day2 = parseInt(dateMatch[6]);
          
          startDate = new Date(year1, month1 - 1, day1);
          endDate = new Date(year2, month2 - 1, day2);
          
          // Validate dates
          if (endDate < startDate || endDate < new Date()) {
            startDate = null;
            endDate = null;
          }
        }

        // Extract artists
        const artistMatch = fullText.match(patterns.artist);
        const artists = artistMatch 
          ? artistMatch[1].split(/[,、&]/).map(a => ({ name: a.trim() })).filter(a => a.name)
          : [];

        // Extract admission
        let admissionFee = undefined;
        if (patterns.freeAdmission.test(fullText)) {
          admissionFee = 0;
        } else {
          const admissionMatch = fullText.match(patterns.admission);
          if (admissionMatch) {
            admissionFee = admissionMatch[1].includes('무료') ? 0 : 
              parseInt(admissionMatch[1].replace(/[^\d]/g, '')) || undefined;
          }
        }

        // If we have at least a title, save it
        if (title && title.length > 2) {
          if (startDate && endDate) {
            // Full exhibition data
            exhibitions.push({
              title,
              venueName: venue.name,
              venueCity: venue.city,
              description: content.substring(0, 500),
              startDate,
              endDate,
              artists,
              admissionFee,
              source: `naver_${type}`,
              sourceUrl: item.link,
              blogName: item.bloggername,
              postDate: item.postdate
            });
          } else {
            // Potential exhibition without dates
            potential.push({
              title,
              venueName: venue.name,
              description: content.substring(0, 200),
              link: item.link,
              blogName: item.bloggername,
              postDate: item.postdate
            });
          }
        }
      } catch (error) {
        // Skip invalid items
      }
    });

    return { exhibitions, potential };
  }

  deduplicateExhibitions(exhibitions) {
    const seen = new Set();
    return exhibitions.filter(exhibition => {
      const key = `${exhibition.title}-${exhibition.venueName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  deduplicatePotential(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  formatDate(date) {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('ko-KR');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run test
async function main() {
  const collector = new ImprovedExhibitionCollector();
  await collector.collectExhibitions();
}

main().catch(console.error);