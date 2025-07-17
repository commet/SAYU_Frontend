const emotionTranslationService = require('../services/emotionTranslationService');
const { validationResult } = require('express-validator');

class EmotionTranslationController {
  /**
   * 감정을 예술로 번역
   */
  async translateEmotion(req, res) {
    try {
      // 유효성 검사
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }
      
      const { emotionInput } = req.body;
      const userId = req.user?.id;
      
      console.log('Translating emotion for user:', userId);
      console.log('Emotion input:', JSON.stringify(emotionInput, null, 2));
      
      // 1. 감정 해석
      const interpretationResult = await emotionTranslationService.interpretEmotion(emotionInput);
      
      // 2. 예술 작품 매칭
      const matches = await emotionTranslationService.findMatchingArtworks(
        interpretationResult.vector,
        interpretationResult.interpretation,
        10 // 최대 10개 작품
      );
      
      // 3. 세션 저장 (로그인한 사용자만)
      let sessionId = null;
      if (userId) {
        sessionId = await emotionTranslationService.saveTranslationSession(
          userId,
          emotionInput,
          interpretationResult.interpretation,
          matches
        );
      }
      
      // 4. 응답 반환
      res.json({
        success: true,
        data: {
          sessionId,
          interpretation: {
            dimensions: interpretationResult.interpretation.dimensions,
            characteristics: interpretationResult.interpretation.characteristics,
            artisticHints: interpretationResult.interpretation.artisticHints
          },
          matches: matches.map(match => ({
            artwork: {
              id: match.artwork.id,
              title: match.artwork.title,
              artist: match.artwork.artist,
              year: match.artwork.year,
              imageUrl: match.artwork.imageUrl,
              style: match.artwork.style,
              medium: match.artwork.medium,
              museum: match.artwork.museum
            },
            matching: match.matching,
            emotionalJourney: match.emotionalJourney
          })),
          timestamp: new Date()
        }
      });
      
    } catch (error) {
      console.error('Error in emotion translation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to translate emotion',
        message: error.message
      });
    }
  }
  
  /**
   * 사용자의 감정 번역 기록 조회
   */
  async getTranslationHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0 } = req.query;
      
      const query = `
        SELECT 
          id,
          emotion_input,
          interpretation,
          matches,
          created_at
        FROM emotion_translation_sessions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await req.db.query(query, [userId, limit, offset]);
      
      const sessions = result.rows.map(row => ({
        id: row.id,
        emotionInput: row.emotion_input,
        interpretation: row.interpretation,
        matches: row.matches,
        createdAt: row.created_at
      }));
      
      res.json({
        success: true,
        data: {
          sessions,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: sessions.length
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching translation history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch translation history'
      });
    }
  }
  
  /**
   * 특정 번역 세션 상세 조회
   */
  async getTranslationSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      const query = `
        SELECT 
          id,
          emotion_input,
          interpretation,
          matches,
          created_at,
          user_feedback
        FROM emotion_translation_sessions
        WHERE id = $1 AND user_id = $2
      `;
      
      const result = await req.db.query(query, [sessionId, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Translation session not found'
        });
      }
      
      const session = result.rows[0];
      
      res.json({
        success: true,
        data: {
          id: session.id,
          emotionInput: session.emotion_input,
          interpretation: session.interpretation,
          matches: session.matches,
          createdAt: session.created_at,
          userFeedback: session.user_feedback
        }
      });
      
    } catch (error) {
      console.error('Error fetching translation session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch translation session'
      });
    }
  }
  
  /**
   * 번역 결과에 대한 피드백 저장
   */
  async saveTranslationFeedback(req, res) {
    try {
      const { sessionId } = req.params;
      const { selectedMatchId, resonanceScore, notes } = req.body;
      const userId = req.user.id;
      
      // 세션 소유권 확인
      const checkQuery = `
        SELECT id FROM emotion_translation_sessions
        WHERE id = $1 AND user_id = $2
      `;
      
      const checkResult = await req.db.query(checkQuery, [sessionId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Translation session not found'
        });
      }
      
      // 피드백 저장
      const updateQuery = `
        UPDATE emotion_translation_sessions
        SET 
          user_feedback = jsonb_build_object(
            'selectedMatchId', $1,
            'resonanceScore', $2,
            'notes', $3,
            'timestamp', NOW()
          ),
          updated_at = NOW()
        WHERE id = $4
        RETURNING id
      `;
      
      await req.db.query(updateQuery, [
        selectedMatchId,
        resonanceScore,
        notes,
        sessionId
      ]);
      
      res.json({
        success: true,
        message: 'Feedback saved successfully'
      });
      
    } catch (error) {
      console.error('Error saving translation feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save feedback'
      });
    }
  }
  
  /**
   * 감정 색상 통계 조회
   */
  async getEmotionColorStats(req, res) {
    try {
      const userId = req.user?.id;
      
      // 전체 사용자 또는 특정 사용자의 색상 통계
      const query = userId ? `
        SELECT 
          emotion_input->'color'->'primary'->>'hue' as hue,
          COUNT(*) as count
        FROM emotion_translation_sessions
        WHERE user_id = $1
        GROUP BY hue
        ORDER BY count DESC
        LIMIT 10
      ` : `
        SELECT 
          emotion_input->'color'->'primary'->>'hue' as hue,
          COUNT(*) as count
        FROM emotion_translation_sessions
        GROUP BY hue
        ORDER BY count DESC
        LIMIT 10
      `;
      
      const result = await req.db.query(query, userId ? [userId] : []);
      
      res.json({
        success: true,
        data: {
          colorDistribution: result.rows,
          userId: userId || 'all'
        }
      });
      
    } catch (error) {
      console.error('Error fetching emotion color stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch color statistics'
      });
    }
  }
}

module.exports = new EmotionTranslationController();