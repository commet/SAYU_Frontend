// 🎨 SAYU Evaluation System Database Migration
// 동반자 평가 시스템 테이블 생성

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 동반자 평가
    await queryInterface.createTable('companion_evaluations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      exhibition_visit_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'exhibition_visits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      evaluator_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      evaluator_type: {
        type: Sequelize.STRING(4),
        allowNull: false
      },
      evaluated_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      evaluated_type: {
        type: Sequelize.STRING(4),
        allowNull: false
      },
      exhibition_engagement: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      exhibition_engagement_comment: {
        type: Sequelize.TEXT
      },
      communication: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      communication_comment: {
        type: Sequelize.TEXT
      },
      pace_matching: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      pace_matching_comment: {
        type: Sequelize.TEXT
      },
      new_perspectives: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_perspectives_comment: {
        type: Sequelize.TEXT
      },
      overall_satisfaction: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      overall_satisfaction_comment: {
        type: Sequelize.TEXT
      },
      highlights: {
        type: Sequelize.TEXT
      },
      highlights_ko: {
        type: Sequelize.TEXT
      },
      improvements: {
        type: Sequelize.TEXT
      },
      improvements_ko: {
        type: Sequelize.TEXT
      },
      would_go_again: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      is_anonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 평가 요약
    await queryInterface.createTable('evaluation_summaries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      personality_type: {
        type: Sequelize.STRING(4),
        allowNull: false
      },
      avg_exhibition_engagement: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      avg_communication: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      avg_pace_matching: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      avg_new_perspectives: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      avg_overall_satisfaction: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      total_evaluations: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      would_go_again_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      would_go_again_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      chemistry_stats: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      received_highlights: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      received_improvements: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 동반자 타이틀
    await queryInterface.createTable('companion_titles', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_ko: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      description_ko: {
        type: Sequelize.TEXT
      },
      icon: {
        type: Sequelize.STRING
      },
      requirement: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 사용자 타이틀
    await queryInterface.createTable('user_companion_titles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'companion_titles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      earned_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 인덱스 추가
    await queryInterface.addIndex('companion_evaluations', 
      ['exhibition_visit_id', 'evaluator_id', 'evaluated_id'], 
      { unique: true }
    );
    await queryInterface.addIndex('companion_evaluations', ['evaluator_id']);
    await queryInterface.addIndex('companion_evaluations', ['evaluated_id']);
    await queryInterface.addIndex('evaluation_summaries', ['user_id'], { unique: true });
    await queryInterface.addIndex('user_companion_titles', ['user_id', 'title_id'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_companion_titles');
    await queryInterface.dropTable('companion_titles');
    await queryInterface.dropTable('evaluation_summaries');
    await queryInterface.dropTable('companion_evaluations');
  }
};