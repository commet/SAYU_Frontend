#!/usr/bin/env node
/**
 * SAYU Exhibition Data Collection Quick Start
 * 
 * This script provides an immediate way to start collecting exhibition data
 * using existing infrastructure and free APIs.
 */

require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY is required in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class QuickStartExhibitionCollector {
  constructor() {
    this.stats = {
      total_collected: 0,
      successful_saves: 0,
      errors: 0,
      sources_attempted: 0,
      sources_successful: 0
    };
    
    this.collectors = [
      {
        name: 'Seoul Open Data',
        method: this.collectSeoulOpenData.bind(this),
        priority: 1,
        requires_api_key: true,
        api_key_env: 'SEOUL_API_KEY',
        free: true
      },
      {
        name: 'Culture Data Portal',
        method: this.collectCulturePortal.bind(this),
        priority: 1,
        requires_api_key: true,
        api_key_env: 'CULTURE_API_KEY',
        free: true
      },
      {
        name: 'Naver API',
        method: this.collectNaverAPI.bind(this),
        priority: 2,
        requires_api_key: true,
        api_key_env: ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET'],
        free: true,
        quota: 25000
      },
      {
        name: 'MMCA Crawler',
        method: this.crawlMMCA.bind(this),
        priority: 2,
        requires_api_key: false,
        free: true
      },
      {
        name: 'SEMA Crawler',
        method: this.crawlSEMA.bind(this),
        priority: 2,
        requires_api_key: false,
        free: true
      }
    ];
  }

  async run() {
    console.log('🎨 SAYU Exhibition Data Collection - Quick Start\n');
    console.log('=' .repeat(60));
    
    // Check prerequisites
    await this.checkPrerequisites();
    
    // Run available collectors
    for (const collector of this.collectors) {
      this.stats.sources_attempted++;
      
      try {
        console.log(`\n🔄 Starting: ${collector.name}`);
        
        // Check API key requirements
        if (collector.requires_api_key && !this.checkAPIKey(collector)) {
          console.log(`⚠️  Skipping ${collector.name} - API key not found`);
          continue;
        }
        
        const results = await collector.method();
        
        if (results && results.length > 0) {
          console.log(`✅ ${collector.name}: ${results.length} exhibitions found`);
          
          const saved = await this.saveExhibitions(results, collector.name);
          console.log(`💾 Saved: ${saved} exhibitions`);
          
          this.stats.total_collected += results.length;
          this.stats.successful_saves += saved;
          this.stats.sources_successful++;
        } else {
          console.log(`⚪ ${collector.name}: No new exhibitions found`);
        }
        
      } catch (error) {
        console.error(`❌ ${collector.name} failed:`, error.message);
        this.stats.errors++;
      }
      
      // Respectful delay between sources
      await this.delay(2000);
    }
    
    // Generate report
    await this.generateReport();
    
    console.log('\n✨ Quick start collection completed!');
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...\n');
    
    // Check database connection
    try {
      const { data, error } = await supabase
        .from('exhibitions')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error && !error.message.includes('relation "exhibitions" does not exist')) {
        throw error;
      }
      
      console.log('✅ Database connection: OK');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('Please check your SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
      process.exit(1);
    }
    
    // Check tables exist
    try {
      const { data: exhibitions, error: exError } = await supabase
        .from('exhibitions')
        .select('count(*)', { count: 'exact', head: true });
      
      const { data: venues, error: vError } = await supabase
        .from('venues')
        .select('count(*)', { count: 'exact', head: true });
      
      if (exError?.message.includes('relation "exhibitions" does not exist') || 
          vError?.message.includes('relation "venues" does not exist')) {
        console.log('⚠️  Required tables missing. Please create them in Supabase dashboard');
        console.log('   → Create "exhibitions" and "venues" tables first');
        console.log('   → Or run the SQL scripts to create the tables');
        await this.createBasicTables();
      } else {
        console.log('✅ Database tables: OK');
      }
    } catch (error) {
      console.error('❌ Table check failed:', error.message);
    }
    
    // Check API keys
    const apiChecks = [
      { name: 'Seoul Open Data', key: 'SEOUL_API_KEY', url: 'https://data.seoul.go.kr' },
      { name: 'Culture Portal', key: 'CULTURE_API_KEY', url: 'https://www.culture.go.kr/data' },
      { name: 'Naver API', key: 'NAVER_CLIENT_ID', url: 'https://developers.naver.com' }
    ];
    
    console.log('\n🔑 API Key Status:');
    for (const check of apiChecks) {
      const hasKey = Boolean(process.env[check.key]);
      console.log(`   ${hasKey ? '✅' : '❌'} ${check.name}: ${hasKey ? 'Configured' : 'Missing'}`);
      if (!hasKey) {
        console.log(`      → Get your key at: ${check.url}`);
      }
    }
  }

  checkAPIKey(collector) {
    if (Array.isArray(collector.api_key_env)) {
      return collector.api_key_env.every(key => Boolean(process.env[key]));
    } else {
      return Boolean(process.env[collector.api_key_env]);
    }
  }

  async createBasicTables() {
    console.log('\n📋 SQL for creating tables (run in Supabase SQL editor):');
    console.log('=' .repeat(60));
    
    const createVenuesTable = `
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'KR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
    
    const createExhibitionsTable = `
CREATE TABLE IF NOT EXISTS exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  venue_name VARCHAR(255) NOT NULL,
  venue_city VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  admission_fee VARCHAR(100),
  official_url VARCHAR(500),
  source VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
    
    console.log(createVenuesTable);
    console.log('\n');
    console.log(createExhibitionsTable);
    console.log('\n' + '=' .repeat(60));
    console.log('⚠️  Please create these tables in your Supabase dashboard first');
    console.log('   → Go to: https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst/editor');
    console.log('   → Run the SQL above in the SQL Editor');
    console.log('   → Then restart this script');
    
    // Save SQL to file for convenience
    const sqlPath = path.join(__dirname, 'exhibition-tables-setup.sql');
    await fs.promises.writeFile(sqlPath, `${createVenuesTable}\n\n${createExhibitionsTable}`);
    console.log(`📄 SQL saved to: ${sqlPath}`);
    
    process.exit(0);
  }

  // Data Collection Methods

  async collectSeoulOpenData() {
    if (!process.env.SEOUL_API_KEY) return [];
    
    try {
      const response = await axios.get(
        `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_API_KEY}/json/SebcExhibitInfo/1/100/`,
        { timeout: 30000 }
      );
      
      const items = response.data?.SebcExhibitInfo?.row || [];
      
      return items.map(item => ({
        title: item.TITLE || '제목 없음',
        venue_name: item.PLACE || '장소 미정',
        venue_city: '서울',
        start_date: this.formatDate(item.START_DATE),
        end_date: this.formatDate(item.END_DATE),
        description: item.CONTENT || null,
        admission_fee: item.FEE || '정보 없음',
        official_url: item.URL || null,
        source: 'seoul_open_data',
        status: this.determineStatus(item.START_DATE, item.END_DATE)
      }));
      
    } catch (error) {
      console.error('Seoul Open Data API error:', error.message);
      return [];
    }
  }

  async collectCulturePortal() {
    if (!process.env.CULTURE_API_KEY) return [];
    
    try {
      const response = await axios.get(
        'https://www.culture.go.kr/openapi/rest/publicperformancedisplays/period',
        {
          params: {
            serviceKey: process.env.CULTURE_API_KEY,
            rows: 100,
            cPage: 1,
            realmCode: 'A' // Art exhibitions
          },
          timeout: 30000
        }
      );
      
      // Handle both XML and JSON responses
      let items = [];
      if (response.data?.response?.body?.items?.item) {
        items = Array.isArray(response.data.response.body.items.item) 
          ? response.data.response.body.items.item 
          : [response.data.response.body.items.item];
      }
      
      return items.map(item => ({
        title: item.title || '제목 없음',
        venue_name: item.place || '장소 미정',
        venue_city: item.area || '정보 없음',
        start_date: this.formatDate(item.startDate),
        end_date: this.formatDate(item.endDate),
        description: item.contents || null,
        admission_fee: item.price || '정보 없음',
        official_url: item.url || null,
        source: 'culture_portal',
        status: this.determineStatus(item.startDate, item.endDate)
      }));
      
    } catch (error) {
      console.error('Culture Portal API error:', error.message);
      return [];
    }
  }

  async collectNaverAPI() {
    if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) return [];
    
    const exhibitions = [];
    const queries = ['전시회 서울', '미술관 전시', '갤러리 전시'];
    
    try {
      for (const query of queries) {
        const response = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
          params: {
            query,
            display: 20,
            sort: 'date'
          },
          headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
          },
          timeout: 15000
        });
        
        const items = response.data?.items || [];
        
        for (const item of items) {
          const parsed = this.parseNaverItem(item);
          if (parsed) {
            exhibitions.push(parsed);
          }
        }
        
        // Rate limiting
        await this.delay(1000);
      }
      
    } catch (error) {
      console.error('Naver API error:', error.message);
    }
    
    return exhibitions;
  }

  parseNaverItem(item) {
    const text = this.stripHtml(`${item.title} ${item.description}`);
    
    // Extract exhibition title
    const titleMatch = text.match(/『(.+?)』|「(.+?)」|<(.+?)>|\[(.+?)\]/);
    if (!titleMatch) return null;
    
    const title = (titleMatch[1] || titleMatch[2] || titleMatch[3] || titleMatch[4] || '').trim();
    if (!title || title.length < 3) return null;
    
    // Extract dates
    const dateMatch = text.match(/(\d{4})[.\s년]\s*(\d{1,2})[.\s월]\s*(\d{1,2})/);
    if (!dateMatch) return null;
    
    const startDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    
    // Extract venue
    const venueMatch = text.match(/(미술관|갤러리|전시관|문화회관|아트센터|박물관)/);
    const venue = venueMatch ? text.substring(Math.max(0, venueMatch.index - 20), venueMatch.index + venueMatch[0].length + 10).trim() : '장소 미정';
    
    return {
      title,
      venue_name: venue,
      venue_city: '서울', // Default to Seoul for Naver results
      start_date: startDate,
      end_date: startDate, // Use same date if end date not found
      description: item.description.substring(0, 300),
      official_url: item.link,
      source: 'naver_api',
      status: 'unknown'
    };
  }

  async crawlMMCA() {
    // Simplified MMCA crawler
    console.log('⚠️  MMCA crawler not implemented in quick start');
    console.log('   → This would require Puppeteer for full implementation');
    return [];
  }

  async crawlSEMA() {
    // Simplified SEMA crawler
    console.log('⚠️  SEMA crawler not implemented in quick start');
    console.log('   → This would require Puppeteer for full implementation');
    return [];
  }

  // Utility Methods

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  }

  formatDate(dateStr) {
    if (!dateStr) return null;
    
    // Handle YYYYMMDD format
    if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
      return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
    }
    
    // Handle YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      return dateStr.split(' ')[0]; // Remove time part
    }
    
    return null;
  }

  determineStatus(startDate, endDate) {
    if (!startDate || !endDate) return 'unknown';
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }

  async saveExhibitions(exhibitions, source) {
    let saved = 0;
    
    for (const exhibition of exhibitions) {
      try {
        // Check for duplicates
        const { data: existing, error: checkError } = await supabase
          .from('exhibitions')
          .select('id')
          .eq('title', exhibition.title)
          .eq('venue_name', exhibition.venue_name)
          .eq('start_date', exhibition.start_date);
        
        if (checkError) {
          console.error(`Error checking for duplicates: ${checkError.message}`);
          continue;
        }
        
        if (existing.length === 0 && exhibition.start_date && exhibition.end_date) {
          const { error: insertError } = await supabase
            .from('exhibitions')
            .insert({
              title: exhibition.title,
              venue_name: exhibition.venue_name,
              venue_city: exhibition.venue_city || 'Unknown',
              start_date: exhibition.start_date,
              end_date: exhibition.end_date,
              description: exhibition.description?.substring(0, 1000),
              admission_fee: exhibition.admission_fee,
              official_url: exhibition.official_url,
              source: exhibition.source || source.toLowerCase().replace(/\s+/g, '_'),
              status: exhibition.status || 'unknown'
            });
          
          if (insertError) {
            console.error(`Failed to insert exhibition "${exhibition.title}":`, insertError.message);
          } else {
            saved++;
          }
        }
      } catch (error) {
        console.error(`Failed to save exhibition "${exhibition.title}":`, error.message);
      }
    }
    
    return saved;
  }

  async generateReport() {
    console.log('\n📊 Collection Summary');
    console.log('=' .repeat(40));
    console.log(`Sources attempted: ${this.stats.sources_attempted}`);
    console.log(`Sources successful: ${this.stats.sources_successful}`);
    console.log(`Total exhibitions found: ${this.stats.total_collected}`);
    console.log(`Successfully saved: ${this.stats.successful_saves}`);
    console.log(`Errors: ${this.stats.errors}`);
    
    // Database stats
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from('exhibitions')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) {
        console.log('⚠️  Could not get total count from database');
      } else {
        console.log(`\n📈 Database Status:`);
        console.log(`Total exhibitions in DB: ${totalCount}`);
      }
      
      // Today's additions
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: todayError } = await supabase
        .from('exhibitions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);
      
      if (!todayError) {
        console.log(`Added today: ${todayCount}`);
      }
      
      // Status breakdown
      const { data: statusData, error: statusError } = await supabase
        .from('exhibitions')
        .select('status, count(*)', { count: 'exact' })
        .order('count', { ascending: false });
      
      if (!statusError && statusData) {
        console.log(`\n🎯 Exhibition Status:`);
        statusData.forEach(row => {
          console.log(`   ${row.status}: ${row.count}`);
        });
      }
      
    } catch (error) {
      console.error('Failed to generate database stats:', error.message);
    }
    
    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      next_steps: [
        'Configure missing API keys for better coverage',
        'Implement web crawlers for major museums',
        'Set up automated scheduling with cron jobs',
        'Add data validation and quality checks'
      ]
    };
    
    const reportPath = path.join(__dirname, 'collection_results', `quick_start_report_${Date.now()}.json`);
    await fs.promises.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.promises.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if called directly
if (require.main === module) {
  const collector = new QuickStartExhibitionCollector();
  collector.run()
    .then(() => {
      console.log('\n🎉 Quick start completed successfully!');
      console.log('\nNext Steps:');
      console.log('1. Configure API keys in .env file');
      console.log('2. Run: npm run collect:full');
      console.log('3. Set up automated scheduling');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Quick start failed:', error);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}

module.exports = QuickStartExhibitionCollector;