#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

class ExhibitionCollectorTest {
  constructor() {
    this.naverClientId = process.env.NAVER_CLIENT_ID;
    this.naverClientSecret = process.env.NAVER_CLIENT_SECRET;
    this.naverHeaders = {
      'X-Naver-Client-Id': this.naverClientId,
      'X-Naver-Client-Secret': this.naverClientSecret
    };
  }

  // Test venues
  testVenues = [
    { name: '국립현대미술관 서울관', city: '서울' },
    { name: '서울시립미술관', city: '서울' },
    { name: '리움미술관', city: '서울' },
    { name: '대림미술관', city: '서울' },
    { name: '아모레퍼시픽미술관', city: '서울' }
  ];

  async collectExhibitions() {
    console.log('🎨 Starting Exhibition Collection Test...\n');

    const allExhibitions = [];

    for (const venue of this.testVenues) {
      console.log(`\n📍 Searching for exhibitions at: ${venue.name}`);
      console.log('━'.repeat(50));

      try {
        const exhibitions = await this.searchNaverForVenue(venue);
        
        if (exhibitions.length > 0) {
          console.log(`✅ Found ${exhibitions.length} potential exhibitions:`);
          exhibitions.forEach((ex, index) => {
            console.log(`\n${index + 1}. ${ex.title}`);
            console.log(`   📅 ${this.formatDate(ex.startDate)} ~ ${this.formatDate(ex.endDate)}`);
            if (ex.artists.length > 0) {
              console.log(`   🎨 Artists: ${ex.artists.map(a => a.name).join(', ')}`);
            }
            console.log(`   💰 ${ex.admissionFee === 0 ? '무료' : `${ex.admissionFee}원`}`);
            console.log(`   🔗 ${ex.sourceUrl}`);
          });
          allExhibitions.push(...exhibitions);
        } else {
          console.log('❌ No exhibitions found');
        }

        // Rate limiting
        await this.delay(1000);
      } catch (error) {
        console.error(`❌ Error searching ${venue.name}:`, error.message);
      }
    }

    // Summary
    console.log('\n\n📊 Collection Summary');
    console.log('━'.repeat(50));
    console.log(`Total exhibitions found: ${allExhibitions.length}`);
    
    // Group by venue
    const byVenue = {};
    allExhibitions.forEach(ex => {
      if (!byVenue[ex.venueName]) byVenue[ex.venueName] = 0;
      byVenue[ex.venueName]++;
    });

    console.log('\nExhibitions by venue:');
    Object.entries(byVenue).forEach(([venue, count]) => {
      console.log(`  ${venue}: ${count}`);
    });

    // Save to JSON file for inspection
    const fs = require('fs').promises;
    const filename = `exhibition-collection-test-${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(filename, JSON.stringify(allExhibitions, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);

    return allExhibitions;
  }

  async searchNaverForVenue(venue) {
    const exhibitions = [];
    const queries = this.generateSearchQueries(venue);

    for (const query of queries) {
      try {
        // Search blogs
        const blogResults = await this.searchNaverBlogs(query);
        const parsedBlogs = this.parseNaverResults(blogResults, 'blog', venue);
        exhibitions.push(...parsedBlogs);

        await this.delay(100);
      } catch (error) {
        console.error(`  ⚠️ Search failed for query "${query}"`);
      }
    }

    return this.deduplicateExhibitions(exhibitions);
  }

  generateSearchQueries(venue) {
    const currentMonth = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    return [
      `${venue.name} 현재전시`,
      `${venue.name} ${currentMonth} 전시`,
      `${venue.name} 전시 일정`
    ];
  }

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
      return { items: [] };
    }
  }

  parseNaverResults(searchResults, type, venue) {
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
          venueName: venue.name,
          venueCity: venue.city,
          description: content.substring(0, 500),
          startDate,
          endDate,
          artists,
          admissionFee: admissionFee || 0,
          source: `naver_${type}`,
          sourceUrl: item.link,
          postDate: type === 'blog' ? item.postdate : item.pubDate
        });
      } catch (error) {
        // Skip invalid items
      }
    });

    return exhibitions;
  }

  deduplicateExhibitions(exhibitions) {
    const seen = new Set();
    return exhibitions.filter(exhibition => {
      const key = `${exhibition.title}-${exhibition.startDate?.getTime()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
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
  const collector = new ExhibitionCollectorTest();
  await collector.collectExhibitions();
}

main().catch(console.error);