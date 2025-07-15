const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Basic Information
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  
  nameEn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  type: {
    type: DataTypes.ENUM('museum', 'gallery', 'alternative_space', 'art_center', 'fair_venue'),
    allowNull: false
  },
  
  tier: {
    type: DataTypes.ENUM('1', '2', '3'),
    defaultValue: '2'
    // Tier 1: Major institutions (daily updates)
    // Tier 2: Important venues (2x week updates)  
    // Tier 3: Small galleries (weekly updates)
  },
  
  // Location
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  addressDetail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  region: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'KR'
  },
  
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  
  // Contact
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  // Social Media
  instagram: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  facebook: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Operating Hours
  operatingHours: {
    type: DataTypes.JSONB,
    defaultValue: {}
    // Format: { monday: "10:00-18:00", tuesday: "10:00-18:00", ... }
  },
  
  closedDays: {
    type: DataTypes.JSONB,
    defaultValue: []
    // Format: ["Monday", "National Holidays"]
  },
  
  // Features
  features: {
    type: DataTypes.JSONB,
    defaultValue: []
    // ["parking", "cafe", "gift_shop", "wheelchair_accessible", "audio_guide"]
  },
  
  // Images
  logoImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Description
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  descriptionEn: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Crawling Information
  crawlUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  crawlSelector: {
    type: DataTypes.JSONB,
    defaultValue: {}
    // CSS selectors for scraping
  },
  
  lastCrawledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  crawlFrequency: {
    type: DataTypes.ENUM('daily', 'twice_weekly', 'weekly', 'manual'),
    defaultValue: 'weekly'
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Statistics
  exhibitionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  followerCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['city', 'country'] },
    { fields: ['type'] },
    { fields: ['tier'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Venue;