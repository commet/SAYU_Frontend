const ExhibitionModel = require('../models/exhibitionModel');
const ExhibitionSubmissionModel = require('../models/exhibitionSubmissionModel');
const VenueModel = require('../models/venueModel');
const exhibitionCollectorService = require('../services/exhibitionCollectorService');
const { pool } = require('../config/database');

const exhibitionController = {
  // Get exhibitions with filters
  async getExhibitions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        city,
        country = 'KR',
        status,
        startDate,
        endDate,
        venueId,
        search,
        featured
      } = req.query;

      const filters = {
        city,
        country,
        status,
        venueId,
        search,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        startDate,
        endDate,
        verificationStatus: 'verified' // Only show verified exhibitions
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy: 'start_date',
        order: 'ASC'
      };

      const result = await ExhibitionModel.find(filters, options);

      res.json(result);
    } catch (error) {
      console.error('Get exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single exhibition
  async getExhibition(req, res) {
    try {
      const { id } = req.params;

      const exhibition = await ExhibitionModel.findById(id);

      if (!exhibition) {
        return res.status(404).json({ error: 'Exhibition not found' });
      }

      // Increment view count
      await ExhibitionModel.incrementViewCount(id);

      res.json(exhibition);
    } catch (error) {
      console.error('Get exhibition error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Submit new exhibition (user submission)
  async submitExhibition(req, res) {
    try {
      const {
        exhibitionTitle,
        venueName,
        venueAddress,
        startDate,
        endDate,
        artists,
        description,
        officialUrl,
        posterImageUrl,
        admissionFee,
        openingEvent,
        submitterName,
        submitterEmail,
        submitterPhone
      } = req.body;

      // Validate required fields
      if (!exhibitionTitle || !venueName || !startDate || !endDate || !submitterEmail) {
        return res.status(400).json({ 
          error: 'Missing required fields: exhibitionTitle, venueName, startDate, endDate, submitterEmail' 
        });
      }

      // Check for duplicate submission
      const existingSubmission = await ExhibitionSubmissionModel.checkDuplicate(
        exhibitionTitle,
        venueName,
        startDate
      );

      if (existingSubmission) {
        return res.status(409).json({ 
          error: 'This exhibition has already been submitted',
          submissionId: existingSubmission.id
        });
      }

      // Create submission
      const submission = await ExhibitionSubmissionModel.create({
        exhibitionTitle,
        venueName,
        venueAddress,
        startDate,
        endDate,
        artists,
        description,
        officialUrl,
        posterImageUrl,
        admissionFee,
        openingEvent,
        submitterName,
        submitterEmail,
        submitterPhone,
        submitterId: req.user?.id,
        submitterType: req.user ? 'user' : 'anonymous',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        source: 'web'
      });

      // Award initial points if user is logged in
      if (req.user) {
        // Award points to user
        await pool.query(
          'UPDATE users SET points = COALESCE(points, 0) + 100 WHERE id = $1',
          [req.user.id]
        );
        
        await ExhibitionSubmissionModel.awardPoints(submission.id, 100);
      }

      res.status(201).json({
        message: 'Exhibition submitted successfully. It will be reviewed shortly.',
        submissionId: submission.id,
        pointsAwarded: req.user ? 100 : 0
      });
    } catch (error) {
      console.error('Submit exhibition error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's submissions
  async getUserSubmissions(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { page = 1, limit = 10 } = req.query;

      const result = await ExhibitionSubmissionModel.findByUser(req.user.id, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json(result);
    } catch (error) {
      console.error('Get user submissions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Admin: Review submission
  async reviewSubmission(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!['approved', 'rejected', 'duplicate'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const submission = await ExhibitionSubmissionModel.findById(id);
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      // Update submission status
      await ExhibitionSubmissionModel.updateStatus(id, status, req.user.id, note);

      if (status === 'approved') {
        // Find or create venue
        let venue = await VenueModel.findByName(submission.venue_name);

        if (!venue) {
          venue = await VenueModel.create({
            name: submission.venue_name,
            address: submission.venue_address || 'Unknown',
            city: 'Seoul', // Default, should be extracted from address
            country: 'KR',
            type: 'gallery' // Default
          });
        }

        // Parse artists
        const artists = submission.artists 
          ? submission.artists.split(',').map(a => ({ name: a.trim() }))
          : [];

        // Create exhibition
        const exhibition = await ExhibitionModel.create({
          title: submission.exhibition_title,
          description: submission.description,
          venueId: venue.id,
          venueName: venue.name,
          venueCity: venue.city,
          venueCountry: venue.country,
          startDate: submission.start_date,
          endDate: submission.end_date,
          artists,
          officialUrl: submission.official_url,
          posterImage: submission.poster_image_url,
          admissionFee: parseInt(submission.admission_fee) || 0,
          source: 'user_submission',
          submittedBy: submission.submitter_id,
          verificationStatus: 'verified',
          verifiedBy: req.user.id,
          verifiedAt: new Date()
        });

        // Link submission to exhibition
        await ExhibitionSubmissionModel.linkToExhibition(id, exhibition.id);

        // Award additional points
        if (submission.submitter_id) {
          await pool.query(
            'UPDATE users SET points = COALESCE(points, 0) + 400 WHERE id = $1',
            [submission.submitter_id]
          );
          
          await ExhibitionSubmissionModel.awardPoints(id, 400);
        }

        // Increment venue exhibition count
        await VenueModel.incrementExhibitionCount(venue.id);
      }

      res.json({
        message: `Submission ${status}`,
        submissionId: id
      });
    } catch (error) {
      console.error('Review submission error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Admin: Trigger exhibition collection
  async collectExhibitions(req, res) {
    try {
      const { includeNaver = true, includeInstagram = false, includeScraping = false } = req.body;

      const results = await exhibitionCollectorService.collectExhibitions({
        includeNaver,
        includeInstagram,
        includeScraping
      });

      res.json({
        message: 'Exhibition collection completed',
        results
      });
    } catch (error) {
      console.error('Collect exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get trending exhibitions
  async getTrendingExhibitions(req, res) {
    try {
      const exhibitions = await ExhibitionModel.getTrending(10);
      res.json(exhibitions);
    } catch (error) {
      console.error('Get trending exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get upcoming exhibitions
  async getUpcomingExhibitions(req, res) {
    try {
      const { days = 7 } = req.query;
      const exhibitions = await ExhibitionModel.getUpcoming(parseInt(days));
      res.json(exhibitions);
    } catch (error) {
      console.error('Get upcoming exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get venues
  async getVenues(req, res) {
    try {
      const { city, country = 'KR', type, tier, search, limit = 50 } = req.query;
      
      const filters = { city, country, type, tier, search };
      const options = { limit: parseInt(limit) };
      
      const venues = await VenueModel.find(filters, options);
      res.json(venues);
    } catch (error) {
      console.error('Get venues error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = exhibitionController;