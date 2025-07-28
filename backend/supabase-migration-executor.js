#!/usr/bin/env node

/**
 * SAYU → Supabase 마이그레이션 실행기
 * 단계별 무중단 마이그레이션 지원
 */

const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

class SAYUSupabaseMigrator {
  constructor() {
    this.currentDb = null;
    this.supabase = null;
    this.migrationStatus = {
      users: false,
      artworks: false,
      exhibitions: false,
      userProfiles: false,
      quizResults: false,
      followRelations: false
    };
  }

  async initialize() {
    console.log('🚀 SAYU → Supabase 마이그레이션 초기화...');

    // 기존 DB 연결
    this.currentDb = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Supabase 연결
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    console.log('✅ 연결 초기화 완료');
  }

  async executeMigration(phase = 'all') {
    await this.initialize();

    switch (phase) {
      case '1':
      case 'schema':
        await this.migrateSchema();
        break;

      case '2':
      case 'users':
        await this.migrateUsers();
        break;

      case '3':
      case 'data':
        await this.migrateData();
        break;

      case 'all':
        await this.migrateSchema();
        await this.migrateUsers();
        await this.migrateData();
        break;

      default:
        console.error('❌ 잘못된 단계:', phase);
        return;
    }

    await this.generateMigrationReport();
  }

  async migrateSchema() {
    console.log('📋 스키마 마이그레이션...');

    const schemas = [
      {
        table: 'profiles',
        sql: `
          CREATE TABLE profiles (
            id UUID REFERENCES auth.users ON DELETE CASCADE,
            username TEXT UNIQUE,
            email TEXT,
            personality_type TEXT,
            type_code TEXT,
            archetype_name TEXT,
            quiz_results JSONB,
            emotional_tags TEXT[],
            art_preferences JSONB,
            generated_image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            PRIMARY KEY (id)
          );
        `
      },
      {
        table: 'artworks',
        sql: `
          CREATE TABLE artworks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            artist_display_name TEXT,
            medium TEXT,
            date_display TEXT,
            primary_image_url TEXT,
            description TEXT,
            tags TEXT[],
            emotional_vector VECTOR(512),
            view_count INTEGER DEFAULT 0,
            like_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        table: 'exhibitions',
        sql: `
          CREATE TABLE exhibitions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            venue_name TEXT,
            venue_city TEXT,
            start_date DATE,
            end_date DATE,
            description TEXT,
            image_url TEXT,
            tags TEXT[],
            status TEXT DEFAULT 'ongoing',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        table: 'user_interactions',
        sql: `
          CREATE TABLE user_interactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
            interaction_type TEXT NOT NULL,
            data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];

    for (const schema of schemas) {
      try {
        const { error } = await this.supabase.rpc('execute_sql', {
          sql: schema.sql
        });

        if (error) {
          console.warn(`⚠️ ${schema.table} 테이블 생성 건너뜀 (이미 존재할 수 있음)`);
        } else {
          console.log(`✅ ${schema.table} 테이블 생성 완료`);
        }
      } catch (err) {
        console.error(`❌ ${schema.table} 생성 실패:`, err);
      }
    }

    // RLS 정책 설정
    await this.setupRLSPolicies();
  }

  async setupRLSPolicies() {
    console.log('🔐 Row Level Security 정책 설정...');

    const policies = [
      'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;',

      // 프로필 정책
      `CREATE POLICY "Users can view own profile" ON profiles 
       FOR SELECT USING (auth.uid() = id);`,

      `CREATE POLICY "Users can update own profile" ON profiles 
       FOR UPDATE USING (auth.uid() = id);`,

      // 상호작용 정책
      `CREATE POLICY "Users can view own interactions" ON user_interactions 
       FOR SELECT USING (auth.uid() = user_id);`,

      `CREATE POLICY "Users can insert own interactions" ON user_interactions 
       FOR INSERT WITH CHECK (auth.uid() = user_id);`
    ];

    for (const policy of policies) {
      try {
        await this.supabase.rpc('execute_sql', { sql: policy });
      } catch (err) {
        console.warn('⚠️ RLS 정책 설정 건너뜀:', err.message);
      }
    }

    console.log('✅ RLS 정책 설정 완료');
  }

  async migrateUsers() {
    console.log('👥 사용자 데이터 마이그레이션...');

    const { rows: users } = await this.currentDb.query(`
      SELECT id, username, email, password_hash, 
             personality_type, type_code, archetype_name,
             quiz_results, emotional_tags, art_preferences,
             generated_image_url, created_at
      FROM users 
      ORDER BY created_at ASC
    `);

    let migrated = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Supabase Auth에 사용자 생성
        const { data: authUser, error: authError } = await this.supabase.auth.admin.createUser({
          email: user.email,
          password: user.password_hash || `temp-password-${Math.random()}`,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            migrated_from: 'railway',
            migrated_at: new Date().toISOString()
          }
        });

        if (authError) {
          console.error(`❌ Auth 생성 실패 ${user.email}:`, authError);
          errors++;
          continue;
        }

        // Profiles 테이블에 추가 정보 저장
        const { error: profileError } = await this.supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            username: user.username,
            email: user.email,
            personality_type: user.personality_type,
            type_code: user.type_code,
            archetype_name: user.archetype_name,
            quiz_results: user.quiz_results,
            emotional_tags: user.emotional_tags,
            art_preferences: user.art_preferences,
            generated_image_url: user.generated_image_url
          });

        if (profileError) {
          console.error(`❌ Profile 생성 실패 ${user.email}:`, profileError);
          errors++;
        } else {
          migrated++;
          if (migrated % 10 === 0) {
            console.log(`📊 사용자 마이그레이션 진행률: ${migrated}/${users.length}`);
          }
        }
      } catch (err) {
        console.error(`❌ 사용자 마이그레이션 오류 ${user.email}:`, err);
        errors++;
      }
    }

    this.migrationStatus.users = true;
    console.log(`✅ 사용자 마이그레이션 완료: ${migrated}개 성공, ${errors}개 실패`);
  }

  async migrateData() {
    console.log('📦 데이터 마이그레이션...');

    await this.migrateArtworks();
    await this.migrateExhibitions();
    await this.migrateInteractions();
  }

  async migrateArtworks() {
    console.log('🎨 작품 데이터 마이그레이션...');

    const { rows: artworks } = await this.currentDb.query(`
      SELECT id, title, artist_display_name, medium, date_display,
             primary_image_url, description, tags, view_count, like_count,
             created_at
      FROM artworks
      ORDER BY created_at ASC
      LIMIT 1000
    `);

    const { error } = await this.supabase
      .from('artworks')
      .insert(
        artworks.map(artwork => ({
          id: artwork.id,
          title: artwork.title,
          artist_display_name: artwork.artist_display_name,
          medium: artwork.medium,
          date_display: artwork.date_display,
          primary_image_url: artwork.primary_image_url,
          description: artwork.description,
          tags: artwork.tags,
          view_count: artwork.view_count || 0,
          like_count: artwork.like_count || 0
        }))
      );

    if (error) {
      console.error('❌ 작품 마이그레이션 실패:', error);
    } else {
      console.log(`✅ 작품 마이그레이션 완료: ${artworks.length}개`);
      this.migrationStatus.artworks = true;
    }
  }

  async migrateExhibitions() {
    console.log('🏛️ 전시 데이터 마이그레이션...');

    const { rows: exhibitions } = await this.currentDb.query(`
      SELECT id, title, venue_name, venue_city, start_date, end_date,
             description, image_url, tags, status, created_at
      FROM exhibitions
      ORDER BY created_at ASC
      LIMIT 500
    `);

    const { error } = await this.supabase
      .from('exhibitions')
      .insert(exhibitions);

    if (error) {
      console.error('❌ 전시 마이그레이션 실패:', error);
    } else {
      console.log(`✅ 전시 마이그레이션 완료: ${exhibitions.length}개`);
      this.migrationStatus.exhibitions = true;
    }
  }

  async migrateInteractions() {
    console.log('🔗 사용자 상호작용 마이그레이션...');

    // 좋아요, 조회 등의 상호작용 데이터 마이그레이션
    const tables = ['artwork_likes', 'artwork_views', 'quiz_responses'];

    for (const table of tables) {
      try {
        const { rows } = await this.currentDb.query(`
          SELECT * FROM ${table} 
          ORDER BY created_at ASC 
          LIMIT 1000
        `);

        if (rows.length > 0) {
          const interactions = rows.map(row => ({
            user_id: row.user_id,
            artwork_id: row.artwork_id || null,
            interaction_type: table.replace('_', '-'),
            data: { ...row },
            created_at: row.created_at
          }));

          await this.supabase
            .from('user_interactions')
            .insert(interactions);

          console.log(`✅ ${table} 마이그레이션 완료: ${rows.length}개`);
        }
      } catch (err) {
        console.warn(`⚠️ ${table} 마이그레이션 건너뜀:`, err.message);
      }
    }

    this.migrationStatus.userProfiles = true;
  }

  async generateMigrationReport() {
    console.log('\n📋 마이그레이션 보고서 생성...');

    const report = {
      timestamp: new Date().toISOString(),
      status: this.migrationStatus,
      summary: {
        completed: Object.values(this.migrationStatus).filter(Boolean).length,
        total: Object.keys(this.migrationStatus).length,
        success_rate: Object.values(this.migrationStatus).filter(Boolean).length / Object.keys(this.migrationStatus).length * 100
      },
      next_steps: [
        '1. Frontend에서 Supabase 클라이언트 설정',
        '2. API 엔드포인트를 Supabase REST로 전환',
        '3. 인증 플로우를 Supabase Auth로 변경',
        '4. Railway 백엔드에서 크론 작업만 유지',
        '5. 프로덕션 트래픽을 점진적으로 Supabase로 전환'
      ],
      rollback_plan: [
        '1. DNS 설정을 이전 상태로 복원',
        '2. Frontend 환경 변수를 Railway로 변경',
        '3. 데이터 동기화 중단',
        '4. 사용자에게 일시적 불편 공지'
      ]
    };

    console.log('\n🎉 마이그레이션 완료!');
    console.log(`📊 성공률: ${report.summary.success_rate.toFixed(1)}%`);
    console.log(`✅ 완료된 항목: ${report.summary.completed}/${report.summary.total}`);

    return report;
  }

  // 롤백 함수
  async rollback() {
    console.log('🔄 마이그레이션 롤백 시작...');

    // Supabase에서 생성된 데이터 정리
    await this.supabase.from('user_interactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await this.supabase.from('artworks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await this.supabase.from('exhibitions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ 롤백 완료');
  }
}

// CLI 실행
if (require.main === module) {
  const migrator = new SAYUSupabaseMigrator();
  const phase = process.argv[2] || 'all';

  if (phase === 'rollback') {
    migrator.rollback();
  } else {
    migrator.executeMigration(phase);
  }
}

module.exports = SAYUSupabaseMigrator;
