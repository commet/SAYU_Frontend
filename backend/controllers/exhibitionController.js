const Exhibition = require('../models/exhibition');
const ExhibitionSubmission = require('../models/exhibitionSubmission');
const Venue = require('../models/venue');
const User = require('../models/user');
const exhibitionCollectorService = require('../services/exhibitionCollectorService');
const { Op } = require('sequelize');

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

      const offset = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (city) where.venueCity = city;
      if (country) where.venueCountry = country;
      if (status) where.status = status;
      if (venueId) where.venueId = venueId;
      if (featured !== undefined) where.featured = featured === 'true';

      // Date range filter
      if (startDate || endDate) {
        where.startDate = {};
        if (startDate) where.startDate[Op.gte] = new Date(startDate);
        if (endDate) where.startDate[Op.lte] = new Date(endDate);
      }

      // Search filter
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { '$artists$': { [Op.contains]: [{ name: search }] } }
        ];
      }

      // Only show verified exhibitions
      where.verificationStatus = 'verified';

      const { rows: exhibitions, count } = await Exhibition.findAndCountAll({
        where,
        include: [{
          model: Venue,
          attributes: ['name', 'nameEn', 'type', 'address']
        }],
        order: [
          ['featured', 'DESC'],
          ['startDate', 'ASC']
        ],
        limit: parseInt(limit),
        offset
      });

      res.json({
        exhibitions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single exhibition
  async getExhibition(req, res) {
    try {
      const { id } = req.params;

      const exhibition = await Exhibition.findByPk(id, {
        include: [{
          model: Venue,
          attributes: ['name', 'nameEn', 'type', 'address', 'phone', 'website', 'operatingHours']
        }]
      });

      if (!exhibition) {
        return res.status(404).json({ error: 'Exhibition not found' });
      }

      // Increment view count
      await exhibition.increment('viewCount');

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
      const existingSubmission = await ExhibitionSubmission.findOne({
        where: {
          exhibitionTitle,
          venueName,
          startDate: new Date(startDate),
          [Op.or]: [
            { verificationStatus: 'pending' },
            { verificationStatus: 'reviewing' },
            { verificationStatus: 'approved' }
          ]
        }
      });

      if (existingSubmission) {
        return res.status(409).json({
          error: 'This exhibition has already been submitted',
          submissionId: existingSubmission.id
        });
      }

      // Create submission
      const submission = await ExhibitionSubmission.create({
        exhibitionTitle,
        venueName,
        venueAddress,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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
        await User.increment('points', {
          by: 100,
          where: { id: req.user.id }
        });
        submission.pointsAwarded = 100;
        await submission.save();
      }

      res.status(201).json({
        message: 'Exhibition submitted successfully. It will be reviewed shortly.',
        submissionId: submission.id,
        pointsAwarded: submission.pointsAwarded
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
      const offset = (page - 1) * limit;

      const { rows: submissions, count } = await ExhibitionSubmission.findAndCountAll({
        where: { submitterId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
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

      const submission = await ExhibitionSubmission.findByPk(id);
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      submission.verificationStatus = status;
      submission.verificationNote = note;
      submission.verifiedBy = req.user.id;
      submission.verifiedAt = new Date();

      if (status === 'approved') {
        // Find or create venue
        let venue = await Venue.findOne({
          where: { name: submission.venueName }
        });

        if (!venue) {
          venue = await Venue.create({
            name: submission.venueName,
            address: submission.venueAddress || 'Unknown',
            city: 'Seoul', // Default, should be extracted from address
            country: 'KR',
            type: 'gallery' // Default
          });
        }

        // Create exhibition
        const exhibition = await Exhibition.create({
          title: submission.exhibitionTitle,
          description: submission.description,
          venueId: venue.id,
          venueName: venue.name,
          venueCity: venue.city,
          venueCountry: venue.country,
          startDate: submission.startDate,
          endDate: submission.endDate,
          artists: submission.artists ? submission.artists.split(',').map(a => ({ name: a.trim() })) : [],
          officialUrl: submission.officialUrl,
          posterImage: submission.posterImageUrl,
          admissionFee: parseInt(submission.admissionFee) || 0,
          source: 'user_submission',
          submittedBy: submission.submitterId,
          verificationStatus: 'verified',
          verifiedBy: req.user.id,
          verifiedAt: new Date()
        });

        submission.exhibitionId = exhibition.id;

        // Award additional points
        if (submission.submitterId) {
          await User.increment('points', {
            by: 400,
            where: { id: submission.submitterId }
          });
          submission.pointsAwarded += 400;
        }
      }

      await submission.save();

      res.json({
        message: `Submission ${status}`,
        submission
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
      const exhibitions = await Exhibition.findAll({
        where: {
          status: 'ongoing',
          verificationStatus: 'verified'
        },
        order: [
          ['viewCount', 'DESC'],
          ['likeCount', 'DESC']
        ],
        limit: 10,
        include: [{
          model: Venue,
          attributes: ['name', 'type']
        }]
      });

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
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(days));

      const exhibitions = await Exhibition.findAll({
        where: {
          status: 'upcoming',
          startDate: {
            [Op.between]: [new Date(), futureDate]
          },
          verificationStatus: 'verified'
        },
        order: [['startDate', 'ASC']],
        include: [{
          model: Venue,
          attributes: ['name', 'type', 'city']
        }]
      });

      res.json(exhibitions);
    } catch (error) {
      console.error('Get upcoming exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = exhibitionController;
