const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exhibition = sequelize.define('Exhibition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  // Basic Information
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  titleEn: {
    type: DataTypes.STRING,
    allowNull: true
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Venue Information
  venueId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Venues',
      key: 'id'
    }
  },

  venueName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  venueCity: {
    type: DataTypes.STRING,
    allowNull: false
  },

  venueCountry: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'KR'
  },

  // Date Information
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },

  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },

  // Artist Information
  artists: {
    type: DataTypes.JSONB,
    defaultValue: []
    // Format: [{ name: "Artist Name", nameEn: "Artist Name EN", id: "artist_id" }]
  },

  // Exhibition Type
  type: {
    type: DataTypes.ENUM('solo', 'group', 'collection', 'special', 'fair'),
    defaultValue: 'group'
  },

  // Images
  posterImage: {
    type: DataTypes.STRING,
    allowNull: true
  },

  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  // Links
  officialUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },

  ticketUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },

  // Pricing
  admissionFee: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // 0 means free
  },

  admissionNote: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Source Information
  source: {
    type: DataTypes.ENUM('manual', 'naver', 'scraping', 'user_submission', 'api', 'instagram'),
    defaultValue: 'manual'
  },

  sourceUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // User Submission
  submittedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },

  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },

  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },

  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Metadata
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // Status
  status: {
    type: DataTypes.ENUM('draft', 'upcoming', 'ongoing', 'ended', 'cancelled'),
    defaultValue: 'upcoming'
  },

  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // Opening Information
  openingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },

  openingTime: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['venueId'] },
    { fields: ['startDate'] },
    { fields: ['endDate'] },
    { fields: ['status'] },
    { fields: ['verificationStatus'] },
    { fields: ['submittedBy'] },
    { fields: ['venueCity', 'venueCountry'] }
  ]
});

// Virtual field for current status
Exhibition.prototype.getCurrentStatus = function() {
  const now = new Date();
  if (this.status === 'cancelled') return 'cancelled';
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'ended';
  return 'ongoing';
};

// Update status automatically
Exhibition.beforeSave(async (exhibition) => {
  exhibition.status = exhibition.getCurrentStatus();
});

module.exports = Exhibition;
