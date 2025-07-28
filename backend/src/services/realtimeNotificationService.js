// 실시간 알림 서비스 - WebSocket 및 Server-Sent Events 기반
const { getRedisClient } = require('../config/redis');
const { pool } = require('../config/database');

class RealtimeNotificationService {
  constructor() {
    this.clients = new Map(); // WebSocket 클라이언트 관리
    this.sseClients = new Map(); // SSE 클라이언트 관리
    this.rooms = new Map(); // 룸 기반 그룹 알림

    this.setupRedisSubscription();
  }

  // ==================== Redis Pub/Sub 설정 ====================

  setupRedisSubscription() {
    const redis = getRedisClient();
    if (!redis) {
      console.warn('Redis not available. Real-time notifications will use in-memory only.');
      return;
    }

    // Redis subscriber 클라이언트 생성
    const subscriber = redis.duplicate();

    // 사용자별 알림 구독
    subscriber.psubscribe('user:*:notifications');

    // 매칭 관련 알림 구독
    subscriber.psubscribe('matching:*');

    // 전시 관련 알림 구독
    subscriber.psubscribe('exhibition:*');

    subscriber.on('pmessage', (pattern, channel, message) => {
      try {
        const data = JSON.parse(message);
        this.handleRedisNotification(pattern, channel, data);
      } catch (error) {
        console.error('Redis notification parsing error:', error);
      }
    });

    console.log('✅ Redis Pub/Sub 실시간 알림 시스템 초기화 완료');
  }

  handleRedisNotification(pattern, channel, data) {
    if (pattern === 'user:*:notifications') {
      // 개별 사용자 알림
      const userId = channel.split(':')[1];
      this.sendToUser(userId, data);

    } else if (pattern === 'matching:*') {
      // 매칭 관련 알림
      this.handleMatchingNotification(channel, data);

    } else if (pattern === 'exhibition:*') {
      // 전시 관련 알림
      this.handleExhibitionNotification(channel, data);
    }
  }

  // ==================== WebSocket 클라이언트 관리 ====================

  addWebSocketClient(userId, ws) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(ws);

    // 클라이언트 연결 해제 시 정리
    ws.on('close', () => {
      this.removeWebSocketClient(userId, ws);
    });

    // 연결 확인 메시지 전송
    this.sendToWebSocket(ws, {
      type: 'connection_established',
      userId,
      timestamp: Date.now()
    });

    console.log(`WebSocket 클라이언트 연결: ${userId}`);
  }

  removeWebSocketClient(userId, ws) {
    if (this.clients.has(userId)) {
      this.clients.get(userId).delete(ws);
      if (this.clients.get(userId).size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  // ==================== Server-Sent Events 클라이언트 관리 ====================

  addSSEClient(userId, res) {
    if (!this.sseClients.has(userId)) {
      this.sseClients.set(userId, new Set());
    }
    this.sseClients.get(userId).add(res);

    // SSE 헤더 설정
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    });

    // 연결 확인 메시지
    this.sendToSSE(res, {
      type: 'connection_established',
      userId,
      timestamp: Date.now()
    });

    // 클라이언트 연결 해제 시 정리
    res.on('close', () => {
      this.removeSSEClient(userId, res);
    });

    console.log(`SSE 클라이언트 연결: ${userId}`);
  }

  removeSSEClient(userId, res) {
    if (this.sseClients.has(userId)) {
      this.sseClients.get(userId).delete(res);
      if (this.sseClients.get(userId).size === 0) {
        this.sseClients.delete(userId);
      }
    }
  }

  // ==================== 알림 전송 ====================

  async sendToUser(userId, notification) {
    // WebSocket 클라이언트에 전송
    if (this.clients.has(userId)) {
      for (const ws of this.clients.get(userId)) {
        this.sendToWebSocket(ws, notification);
      }
    }

    // SSE 클라이언트에 전송
    if (this.sseClients.has(userId)) {
      for (const res of this.sseClients.get(userId)) {
        this.sendToSSE(res, notification);
      }
    }

    // 알림 이력 저장
    await this.saveNotificationHistory(userId, notification);

    // 푸시 알림 전송 (클라이언트가 오프라인인 경우)
    if (!this.clients.has(userId) && !this.sseClients.has(userId)) {
      await this.sendPushNotification(userId, notification);
    }
  }

  sendToWebSocket(ws, data) {
    try {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(data));
      }
    } catch (error) {
      console.error('WebSocket 전송 오류:', error);
    }
  }

  sendToSSE(res, data) {
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      res.write(message);
    } catch (error) {
      console.error('SSE 전송 오류:', error);
    }
  }

  // ==================== 매칭 관련 알림 ====================

  async handleMatchingNotification(channel, data) {
    const channelParts = channel.split(':');
    const eventType = channelParts[1];

    switch (eventType) {
      case 'request_created':
        await this.notifyPotentialMatches(data);
        break;
      case 'match_found':
        await this.notifyMatchFound(data);
        break;
      case 'match_accepted':
        await this.notifyMatchAccepted(data);
        break;
      case 'match_rejected':
        await this.notifyMatchRejected(data);
        break;
    }
  }

  async notifyPotentialMatches(data) {
    const { matchRequestId, hostUserId, exhibitionId } = data;

    // 호환 가능한 사용자들에게 새로운 매칭 기회 알림
    const potentialMatches = await this.findPotentialMatches(matchRequestId);

    for (const match of potentialMatches) {
      await this.sendToUser(match.userId, {
        type: 'new_match_opportunity',
        title: '새로운 전시 동행 기회!',
        body: `${data.exhibitionName}에서 함께할 동행자를 찾고 있어요`,
        data: {
          matchRequestId,
          exhibitionId,
          hostUserId,
          compatibilityScore: match.compatibilityScore
        },
        timestamp: Date.now()
      });
    }
  }

  async notifyMatchFound(data) {
    const { hostUserId, matches } = data;

    await this.sendToUser(hostUserId, {
      type: 'matches_found',
      title: `${matches.length}명의 동행자 후보를 찾았어요!`,
      body: '프로필을 확인하고 함께할 사람을 선택해보세요',
      data: {
        matchCount: matches.length,
        topMatches: matches.slice(0, 3)
      },
      timestamp: Date.now()
    });
  }

  async notifyMatchAccepted(data) {
    const { hostUserId, matchedUserId, exhibitionName, matchDate } = data;

    // 호스트에게 알림
    await this.sendToUser(hostUserId, {
      type: 'match_confirmed',
      title: '전시 동행이 확정되었어요!',
      body: `${exhibitionName}에서 만나실 수 있어요`,
      data: {
        matchedUserId,
        exhibitionName,
        matchDate,
        nextSteps: ['venue_info', 'contact_exchange', 'safety_checkin']
      },
      timestamp: Date.now()
    });

    // 매칭된 사용자에게 알림
    await this.sendToUser(matchedUserId, {
      type: 'match_confirmed',
      title: '전시 동행이 확정되었어요!',
      body: `${exhibitionName}에서 새로운 사람과 만나실 수 있어요`,
      data: {
        hostUserId,
        exhibitionName,
        matchDate,
        nextSteps: ['venue_info', 'contact_exchange', 'safety_checkin']
      },
      timestamp: Date.now()
    });
  }

  async notifyMatchRejected(data) {
    const { hostUserId, reason } = data;

    await this.sendToUser(hostUserId, {
      type: 'match_update',
      title: '매칭 상태 업데이트',
      body: '다른 좋은 매칭 기회를 찾아드릴게요',
      data: { reason },
      timestamp: Date.now()
    });
  }

  // ==================== 전시 관련 알림 ====================

  async handleExhibitionNotification(channel, data) {
    const channelParts = channel.split(':');
    const eventType = channelParts[1];

    switch (eventType) {
      case 'reminder':
        await this.sendExhibitionReminder(data);
        break;
      case 'checkin_required':
        await this.sendCheckinReminder(data);
        break;
      case 'safety_alert':
        await this.sendSafetyAlert(data);
        break;
    }
  }

  async sendExhibitionReminder(data) {
    const { userId, exhibitionName, matchDate, timeSlot } = data;

    await this.sendToUser(userId, {
      type: 'exhibition_reminder',
      title: '전시 관람 알림',
      body: `${exhibitionName} 관람이 ${this.formatTimeRemaining(matchDate)}에 예정되어 있어요`,
      data: {
        exhibitionName,
        matchDate,
        timeSlot,
        actions: ['view_details', 'contact_partner', 'checkin']
      },
      timestamp: Date.now()
    });
  }

  async sendCheckinReminder(data) {
    const { userId, venueInfo } = data;

    await this.sendToUser(userId, {
      type: 'safety_checkin',
      title: '안전 체크인 요청',
      body: '전시장 도착 시 안전을 위해 체크인 해주세요',
      data: {
        venueInfo,
        emergency_contact: process.env.EMERGENCY_CONTACT || '02-1234-5678'
      },
      timestamp: Date.now()
    });
  }

  // ==================== 그룹 및 룸 알림 ====================

  joinRoom(userId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);
  }

  leaveRoom(userId, roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  async sendToRoom(roomId, notification) {
    if (!this.rooms.has(roomId)) return;

    for (const userId of this.rooms.get(roomId)) {
      await this.sendToUser(userId, notification);
    }
  }

  // ==================== 데이터 저장 및 관리 ====================

  async saveNotificationHistory(userId, notification) {
    const client = await pool.connect();

    try {
      await client.query(`
        INSERT INTO notification_history (user_id, type, title, body, data, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        userId,
        notification.type,
        notification.title || '',
        notification.body || '',
        JSON.stringify(notification.data || {})
      ]);

    } catch (error) {
      console.error('알림 이력 저장 오류:', error);
    } finally {
      client.release();
    }
  }

  async getUserNotificationHistory(userId, limit = 50, offset = 0) {
    const client = await pool.connect();

    try {
      const result = await client.query(`
        SELECT * FROM notification_history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return result.rows;

    } finally {
      client.release();
    }
  }

  async markNotificationAsRead(userId, notificationId) {
    const client = await pool.connect();

    try {
      await client.query(`
        UPDATE notification_history
        SET read_at = NOW()
        WHERE user_id = $1 AND id = $2 AND read_at IS NULL
      `, [userId, notificationId]);

    } finally {
      client.release();
    }
  }

  // ==================== 푸시 알림 ====================

  async sendPushNotification(userId, notification) {
    // 실제 푸시 알림 구현 (FCM, APNS 등)
    // 여기서는 콘솔 로그로 대체
    console.log(`푸시 알림 전송 대상: ${userId}`, {
      title: notification.title,
      body: notification.body
    });

    // FCM 구현 예시 (실제 구현 시)
    /*
    const admin = require('firebase-admin');

    // 사용자의 FCM 토큰 조회
    const tokens = await this.getUserFCMTokens(userId);

    if (tokens.length > 0) {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        tokens
      };

      await admin.messaging().sendMulticast(message);
    }
    */
  }

  // ==================== 헬퍼 함수 ====================

  formatTimeRemaining(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    if (diff < 0) return '지났음';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 후`;
    } else if (hours > 0) {
      return `${hours}시간 후`;
    } else {
      return `${minutes}분 후`;
    }
  }

  async findPotentialMatches(matchRequestId) {
    // 매칭 서비스를 통해 잠재적 매칭 상대 조회
    // 실제 구현에서는 ExhibitionMatchingService 사용
    return [];
  }

  // ==================== 통계 및 모니터링 ====================

  getConnectionStats() {
    return {
      websocketClients: this.clients.size,
      sseClients: this.sseClients.size,
      activeRooms: this.rooms.size,
      totalConnections: Array.from(this.clients.values()).reduce((sum, set) => sum + set.size, 0) +
                       Array.from(this.sseClients.values()).reduce((sum, set) => sum + set.size, 0)
    };
  }

  // ==================== 정리 및 종료 ====================

  cleanup() {
    // 모든 연결 정리
    for (const [userId, wsSet] of this.clients) {
      for (const ws of wsSet) {
        ws.close();
      }
    }

    for (const [userId, resSet] of this.sseClients) {
      for (const res of resSet) {
        res.end();
      }
    }

    this.clients.clear();
    this.sseClients.clear();
    this.rooms.clear();

    console.log('실시간 알림 서비스 정리 완료');
  }
}

module.exports = RealtimeNotificationService;
