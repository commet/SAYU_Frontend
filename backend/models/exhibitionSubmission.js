const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExhibitionSubmission = sequelize.define('ExhibitionSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  // Submitter Information
  submitterId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },

  submitterType: {
    type: DataTypes.ENUM('user', 'artist', 'gallery', 'anonymous'),
    defaultValue: 'user'
  },

  submitterEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },

  submitterName: {
    type: DataTypes.STRING,
    allowNull: true
  },

  submitterPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Exhibition Information
  exhibitionTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },

  venueName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  venueAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },

  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },

  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },

  artists: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Links and Images
  officialUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },

  posterImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },

  uploadedImages: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  // Additional Information
  admissionFee: {
    type: DataTypes.STRING,
    allowNull: true
  },

  openingEvent: {
    type: DataTypes.JSONB,
    defaultValue: null
    // { date: "2024-01-15", time: "17:00", description: "Opening reception" }
  },

  // Verification
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'reviewing', 'approved', 'rejected', 'duplicate'),
    defaultValue: 'pending'
  },

  verificationNote: {
    type: DataTypes.TEXT,
    allowNull: true
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

  // Converted Exhibition
  exhibitionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Exhibitions',
      key: 'id'
    }
  },

  // Rewards
  pointsAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // Metadata
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },

  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },

  source: {
    type: DataTypes.ENUM('web', 'mobile', 'kakao', 'email', 'api'),
    defaultValue: 'web'
  },

  // Anti-spam
  spamScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },

  duplicateChecksum: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['submitterId'] },
    { fields: ['verificationStatus'] },
    { fields: ['exhibitionId'] },
    { fields: ['createdAt'] },
    { fields: ['duplicateChecksum'] }
  ]
});

// Generate checksum for duplicate detection
ExhibitionSubmission.beforeSave(async (submission) => {
  const crypto = require('crypto');
  const data = `${submission.exhibitionTitle}-${submission.venueName}-${submission.startDate}`;
  submission.duplicateChecksum = crypto.createHash('md5').update(data).digest('hex');
});

module.exports = ExhibitionSubmission;
