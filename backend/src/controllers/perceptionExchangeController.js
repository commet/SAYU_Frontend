const { pool } = require('../config/database');
const {
  handleError,
  AppError,
  ERROR_CODES
} = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class PerceptionExchangeController {
  // 감상 교환 초대 생성
  async createExchange(req, res) {
    try {
      const userId = req.user.id;
      const {
        partner_id,
        artwork_id,
        museum_source,
        artwork_data,
        initial_message
      } = req.body;

      // 입력 검증
      if (!partner_id || !artwork_id || !initial_message) {
        throw new AppError('필수 필드가 누락되었습니다', ERROR_CODES.VALIDATION_ERROR);
      }

      // 기존 활성 세션 확인
      const existingSessionQuery = `
        SELECT id FROM perception_exchange_sessions 
        WHERE artwork_id = $1 
        AND ((initiator_id = $2 AND partner_id = $3) OR (initiator_id = $3 AND partner_id = $2))
        AND status IN ('pending', 'active')
      `;
      const existingSession = await pool.query(existingSessionQuery, [artwork_id, userId, partner_id]);

      if (existingSession.rows.length > 0) {
        throw new AppError('이미 진행 중인 감상 교환이 있습니다', ERROR_CODES.CONFLICT);
      }

      // 새 세션 생성
      const createSessionQuery = `
        INSERT INTO perception_exchange_sessions (
          initiator_id, partner_id, artwork_id, museum_source, 
          artwork_data, status, current_phase, initiated_at
        ) VALUES ($1, $2, $3, $4, $5, 'pending', 1, NOW())
        RETURNING id
      `;

      const sessionResult = await pool.query(createSessionQuery, [
        userId, partner_id, artwork_id, museum_source, artwork_data
      ]);

      const sessionId = sessionResult.rows[0].id;

      // 첫 메시지 생성
      const createMessageQuery = `
        INSERT INTO perception_messages (
          session_id, sender_id, content, phase, word_count, sent_at
        ) VALUES ($1, $2, $3, 1, $4, NOW())
        RETURNING id
      `;

      const wordCount = initial_message.split(/\s+/).length;
      await pool.query(createMessageQuery, [
        sessionId, userId, initial_message, wordCount
      ]);

      logger.info(`Perception exchange created: ${sessionId} by user ${userId}`);

      res.status(201).json({
        success: true,
        data: { session_id: sessionId }
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 내 교환 목록 조회
  async getMyExchanges(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      let whereClause = `WHERE (pe.initiator_id = $1 OR pe.partner_id = $1)`;
      const queryParams = [userId];

      if (status) {
        whereClause += ` AND pe.status = $2`;
        queryParams.push(status);
      }

      const query = `
        SELECT 
          pe.*,
          CASE WHEN pe.initiator_id = $1 THEN 'initiator' ELSE 'partner' END as my_role,
          partner_info.username as partner_username,
          partner_info.profile_image_url as partner_image,
          partner_info.personality_type as partner_apt,
          (
            SELECT json_agg(
              json_build_object(
                'id', pm.id,
                'content', pm.content,
                'sender_id', pm.sender_id,
                'sent_at', pm.sent_at,
                'read_at', pm.read_at,
                'emotion_tags', pm.emotion_tags,
                'reaction', pm.reaction
              ) ORDER BY pm.sent_at ASC
            )
            FROM perception_messages pm 
            WHERE pm.session_id = pe.id
          ) as messages,
          (
            SELECT COUNT(*)
            FROM perception_messages pm
            WHERE pm.session_id = pe.id 
            AND pm.sender_id != $1 
            AND pm.read_at IS NULL
          ) as unread_count
        FROM perception_exchange_sessions pe
        LEFT JOIN user_profiles partner_info ON 
          partner_info.user_id = CASE 
            WHEN pe.initiator_id = $1 THEN pe.partner_id 
            ELSE pe.initiator_id 
          END
        ${whereClause}
        ORDER BY pe.initiated_at DESC
      `;

      const result = await pool.query(query, queryParams);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 특정 세션 상세 조회
  async getSession(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const sessionQuery = `
        SELECT 
          pe.*,
          CASE WHEN pe.initiator_id = $1 THEN 'initiator' ELSE 'partner' END as my_role,
          initiator.username as initiator_username,
          initiator.profile_image_url as initiator_image,
          initiator.personality_type as initiator_apt,
          partner.username as partner_username,
          partner.profile_image_url as partner_image,
          partner.personality_type as partner_apt
        FROM perception_exchange_sessions pe
        LEFT JOIN user_profiles initiator ON initiator.user_id = pe.initiator_id
        LEFT JOIN user_profiles partner ON partner.user_id = pe.partner_id
        WHERE pe.id = $2 AND (pe.initiator_id = $1 OR pe.partner_id = $1)
      `;

      const sessionResult = await pool.query(sessionQuery, [userId, sessionId]);

      if (sessionResult.rows.length === 0) {
        throw new AppError('세션을 찾을 수 없습니다', ERROR_CODES.NOT_FOUND);
      }

      const session = sessionResult.rows[0];

      // 메시지 조회
      const messagesQuery = `
        SELECT 
          pm.*,
          CASE WHEN pm.sender_id = $1 THEN true ELSE false END as is_mine
        FROM perception_messages pm
        WHERE pm.session_id = $2
        ORDER BY pm.sent_at ASC
      `;

      const messagesResult = await pool.query(messagesQuery, [userId, sessionId]);

      session.messages = messagesResult.rows;

      res.json({
        success: true,
        data: session
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 메시지 전송
  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;
      const { content, emotion_tags } = req.body;

      if (!content?.trim()) {
        throw new AppError('메시지 내용이 필요합니다', ERROR_CODES.VALIDATION_ERROR);
      }

      // 세션 상태 확인
      const sessionCheck = await pool.query(
        `SELECT status, current_phase FROM perception_exchange_sessions 
         WHERE id = $1 AND (initiator_id = $2 OR partner_id = $2)`,
        [sessionId, userId]
      );

      if (sessionCheck.rows.length === 0) {
        throw new AppError('세션을 찾을 수 없습니다', ERROR_CODES.NOT_FOUND);
      }

      const session = sessionCheck.rows[0];
      if (session.status !== 'active') {
        throw new AppError('활성 상태가 아닌 세션입니다', ERROR_CODES.CONFLICT);
      }

      const wordCount = content.split(/\s+/).length;

      const insertQuery = `
        INSERT INTO perception_messages (
          session_id, sender_id, content, emotion_tags, 
          phase, word_count, sent_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        sessionId, userId, content, emotion_tags,
        session.current_phase, wordCount
      ]);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 초대 수락
  async acceptInvitation(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const updateQuery = `
        UPDATE perception_exchange_sessions 
        SET status = 'active', accepted_at = NOW()
        WHERE id = $1 AND partner_id = $2 AND status = 'pending'
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [sessionId, userId]);

      if (result.rows.length === 0) {
        throw new AppError('수락할 수 있는 초대가 없습니다', ERROR_CODES.NOT_FOUND);
      }

      logger.info(`Perception exchange accepted: ${sessionId} by user ${userId}`);

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 초대 거절
  async declineInvitation(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const updateQuery = `
        UPDATE perception_exchange_sessions 
        SET status = 'declined'
        WHERE id = $1 AND partner_id = $2 AND status = 'pending'
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [sessionId, userId]);

      if (result.rows.length === 0) {
        throw new AppError('거절할 수 있는 초대가 없습니다', ERROR_CODES.NOT_FOUND);
      }

      logger.info(`Perception exchange declined: ${sessionId} by user ${userId}`);

      res.json({
        success: true,
        message: '초대를 거절했습니다'
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 단계 진행 요청
  async requestPhaseAdvance(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      // 현재 세션 정보 조회
      const sessionQuery = `
        SELECT * FROM perception_exchange_sessions 
        WHERE id = $1 AND (initiator_id = $2 OR partner_id = $2)
      `;
      const sessionResult = await pool.query(sessionQuery, [sessionId, userId]);

      if (sessionResult.rows.length === 0) {
        throw new AppError('세션을 찾을 수 없습니다', ERROR_CODES.NOT_FOUND);
      }

      const session = sessionResult.rows[0];

      if (session.status !== 'active') {
        throw new AppError('활성 상태가 아닌 세션입니다', ERROR_CODES.CONFLICT);
      }

      if (session.current_phase >= 4) {
        throw new AppError('이미 최종 단계입니다', ERROR_CODES.CONFLICT);
      }

      // 양쪽 사용자의 메시지 수 확인
      const messageCountQuery = `
        SELECT 
          sender_id,
          COUNT(*) as message_count
        FROM perception_messages 
        WHERE session_id = $1 AND phase = $2
        GROUP BY sender_id
      `;

      const messageCountResult = await pool.query(messageCountQuery, [
        sessionId, session.current_phase
      ]);

      // 최소 메시지 수 조건 확인 (각자 2개 이상)
      const minMessagesPerPhase = 2;
      const userMessages = messageCountResult.rows.reduce((acc, row) => {
        acc[row.sender_id] = parseInt(row.message_count);
        return acc;
      }, {});

      const initiatorMessages = userMessages[session.initiator_id] || 0;
      const partnerMessages = userMessages[session.partner_id] || 0;

      if (initiatorMessages < minMessagesPerPhase || partnerMessages < minMessagesPerPhase) {
        return res.json({
          success: false,
          message: '단계 진행을 위해서는 양쪽 모두 최소 2개의 메시지가 필요합니다',
          data: { can_advance: false }
        });
      }

      // 단계 진행
      const updateQuery = `
        UPDATE perception_exchange_sessions 
        SET current_phase = current_phase + 1
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [sessionId]);

      logger.info(`Perception exchange phase advanced: ${sessionId} to phase ${result.rows[0].current_phase}`);

      res.json({
        success: true,
        data: {
          can_advance: true,
          new_phase: result.rows[0].current_phase
        }
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 메시지 읽음 처리
  async markMessageAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;

      const updateQuery = `
        UPDATE perception_messages 
        SET read_at = NOW()
        WHERE id = $1 
        AND sender_id != $2 
        AND read_at IS NULL
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [messageId, userId]);

      res.json({
        success: true,
        data: result.rows[0] || null
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 메시지에 반응 추가
  async addReaction(req, res) {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;
      const { reaction } = req.body;

      const validReactions = ['resonate', 'thoughtful', 'inspiring'];
      if (!validReactions.includes(reaction)) {
        throw new AppError('유효하지 않은 반응입니다', ERROR_CODES.VALIDATION_ERROR);
      }

      // 메시지가 속한 세션의 참여자인지 확인
      const checkQuery = `
        SELECT pm.id FROM perception_messages pm
        JOIN perception_exchange_sessions pe ON pe.id = pm.session_id
        WHERE pm.id = $1 AND (pe.initiator_id = $2 OR pe.partner_id = $2)
      `;

      const checkResult = await pool.query(checkQuery, [messageId, userId]);

      if (checkResult.rows.length === 0) {
        throw new AppError('권한이 없습니다', ERROR_CODES.FORBIDDEN);
      }

      const updateQuery = `
        UPDATE perception_messages 
        SET reaction = $1
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [reaction, messageId]);

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 추천 파트너 찾기
  async findPotentialPartners(req, res) {
    try {
      const userId = req.user.id;
      const { artworkId } = req.params;

      // 같은 작품을 컬렉션에 저장한 사용자들 찾기
      const query = `
        SELECT DISTINCT
          up.user_id,
          up.username,
          up.profile_image_url,
          up.personality_type as apt_type,
          ci.emotion_tags as shared_emotions
        FROM collection_items ci
        JOIN user_profiles up ON up.user_id = ci.added_by
        WHERE ci.artwork_id = $1 
        AND ci.added_by != $2
        AND NOT EXISTS (
          SELECT 1 FROM perception_exchange_sessions pe
          WHERE pe.artwork_id = $1
          AND ((pe.initiator_id = $2 AND pe.partner_id = ci.added_by) 
               OR (pe.initiator_id = ci.added_by AND pe.partner_id = $2))
          AND pe.status IN ('pending', 'active')
        )
        LIMIT 10
      `;

      const result = await pool.query(query, [artworkId, userId]);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }

  // 교환 통계 조회
  async getExchangeStats(req, res) {
    try {
      const userId = req.user.id;

      const statsQuery = `
        SELECT 
          COUNT(*) as total_exchanges,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_exchanges,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_exchanges,
          COALESCE(AVG(
            CASE WHEN status = 'completed' THEN 
              (SELECT AVG(quality_score) FROM exchange_quality_metrics eqm WHERE eqm.session_id = pe.id)
            END
          ), 0) as average_quality_score
        FROM perception_exchange_sessions pe
        WHERE pe.initiator_id = $1 OR pe.partner_id = $1
      `;

      const result = await pool.query(statsQuery, [userId]);

      res.json({
        success: true,
        data: result.rows[0] || {
          total_exchanges: 0,
          active_exchanges: 0,
          completed_exchanges: 0,
          average_quality_score: 0
        }
      });

    } catch (error) {
      handleError(error, req, res);
    }
  }
}

module.exports = new PerceptionExchangeController();
