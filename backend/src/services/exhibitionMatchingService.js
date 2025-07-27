// 전시 동행 매칭 서비스 - 16가지 APT 유형 기반 고급 매칭 시스템
const { pool } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const { SAYU_TYPES, isValidSAYUType } = require('../../../shared/SAYUTypeDefinitions');
const APTCacheService = require('./aptCacheService');

class ExhibitionMatchingService {
  constructor() {
    this.aptCache = new APTCacheService();
    
    // 16가지 동물 유형 간 호환성 매트릭스 (대칭 행렬)
    this.compatibilityMatrix = {
      // 여우(LAEF) - 몽환적 방랑자
      LAEF: { LAEF: 90, LAEC: 75, LAMF: 85, LAMC: 65, LREF: 70, LREC: 60, LRMF: 55, LRMC: 45, 
              SAEF: 80, SAEC: 65, SAMF: 75, SAMC: 55, SREF: 85, SREC: 70, SRMF: 60, SRMC: 50 },
      
      // 고양이(LAEC) - 감성 큐레이터  
      LAEC: { LAEF: 75, LAEC: 95, LAMF: 70, LAMC: 80, LREF: 65, LREC: 85, LRMF: 50, LRMC: 70,
              SAEF: 60, SAEC: 80, SAMF: 55, SAMC: 75, SREF: 65, SREC: 80, SRMF: 45, SRMC: 65 },
      
      // 올빼미(LAMF) - 직관적 탐구자
      LAMF: { LAEF: 85, LAEC: 70, LAMF: 90, LAMC: 75, LREF: 60, LREC: 55, LRMF: 80, LRMC: 65,
              SAEF: 70, SAEC: 55, SAMF: 85, SAMC: 70, SREF: 60, SREC: 50, SRMF: 75, SRMC: 60 },
      
      // 거북이(LAMC) - 철학적 수집가
      LAMC: { LAEF: 65, LAEC: 80, LAMF: 75, LAMC: 95, LREF: 55, LREC: 70, LRMF: 65, LRMC: 85,
              SAEF: 50, SAEC: 70, SAMF: 60, SAMC: 80, SREF: 45, SREC: 65, SRMF: 55, SRMC: 75 },
      
      // 카멜레온(LREF) - 고독한 관찰자
      LREF: { LAEF: 70, LAEC: 65, LAMF: 60, LAMC: 55, LREF: 85, LREC: 75, LRMF: 70, LRMC: 60,
              SAEF: 75, SAEC: 60, SAMF: 65, SAMC: 50, SREF: 90, SREC: 75, SRMF: 65, SRMC: 55 },
      
      // 고슴도치(LREC) - 섬세한 감정가
      LREC: { LAEF: 60, LAEC: 85, LAMF: 55, LAMC: 70, LREF: 75, LREC: 90, LRMF: 50, LRMC: 65,
              SAEF: 55, SAEC: 75, SAMF: 45, SAMC: 60, SREF: 70, SREC: 85, SRMF: 40, SRMC: 55 },
      
      // 문어(LRMF) - 디지털 탐험가
      LRMF: { LAEF: 55, LAEC: 50, LAMF: 80, LAMC: 65, LREF: 70, LREC: 50, LRMF: 85, LRMC: 70,
              SAEF: 60, SAEC: 45, SAMF: 75, SAMC: 60, SREF: 65, SREC: 50, SRMF: 80, SRMC: 65 },
      
      // 비버(LRMC) - 학구적 연구자
      LRMC: { LAEF: 45, LAEC: 70, LAMF: 65, LAMC: 85, LREF: 60, LREC: 65, LRMF: 70, LRMC: 90,
              SAEF: 40, SAEC: 60, SAMF: 55, SAMC: 70, SREF: 45, SREC: 60, SRMF: 65, SRMC: 80 },
      
      // 나비(SAEF) - 감성 나눔이
      SAEF: { LAEF: 80, LAEC: 60, LAMF: 70, LAMC: 50, LREF: 75, LREC: 55, LRMF: 60, LRMC: 40,
              SAEF: 95, SAEC: 75, SAMF: 80, SAMC: 60, SREF: 85, SREC: 70, SRMF: 65, SRMC: 50 },
      
      // 펭귄(SAEC) - 예술 네트워커
      SAEC: { LAEF: 65, LAEC: 80, LAMF: 55, LAMC: 70, LREF: 60, LREC: 75, LRMF: 45, LRMC: 60,
              SAEF: 75, SAEC: 90, SAMF: 65, SAMC: 80, SREF: 70, SREC: 85, SRMF: 50, SRMC: 70 },
      
      // 앵무새(SAMF) - 영감 전도사
      SAMF: { LAEF: 75, LAEC: 55, LAMF: 85, LAMC: 60, LREF: 65, LREC: 45, LRMF: 75, LRMC: 55,
              SAEF: 80, SAEC: 65, SAMF: 95, SAMC: 70, SREF: 75, SREC: 60, SRMF: 85, SRMC: 65 },
      
      // 사슴(SAMC) - 문화 기획자
      SAMC: { LAEF: 55, LAEC: 75, LAMF: 70, LAMC: 80, LREF: 50, LREC: 60, LRMF: 60, LRMC: 70,
              SAEF: 60, SAEC: 80, SAMF: 70, SAMC: 95, SREF: 55, SREC: 75, SRMF: 65, SRMC: 85 },
      
      // 강아지(SREF) - 열정적 관람자
      SREF: { LAEF: 85, LAEC: 65, LAMF: 60, LAMC: 45, LREF: 90, LREC: 70, LRMF: 65, LRMC: 45,
              SAEF: 85, SAEC: 70, SAMF: 75, SAMC: 55, SREF: 90, SREC: 80, SRMF: 70, SRMC: 60 },
      
      // 오리(SREC) - 따뜻한 안내자
      SREC: { LAEF: 70, LAEC: 80, LAMF: 50, LAMC: 65, LREF: 75, LREC: 85, LRMF: 50, LRMC: 60,
              SAEF: 70, SAEC: 85, SAMF: 60, SAMC: 75, SREF: 80, SREC: 95, SRMF: 55, SRMC: 75 },
      
      // 코끼리(SRMF) - 지식 멘토
      SRMF: { LAEF: 60, LAEC: 45, LAMF: 75, LAMC: 55, LREF: 65, LREC: 40, LRMF: 80, LRMC: 65,
              SAEF: 65, SAEC: 50, SAMF: 85, SAMC: 65, SREF: 70, SREC: 55, SRMF: 90, SRMC: 75 },
      
      // 독수리(SRMC) - 체계적 교육자
      SRMC: { LAEF: 50, LAEC: 65, LAMF: 60, LAMC: 75, LREF: 55, LREC: 55, LRMF: 65, LRMC: 80,
              SAEF: 50, SAEC: 70, SAMF: 65, SAMC: 85, SREF: 60, SREC: 75, SRMF: 75, SRMC: 95 }
    };

    // 위치 기반 매칭 가중치
    this.locationWeights = {
      sameDistrict: 30,    // 같은 구
      nearbyDistrict: 20,  // 인접 구
      sameCity: 10,        // 같은 시
      differentCity: 0     // 다른 시
    };

    // 시간대별 가중치
    this.timeWeights = {
      exactMatch: 25,      // 정확히 같은 시간
      adjacentTime: 15,    // 인접 시간대
      overlapping: 10,     // 겹치는 시간
      noOverlap: 0        // 겹치지 않는 시간
    };
  }

  // ==================== 매칭 요청 생성 ====================
  
  async createMatchRequest(userId, matchData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 사용자 APT 정보 조회
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // 전시 정보 검증
      const exhibition = await this.getExhibitionInfo(matchData.exhibitionId);
      if (!exhibition) {
        throw new Error('Exhibition not found');
      }

      // 기존 요청 중복 확인
      const existingRequest = await client.query(
        `SELECT id FROM exhibition_matches 
         WHERE host_user_id = $1 AND exhibition_id = $2 AND status = 'open'`,
        [userId, matchData.exhibitionId]
      );

      if (existingRequest.rows.length > 0) {
        throw new Error('You already have an open match request for this exhibition');
      }

      // 매칭 기준 설정
      const matchingCriteria = {
        aptTypes: matchData.preferredAptTypes || [],
        ageRange: matchData.ageRange || { min: 18, max: 99 },
        gender: matchData.genderPreference || 'any',
        maxDistance: matchData.maxDistance || 50, // km
        language: matchData.language || ['korean'],
        interests: matchData.interests || [],
        experienceLevel: matchData.experienceLevel || 'any'
      };

      // 매칭 요청 생성
      const result = await client.query(
        `INSERT INTO exhibition_matches 
         (exhibition_id, host_user_id, preferred_date, time_slot, matching_criteria, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          matchData.exhibitionId,
          userId,
          matchData.preferredDate,
          matchData.timeSlot,
          JSON.stringify(matchingCriteria),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
        ]
      );

      await client.query('COMMIT');

      // 매칭 풀에 추가하고 실시간 매칭 시작
      const matchRequest = result.rows[0];
      await this.addToMatchingPool(matchRequest);
      await this.triggerRealTimeMatching(matchRequest);

      return matchRequest;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== 고급 매칭 알고리즘 ====================
  
  async findCompatibleMatches(matchRequestId) {
    const client = await pool.connect();
    
    try {
      // 매칭 요청 정보 조회
      const requestResult = await client.query(
        `SELECT em.*, up.type_code as host_apt_type, u.age as host_age, u.gender as host_gender
         FROM exhibition_matches em
         JOIN users u ON em.host_user_id = u.id
         JOIN user_profiles up ON u.id = up.user_id
         WHERE em.id = $1 AND em.status = 'open'`,
        [matchRequestId]
      );

      if (requestResult.rows.length === 0) {
        throw new Error('Match request not found or not open');
      }

      const matchRequest = requestResult.rows[0];
      const hostAptType = matchRequest.host_apt_type;
      const criteria = JSON.parse(matchRequest.matching_criteria);

      // 1단계: APT 호환성 기반 후보군 필터링
      const compatibleAptTypes = this.getCompatibleAptTypes(hostAptType, criteria.aptTypes);
      
      // 2단계: 기본 조건 필터링 (위치, 시간, 나이 등)
      const baseQuery = `
        SELECT DISTINCT u.id, u.nickname, u.age, u.gender, up.type_code, up.archetype_name, 
               up.generated_image_url, u.location, u.created_at,
               ST_Distance(
                 ST_GeogFromText(CONCAT('POINT(', u.longitude, ' ', u.latitude, ')')),
                 ST_GeogFromText(CONCAT('POINT(', $3, ' ', $4, ')'))
               ) / 1000 as distance_km
        FROM users u
        JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id != $1 
        AND up.type_code = ANY($2)
        AND u.age BETWEEN $5 AND $6
        AND ($7 = 'any' OR u.gender = $7)
        AND u.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM exhibition_matches em2 
          WHERE em2.matched_user_id = u.id 
          AND em2.exhibition_id = $8 
          AND em2.status IN ('matched', 'completed')
        )
        HAVING distance_km <= $9
        ORDER BY distance_km
        LIMIT 100
      `;

      const candidatesResult = await client.query(baseQuery, [
        matchRequest.host_user_id,
        compatibleAptTypes,
        matchRequest.host_longitude || 126.9780, // 기본값: 서울 시청
        matchRequest.host_latitude || 37.5665,
        criteria.ageRange.min,
        criteria.ageRange.max,
        criteria.gender,
        matchRequest.exhibition_id,
        criteria.maxDistance
      ]);

      const candidates = candidatesResult.rows;

      // 3단계: 심층 매칭 점수 계산
      const scoredCandidates = await Promise.all(
        candidates.map(async candidate => {
          const score = await this.calculateMatchScore(matchRequest, candidate);
          return { ...candidate, matchScore: score };
        })
      );

      // 4단계: 상호 선호도 학습 반영
      const finalCandidates = await this.applyMutualPreferenceLearning(
        scoredCandidates, 
        matchRequest.host_user_id
      );

      // 5단계: 최종 정렬 및 반환
      return finalCandidates
        .filter(c => c.matchScore >= 60) // 최소 매칭 점수
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20);

    } finally {
      client.release();
    }
  }

  // ==================== 매칭 점수 계산 ====================
  
  async calculateMatchScore(matchRequest, candidate) {
    let totalScore = 0;
    const weights = {
      aptCompatibility: 40,    // APT 호환성
      location: 20,           // 위치 기반
      time: 15,              // 시간 호환성  
      interests: 10,         // 관심사 유사도
      experience: 8,         // 경험 수준
      socialActivity: 7      // 소셜 활동도
    };

    // 1. APT 호환성 점수 (40점)
    const hostAptType = matchRequest.host_apt_type;
    const candidateAptType = candidate.type_code;
    const aptScore = this.compatibilityMatrix[hostAptType][candidateAptType] || 50;
    totalScore += (aptScore / 100) * weights.aptCompatibility;

    // 2. 위치 기반 점수 (20점)
    const locationScore = this.calculateLocationScore(
      candidate.distance_km, 
      JSON.parse(matchRequest.matching_criteria).maxDistance
    );
    totalScore += locationScore * weights.location / 100;

    // 3. 시간 호환성 점수 (15점)
    const timeScore = await this.calculateTimeCompatibility(
      matchRequest.host_user_id,
      candidate.id,
      matchRequest.preferred_date,
      matchRequest.time_slot
    );
    totalScore += timeScore * weights.time / 100;

    // 4. 관심사 유사도 점수 (10점)
    const interestScore = await this.calculateInterestSimilarity(
      matchRequest.host_user_id,
      candidate.id
    );
    totalScore += interestScore * weights.interests / 100;

    // 5. 경험 수준 점수 (8점)
    const experienceScore = await this.calculateExperienceCompatibility(
      matchRequest.host_user_id,
      candidate.id
    );
    totalScore += experienceScore * weights.experience / 100;

    // 6. 소셜 활동도 점수 (7점)
    const socialScore = await this.calculateSocialActivityScore(candidate.id);
    totalScore += socialScore * weights.socialActivity / 100;

    // 보너스 점수
    totalScore += await this.calculateBonusScore(matchRequest, candidate);

    return Math.min(100, Math.max(0, Math.round(totalScore)));
  }

  // ==================== 위치 기반 스코어링 ====================
  
  calculateLocationScore(distanceKm, maxDistance) {
    if (distanceKm > maxDistance) return 0;
    
    // 거리별 점수 계산 (가까울수록 높은 점수)
    if (distanceKm <= 5) return 100;      // 5km 이내: 100점
    if (distanceKm <= 10) return 90;      // 10km 이내: 90점
    if (distanceKm <= 20) return 75;      // 20km 이내: 75점
    if (distanceKm <= 30) return 60;      // 30km 이내: 60점
    if (distanceKm <= 40) return 45;      // 40km 이내: 45점
    
    // 최대 거리 내에서 선형 감소
    return Math.max(20, 100 - (distanceKm / maxDistance) * 80);
  }

  // ==================== 실시간 매칭 및 알림 ====================
  
  async triggerRealTimeMatching(matchRequest) {
    const redis = getRedisClient();
    if (!redis) return;

    // 매칭 큐에 추가
    await redis.lpush('matching:queue', JSON.stringify({
      requestId: matchRequest.id,
      priority: this.calculateMatchPriority(matchRequest),
      timestamp: Date.now()
    }));

    // 실시간 매칭 프로세스 트리거
    await this.processMatchingQueue();
  }

  async processMatchingQueue() {
    const redis = getRedisClient();
    if (!redis) return;

    // 큐에서 매칭 요청 처리
    const queueItem = await redis.brpop('matching:queue', 0);
    if (!queueItem) return;

    const { requestId } = JSON.parse(queueItem[1]);
    
    try {
      const matches = await this.findCompatibleMatches(requestId);
      
      if (matches.length > 0) {
        // 매칭 결과를 실시간으로 전송
        await this.sendMatchingNotifications(requestId, matches);
        
        // 매칭 결과 캐싱
        await redis.setex(
          `matches:${requestId}`,
          3600, // 1시간
          JSON.stringify(matches)
        );
      }
      
      // 다음 큐 항목 처리
      setImmediate(() => this.processMatchingQueue());
      
    } catch (error) {
      console.error('매칭 처리 오류:', error);
      // 에러 발생 시 큐에 다시 추가 (재시도)
      await redis.lpush('matching:queue', queueItem[1]);
    }
  }

  // ==================== 매칭 수락/거절 처리 ====================
  
  async acceptMatch(matchRequestId, candidateUserId, acceptingUserId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 매칭 요청 상태 확인
      const matchRequest = await client.query(
        'SELECT * FROM exhibition_matches WHERE id = $1 AND status = $2',
        [matchRequestId, 'open']
      );

      if (matchRequest.rows.length === 0) {
        throw new Error('Match request not found or no longer available');
      }

      const request = matchRequest.rows[0];

      // 권한 확인 (호스트 또는 후보자만 수락 가능)
      if (acceptingUserId !== request.host_user_id && acceptingUserId !== candidateUserId) {
        throw new Error('Unauthorized to accept this match');
      }

      // 매칭 확정
      await client.query(
        `UPDATE exhibition_matches 
         SET matched_user_id = $1, status = $2, matched_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [candidateUserId, 'matched', matchRequestId]
      );

      // 매칭 성공 로그 저장
      await this.logMatchingSuccess(request.host_user_id, candidateUserId, matchRequestId);

      // 상호 선호도 학습 데이터 업데이트
      await this.updateMutualPreferenceLearning(
        request.host_user_id, 
        candidateUserId, 
        'accept'
      );

      await client.query('COMMIT');

      // 실시간 알림 전송
      await this.sendMatchConfirmationNotifications(request, candidateUserId);

      return { success: true, matchId: matchRequestId };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rejectMatch(matchRequestId, candidateUserId, rejectingUserId) {
    const client = await pool.connect();
    
    try {
      // 거절 로그 저장
      await client.query(
        `INSERT INTO matching_rejections (match_request_id, candidate_user_id, rejecting_user_id, reason)
         VALUES ($1, $2, $3, $4)`,
        [matchRequestId, candidateUserId, rejectingUserId, 'user_rejection']
      );

      // 상호 선호도 학습 데이터 업데이트 (네거티브 피드백)
      await this.updateMutualPreferenceLearning(
        rejectingUserId, 
        candidateUserId, 
        'reject'
      );

      return { success: true };

    } finally {
      client.release();
    }
  }

  // ==================== 헬퍼 함수들 ====================
  
  getCompatibleAptTypes(hostAptType, preferredTypes = []) {
    if (preferredTypes.length > 0) {
      return preferredTypes.filter(type => isValidSAYUType(type));
    }

    // 호환성 점수 70 이상인 타입들 반환
    const compatibleTypes = Object.keys(this.compatibilityMatrix[hostAptType])
      .filter(type => this.compatibilityMatrix[hostAptType][type] >= 70);
    
    return compatibleTypes;
  }

  calculateMatchPriority(matchRequest) {
    let priority = 50;
    
    // 신규 사용자에게 높은 우선순위
    const accountAge = Date.now() - new Date(matchRequest.created_at).getTime();
    if (accountAge < 7 * 24 * 60 * 60 * 1000) { // 7일 미만
      priority += 20;
    }

    // 활성 사용자에게 높은 우선순위
    if (matchRequest.recent_activity_score > 80) {
      priority += 15;
    }

    return priority;
  }

  async calculateTimeCompatibility(hostUserId, candidateId, preferredDate, timeSlot) {
    // 사용자들의 일반적인 활동 시간 패턴 분석
    const redis = getRedisClient();
    if (!redis) return 75; // 기본 점수

    const hostPattern = await redis.hget(`user:activity:${hostUserId}`, 'time_pattern');
    const candidatePattern = await redis.hget(`user:activity:${candidateId}`, 'time_pattern');

    if (!hostPattern || !candidatePattern) return 75;

    const hostPreferences = JSON.parse(hostPattern);
    const candidatePreferences = JSON.parse(candidatePattern);

    // 시간대 선호도 비교
    const timeSlotMap = { morning: 0, afternoon: 1, evening: 2 };
    const hostSlotPreference = hostPreferences[timeSlotMap[timeSlot]] || 50;
    const candidateSlotPreference = candidatePreferences[timeSlotMap[timeSlot]] || 50;

    // 두 사용자의 해당 시간대 선호도 평균
    return (hostSlotPreference + candidateSlotPreference) / 2;
  }

  async calculateInterestSimilarity(hostUserId, candidateId) {
    const client = await pool.connect();
    
    try {
      // 좋아요한 작품의 카테고리 분석
      const hostInterests = await client.query(`
        SELECT artwork_category, COUNT(*) as count
        FROM user_interactions 
        WHERE user_id = $1 AND interaction_type = 'like'
        GROUP BY artwork_category
      `, [hostUserId]);

      const candidateInterests = await client.query(`
        SELECT artwork_category, COUNT(*) as count
        FROM user_interactions 
        WHERE user_id = $1 AND interaction_type = 'like'
        GROUP BY artwork_category
      `, [candidateId]);

      if (hostInterests.rows.length === 0 || candidateInterests.rows.length === 0) {
        return 70; // 기본 점수
      }

      // 코사인 유사도 계산
      const similarity = this.calculateCosineSimilarity(
        hostInterests.rows,
        candidateInterests.rows
      );

      return Math.round(similarity * 100);

    } catch (error) {
      console.error('관심사 유사도 계산 오류:', error);
      return 70;
    } finally {
      client.release();
    }
  }

  calculateCosineSimilarity(vectorA, vectorB) {
    const mapA = new Map(vectorA.map(item => [item.artwork_category, item.count]));
    const mapB = new Map(vectorB.map(item => [item.artwork_category, item.count]));
    
    const allCategories = new Set([...mapA.keys(), ...mapB.keys()]);
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (const category of allCategories) {
      const valueA = mapA.get(category) || 0;
      const valueB = mapB.get(category) || 0;
      
      dotProduct += valueA * valueB;
      normA += valueA * valueA;
      normB += valueB * valueB;
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async calculateExperienceCompatibility(hostUserId, candidateId) {
    const client = await pool.connect();
    
    try {
      // 사용자들의 미술관 방문 횟수 비교
      const hostVisits = await client.query(
        'SELECT COUNT(*) as visit_count FROM exhibition_checkins WHERE user_id = $1',
        [hostUserId]
      );

      const candidateVisits = await client.query(
        'SELECT COUNT(*) as visit_count FROM exhibition_checkins WHERE user_id = $1',
        [candidateId]
      );

      const hostCount = parseInt(hostVisits.rows[0].visit_count);
      const candidateCount = parseInt(candidateVisits.rows[0].visit_count);

      // 경험 수준 차이에 따른 점수 계산
      const difference = Math.abs(hostCount - candidateCount);
      
      if (difference <= 2) return 100;     // 매우 유사
      if (difference <= 5) return 85;      // 유사
      if (difference <= 10) return 70;     // 보통
      if (difference <= 20) return 55;     // 약간 다름
      
      return 40; // 많이 다름

    } catch (error) {
      console.error('경험 호환성 계산 오류:', error);
      return 75;
    } finally {
      client.release();
    }
  }

  async calculateSocialActivityScore(candidateId) {
    const client = await pool.connect();
    
    try {
      // 최근 30일간 활동 점수 계산
      const activityResult = await client.query(`
        SELECT 
          COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) * 3 as comment_score,
          COUNT(CASE WHEN interaction_type = 'like' THEN 1 END) * 1 as like_score,
          COUNT(CASE WHEN interaction_type = 'share' THEN 1 END) * 2 as share_score
        FROM user_interactions 
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      `, [candidateId]);

      const activity = activityResult.rows[0];
      const totalScore = (activity.comment_score || 0) + 
                        (activity.like_score || 0) + 
                        (activity.share_score || 0);

      // 점수를 0-100 범위로 정규화
      return Math.min(100, Math.max(20, totalScore * 2));

    } catch (error) {
      console.error('소셜 활동도 계산 오류:', error);
      return 60;
    } finally {
      client.release();
    }
  }

  async calculateBonusScore(matchRequest, candidate) {
    let bonus = 0;

    // 신규 사용자 보너스
    const accountAge = Date.now() - new Date(candidate.created_at).getTime();
    if (accountAge < 30 * 24 * 60 * 60 * 1000) { // 30일 미만
      bonus += 5;
    }

    // 프리미엄 사용자 보너스
    if (candidate.is_premium) {
      bonus += 3;
    }

    // 완성된 프로필 보너스
    if (candidate.generated_image_url) {
      bonus += 2;
    }

    return bonus;
  }

  // ==================== 사용자 패턴 학습 ====================
  
  async updateMutualPreferenceLearning(userId, targetUserId, action) {
    const redis = getRedisClient();
    if (!redis) return;

    const key = `user:preferences:${userId}`;
    const weight = action === 'accept' ? 1 : -0.5;
    
    await redis.hincrby(key, `user:${targetUserId}`, weight);
    
    // APT 타입별 선호도도 업데이트
    const targetProfile = await this.getUserProfile(targetUserId);
    if (targetProfile && targetProfile.type_code) {
      await redis.hincrby(key, `apt:${targetProfile.type_code}`, weight);
    }
    
    // 7일 후 만료
    await redis.expire(key, 7 * 24 * 60 * 60);
  }

  async applyMutualPreferenceLearning(candidates, userId) {
    const redis = getRedisClient();
    if (!redis) return candidates;

    const preferences = await redis.hgetall(`user:preferences:${userId}`);
    if (!preferences) return candidates;

    return candidates.map(candidate => {
      let adjustedScore = candidate.matchScore;
      
      // 개별 사용자 선호도 적용
      const userPreference = preferences[`user:${candidate.id}`];
      if (userPreference) {
        adjustedScore += parseInt(userPreference) * 5;
      }
      
      // APT 타입 선호도 적용
      const aptPreference = preferences[`apt:${candidate.type_code}`];
      if (aptPreference) {
        adjustedScore += parseInt(aptPreference) * 3;
      }
      
      return {
        ...candidate,
        matchScore: Math.min(100, Math.max(0, adjustedScore)),
        learningAdjustment: adjustedScore - candidate.matchScore
      };
    });
  }

  // ==================== 알림 시스템 ====================
  
  async sendMatchingNotifications(requestId, matches) {
    const client = await pool.connect();
    
    try {
      // 매칭 요청자에게 알림
      const hostResult = await client.query(
        'SELECT host_user_id FROM exhibition_matches WHERE id = $1',
        [requestId]
      );

      if (hostResult.rows.length === 0) return;
      
      const hostUserId = hostResult.rows[0].host_user_id;
      
      // 실시간 알림 전송 (WebSocket 또는 Server-Sent Events)
      await this.sendRealTimeNotification(hostUserId, {
        type: 'matches_found',
        matchRequestId: requestId,
        matchCount: matches.length,
        topMatches: matches.slice(0, 3).map(m => ({
          id: m.id,
          nickname: m.nickname,
          aptType: m.type_code,
          matchScore: m.matchScore
        }))
      });

      // 이메일/푸시 알림 (선택사항)
      if (matches.length > 0) {
        await this.sendPushNotification(hostUserId, {
          title: '새로운 전시 동행자를 찾았어요!',
          body: `${matches.length}명의 호환 가능한 사용자를 발견했습니다.`,
          data: { requestId, type: 'matches_found' }
        });
      }

    } finally {
      client.release();
    }
  }

  async sendMatchConfirmationNotifications(matchRequest, matchedUserId) {
    // 양쪽 사용자에게 확정 알림
    const notifications = [
      {
        userId: matchRequest.host_user_id,
        message: '전시 동행이 확정되었습니다!',
        type: 'match_confirmed'
      },
      {
        userId: matchedUserId,
        message: '전시 동행이 확정되었습니다!',
        type: 'match_confirmed'
      }
    ];

    for (const notification of notifications) {
      await this.sendRealTimeNotification(notification.userId, {
        type: notification.type,
        message: notification.message,
        matchId: matchRequest.id,
        exhibitionId: matchRequest.exhibition_id
      });
    }
  }

  async sendRealTimeNotification(userId, data) {
    const redis = getRedisClient();
    if (!redis) return;

    // Redis Pub/Sub을 통한 실시간 알림
    await redis.publish(`user:${userId}:notifications`, JSON.stringify(data));
  }

  async sendPushNotification(userId, notification) {
    // 푸시 알림 구현 (FCM, APNS 등)
    // 실제 구현에서는 사용자의 디바이스 토큰을 조회하여 전송
    console.log(`푸시 알림 전송 - 사용자 ${userId}:`, notification);
  }

  // ==================== 데이터 접근 함수들 ====================
  
  async getUserProfile(userId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT u.*, up.type_code, up.archetype_name, up.generated_image_url
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `, [userId]);

      return result.rows[0] || null;
      
    } finally {
      client.release();
    }
  }

  async getExhibitionInfo(exhibitionId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM global_venues WHERE id = $1
      `, [exhibitionId]);

      return result.rows[0] || null;
      
    } finally {
      client.release();
    }
  }

  async addToMatchingPool(matchRequest) {
    const redis = getRedisClient();
    if (!redis) return;

    // 매칭 풀에 추가 (위치 기반 인덱싱)
    const geoKey = 'matching:pool:geo';
    const metaKey = `matching:pool:meta:${matchRequest.id}`;
    
    // 지리적 위치로 인덱싱
    await redis.geoadd(
      geoKey,
      matchRequest.longitude || 126.9780,
      matchRequest.latitude || 37.5665,
      matchRequest.id
    );
    
    // 메타데이터 저장
    await redis.setex(metaKey, 7 * 24 * 60 * 60, JSON.stringify(matchRequest));
  }

  async logMatchingSuccess(hostUserId, matchedUserId, matchRequestId) {
    const client = await pool.connect();
    
    try {
      await client.query(`
        INSERT INTO matching_success_logs 
        (host_user_id, matched_user_id, match_request_id, success_factors)
        VALUES ($1, $2, $3, $4)
      `, [
        hostUserId,
        matchedUserId, 
        matchRequestId,
        JSON.stringify({ timestamp: Date.now() })
      ]);
      
    } catch (error) {
      console.error('매칭 성공 로그 저장 오류:', error);
    } finally {
      client.release();
    }
  }

  // ==================== 매칭 품질 분석 ====================
  
  async getMatchingAnalytics(userId) {
    const client = await pool.connect();
    
    try {
      // 사용자의 매칭 성공률 분석
      const analytics = await client.query(`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'matched' THEN 1 END) as successful_matches,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_matches,
          AVG(EXTRACT(EPOCH FROM (matched_at - created_at))/3600) as avg_match_time_hours
        FROM exhibition_matches 
        WHERE host_user_id = $1
      `, [userId]);

      const feedbackStats = await client.query(`
        SELECT 
          AVG(rating) as avg_rating,
          COUNT(*) as total_feedback
        FROM match_feedback 
        WHERE target_user_id = $1
      `, [userId]);

      return {
        matchingStats: analytics.rows[0],
        feedbackStats: feedbackStats.rows[0]
      };
      
    } finally {
      client.release();
    }
  }
}

module.exports = ExhibitionMatchingService;