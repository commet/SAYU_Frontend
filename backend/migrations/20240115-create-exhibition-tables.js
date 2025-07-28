'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Venues table
    await queryInterface.createTable('Venues', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      nameEn: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('museum', 'gallery', 'alternative_space', 'art_center', 'fair_venue'),
        allowNull: false
      },
      tier: {
        type: Sequelize.ENUM('1', '2', '3'),
        defaultValue: '2'
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      addressDetail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'KR'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      instagram: {
        type: Sequelize.STRING,
        allowNull: true
      },
      facebook: {
        type: Sequelize.STRING,
        allowNull: true
      },
      operatingHours: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      closedDays: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      features: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      logoImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      coverImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      images: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      descriptionEn: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      crawlUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      crawlSelector: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      lastCrawledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      crawlFrequency: {
        type: Sequelize.ENUM('daily', 'twice_weekly', 'weekly', 'manual'),
        defaultValue: 'weekly'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isPremium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      exhibitionCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      followerCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      averageRating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Exhibitions table
    await queryInterface.createTable('Exhibitions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      titleEn: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      venueId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Venues',
          key: 'id'
        }
      },
      venueName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      venueCity: {
        type: Sequelize.STRING,
        allowNull: false
      },
      venueCountry: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'KR'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      artists: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      type: {
        type: Sequelize.ENUM('solo', 'group', 'collection', 'special', 'fair'),
        defaultValue: 'group'
      },
      posterImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      images: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      officialUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ticketUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      admissionFee: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      admissionNote: {
        type: Sequelize.STRING,
        allowNull: true
      },
      source: {
        type: Sequelize.ENUM('manual', 'naver', 'scraping', 'user_submission', 'api', 'instagram'),
        defaultValue: 'manual'
      },
      sourceUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      submittedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
      },
      verifiedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      likeCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('draft', 'upcoming', 'ongoing', 'ended', 'cancelled'),
        defaultValue: 'upcoming'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      openingDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      openingTime: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create ExhibitionSubmissions table
    await queryInterface.createTable('ExhibitionSubmissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      submitterId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      submitterType: {
        type: Sequelize.ENUM('user', 'artist', 'gallery', 'anonymous'),
        defaultValue: 'user'
      },
      submitterEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      submitterName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      submitterPhone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      exhibitionTitle: {
        type: Sequelize.STRING,
        allowNull: false
      },
      venueName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      venueAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      artists: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      officialUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      posterImageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      uploadedImages: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      admissionFee: {
        type: Sequelize.STRING,
        allowNull: true
      },
      openingEvent: {
        type: Sequelize.JSONB,
        defaultValue: null
      },
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'reviewing', 'approved', 'rejected', 'duplicate'),
        defaultValue: 'pending'
      },
      verificationNote: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      verifiedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      exhibitionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Exhibitions',
          key: 'id'
        }
      },
      pointsAwarded: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.STRING,
        allowNull: true
      },
      source: {
        type: Sequelize.ENUM('web', 'mobile', 'kakao', 'email', 'api'),
        defaultValue: 'web'
      },
      spamScore: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      duplicateChecksum: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create indexes
    await queryInterface.addIndex('Venues', ['city', 'country']);
    await queryInterface.addIndex('Venues', ['type']);
    await queryInterface.addIndex('Venues', ['tier']);
    await queryInterface.addIndex('Venues', ['isActive']);

    await queryInterface.addIndex('Exhibitions', ['venueId']);
    await queryInterface.addIndex('Exhibitions', ['startDate']);
    await queryInterface.addIndex('Exhibitions', ['endDate']);
    await queryInterface.addIndex('Exhibitions', ['status']);
    await queryInterface.addIndex('Exhibitions', ['verificationStatus']);
    await queryInterface.addIndex('Exhibitions', ['submittedBy']);
    await queryInterface.addIndex('Exhibitions', ['venueCity', 'venueCountry']);

    await queryInterface.addIndex('ExhibitionSubmissions', ['submitterId']);
    await queryInterface.addIndex('ExhibitionSubmissions', ['verificationStatus']);
    await queryInterface.addIndex('ExhibitionSubmissions', ['exhibitionId']);
    await queryInterface.addIndex('ExhibitionSubmissions', ['createdAt']);
    await queryInterface.addIndex('ExhibitionSubmissions', ['duplicateChecksum']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ExhibitionSubmissions');
    await queryInterface.dropTable('Exhibitions');
    await queryInterface.dropTable('Venues');
  }
};
