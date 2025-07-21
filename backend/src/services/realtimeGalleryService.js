const { Server } = require('socket.io');
const pool = require('../config/database');

class RealtimeGalleryService {
  constructor() {
    this.io = null;
    this.activeSessions = new Map(); // sessionId -> session data
    this.userSessions = new Map(); // userId -> sessionId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
      }
    });

    this.io.on('connection', (socket) => {
      console.log('New socket connection:', socket.id);

      // 갤러리 세션 참여
      socket.on('join-gallery', async (data) => {
        await this.handleJoinGallery(socket, data);
      });

      // 커서 위치 업데이트
      socket.on('cursor-move', (data) => {
        this.handleCursorMove(socket, data);
      });

      // 작품 포커스
      socket.on('artwork-focus', (data) => {
        this.handleArtworkFocus(socket, data);
      });

      // 노트 공유
      socket.on('share-note', async (data) => {
        await this.handleShareNote(socket, data);
      });

      // 세션 나가기
      socket.on('leave-gallery', async () => {
        await this.handleLeaveGallery(socket);
      });

      // 연결 끊김
      socket.on('disconnect', async () => {
        await this.handleDisconnect(socket);
      });
    });
  }

  async handleJoinGallery(socket, { userId, galleryId, aptType, userName }) {
    try {
      // 기존 세션 확인 또는 새 세션 생성
      let sessionId = await this.findOrCreateSession(galleryId);
      
      // 사용자를 세션에 추가
      const participant = {
        userId,
        userName,
        aptType,
        socketId: socket.id,
        cursorPosition: { x: 0, y: 0 },
        currentArtwork: null,
        isActive: true
      };

      // 세션 데이터 업데이트
      if (!this.activeSessions.has(sessionId)) {
        this.activeSessions.set(sessionId, {
          sessionId,
          galleryId,
          participants: new Map()
        });
      }

      const session = this.activeSessions.get(sessionId);
      session.participants.set(userId, participant);
      this.userSessions.set(userId, sessionId);

      // Socket을 룸에 참여
      socket.join(sessionId);
      socket.userId = userId;
      socket.sessionId = sessionId;

      // DB에 참가자 기록
      await pool.query(
        `INSERT INTO gallery_session_participants 
         (session_id, user_id, apt_type, is_active) 
         VALUES ($1, $2, $3, true)
         ON CONFLICT (session_id, user_id) 
         DO UPDATE SET is_active = true, joined_at = CURRENT_TIMESTAMP`,
        [sessionId, userId, aptType]
      );

      // 다른 참가자들에게 알림
      socket.to(sessionId).emit('participant-joined', {
        userId,
        userName,
        aptType
      });

      // 현재 세션 상태 전송
      socket.emit('session-state', {
        sessionId,
        participants: Array.from(session.participants.values()).map(p => ({
          userId: p.userId,
          userName: p.userName,
          aptType: p.aptType,
          cursorPosition: p.cursorPosition,
          currentArtwork: p.currentArtwork
        }))
      });

    } catch (error) {
      console.error('Error joining gallery:', error);
      socket.emit('error', { message: 'Failed to join gallery session' });
    }
  }

  handleCursorMove(socket, { x, y }) {
    const { userId, sessionId } = socket;
    if (!userId || !sessionId) return;

    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(userId);
    if (!participant) return;

    participant.cursorPosition = { x, y };

    // 다른 참가자들에게 커서 위치 브로드캐스트
    socket.to(sessionId).emit('cursor-update', {
      userId,
      position: { x, y }
    });
  }

  handleArtworkFocus(socket, { artworkId, artworkData }) {
    const { userId, sessionId } = socket;
    if (!userId || !sessionId) return;

    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(userId);
    if (!participant) return;

    participant.currentArtwork = artworkId;

    // 다른 참가자들에게 알림
    socket.to(sessionId).emit('participant-focus', {
      userId,
      artworkId,
      artworkData
    });
  }

  async handleShareNote(socket, { artworkId, note }) {
    const { userId, sessionId } = socket;
    if (!userId || !sessionId) return;

    try {
      // DB에 노트 저장
      const result = await pool.query(
        `INSERT INTO gallery_session_notes 
         (session_id, user_id, artwork_id, note) 
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [sessionId, userId, artworkId, note]
      );

      const savedNote = result.rows[0];

      // 세션의 모든 참가자에게 노트 브로드캐스트
      this.io.to(sessionId).emit('new-note', {
        noteId: savedNote.id,
        userId,
        artworkId,
        note,
        timestamp: savedNote.created_at
      });

    } catch (error) {
      console.error('Error sharing note:', error);
      socket.emit('error', { message: 'Failed to share note' });
    }
  }

  async handleLeaveGallery(socket) {
    const { userId, sessionId } = socket;
    if (!userId || !sessionId) return;

    await this.removeParticipant(userId, sessionId);
    
    // 다른 참가자들에게 알림
    socket.to(sessionId).emit('participant-left', { userId });
  }

  async handleDisconnect(socket) {
    const { userId, sessionId } = socket;
    if (!userId || !sessionId) return;

    await this.removeParticipant(userId, sessionId);
  }

  async removeParticipant(userId, sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.participants.delete(userId);
    this.userSessions.delete(userId);

    // DB 업데이트
    await pool.query(
      `UPDATE gallery_session_participants 
       SET is_active = false, left_at = CURRENT_TIMESTAMP 
       WHERE session_id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    // 세션에 참가자가 없으면 세션 종료
    if (session.participants.size === 0) {
      this.activeSessions.delete(sessionId);
      await pool.query(
        `UPDATE gallery_sessions 
         SET is_active = false, ended_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [sessionId]
      );
    }
  }

  async findOrCreateSession(galleryId) {
    // 활성 세션 찾기
    const activeSession = await pool.query(
      `SELECT id FROM gallery_sessions 
       WHERE gallery_id = $1 AND is_active = true 
       ORDER BY started_at DESC LIMIT 1`,
      [galleryId]
    );

    if (activeSession.rows.length > 0) {
      return activeSession.rows[0].id;
    }

    // 새 세션 생성
    const newSession = await pool.query(
      `INSERT INTO gallery_sessions (gallery_id) 
       VALUES ($1) RETURNING id`,
      [galleryId]
    );

    return newSession.rows[0].id;
  }

  // SSE를 위한 메서드
  async createSSEConnection(userId, galleryId, response) {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // 초기 연결 메시지
    response.write(`data: ${JSON.stringify({ 
      type: 'connected', 
      message: 'SSE connection established' 
    })}\n\n`);

    // 갤러리 업데이트 구독
    const updateHandler = (data) => {
      response.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // 이벤트 리스너 등록
    this.on(`gallery-${galleryId}`, updateHandler);

    // 연결 종료 시 정리
    response.on('close', () => {
      this.off(`gallery-${galleryId}`, updateHandler);
    });
  }
}

module.exports = new RealtimeGalleryService();