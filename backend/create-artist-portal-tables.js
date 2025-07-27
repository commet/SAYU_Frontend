const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createArtistPortalTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🎨 Artist Portal 테이블 생성 시작\n');
    
    // 1. Artist Profiles 테이블
    console.log('📝 Creating artist_profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS artist_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        artist_name VARCHAR(200) NOT NULL,
        bio TEXT,
        website_url VARCHAR(500),
        social_links JSONB DEFAULT '{}',
        contact_email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        specialties TEXT[] DEFAULT '{}',
        profile_image_url VARCHAR(500),
        banner_image_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);
    
    // 2. Gallery Profiles 테이블  
    console.log('🏛️ Creating gallery_profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        gallery_name VARCHAR(200) NOT NULL,
        description TEXT,
        website_url VARCHAR(500),
        contact_email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        opening_hours JSONB DEFAULT '{}',
        gallery_type VARCHAR(50) DEFAULT 'independent' CHECK (gallery_type IN ('independent', 'commercial', 'museum', 'nonprofit', 'online')),
        established_year INTEGER,
        specializations TEXT[] DEFAULT '{}',
        profile_image_url VARCHAR(500),
        banner_image_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);
    
    // 3. Submitted Artworks 테이블
    console.log('🖼️ Creating submitted_artworks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS submitted_artworks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
        gallery_profile_id UUID REFERENCES gallery_profiles(id) ON DELETE CASCADE,
        title VARCHAR(300) NOT NULL,
        artist_display_name VARCHAR(200),
        creation_date DATE,
        medium VARCHAR(200),
        dimensions VARCHAR(200),
        description TEXT,
        technique VARCHAR(200),
        style VARCHAR(100),
        subject_matter TEXT[] DEFAULT '{}',
        color_palette TEXT[] DEFAULT '{}',
        primary_image_url VARCHAR(500) NOT NULL,
        additional_images TEXT[] DEFAULT '{}',
        price_range VARCHAR(100),
        availability_status VARCHAR(50) DEFAULT 'available' CHECK (availability_status IN ('available', 'sold', 'reserved', 'not_for_sale')),
        exhibition_history TEXT,
        provenance TEXT,
        condition_report TEXT,
        tags TEXT[] DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        submission_status VARCHAR(20) DEFAULT 'pending' CHECK (submission_status IN ('pending', 'approved', 'rejected')),
        review_notes TEXT,
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT artwork_profile_check CHECK (
          (artist_profile_id IS NOT NULL AND gallery_profile_id IS NULL) OR
          (artist_profile_id IS NULL AND gallery_profile_id IS NOT NULL)
        )
      )
    `);
    
    // 4. Submitted Exhibitions 테이블
    console.log('🎪 Creating submitted_exhibitions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS submitted_exhibitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gallery_profile_id UUID REFERENCES gallery_profiles(id) ON DELETE CASCADE,
        title VARCHAR(300) NOT NULL,
        description TEXT,
        curator_name VARCHAR(200),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        opening_reception TIMESTAMP WITH TIME ZONE,
        exhibition_type VARCHAR(50) DEFAULT 'group' CHECK (exhibition_type IN ('solo', 'group', 'thematic', 'retrospective')),
        theme VARCHAR(200),
        featured_artists TEXT[] DEFAULT '{}',
        artwork_ids UUID[] DEFAULT '{}',
        poster_image_url VARCHAR(500),
        gallery_images TEXT[] DEFAULT '{}',
        press_release TEXT,
        catalog_url VARCHAR(500),
        ticket_info JSONB DEFAULT '{}',
        accessibility_info TEXT,
        special_events JSONB DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        submission_status VARCHAR(20) DEFAULT 'pending' CHECK (submission_status IN ('pending', 'approved', 'rejected')),
        review_notes TEXT,
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_dates CHECK (end_date >= start_date)
      )
    `);
    
    // 5. Submission Reviews 테이블
    console.log('📋 Creating submission_reviews table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS submission_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('artwork', 'exhibition')),
        submission_id UUID NOT NULL,
        reviewer_id UUID REFERENCES users(id) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected', 'pending')),
        review_notes TEXT,
        quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
        feedback JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 6. 인덱스 생성
    console.log('🔍 Creating indexes...');
    
    // Artist profiles 인덱스
    await client.query('CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_artist_profiles_status ON artist_profiles(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_artist_profiles_specialties ON artist_profiles USING GIN(specialties)');
    
    // Gallery profiles 인덱스
    await client.query('CREATE INDEX IF NOT EXISTS idx_gallery_profiles_user_id ON gallery_profiles(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_gallery_profiles_status ON gallery_profiles(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_gallery_profiles_type ON gallery_profiles(gallery_type)');
    
    // Submitted artworks 인덱스
    await client.query('CREATE INDEX IF NOT EXISTS idx_submitted_artworks_artist_profile ON submitted_artworks(artist_profile_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_submitted_artworks_gallery_profile ON submitted_artworks(gallery_profile_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_submitted_artworks_status ON submitted_artworks(submission_status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_submitted_artworks_tags ON submitted_artworks USING GIN(tags)');
    
    // Submitted exhibitions 인덱스
    await client.query('CREATE INDEX IF NOT EXISTS idx_submitted_exhibitions_gallery_profile ON submitted_exhibitions(gallery_profile_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_submitted_exhibitions_status ON submitted_exhibitions(submission_status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_submitted_exhibitions_dates ON submitted_exhibitions(start_date, end_date)');
    
    // Reviews 인덱스
    await client.query('CREATE INDEX IF NOT EXISTS idx_submission_reviews_submission ON submission_reviews(submission_type, submission_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_submission_reviews_reviewer ON submission_reviews(reviewer_id)');
    
    // 7. 업데이트 트리거 함수 생성
    console.log('⚡ Creating update triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    // 업데이트 트리거 적용
    await client.query(`
      DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON artist_profiles;
      CREATE TRIGGER update_artist_profiles_updated_at 
        BEFORE UPDATE ON artist_profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_gallery_profiles_updated_at ON gallery_profiles;
      CREATE TRIGGER update_gallery_profiles_updated_at 
        BEFORE UPDATE ON gallery_profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_submitted_artworks_updated_at ON submitted_artworks;
      CREATE TRIGGER update_submitted_artworks_updated_at 
        BEFORE UPDATE ON submitted_artworks 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_submitted_exhibitions_updated_at ON submitted_exhibitions;
      CREATE TRIGGER update_submitted_exhibitions_updated_at 
        BEFORE UPDATE ON submitted_exhibitions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await client.query('COMMIT');
    
    console.log('\n✅ Artist Portal 테이블 생성 완료!');
    console.log('\n📊 생성된 테이블:');
    console.log('  1. artist_profiles - 작가 프로필');
    console.log('  2. gallery_profiles - 갤러리 프로필');
    console.log('  3. submitted_artworks - 작품 제출');
    console.log('  4. submitted_exhibitions - 전시 제출');
    console.log('  5. submission_reviews - 리뷰 시스템');
    console.log('\n🔍 인덱스 및 트리거 설정 완료');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  createArtistPortalTables();
}

module.exports = { createArtistPortalTables };