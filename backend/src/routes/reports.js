const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { 
  validationSchemas, 
  handleValidationResult, 
  securityHeaders, 
  requestSizeLimiter,
  sanitizeInput,
  rateLimits 
} = require('../middleware/validation');
const { pool } = require('../config/database');
const { log } = require('../config/logger');
const { openai } = require('../services/openai');

// Apply security middleware
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('2mb'));
router.use(authMiddleware);

// Generate personalized exhibition report
router.post('/exhibition/:exhibitionId',
  rateLimits.strict,
  async (req, res) => {
    try {
      const userId = req.userId;
      const exhibitionId = req.params.exhibitionId;

      // Get exhibition with artworks
      const exhibitionResult = await pool.query(`
        SELECT 
          e.*,
          u.nickname as user_nickname,
          p.type_code,
          p.archetype_name,
          p.emotional_tags
        FROM user_exhibitions e
        JOIN users u ON e.user_id = u.id
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE e.id = $1 AND e.user_id = $2
      `, [exhibitionId, userId]);

      if (exhibitionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Exhibition not found' });
      }

      const exhibition = exhibitionResult.rows[0];

      // Get artworks for this exhibition
      const artworksResult = await pool.query(`
        SELECT * FROM user_artwork_entries 
        WHERE exhibition_id = $1 
        ORDER BY created_at
      `, [exhibitionId]);

      const artworks = artworksResult.rows;

      if (artworks.length === 0) {
        return res.status(400).json({ error: 'No artworks found for this exhibition' });
      }

      // Generate AI report
      const report = await generateExhibitionReport(exhibition, artworks);

      // Save report
      const reportResult = await pool.query(`
        INSERT INTO exhibition_reports (
          exhibition_id, user_id, report_content, generated_at
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING id, generated_at
      `, [exhibitionId, userId, JSON.stringify(report)]);

      log.userAction(userId, 'exhibition_report_generated', {
        exhibition_id: exhibitionId,
        report_id: reportResult.rows[0].id,
        artwork_count: artworks.length
      });

      res.json({
        message: 'Exhibition report generated successfully',
        report: {
          id: reportResult.rows[0].id,
          exhibition_id: exhibitionId,
          generated_at: reportResult.rows[0].generated_at,
          ...report
        }
      });

    } catch (error) {
      log.error('Generate exhibition report error', error, {
        userId: req.userId,
        exhibitionId: req.params.exhibitionId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to generate exhibition report' });
    }
  }
);

// Get user's exhibition reports
router.get('/exhibition',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const offset = parseInt(req.query.offset) || 0;

      const result = await pool.query(`
        SELECT 
          r.id as report_id,
          r.generated_at,
          r.report_content,
          e.exhibition_name,
          e.venue,
          e.visit_date,
          COUNT(a.id) as artwork_count
        FROM exhibition_reports r
        JOIN user_exhibitions e ON r.exhibition_id = e.id
        LEFT JOIN user_artwork_entries a ON e.id = a.exhibition_id
        WHERE r.user_id = $1
        GROUP BY r.id, e.id
        ORDER BY r.generated_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      const reports = result.rows.map(row => ({
        id: row.report_id,
        exhibition_name: row.exhibition_name,
        venue: row.venue,
        visit_date: row.visit_date,
        artwork_count: parseInt(row.artwork_count),
        generated_at: row.generated_at,
        report_content: JSON.parse(row.report_content || '{}')
      }));

      res.json({
        reports,
        total: reports.length,
        has_more: reports.length === limit
      });

    } catch (error) {
      log.error('Get exhibition reports error', error, {
        userId: req.userId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch exhibition reports' });
    }
  }
);

// Get specific exhibition report
router.get('/exhibition/:reportId',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      const reportId = req.params.reportId;

      const result = await pool.query(`
        SELECT 
          r.*,
          e.exhibition_name,
          e.venue,
          e.visit_date,
          e.overall_impression,
          e.mood_tags
        FROM exhibition_reports r
        JOIN user_exhibitions e ON r.exhibition_id = e.id
        WHERE r.id = $1 AND r.user_id = $2
      `, [reportId, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const report = result.rows[0];

      res.json({
        report: {
          ...report,
          report_content: JSON.parse(report.report_content || '{}'),
          mood_tags: report.mood_tags || []
        }
      });

    } catch (error) {
      log.error('Get exhibition report error', error, {
        userId: req.userId,
        reportId: req.params.reportId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch exhibition report' });
    }
  }
);

// Generate AI exhibition report
async function generateExhibitionReport(exhibition, artworks) {
  const userProfile = {
    typeCode: exhibition.type_code,
    archetypeName: exhibition.archetype_name,
    emotionalTags: exhibition.emotional_tags || []
  };

  // Calculate visit analytics
  const avgEmotionRating = artworks.reduce((sum, a) => sum + a.emotion_rating, 0) / artworks.length;
  const avgTechnicalRating = artworks.reduce((sum, a) => sum + a.technical_rating, 0) / artworks.length;
  
  const topArtworks = artworks
    .sort((a, b) => (b.emotion_rating + b.technical_rating) - (a.emotion_rating + a.technical_rating))
    .slice(0, 3);

  const artistFrequency = artworks.reduce((acc, artwork) => {
    acc[artwork.artist] = (acc[artwork.artist] || 0) + 1;
    return acc;
  }, {});

  const favoriteArtists = Object.entries(artistFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([artist, count]) => ({ artist, count }));

  const prompt = `Generate a personalized exhibition report for a user with aesthetic personality type "${userProfile.archetypeName}" (${userProfile.typeCode}).

Exhibition Details:
- Name: ${exhibition.exhibition_name}
- Venue: ${exhibition.venue}
- Date: ${exhibition.visit_date}
- Overall Impression: ${exhibition.overall_impression || 'Not provided'}

User's Aesthetic Profile:
- Type: ${userProfile.archetypeName}
- Emotional Tags: ${userProfile.emotionalTags.join(', ')}

Visit Analytics:
- Artworks Viewed: ${artworks.length}
- Average Emotional Impact: ${avgEmotionRating.toFixed(1)}/5
- Average Technical Appreciation: ${avgTechnicalRating.toFixed(1)}/5

Top 3 Most Impactful Artworks:
${topArtworks.map((artwork, index) => 
  `${index + 1}. "${artwork.title}" by ${artwork.artist}
     User's impression: "${artwork.impression}"
     Emotional Impact: ${artwork.emotion_rating}/5, Technical: ${artwork.technical_rating}/5`
).join('\n')}

Favorite Artists (by frequency):
${favoriteArtists.map(({artist, count}) => `- ${artist} (${count} artwork${count > 1 ? 's' : ''})`).join('\n')}

Please generate a comprehensive, personalized exhibition report that includes:

1. **Executive Summary**: A 2-3 sentence overview of the visit
2. **Personal Aesthetic Journey**: How this exhibition aligned with or challenged their aesthetic preferences
3. **Standout Moments**: Analysis of their top-rated artworks and what resonated
4. **Artistic Discoveries**: New artists, techniques, or styles they encountered
5. **Emotional Journey**: How their feelings evolved throughout the visit
6. **Future Recommendations**: Suggested exhibitions, artists, or museums based on their reactions
7. **Reflection Questions**: 2-3 thoughtful questions for deeper contemplation

Make it personal, insightful, and tailored to their ${userProfile.archetypeName} aesthetic personality. Use a warm, encouraging tone that validates their artistic experience and encourages further exploration.

Format as JSON with these sections: summary, aesthetic_journey, standout_moments, discoveries, emotional_journey, recommendations, reflection_questions.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert art curator and therapist who specializes in personalized aesthetic analysis. Generate thoughtful, insightful exhibition reports that help users understand their artistic journey and growth.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const reportContent = completion.choices[0].message.content;
    
    try {
      const report = JSON.parse(reportContent);
      return {
        ...report,
        analytics: {
          artworks_viewed: artworks.length,
          avg_emotion_rating: avgEmotionRating,
          avg_technical_rating: avgTechnicalRating,
          top_artworks: topArtworks.map(a => ({
            title: a.title,
            artist: a.artist,
            emotion_rating: a.emotion_rating,
            technical_rating: a.technical_rating
          })),
          favorite_artists: favoriteArtists
        },
        metadata: {
          generated_at: new Date().toISOString(),
          user_type: userProfile.typeCode,
          archetype: userProfile.archetypeName
        }
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        summary: reportContent,
        analytics: {
          artworks_viewed: artworks.length,
          avg_emotion_rating: avgEmotionRating,
          avg_technical_rating: avgTechnicalRating
        },
        metadata: {
          generated_at: new Date().toISOString(),
          user_type: userProfile.typeCode,
          archetype: userProfile.archetypeName
        }
      };
    }
  } catch (aiError) {
    console.error('OpenAI API error:', aiError);
    
    // Fallback report if AI fails
    return {
      summary: `Your visit to ${exhibition.exhibition_name} at ${exhibition.venue} was a meaningful exploration of ${artworks.length} artworks. You showed particular appreciation for works with an average emotional impact of ${avgEmotionRating.toFixed(1)}/5.`,
      analytics: {
        artworks_viewed: artworks.length,
        avg_emotion_rating: avgEmotionRating,
        avg_technical_rating: avgTechnicalRating,
        top_artworks: topArtworks.map(a => ({
          title: a.title,
          artist: a.artist,
          emotion_rating: a.emotion_rating,
          technical_rating: a.technical_rating
        })),
        favorite_artists: favoriteArtists
      },
      metadata: {
        generated_at: new Date().toISOString(),
        user_type: userProfile.typeCode,
        archetype: userProfile.archetypeName,
        fallback: true
      }
    };
  }
}

// Create reports table if it doesn't exist
async function createReportsTable() {
  const createReportsSQL = `
    CREATE TABLE IF NOT EXISTS exhibition_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      exhibition_id UUID REFERENCES user_exhibitions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      report_content JSONB NOT NULL,
      generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      shared_publicly BOOLEAN DEFAULT FALSE,
      metadata JSONB DEFAULT '{}'
    );
  `;

  const createIndexesSQL = `
    CREATE INDEX IF NOT EXISTS idx_exhibition_reports_user_id ON exhibition_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_exhibition_reports_exhibition_id ON exhibition_reports(exhibition_id);
    CREATE INDEX IF NOT EXISTS idx_exhibition_reports_generated_at ON exhibition_reports(generated_at DESC);
  `;

  try {
    await pool.query(createReportsSQL);
    await pool.query(createIndexesSQL);
    console.log('✅ Exhibition reports table created successfully');
  } catch (error) {
    console.error('❌ Error creating reports table:', error);
  }
}

// Initialize table on startup
createReportsTable();

module.exports = router;