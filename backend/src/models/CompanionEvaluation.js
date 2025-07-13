// 🎨 SAYU Companion Evaluation Models
// 동반자 평가 시스템 데이터베이스 모델

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

// 동반자 평가
const CompanionEvaluation = sequelize.define('CompanionEvaluation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  exhibitionVisitId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'exhibition_visits',
      key: 'id'
    }
  },
  evaluatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  evaluatorType: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  evaluatedId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  evaluatedType: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  // 평가 점수들
  exhibitionEngagement: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  exhibitionEngagementComment: {
    type: DataTypes.TEXT
  },
  communication: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  communicationComment: {
    type: DataTypes.TEXT
  },
  paceMatching: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  paceMatchingComment: {
    type: DataTypes.TEXT
  },
  newPerspectives: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  newPerspectivesComment: {
    type: DataTypes.TEXT
  },
  overallSatisfaction: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  overallSatisfactionComment: {
    type: DataTypes.TEXT
  },
  // 추가 피드백
  highlights: {
    type: DataTypes.TEXT
  },
  highlightsKo: {
    type: DataTypes.TEXT
  },
  improvements: {
    type: DataTypes.TEXT
  },
  improvementsKo: {
    type: DataTypes.TEXT
  },
  wouldGoAgain: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'companion_evaluations',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['exhibition_visit_id', 'evaluator_id', 'evaluated_id']
    }
  ]
});

// 평가 요약 (계산된 값 캐시)
const EvaluationSummary = sequelize.define('EvaluationSummary', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  personalityType: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  // 평균 평점들
  avgExhibitionEngagement: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  avgCommunication: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  avgPaceMatching: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  avgNewPerspectives: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  avgOverallSatisfaction: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  totalEvaluations: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wouldGoAgainCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wouldGoAgainPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // 유형별 궁합 통계 (JSONB)
  chemistryStats: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // 받은 하이라이트/개선사항 (배열)
  receivedHighlights: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  receivedImprovements: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  }
}, {
  tableName: 'evaluation_summaries',
  underscored: true
});

// 동반자 타이틀
const CompanionTitle = sequelize.define('CompanionTitle', {
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
  requirement: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'companion_titles',
  underscored: true
});

// 사용자 타이틀 획득
const UserCompanionTitle = sequelize.define('UserCompanionTitle', {
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
  titleId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'companion_titles',
      key: 'id'
    }
  },
  earnedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_companion_titles',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'title_id']
    }
  ]
});

// 관계 설정 함수 (나중에 호출)
const initializeAssociations = () => {
  // TODO: Sequelize 모델이 준비되면 관계 설정
  // const { User } = require('./User');
  // const { ExhibitionVisit } = require('./Gamification');
  
  // CompanionEvaluation.belongsTo(ExhibitionVisit, { foreignKey: 'exhibitionVisitId' });
  // CompanionEvaluation.belongsTo(User, { foreignKey: 'evaluatorId', as: 'evaluator' });
  // CompanionEvaluation.belongsTo(User, { foreignKey: 'evaluatedId', as: 'evaluated' });

  // EvaluationSummary.belongsTo(User, { foreignKey: 'userId' });
  // EvaluationSummary.hasMany(UserCompanionTitle, { foreignKey: 'userId', as: 'titles' });

  // UserCompanionTitle.belongsTo(User, { foreignKey: 'userId' });
  // UserCompanionTitle.belongsTo(CompanionTitle, { foreignKey: 'titleId' });
};

module.exports = {
  CompanionEvaluation,
  EvaluationSummary,
  CompanionTitle,
  UserCompanionTitle,
  initializeAssociations
};