const router = require('express').Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware: requireAdmin } = require('../middleware/auth');
const artistPortalService = require('../services/artistPortalService');
const { logger } = require("../config/logger");
const FlexibleArtistSubmission = require('../../flexible-artist-submission');
const DOMPurify = require('isomorphic-dompurify');
const { getRedisClient } = require('../config/redis');
const { artistPortalCors } = require('../middleware/corsEnhanced');
const { artistPortalSecurity } = require('../middleware/artistPortalSecurity');
const { cloudinaryService } = require('../services/cloudinaryService');

// Artist Portal Rate Limiters
const artistPortalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // IP당 15분에 10회 제출 제한
  message: {
    error: 'Too many artist portal submissions. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `artist_portal:${req.ip}`,
  skip: (req) => {
    // 인증된 사용자는 좀 더 관대한 제한
    return req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
  }
});

const authUserRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 20, // 인증된 사용자는 15분에 20회
  message: {
    error: 'Too many requests. Please slow down.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `artist_portal_auth:${req.userId}`,
});

// 파일 업로드 설정
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
    files: 10 // 최대 10개 파일
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
    }
  }
});

// 입력 검증 및 sanitization 미들웨어
const validateAndSanitize = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', {
      errors: errors.array(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errors: errors.array()
    });
  }
  
  // 모든 문자열 필드 sanitize
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [] }); // 모든 HTML 태그 제거
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };
  
  req.body = sanitizeObject(req.body);
  next();
};

// 악성 파일 검사 미들웨어
const scanFile = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }
  
  try {
    for (const file of req.files) {
      // 파일 시그니처 검사 (매직 넘버)
      const buffer = file.buffer;
      
      // JPEG 시그니처: FF D8 FF
      // PNG 시그니처: 89 50 4E 47
      // GIF 시그니처: 47 49 46 38
      // WebP 시그니처: 52 49 46 46 (RIFF) + 57 45 42 50 (WEBP)
      
      const isValidImage = (
        (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) || // JPEG
        (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) || // PNG
        (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) || // GIF
        (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && 
         buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) // WebP
      );
      
      if (!isValidImage) {
        logger.warn('Invalid file signature detected:', {
          filename: file.originalname,
          mimetype: file.mimetype,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          message: 'Invalid file format detected'
        });
      }
    }
    next();
  } catch (error) {
    logger.error('File scan error:', error);
    res.status(500).json({
      success: false,
      message: 'File validation failed'
    });
  }
};

// Apply enhanced security and CORS to all Artist Portal routes
router.use(artistPortalCors);
router.use(artistPortalSecurity);

// Public routes (no auth required)

// Public Artist Submission Route (기존 flexible-artist-submission.js 활용)
router.post('/submit', 
  artistPortalRateLimit,
  [
    body('artist_name').isLength({ min: 2, max: 100 }).trim().notEmpty().withMessage('Artist name must be 2-100 characters'),
    body('contact_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('bio').optional().isLength({ max: 1000 }).trim().withMessage('Bio must be less than 1000 characters'),
    body('website_url').optional().isURL().withMessage('Valid website URL required'),
    body('phone').optional().matches(/^[+]?[0-9\s\-\(\)]{10,15}$/).withMessage('Valid phone number required'),
    body('specialties').optional().isArray({ max: 10 }).withMessage('Maximum 10 specialties allowed'),
    body('social_links').optional().isObject().withMessage('Social links must be an object')
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const submissionService = new FlexibleArtistSubmission();
    const result = await submissionService.submitArtistInfo(req.body);
    
    res.status(201).json(result);
  } catch (error) {
    logger.error('Failed to submit artist info:', error);
    
    if (error.message.includes('이미 등록되어 있습니다')) {
      return res.status(409).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to submit artist information' 
    });
  }
});

// Apply auth middleware to protected routes
router.use(authMiddleware);
router.use(authUserRateLimit);

// Image Upload Endpoint
router.post('/upload/image',
  upload.single('image'),
  scanFile,
  [
    body('category').isIn(['artist_profiles', 'artist_artworks', 'gallery_profiles', 'gallery_exhibitions']).withMessage('Valid category required'),
    body('description').optional().isLength({ max: 500 }).trim().withMessage('Description must be less than 500 characters')
  ],
  validateAndSanitize,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No image file provided' 
        });
      }

      const { category, description } = req.body;
      
      // Cloudinary 설정 검증
      if (!cloudinaryService.validateConfig()) {
        return res.status(503).json({
          success: false,
          error: 'Image upload service is not configured'
        });
      }

      // 이미지 업로드
      const uploadResult = await cloudinaryService.uploadImage(
        req.file.buffer,
        category,
        req.file.originalname,
        {
          context: {
            userId: req.userId,
            description: description || '',
            uploadedAt: new Date().toISOString()
          }
        }
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image'
        });
      }

      logger.info('Image uploaded successfully', {
        userId: req.userId,
        category,
        publicId: uploadResult.publicId,
        fileSize: req.file.size,
        fileName: req.file.originalname
      });

      res.json({
        success: true,
        image: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          sizes: uploadResult.sizes,
          metadata: uploadResult.metadata
        }
      });

    } catch (error) {
      logger.error('Image upload failed:', {
        error: error.message,
        userId: req.userId,
        fileName: req.file?.originalname
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Image upload failed' 
      });
    }
  }
);

// Batch Image Upload Endpoint
router.post('/upload/images',
  upload.array('images', 10),
  scanFile,
  [
    body('category').isIn(['artist_profiles', 'artist_artworks', 'gallery_profiles', 'gallery_exhibitions']).withMessage('Valid category required'),
    body('descriptions').optional().isArray({ max: 10 }).withMessage('Descriptions must be an array with max 10 items')
  ],
  validateAndSanitize,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No image files provided' 
        });
      }

      const { category, descriptions = [] } = req.body;
      
      // Cloudinary 설정 검증
      if (!cloudinaryService.validateConfig()) {
        return res.status(503).json({
          success: false,
          error: 'Image upload service is not configured'
        });
      }

      // 여러 이미지 업로드
      const uploadResults = await cloudinaryService.uploadMultipleImages(
        req.files,
        category,
        {
          context: {
            userId: req.userId,
            uploadedAt: new Date().toISOString()
          }
        }
      );

      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);

      logger.info('Batch image upload completed', {
        userId: req.userId,
        category,
        totalFiles: req.files.length,
        successful: successfulUploads.length,
        failed: failedUploads.length
      });

      res.json({
        success: true,
        results: {
          successful: successfulUploads.map(result => ({
            url: result.url,
            publicId: result.publicId,
            sizes: result.sizes,
            metadata: result.metadata
          })),
          failed: failedUploads,
          summary: {
            total: req.files.length,
            successful: successfulUploads.length,
            failed: failedUploads.length
          }
        }
      });

    } catch (error) {
      logger.error('Batch image upload failed:', {
        error: error.message,
        userId: req.userId,
        fileCount: req.files?.length
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Batch image upload failed' 
      });
    }
  }
);

// Image Delete Endpoint
router.delete('/upload/image/:publicId',
  [
    param('publicId').notEmpty().withMessage('Public ID is required')
  ],
  validateAndSanitize,
  async (req, res) => {
    try {
      const { publicId } = req.params;
      
      // URL에서 전달된 경우 디코딩
      const decodedPublicId = decodeURIComponent(publicId);
      
      const deleteResult = await cloudinaryService.deleteImage(decodedPublicId);
      
      if (deleteResult) {
        logger.info('Image deleted successfully', {
          userId: req.userId,
          publicId: decodedPublicId
        });
        
        res.json({
          success: true,
          message: 'Image deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Image not found or already deleted'
        });
      }

    } catch (error) {
      logger.error('Image deletion failed:', {
        error: error.message,
        userId: req.userId,
        publicId: req.params.publicId
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Image deletion failed' 
      });
    }
  }
);

// Artist Profile Routes
router.post('/artist/profile',
  [
    body('artist_name').isLength({ min: 2, max: 100 }).trim().notEmpty(),
    body('bio').optional().isLength({ max: 2000 }).trim(),
    body('website_url').optional().isURL(),
    body('contact_email').isEmail().normalizeEmail(),
    body('phone').optional().matches(/^[+]?[0-9\s\-\(\)]{10,15}$/),
    body('address').optional().isLength({ max: 500 }).trim(),
    body('specialties').optional().isArray({ max: 15 }),
    body('social_links').optional().isObject()
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const profile = await artistPortalService.createArtistProfile(req.userId, req.body);
    res.status(201).json(profile);
  } catch (error) {
    logger.error('Failed to create artist profile:', error);
    res.status(500).json({ error: 'Failed to create artist profile' });
  }
});

router.get('/artist/profile', async (req, res) => {
  try {
    const profile = await artistPortalService.getArtistProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Artist profile not found' });
    }
    res.json(profile);
  } catch (error) {
    logger.error('Failed to get artist profile:', error);
    res.status(500).json({ error: 'Failed to get artist profile' });
  }
});

router.put('/artist/profile/:profileId',
  [
    param('profileId').isUUID().withMessage('Valid profile ID required'),
    body('artist_name').optional().isLength({ min: 2, max: 100 }).trim(),
    body('bio').optional().isLength({ max: 2000 }).trim(),
    body('website_url').optional().isURL(),
    body('contact_email').optional().isEmail().normalizeEmail(),
    body('phone').optional().matches(/^[+]?[0-9\s\-\(\)]{10,15}$/),
    body('specialties').optional().isArray({ max: 15 }),
    body('social_links').optional().isObject()
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = await artistPortalService.updateArtistProfile(profileId, req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ error: 'Artist profile not found or unauthorized' });
    }
    
    res.json(profile);
  } catch (error) {
    logger.error('Failed to update artist profile:', error);
    res.status(500).json({ error: 'Failed to update artist profile' });
  }
});

// Gallery Profile Routes
router.post('/gallery/profile',
  [
    body('gallery_name').isLength({ min: 2, max: 100 }).trim().notEmpty(),
    body('description').optional().isLength({ max: 2000 }).trim(),
    body('website_url').optional().isURL(),
    body('contact_email').isEmail().normalizeEmail(),
    body('phone').optional().matches(/^[+]?[0-9\s\-\(\)]{10,15}$/),
    body('address').optional().isLength({ max: 500 }).trim(),
    body('gallery_type').optional().isIn(['independent', 'commercial', 'museum', 'nonprofit', 'online', 'popup']),
    body('established_year').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
    body('specializations').optional().isArray({ max: 15 }),
    body('opening_hours').optional().isObject()
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const profile = await artistPortalService.createGalleryProfile(req.userId, req.body);
    res.status(201).json(profile);
  } catch (error) {
    logger.error('Failed to create gallery profile:', error);
    res.status(500).json({ error: 'Failed to create gallery profile' });
  }
});

router.get('/gallery/profile', async (req, res) => {
  try {
    const profile = await artistPortalService.getGalleryProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Gallery profile not found' });
    }
    res.json(profile);
  } catch (error) {
    logger.error('Failed to get gallery profile:', error);
    res.status(500).json({ error: 'Failed to get gallery profile' });
  }
});

router.put('/gallery/profile/:profileId',
  [
    param('profileId').isUUID().withMessage('Valid profile ID required'),
    body('gallery_name').optional().isLength({ min: 2, max: 100 }).trim(),
    body('description').optional().isLength({ max: 2000 }).trim(),
    body('website_url').optional().isURL(),
    body('contact_email').optional().isEmail().normalizeEmail(),
    body('phone').optional().matches(/^[+]?[0-9\s\-\(\)]{10,15}$/),
    body('gallery_type').optional().isIn(['independent', 'commercial', 'museum', 'nonprofit', 'online', 'popup']),
    body('specializations').optional().isArray({ max: 15 })
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = await artistPortalService.updateGalleryProfile(profileId, req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ error: 'Gallery profile not found or unauthorized' });
    }
    
    res.json(profile);
  } catch (error) {
    logger.error('Failed to update gallery profile:', error);
    res.status(500).json({ error: 'Failed to update gallery profile' });
  }
});

// Artwork Submission Routes
router.post('/artworks',
  upload.array('images', 10),
  scanFile,
  [
    body('profileId').isUUID().withMessage('Valid profile ID required'),
    body('profileType').isIn(['artist', 'gallery']).withMessage('Profile type must be artist or gallery'),
    body('title').isLength({ min: 1, max: 200 }).trim().notEmpty(),
    body('artist_display_name').isLength({ min: 1, max: 100 }).trim().notEmpty(),
    body('creation_date').optional().isISO8601().toDate(),
    body('medium').isLength({ min: 1, max: 100 }).trim().notEmpty(),
    body('dimensions').optional().isLength({ max: 100 }).trim(),
    body('description').optional().isLength({ max: 2000 }).trim(),
    body('technique').optional().isLength({ max: 100 }).trim(),
    body('style').optional().isLength({ max: 100 }).trim(),
    body('subject_matter').optional().isArray({ max: 20 }),
    body('color_palette').optional().isArray({ max: 20 }),
    body('price_range').optional().isLength({ max: 50 }).trim(),
    body('availability_status').optional().isIn(['available', 'sold', 'on_hold', 'not_for_sale']),
    body('tags').optional().isArray({ max: 30 })
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { profileId, profileType } = req.body;
    
    if (!profileId || !profileType || !['artist', 'gallery'].includes(profileType)) {
      return res.status(400).json({ error: 'Profile ID and type (artist/gallery) are required' });
    }

    const artwork = await artistPortalService.submitArtwork(profileId, profileType, req.body);
    res.status(201).json(artwork);
  } catch (error) {
    logger.error('Failed to submit artwork:', error);
    res.status(500).json({ error: 'Failed to submit artwork' });
  }
});

router.get('/artworks',
  [
    query('profileId').isUUID().withMessage('Valid profile ID required'),
    query('profileType').isIn(['artist', 'gallery']).withMessage('Profile type must be artist or gallery'),
    query('status').optional().isIn(['pending', 'approved', 'rejected'])
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { profileId, profileType, status } = req.query;
    
    if (!profileId || !profileType) {
      return res.status(400).json({ error: 'Profile ID and type are required' });
    }

    const artworks = await artistPortalService.getSubmittedArtworks(profileId, profileType, status);
    res.json(artworks);
  } catch (error) {
    logger.error('Failed to get submitted artworks:', error);
    res.status(500).json({ error: 'Failed to get submitted artworks' });
  }
});

router.put('/artworks/:artworkId',
  upload.array('images', 10),
  scanFile,
  [
    param('artworkId').isUUID().withMessage('Valid artwork ID required'),
    body('profileId').isUUID().withMessage('Valid profile ID required'),
    body('profileType').isIn(['artist', 'gallery']).withMessage('Profile type must be artist or gallery'),
    body('title').optional().isLength({ min: 1, max: 200 }).trim(),
    body('description').optional().isLength({ max: 2000 }).trim(),
    body('tags').optional().isArray({ max: 30 })
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { profileId, profileType } = req.body;
    
    if (!profileId || !profileType) {
      return res.status(400).json({ error: 'Profile ID and type are required' });
    }

    const artwork = await artistPortalService.updateArtworkSubmission(
      artworkId, profileId, profileType, req.body
    );
    
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found or cannot be updated' });
    }
    
    res.json(artwork);
  } catch (error) {
    logger.error('Failed to update artwork submission:', error);
    res.status(500).json({ error: 'Failed to update artwork submission' });
  }
});

// Exhibition Submission Routes (Gallery only)
router.post('/exhibitions',
  upload.array('images', 10),
  scanFile,
  [
    body('galleryProfileId').isUUID().withMessage('Valid gallery profile ID required'),
    body('title').isLength({ min: 1, max: 200 }).trim().notEmpty(),
    body('description').optional().isLength({ max: 3000 }).trim(),
    body('curator_name').optional().isLength({ min: 1, max: 100 }).trim(),
    body('start_date').isISO8601().toDate().withMessage('Valid start date required'),
    body('end_date').isISO8601().toDate().withMessage('Valid end date required'),
    body('exhibition_type').optional().isIn(['solo', 'group', 'collective', 'retrospective', 'thematic']),
    body('theme').optional().isLength({ max: 200 }).trim(),
    body('featured_artists').optional().isArray({ max: 50 }),
    body('tags').optional().isArray({ max: 30 })
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { galleryProfileId } = req.body;
    
    if (!galleryProfileId) {
      return res.status(400).json({ error: 'Gallery profile ID is required' });
    }

    const exhibition = await artistPortalService.submitExhibition(galleryProfileId, req.body);
    res.status(201).json(exhibition);
  } catch (error) {
    logger.error('Failed to submit exhibition:', error);
    res.status(500).json({ error: 'Failed to submit exhibition' });
  }
});

router.get('/exhibitions',
  [
    query('galleryProfileId').isUUID().withMessage('Valid gallery profile ID required'),
    query('status').optional().isIn(['pending', 'approved', 'rejected'])
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { galleryProfileId, status } = req.query;
    
    if (!galleryProfileId) {
      return res.status(400).json({ error: 'Gallery profile ID is required' });
    }

    const exhibitions = await artistPortalService.getSubmittedExhibitions(galleryProfileId, status);
    res.json(exhibitions);
  } catch (error) {
    logger.error('Failed to get submitted exhibitions:', error);
    res.status(500).json({ error: 'Failed to get submitted exhibitions' });
  }
});

// Admin Routes (require admin role)

router.get('/admin/submissions/pending', requireAdmin, async (req, res) => {
  try {
    const { type } = req.query; // 'artworks', 'exhibitions', or null for both
    const submissions = await artistPortalService.getPendingSubmissions(type);
    res.json(submissions);
  } catch (error) {
    logger.error('Failed to get pending submissions:', error);
    res.status(500).json({ error: 'Failed to get pending submissions' });
  }
});

router.post('/admin/submissions/:submissionType/:submissionId/review', 
  requireAdmin,
  [
    param('submissionType').isIn(['artwork', 'exhibition']).withMessage('Invalid submission type'),
    param('submissionId').isUUID().withMessage('Valid submission ID required'),
    body('status').isIn(['approved', 'rejected', 'pending']).withMessage('Invalid status'),
    body('review_notes').optional().isLength({ max: 1000 }).trim(),
    body('quality_score').optional().isFloat({ min: 0, max: 100 }),
    body('feedback').optional().isObject()
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { submissionType, submissionId } = req.params;
    const { status, review_notes, quality_score, feedback } = req.body;
    
    if (!['artwork', 'exhibition'].includes(submissionType)) {
      return res.status(400).json({ error: 'Invalid submission type' });
    }
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const reviewedSubmission = await artistPortalService.reviewSubmission(
      submissionType,
      submissionId,
      req.userId,
      { status, review_notes, quality_score, feedback }
    );
    
    res.json(reviewedSubmission);
  } catch (error) {
    logger.error('Failed to review submission:', error);
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await artistPortalService.getPortalStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get portal stats:', error);
    res.status(500).json({ error: 'Failed to get portal stats' });
  }
});

// 보안 통계 및 모니터링 (관리자 전용)
router.get('/admin/security/stats', requireAdmin, async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return res.json({
        message: 'Redis not available - security stats unavailable',
        securityFeatures: {
          rateLimiting: true,
          inputValidation: true,
          fileScanning: true,
          corsProtection: true,
          behaviorAnalysis: false
        }
      });
    }

    const [
      totalBlocks,
      suspiciousIPs,
      recentBlocks
    ] = await Promise.all([
      redis.keys('ip_reputation:*').then(keys => keys.length),
      redis.keys('ip_reputation:*').then(async keys => {
        const badIPs = [];
        for (const key of keys.slice(0, 100)) { // 성능을 위해 처음 100개만
          const score = await redis.get(key);
          if (parseInt(score) < -5) {
            badIPs.push({ ip: key.replace('ip_reputation:', ''), score: parseInt(score) });
          }
        }
        return badIPs;
      }),
      redis.keys('submission_limit:*').then(keys => keys.length)
    ]);

    res.json({
      security: {
        rateLimiting: {
          totalProtectedIPs: totalBlocks,
          suspiciousIPs: suspiciousIPs.length,
          recentSubmissionLimits: recentBlocks
        },
        features: {
          rateLimiting: true,
          inputValidation: true,
          fileScanning: true,
          corsProtection: true,
          behaviorAnalysis: true,
          maliciousPayloadDetection: true
        },
        threats: {
          blockedIPs: suspiciousIPs.slice(0, 10), // 상위 10개만 반환
          lastUpdated: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get security stats:', error);
    res.status(500).json({ error: 'Failed to get security stats' });
  }
});

// 의심스러운 활동 사용자 목록 (관리자 전용)
router.get('/admin/security/suspicious-users', requireAdmin, async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return res.json({ users: [], message: 'Redis not available' });
    }

    const userKeys = await redis.keys('security_events:*');
    const suspiciousUsers = [];

    for (const key of userKeys.slice(0, 50)) { // 성능을 위해 50개만
      const userId = key.replace('security_events:', '');
      const events = await redis.lrange(key, 0, 10);
      
      if (events.length >= 5) {
        const recentEvents = events
          .map(event => JSON.parse(event))
          .filter(event => Date.now() - event.timestamp < 24 * 60 * 60 * 1000); // 24시간 이내
        
        if (recentEvents.length >= 3) {
          suspiciousUsers.push({
            userId,
            eventCount: recentEvents.length,
            lastActivity: new Date(Math.max(...recentEvents.map(e => e.timestamp))).toISOString(),
            events: recentEvents.slice(0, 3) // 최근 3개 이벤트만
          });
        }
      }
    }

    // 위험도 순으로 정렬
    suspiciousUsers.sort((a, b) => b.eventCount - a.eventCount);

    res.json({
      suspiciousUsers: suspiciousUsers.slice(0, 20), // 상위 20명만
      totalSuspicious: suspiciousUsers.length,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get suspicious users:', error);
    res.status(500).json({ error: 'Failed to get suspicious users' });
  }
});

// IP 평판 관리 (관리자 전용)
router.post('/admin/security/ip/:ip/reputation', requireAdmin, 
  [
    param('ip').isIP().withMessage('Valid IP address required'),
    body('action').isIn(['block', 'unblock', 'reset']).withMessage('Action must be block, unblock, or reset'),
    body('reason').optional().isLength({ max: 200 }).trim()
  ],
  validateAndSanitize,
  async (req, res) => {
    try {
      const { ip } = req.params;
      const { action, reason } = req.body;
      const redis = getRedisClient();
      
      if (!redis) {
        return res.status(503).json({ error: 'Redis not available' });
      }

      const key = `ip_reputation:${ip}`;
      let newReputation;

      switch (action) {
        case 'block':
          newReputation = -100;
          await redis.set(key, newReputation, 'EX', 7 * 24 * 60 * 60); // 7일간 차단
          break;
        case 'unblock':
          newReputation = 0;
          await redis.set(key, newReputation, 'EX', 24 * 60 * 60); // 1일간 중립
          break;
        case 'reset':
          await redis.del(key);
          newReputation = null;
          break;
      }

      // 관리자 액션 로깅
      logger.info('Admin IP reputation change:', {
        adminId: req.userId,
        targetIP: ip,
        action,
        reason,
        newReputation,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        ip,
        action,
        newReputation,
        message: `IP ${ip} has been ${action}ed`
      });
    } catch (error) {
      logger.error('Failed to manage IP reputation:', error);
      res.status(500).json({ error: 'Failed to manage IP reputation' });
    }
  }
);

// Public Routes (for browsing approved content)
router.get('/public/artists',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('specialty').optional().isLength({ min: 1, max: 50 }).trim()
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { page = 1, limit = 20, specialty } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT ap.id, ap.artist_name, ap.bio, ap.specialties, 
             ap.profile_image_url, ap.verified,
             COUNT(sa.id) as artwork_count
      FROM artist_profiles ap
      LEFT JOIN submitted_artworks sa ON ap.id = sa.artist_profile_id 
        AND sa.submission_status = 'approved'
      WHERE ap.status = 'approved'
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (specialty) {
      query += ` AND $${paramCount} = ANY(ap.specialties)`;
      params.push(specialty);
      paramCount++;
    }
    
    query += `
      GROUP BY ap.id
      ORDER BY ap.verified DESC, artwork_count DESC, ap.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Failed to get public artists:', error);
    res.status(500).json({ error: 'Failed to get artists' });
  }
});

router.get('/public/galleries',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('type').optional().isIn(['independent', 'commercial', 'museum', 'nonprofit', 'online', 'popup'])
  ],
  validateAndSanitize,
  async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT gp.id, gp.gallery_name, gp.description, gp.gallery_type,
             gp.address, gp.profile_image_url, gp.verified,
             COUNT(DISTINCT sa.id) as artwork_count,
             COUNT(DISTINCT se.id) as exhibition_count
      FROM gallery_profiles gp
      LEFT JOIN submitted_artworks sa ON gp.id = sa.gallery_profile_id 
        AND sa.submission_status = 'approved'
      LEFT JOIN submitted_exhibitions se ON gp.id = se.gallery_profile_id 
        AND se.submission_status = 'approved'
      WHERE gp.status = 'approved'
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (type) {
      query += ` AND gp.gallery_type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    
    query += `
      GROUP BY gp.id
      ORDER BY gp.verified DESC, (COUNT(DISTINCT sa.id) + COUNT(DISTINCT se.id)) DESC, gp.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Failed to get public galleries:', error);
    res.status(500).json({ error: 'Failed to get galleries' });
  }
});

module.exports = router;