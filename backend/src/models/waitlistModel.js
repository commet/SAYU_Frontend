const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Waitlist = sequelize.define('Waitlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: sequelize.literal('gen_random_uuid()'),
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  referralCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  referredBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  referralCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  aptTestCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  aptScore: {
    type: DataTypes.JSON,
    allowNull: true
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true
  },
  accessGranted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  accessLevel: {
    type: DataTypes.ENUM('basic', 'premium', 'full'),
    defaultValue: null,
    allowNull: true
  },
  accessGrantedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: '추가 데이터 (소스, 캠페인 등)'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'waitlists',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['referralCode']
    },
    {
      fields: ['position']
    },
    {
      fields: ['accessGranted']
    }
  ]
});

// 관계 설정
Waitlist.hasMany(Waitlist, {
  foreignKey: 'referredBy',
  as: 'referrals'
});

Waitlist.belongsTo(Waitlist, {
  foreignKey: 'referredBy',
  as: 'referrer'
});

module.exports = Waitlist;