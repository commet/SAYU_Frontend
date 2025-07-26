require('dotenv').config();
const { Pool } = require('pg');

// 간단한 감정 프로필 테스트
async function testEmotionalProfile() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🎨 Testing Artist Emotional Profile Generation...\n');

    // 1. 먼저 artists 테이블에 새 컬럼이 있는지 확인
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'artists' 
      AND column_name IN ('emotional_profile', 'personality_affinity', 'representative_works', 'themes_subjects', 'artistic_style')
    `;
    
    const columnsResult = await pool.query(checkColumnsQuery);
    console.log('Available new columns:', columnsResult.rows.map(r => r.column_name));

    if (columnsResult.rows.length === 0) {
      console.log('\n⚠️  New columns not found. Running migration...');
      // 여기서 마이그레이션을 실행하거나 안내 메시지 출력
      console.log('Please run: psql $DATABASE_URL < migrations/add-sayu-artist-fields.sql');
      return;
    }

    // 2. 테스트용 아티스트 선택 (Vincent van Gogh)
    const artistQuery = `
      SELECT id, name, bio, nationality, era 
      FROM artists 
      WHERE name LIKE '%Vincent van Gogh%' 
      LIMIT 1
    `;
    
    const artistResult = await pool.query(artistQuery);
    
    if (artistResult.rows.length === 0) {
      console.log('Test artist not found. Adding sample data...');
      // 샘플 데이터는 이미 있어야 함
      return;
    }

    const artist = artistResult.rows[0];
    console.log(`Testing with artist: ${artist.name}\n`);

    // 3. 간단한 감정 프로필 생성 (OpenAI 없이 테스트)
    const mockEmotionalProfile = {
      primary_emotions: ["열정", "고독", "희망", "불안"],
      emotional_intensity: 9,
      mood_signature: "강렬하고 감정적이며 때로는 혼란스러운",
      viewer_impact: "깊은 공감과 감동을 주며 인간의 내면을 들여다보게 하는"
    };

    // 4. 성격 유형 친화도 (고흐의 특성 반영)
    const mockPersonalityAffinity = {
      scores: {
        wolf: 0.92,      // 독립적, 강렬함
        fox: 0.78,       // 영리함, 창의성
        eagle: 0.81,     // 비전, 이상주의
        deer: 0.65,      // 민감함
        owl: 0.70,       // 내면의 지혜
        cat: 0.75,       // 독립성, 신비로움
        lion: 0.60,      // 열정
        rabbit: 0.55,    // 섬세함
        bear: 0.68,      // 고독
        horse: 0.72,     // 자유로움
        dolphin: 0.45,   // 사교성 (낮음)
        dog: 0.48,       // 충성 (낮음)
        elephant: 0.52,  // 공동체 (낮음)
        sheep: 0.35,     // 순응 (낮음)
        cow: 0.30,       // 안정 (낮음)
        pig: 0.38        // 현실성 (낮음)
      },
      best_match_types: ["wolf", "eagle", "fox"],
      match_reasoning: "고흐의 독립적이고 강렬한 예술 세계는 늑대형의 독립성과 깊이, 독수리형의 이상주의적 비전, 그리고 여우형의 창의적 영리함과 강하게 공명합니다."
    };

    // 5. 대표작 정보 (하드코딩된 예시)
    const mockRepresentativeWorks = [
      {
        title: "별이 빛나는 밤",
        year: 1889,
        medium: "캔버스에 유화",
        current_location: "뉴욕 현대미술관 (MoMA)",
        image_url: "https://www.moma.org/media/W1siZiIsIjQ2NzUxNyJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=33c4ad4a19c33f85",
        emotional_tags: ["신비", "고독", "희망", "불안", "경이"]
      },
      {
        title: "해바라기",
        year: 1888,
        medium: "캔버스에 유화",
        current_location: "런던 내셔널 갤러리",
        image_url: "",
        emotional_tags: ["생명력", "기쁨", "열정", "따뜻함"]
      },
      {
        title: "아를의 침실",
        year: 1888,
        medium: "캔버스에 유화",
        current_location: "반 고흐 미술관",
        image_url: "",
        emotional_tags: ["평온", "고독", "안식", "친밀함"]
      }
    ];

    // 6. 주요 테마
    const mockThemesSubjects = {
      primary_themes: ["자연", "인간의 고독", "빛과 색채", "일상의 아름다움"],
      recurring_motifs: ["별", "해바라기", "사이프러스 나무", "밀밭", "자화상"],
      conceptual_interests: ["존재의 의미", "예술가의 고독", "자연과의 교감", "색채를 통한 감정 표현"]
    };

    // 7. 예술 스타일
    const mockArtisticStyle = {
      movements: ["후기인상주의", "표현주의 선구"],
      techniques: ["임파스토", "보색 대비", "소용돌이 붓터치"],
      dominant_colors: ["#FFD700", "#4169E1", "#FF6347", "#228B22", "#FFA500"],
      color_temperature: "mixed",
      brushwork: "두껍고 역동적인 붓터치로 감정의 소용돌이를 표현"
    };

    // 8. 데이터베이스 업데이트
    const updateQuery = `
      UPDATE artists 
      SET 
        emotional_profile = $2,
        personality_affinity = $3,
        representative_works = $4,
        themes_subjects = $5,
        artistic_style = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, emotional_profile, personality_affinity
    `;

    const updateResult = await pool.query(updateQuery, [
      artist.id,
      mockEmotionalProfile,
      mockPersonalityAffinity,
      mockRepresentativeWorks,
      mockThemesSubjects,
      mockArtisticStyle
    ]);

    console.log('✅ Successfully updated artist profile!\n');
    console.log('Emotional Profile:', JSON.stringify(mockEmotionalProfile, null, 2));
    console.log('\nTop personality matches:', mockPersonalityAffinity.best_match_types);
    console.log('\nRepresentative works:', mockRepresentativeWorks.length);

    // 9. 검증 쿼리 - 성격 유형별 추천 테스트
    console.log('\n🔍 Testing personality-based recommendation...');
    
    const recommendQuery = `
      SELECT 
        name,
        COALESCE((personality_affinity->'scores'->>'wolf')::FLOAT, 0.0) as wolf_score
      FROM artists
      WHERE personality_affinity->'scores' ? 'wolf'
      ORDER BY wolf_score DESC
      LIMIT 5
    `;

    const recommendResult = await pool.query(recommendQuery);
    console.log('\nTop artists for Wolf personality type:');
    recommendResult.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.name} (score: ${row.wolf_score})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// 실행
testEmotionalProfile().then(() => {
  console.log('\n✨ Test completed!');
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});