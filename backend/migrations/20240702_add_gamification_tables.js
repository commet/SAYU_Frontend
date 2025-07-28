// 🎨 SAYU Gamification Database Migration
// 게임화 시스템 테이블 생성

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 사용자 포인트 테이블
    await queryInterface.createTable('user_points', {
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
      total_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      level_name: {
        type: Sequelize.STRING,
        defaultValue: 'Art Curious'
      },
      level_name_ko: {
        type: Sequelize.STRING,
        defaultValue: '예술 입문자'
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

    // 포인트 활동 로그
    await queryInterface.createTable('point_activities', {
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
      activity_type: {
        type: Sequelize.ENUM(
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
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
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

    // 업적 정의
    await queryInterface.createTable('achievements', {
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
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      category: {
        type: Sequelize.ENUM('exploration', 'social', 'knowledge', 'special'),
        allowNull: false
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

    // 사용자 업적
    await queryInterface.createTable('user_achievements', {
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
      achievement_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'achievements',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      unlocked_at: {
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

    // 미션 템플릿
    await queryInterface.createTable('mission_templates', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      type: {
        type: Sequelize.ENUM('daily', 'weekly', 'special'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      title_ko: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      description_ko: {
        type: Sequelize.TEXT
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      target: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM(
          'exhibition_visit',
          'personality_exploration',
          'social_interaction',
          'knowledge_sharing',
          'art_discovery'
        ),
        allowNull: false
      },
      recurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // 사용자 미션
    await queryInterface.createTable('user_missions', {
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
      mission_template_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'mission_templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      progress: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      expires_at: {
        type: Sequelize.DATE
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

    // 전시 방문 기록
    await queryInterface.createTable('exhibition_visits', {
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
      exhibition_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      exhibition_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      visit_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      companion_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      companion_type: {
        type: Sequelize.STRING(4)
      },
      compatibility_level: {
        type: Sequelize.ENUM('platinum', 'gold', 'silver', 'bronze')
      },
      rating: {
        type: Sequelize.INTEGER,
        validate: {
          min: 1,
          max: 5
        }
      },
      review: {
        type: Sequelize.TEXT
      },
      points_earned: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.addIndex('user_points', ['user_id'], { unique: true });
    await queryInterface.addIndex('point_activities', ['user_id']);
    await queryInterface.addIndex('point_activities', ['activity_type']);
    await queryInterface.addIndex('user_achievements', ['user_id', 'achievement_id'], { unique: true });
    await queryInterface.addIndex('user_missions', ['user_id']);
    await queryInterface.addIndex('user_missions', ['completed']);
    await queryInterface.addIndex('exhibition_visits', ['user_id']);
    await queryInterface.addIndex('exhibition_visits', ['exhibition_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exhibition_visits');
    await queryInterface.dropTable('user_missions');
    await queryInterface.dropTable('mission_templates');
    await queryInterface.dropTable('user_achievements');
    await queryInterface.dropTable('achievements');
    await queryInterface.dropTable('point_activities');
    await queryInterface.dropTable('user_points');
  }
};
