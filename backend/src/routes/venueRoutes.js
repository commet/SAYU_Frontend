const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { query, param } = require('express-validator');

// Validation middleware
const validateGetVenues = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('lang').optional().isIn(['ko', 'en']).withMessage('Language must be ko or en'),
  query('tier').optional().isInt({ min: 1, max: 5 }).withMessage('Tier must be between 1 and 5'),
  query('sortBy').optional().isIn(['rating', 'name', 'created_at']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

const validateGetVenueById = [
  param('id').isUUID().withMessage('Invalid venue ID'),
  query('lang').optional().isIn(['ko', 'en']).withMessage('Language must be ko or en')
];

const validateSearch = [
  query('q').notEmpty().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  query('lang').optional().isIn(['ko', 'en']).withMessage('Language must be ko or en'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

// Routes
// GET /api/venues - Get venues list with filters and language support
router.get('/', validateGetVenues, venueController.getVenues);

// GET /api/venues/search - Search venues with multi-language support
router.get('/search', validateSearch, venueController.searchVenues);

// GET /api/venues/cities - Get cities with venue counts
router.get('/cities', venueController.getCitiesWithCounts);

// GET /api/venues/countries - Get countries with venue counts
router.get('/countries', venueController.getCountriesWithCounts);

// GET /api/venues/:id - Get single venue by ID
router.get('/:id', validateGetVenueById, venueController.getVenueById);

module.exports = router;
