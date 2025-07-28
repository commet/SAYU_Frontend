// 🎨 SAYU Gamification Models
// 포인트, 미션, 업적 관련 데이터베이스 모델

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 사용자 포인트 테이블
const UserPoints = sequelize.define('UserPoints', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  levelName: {
    type: DataTypes.STRING,
    defaultValue: 'Art Curious'
  },
  levelNameKo: {
    type: DataTypes.STRING,
    defaultValue: '예술 입문자'
  }
}, {
  tableName: 'user_points',
  underscored: true
});

// 포인트 활동 로그
const PointActivity = sequelize.define('PointActivity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  activityType: {
    type: DataTypes.ENUM(
      'quiz_completion',
      'first_quiz',
      'exhibition_visit',
      'exhibition_review',
      'compatibility_check',
      'profile_complete',
      'achievement_unlock',
      'mission_complete',
      'daily_login',
      'invite_friend',
      'share_result',
      'companion_evaluation'
    ),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'point_activities',
  underscored: true
});

// 업적 정의
const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameKo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  descriptionKo: {
    type: DataTypes.TEXT
  },
  icon: {
    type: DataTypes.STRING
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  category: {
    type: DataTypes.ENUM('exploration', 'social', 'knowledge', 'special'),
    allowNull: false
  }
}, {
  tableName: 'achievements',
  underscored: true
});

// 사용자 업적 획득 기록
const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  achievementId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'achievements',
      key: 'id'
    }
  },
  unlockedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_achievements',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'achievement_id']
    }
  ]
});

// 미션 템플릿
const MissionTemplate = sequelize.define('MissionTemplate', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('daily', 'weekly', 'special'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  titleKo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  descriptionKo: {
    type: DataTypes.TEXT
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'exhibition_visit',
      'personality_exploration',
      'social_interaction',
      'knowledge_sharing',
      'art_discovery'
    ),
    allowNull: false
  },
  recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'mission_templates',
  underscored: true
});

// 사용자 미션
const UserMission = sequelize.define('UserMission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  missionTemplateId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'mission_templates',
      key: 'id'
    }
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'user_missions',
  underscored: true
});

// 전시 방문 기록
const ExhibitionVisit = sequelize.define('ExhibitionVisit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  exhibitionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  exhibitionName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  visitDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  companionId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  companionType: {
    type: DataTypes.STRING(4)
  },
  compatibilityLevel: {
    type: DataTypes.ENUM('platinum', 'gold', 'silver', 'bronze')
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: DataTypes.TEXT
  },
  pointsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'exhibition_visits',
  underscored: true
});

// 관계 설정
UserPoints.belongsTo(sequelize.models.User, { foreignKey: 'userId' });
PointActivity.belongsTo(sequelize.models.User, { foreignKey: 'userId' });
UserAchievement.belongsTo(sequelize.models.User, { foreignKey: 'userId' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievementId' });
UserMission.belongsTo(sequelize.models.User, { foreignKey: 'userId' });
UserMission.belongsTo(MissionTemplate, { foreignKey: 'missionTemplateId' });
ExhibitionVisit.belongsTo(sequelize.models.User, { foreignKey: 'userId', as: 'user' });
ExhibitionVisit.belongsTo(sequelize.models.User, { foreignKey: 'companionId', as: 'companion' });

module.exports = {
  UserPoints,
  PointActivity,
  Achievement,
  UserAchievement,
  MissionTemplate,
  UserMission,
  ExhibitionVisit
};
