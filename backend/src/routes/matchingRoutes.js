const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const pool = require('../config/database');

// 전시 동행 매칭 생성
router.post('/exhibition-matches', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      exhibitionId,
      preferredDate,
      timeSlot,
      matchingCriteria,
      expiresAt
    } = req.body;

    // 매칭 생성
    const query = `
      INSERT INTO exhibition_matches 
      (exhibition_id, host_user_id, preferred_date, time_slot, matching_criteria, status, expires_at)
      VALUES ($1, $2, $3, $4, $5, 'open', $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      exhibitionId,
      userId,
      preferredDate,
      timeSlot,
      JSON.stringify(matchingCriteria),
      expiresAt
    ]);

    res.json({
      success: true,
      match: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating exhibition match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// 전시 동행 매칭 목록 조회
router.get('/exhibition-matches', authenticateUser, async (req, res) => {
  try {
    const { exhibitionId, status = 'open' } = req.query;

    let query = `
      SELECT 
        em.*,
        u.username as host_username,
        up.personality_type as host_apt_type,
        up.avatar_url as host_avatar
      FROM exhibition_matches em
      JOIN users u ON em.host_user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE em.status = $1
    `;

    const params = [status];

    if (exhibitionId) {
      query += ' AND em.exhibition_id = $2';
      params.push(exhibitionId);
    }

    query += ' ORDER BY em.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      matches: result.rows
    });
  } catch (error) {
    console.error('Error fetching exhibition matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// 매칭 참여 신청
router.post('/exhibition-matches/:matchId/apply', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    // 매칭 상태 확인
    const matchQuery = await pool.query(
      'SELECT * FROM exhibition_matches WHERE id = $1 AND status = $2',
      [matchId, 'open']
    );

    if (matchQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found or not available' });
    }

    const match = matchQuery.rows[0];

    // 자기 자신의 매칭에는 신청 불가
    if (match.host_user_id === userId) {
      return res.status(400).json({ error: 'Cannot apply to your own match' });
    }

    // APT 호환성 계산
    const compatibilityScore = await calculateAPTCompatibility(
      match.host_user_id,
      userId
    );

    // 최소 호환성 체크
    if (compatibilityScore < match.matching_criteria.minCompatibility) {
      return res.status(400).json({ 
        error: 'Compatibility score does not meet requirements',
        score: compatibilityScore
      });
    }

    // 매칭 업데이트
    const updateQuery = `
      UPDATE exhibition_matches 
      SET matched_user_id = $1, status = 'matched', matched_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [userId, matchId]);

    res.json({
      success: true,
      match: result.rows[0],
      compatibilityScore
    });
  } catch (error) {
    console.error('Error applying to match:', error);
    res.status(500).json({ error: 'Failed to apply to match' });
  }
});

// 작품 상호작용 저장
router.post('/artwork-interactions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type,
      prompt,
      targetUserId,
      artworkId,
      metadata
    } = req.body;

    const query = `
      INSERT INTO artwork_interactions 
      (user_id, target_user_id, artwork_id, type, prompt, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      targetUserId,
      artworkId,
      type,
      prompt,
      JSON.stringify(metadata)
    ]);

    res.json({
      success: true,
      interaction: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving artwork interaction:', error);
    res.status(500).json({ error: 'Failed to save interaction' });
  }
});

// 사용자 간 상호작용 조회
router.get('/artwork-interactions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId, artworkId } = req.query;

    let query = `
      SELECT 
        ai.*,
        u.username as sender_username,
        up.personality_type as sender_apt_type
      FROM artwork_interactions ai
      JOIN users u ON ai.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE (ai.user_id = $1 OR ai.target_user_id = $1)
    `;

    const params = [userId];

    if (targetUserId) {
      query += ' AND (ai.target_user_id = $2 OR ai.user_id = $2)';
      params.push(targetUserId);
    }

    if (artworkId) {
      query += ' AND ai.artwork_id = $' + (params.length + 1);
      params.push(artworkId);
    }

    query += ' ORDER BY ai.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      interactions: result.rows
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

// APT 호환성 계산 함수
async function calculateAPTCompatibility(userId1, userId2) {
  try {
    // 두 사용자의 프로필 정보 조회
    const query = `
      SELECT user_id, personality_type, quiz_responses
      FROM user_profiles
      WHERE user_id IN ($1, $2)
    `;

    const result = await pool.query(query, [userId1, userId2]);

    if (result.rows.length !== 2) {
      throw new Error('User profiles not found');
    }

    const [profile1, profile2] = result.rows;
    
    // APT 타입에서 각 차원 추출
    const apt1 = profile1.personality_type;
    const apt2 = profile2.personality_type;

    // 각 차원별 호환성 계산
    const dimensions = {
      social: calculateDimensionCompatibility(apt1[0], apt2[0], 'complementary'),
      artistic: calculateDimensionCompatibility(apt1[1], apt2[1], 'complementary'),
      emotional: calculateDimensionCompatibility(apt1[2], apt2[2], 'similar'),
      structural: calculateDimensionCompatibility(apt1[3], apt2[3], 'similar')
    };

    // 전체 호환성 점수 계산
    const overall = (
      dimensions.social * 0.2 +
      dimensions.artistic * 0.3 +
      dimensions.emotional * 0.3 +
      dimensions.structural * 0.2
    );

    return Math.round(overall);
  } catch (error) {
    console.error('Error calculating compatibility:', error);
    return 50; // 기본값
  }
}

// 차원별 호환성 계산
function calculateDimensionCompatibility(trait1, trait2, type) {
  if (type === 'similar') {
    // 유사할수록 높은 점수
    return trait1 === trait2 ? 100 : 60;
  } else {
    // 보완적일수록 높은 점수
    return trait1 !== trait2 ? 90 : 70;
  }
}

// 프라이버시 레벨 업데이트
router.put('/privacy-level', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { level, revealedInfo } = req.body;

    const query = `
      UPDATE user_profiles
      SET 
        privacy_level = $1,
        privacy_revealed_info = $2,
        updated_at = NOW()
      WHERE user_id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [
      level,
      JSON.stringify(revealedInfo),
      userId
    ]);

    res.json({
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating privacy level:', error);
    res.status(500).json({ error: 'Failed to update privacy level' });
  }
});

// 공유 컬렉션 생성
router.post('/shared-collections', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      theme,
      visibility = 'private',
      tags = []
    } = req.body;

    const query = `
      INSERT INTO shared_collections 
      (name, theme, creator_id, visibility, tags)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      theme,
      userId,
      visibility,
      JSON.stringify(tags)
    ]);

    res.json({
      success: true,
      collection: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating shared collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// 컬렉션에 작품 추가
router.post('/shared-collections/:collectionId/artworks', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { collectionId } = req.params;
    const { artworkId, note, voiceNote } = req.body;

    // 권한 확인
    const checkQuery = `
      SELECT * FROM shared_collections 
      WHERE id = $1 AND (creator_id = $2 OR $2 = ANY(collaborator_ids))
    `;

    const checkResult = await pool.query(checkQuery, [collectionId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 작품 추가
    const query = `
      INSERT INTO collection_artworks 
      (collection_id, artwork_id, added_by, note, voice_note)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      collectionId,
      artworkId,
      userId,
      note,
      voiceNote
    ]);

    res.json({
      success: true,
      artwork: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding artwork to collection:', error);
    res.status(500).json({ error: 'Failed to add artwork' });
  }
});

module.exports = router;