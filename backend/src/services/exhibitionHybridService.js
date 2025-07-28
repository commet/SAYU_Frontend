const { hybridDB } = require('../config/hybridDatabase');
const { pool } = require('../config/database');
const { getSupabaseClient } = require('../config/supabase');

class ExhibitionHybridService {
  constructor() {
    this.railway = pool;
    this.supabase = getSupabaseClient();
  }

  /**
   * Save raw crawling data to Railway (temporary storage)
   */
  async saveRawData(crawlData) {
    const query = `
      INSERT INTO exhibition_raw_data (
        source, venue_name, raw_content, parsed_data, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `;

    const values = [
      crawlData.source,
      crawlData.venueName,
      crawlData.rawContent,
      JSON.stringify(crawlData.parsed)
    ];

    const result = await this.railway.query(query, values);
    return result.rows[0];
  }

  /**
   * Process and move verified exhibitions to Supabase
   */
  async processAndMoveToSupabase(exhibitionData) {
    if (!this.supabase) {
      // Fallback to Railway if Supabase not available
      return this.saveToRailway(exhibitionData);
    }

    try {
      // Insert to Supabase (user-facing data)
      const { data, error } = await this.supabase
        .from('exhibitions')
        .upsert({
          title: exhibitionData.title,
          title_en: exhibitionData.titleEn,
          venue_id: exhibitionData.venueId,
          venue_name: exhibitionData.venueName,
          venue_city: exhibitionData.venueCity,
          venue_country: exhibitionData.venueCountry || 'KR',
          start_date: exhibitionData.startDate,
          end_date: exhibitionData.endDate,
          artists: exhibitionData.artists || [],
          description: exhibitionData.description,
          admission_fee: exhibitionData.admissionFee || 0,
          source: exhibitionData.source,
          verification_status: 'verified',
          status: this.getExhibitionStatus(exhibitionData.startDate, exhibitionData.endDate),
          images: exhibitionData.images || [],
          poster_image: exhibitionData.posterImage,
          official_url: exhibitionData.officialUrl
        }, {
          onConflict: 'title,venue_id,start_date'
        });

      if (error) throw error;

      // Mark as processed in Railway
      if (exhibitionData.rawDataId) {
        await this.railway.query(
          'UPDATE exhibition_raw_data SET processing_status = $1 WHERE id = $2',
          ['completed', exhibitionData.rawDataId]
        );
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to save to Supabase:', error);
      // Fallback to Railway
      return this.saveToRailway(exhibitionData);
    }
  }

  /**
   * Fallback save to Railway
   */
  async saveToRailway(exhibitionData) {
    const query = `
      INSERT INTO exhibitions (
        title, venue_id, venue_name, venue_city, venue_country,
        start_date, end_date, artists, description, admission_fee,
        source, verification_status, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `;

    const values = [
      exhibitionData.title,
      exhibitionData.venueId,
      exhibitionData.venueName,
      exhibitionData.venueCity,
      exhibitionData.venueCountry || 'KR',
      exhibitionData.startDate,
      exhibitionData.endDate,
      JSON.stringify(exhibitionData.artists || []),
      exhibitionData.description,
      exhibitionData.admissionFee || 0,
      exhibitionData.source,
      'verified',
      this.getExhibitionStatus(exhibitionData.startDate, exhibitionData.endDate)
    ];

    const result = await this.railway.query(query, values);
    return { success: true, data: result.rows[0] };
  }

  /**
   * Get exhibitions from Supabase (user queries)
   */
  async getExhibitions(filters = {}) {
    // Try Supabase first
    if (this.supabase) {
      try {
        let query = this.supabase
          .from('exhibitions')
          .select(`
            *,
            venue:venues(name, address, city, type)
          `)
          .eq('verification_status', 'verified');

        // Apply filters
        if (filters.city) {
          query = query.eq('venue_city', filters.city);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.featured !== undefined) {
          query = query.eq('featured', filters.featured);
        }
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        // Date range
        if (filters.startDate) {
          query = query.gte('start_date', filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte('start_date', filters.endDate);
        }

        // Ordering and pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = (page - 1) * limit;

        query = query
          .order('featured', { ascending: false })
          .order('start_date', { ascending: true })
          .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          exhibitions: data,
          pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil(count / limit)
          }
        };
      } catch (error) {
        console.error('Supabase query failed, falling back to Railway:', error);
      }
    }

    // Fallback to Railway
    return this.getExhibitionsFromRailway(filters);
  }

  /**
   * Railway fallback for getting exhibitions
   */
  async getExhibitionsFromRailway(filters) {
    // Implementation using Railway PostgreSQL
    // (Use the existing exhibitionModel.js logic)
  }

  /**
   * Daily sync job - move processed data from Railway to Supabase
   */
  async dailySync() {
    if (!this.supabase) {
      console.log('Supabase not configured, skipping sync');
      return;
    }

    try {
      // Get unprocessed exhibitions from Railway
      const { rows } = await this.railway.query(`
        SELECT * FROM exhibition_raw_data 
        WHERE processing_status = 'parsed' 
        AND created_at > NOW() - INTERVAL '48 hours'
        ORDER BY created_at ASC
        LIMIT 100
      `);

      console.log(`Found ${rows.length} exhibitions to sync`);

      for (const row of rows) {
        try {
          const exhibitionData = {
            ...row.parsed_data,
            rawDataId: row.id
          };

          await this.processAndMoveToSupabase(exhibitionData);
          console.log(`Synced exhibition: ${exhibitionData.title}`);
        } catch (error) {
          console.error(`Failed to sync exhibition ${row.id}:`, error);
        }
      }

      // Clean up old Railway data
      await this.cleanupOldData();

      return { synced: rows.length };
    } catch (error) {
      console.error('Daily sync failed:', error);
      throw error;
    }
  }

  /**
   * Clean up old processed data from Railway
   */
  async cleanupOldData() {
    const result = await this.railway.query(`
      DELETE FROM exhibition_raw_data 
      WHERE processing_status = 'completed' 
      AND created_at < NOW() - INTERVAL '7 days'
    `);

    console.log(`Cleaned up ${result.rowCount} old records`);
  }

  /**
   * Determine exhibition status based on dates
   */
  getExhibitionStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }

  /**
   * Save user submission (directly to Supabase)
   */
  async saveUserSubmission(submissionData, userId) {
    if (!this.supabase) {
      // Fallback to Railway
      return this.saveSubmissionToRailway(submissionData, userId);
    }

    try {
      const { data, error } = await this.supabase
        .from('exhibition_submissions')
        .insert({
          user_id: userId,
          exhibition_data: submissionData,
          status: 'pending',
          created_at: new Date()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Failed to save submission to Supabase:', error);
      return this.saveSubmissionToRailway(submissionData, userId);
    }
  }

  /**
   * Railway fallback for submissions
   */
  async saveSubmissionToRailway(submissionData, userId) {
    // Implementation for Railway
  }
}

module.exports = new ExhibitionHybridService();
