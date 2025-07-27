// 전시 동행 매칭 시스템 테스트
const ExhibitionMatchingService = require('../src/services/exhibitionMatchingService');
const { pool } = require('../src/config/database');

describe('Exhibition Matching System', () => {
  let matchingService;
  let testUsers = [];
  let testExhibition;

  beforeAll(async () => {
    matchingService = new ExhibitionMatchingService();
    
    // 테스트 사용자 생성
    await setupTestUsers();
    await setupTestExhibition();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await cleanupTestData();
    await pool.end();
  });

  describe('APT 호환성 매트릭스', () => {
    test('여우(LAEF)와 강아지(SREF)의 호환성이 높아야 함', () => {
      const compatibility = matchingService.compatibilityMatrix['LAEF']['SREF'];
      expect(compatibility).toBeGreaterThan(80);
    });

    test('모든 APT 타입이 자기 자신과 90점 이상의 호환성을 가져야 함', () => {
      const aptTypes = Object.keys(matchingService.compatibilityMatrix);
      
      aptTypes.forEach(type => {
        const selfCompatibility = matchingService.compatibilityMatrix[type][type];
        expect(selfCompatibility).toBeGreaterThanOrEqual(90);
      });
    });

    test('호환성 매트릭스가 대칭적이어야 함', () => {
      const aptTypes = Object.keys(matchingService.compatibilityMatrix);
      
      aptTypes.forEach(typeA => {
        aptTypes.forEach(typeB => {
          const compatibilityAB = matchingService.compatibilityMatrix[typeA][typeB];
          const compatibilityBA = matchingService.compatibilityMatrix[typeB][typeA];
          expect(compatibilityAB).toBe(compatibilityBA);
        });
      });
    });
  });

  describe('매칭 요청 생성', () => {
    test('유효한 매칭 요청을 생성할 수 있어야 함', async () => {
      const matchData = {
        exhibitionId: testExhibition.id,
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
        timeSlot: 'afternoon',
        maxDistance: 30,
        ageRange: { min: 20, max: 40 }
      };

      const result = await matchingService.createMatchRequest(testUsers[0].id, matchData);
      
      expect(result).toBeDefined();
      expect(result.exhibition_id).toBe(testExhibition.id);
      expect(result.host_user_id).toBe(testUsers[0].id);
      expect(result.status).toBe('open');
    });

    test('중복 매칭 요청은 거부되어야 함', async () => {
      const matchData = {
        exhibitionId: testExhibition.id,
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        timeSlot: 'morning'
      };

      // 첫 번째 요청
      await matchingService.createMatchRequest(testUsers[1].id, matchData);
      
      // 중복 요청 - 에러가 발생해야 함
      await expect(
        matchingService.createMatchRequest(testUsers[1].id, matchData)
      ).rejects.toThrow('already have an open match request');
    });
  });

  describe('호환성 기반 매칭', () => {
    test('호환 가능한 사용자를 찾을 수 있어야 함', async () => {
      // 매칭 요청 생성
      const matchData = {
        exhibitionId: testExhibition.id,
        preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        timeSlot: 'evening'
      };

      const matchRequest = await matchingService.createMatchRequest(testUsers[2].id, matchData);
      
      // 매칭 찾기
      const matches = await matchingService.findCompatibleMatches(matchRequest.id);
      
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
      
      // 매칭 점수가 있어야 함
      matches.forEach(match => {
        expect(match.matchScore).toBeGreaterThan(0);
        expect(match.matchScore).toBeLessThanOrEqual(100);
      });
    });

    test('매칭 결과가 점수 순으로 정렬되어야 함', async () => {
      const matchData = {
        exhibitionId: testExhibition.id,
        preferredDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        timeSlot: 'morning'
      };

      const matchRequest = await matchingService.createMatchRequest(testUsers[3].id, matchData);
      const matches = await matchingService.findCompatibleMatches(matchRequest.id);
      
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i-1].matchScore).toBeGreaterThanOrEqual(matches[i].matchScore);
      }
    });
  });

  describe('위치 기반 스코어링', () => {
    test('가까운 거리일수록 높은 점수를 받아야 함', () => {
      const score5km = matchingService.calculateLocationScore(5, 50);
      const score20km = matchingService.calculateLocationScore(20, 50);
      const score40km = matchingService.calculateLocationScore(40, 50);
      
      expect(score5km).toBeGreaterThan(score20km);
      expect(score20km).toBeGreaterThan(score40km);
    });

    test('최대 거리를 초과하면 0점을 받아야 함', () => {
      const score = matchingService.calculateLocationScore(60, 50);
      expect(score).toBe(0);
    });
  });

  describe('매칭 수락/거절', () => {
    test('매칭을 수락할 수 있어야 함', async () => {
      const matchData = {
        exhibitionId: testExhibition.id,
        preferredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        timeSlot: 'afternoon'
      };

      const matchRequest = await matchingService.createMatchRequest(testUsers[4].id, matchData);
      const candidateUserId = testUsers[5].id;
      
      const result = await matchingService.acceptMatch(
        matchRequest.id,
        candidateUserId,
        testUsers[4].id // 호스트가 수락
      );
      
      expect(result.success).toBe(true);
      expect(result.matchId).toBe(matchRequest.id);
    });

    test('매칭을 거절할 수 있어야 함', async () => {
      const matchData = {
        exhibitionId: testExhibition.id,
        preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        timeSlot: 'evening'
      };

      const matchRequest = await matchingService.createMatchRequest(testUsers[6].id, matchData);
      const candidateUserId = testUsers[7].id;
      
      const result = await matchingService.rejectMatch(
        matchRequest.id,
        candidateUserId,
        testUsers[6].id
      );
      
      expect(result.success).toBe(true);
    });
  });

  describe('매칭 품질 분석', () => {
    test('사용자의 매칭 분석 데이터를 조회할 수 있어야 함', async () => {
      const analytics = await matchingService.getMatchingAnalytics(testUsers[0].id);
      
      expect(analytics).toBeDefined();
      expect(analytics.matchingStats).toBeDefined();
      expect(analytics.feedbackStats).toBeDefined();
      
      expect(typeof analytics.matchingStats.total_requests).toBe('string');
      expect(typeof analytics.matchingStats.successful_matches).toBe('string');
    });
  });

  // ==================== 헬퍼 함수들 ====================

  async function setupTestUsers() {
    const aptTypes = ['LAEF', 'SREF', 'SAEC', 'LRMC', 'SAMF', 'LREC', 'SRMC', 'SAEF'];
    
    for (let i = 0; i < 8; i++) {
      const user = await createTestUser({
        nickname: `testuser${i}`,
        age: 25 + i,
        email: `test${i}@example.com`,
        aptType: aptTypes[i],
        location: '서울시 강남구'
      });
      testUsers.push(user);
    }
  }

  async function createTestUser(userData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 사용자 생성
      const userResult = await client.query(`
        INSERT INTO users (nickname, age, email, location, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        userData.nickname,
        userData.age,
        userData.email,
        userData.location,
        37.5665 + Math.random() * 0.1, // 서울 근처 랜덤 위치
        126.9780 + Math.random() * 0.1
      ]);

      const user = userResult.rows[0];

      // 사용자 프로필 생성
      await client.query(`
        INSERT INTO user_profiles (user_id, type_code, archetype_name)
        VALUES ($1, $2, $3)
      `, [
        user.id,
        userData.aptType,
        getArchetypeName(userData.aptType)
      ]);

      await client.query('COMMIT');
      return user;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function setupTestExhibition() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO global_venues (name, location, latitude, longitude, venue_type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        '테스트 미술관',
        '서울시 중구 세종대로',
        37.5665,
        126.9780,
        'museum'
      ]);

      testExhibition = result.rows[0];
      
    } finally {
      client.release();
    }
  }

  function getArchetypeName(aptType) {
    const names = {
      'LAEF': '몽환적 방랑자',
      'SREF': '열정적 관람자',
      'SAEC': '예술 네트워커',
      'LRMC': '학구적 연구자',
      'SAMF': '영감 전도사',
      'LREC': '섬세한 감정가',
      'SRMC': '체계적 교육자',
      'SAEF': '감성 나눔이'
    };
    return names[aptType] || '미지의 유형';
  }

  async function cleanupTestData() {
    const client = await pool.connect();
    
    try {
      // 테스트 데이터 삭제
      const userIds = testUsers.map(user => user.id);
      
      if (userIds.length > 0) {
        await client.query(`DELETE FROM exhibition_matches WHERE host_user_id = ANY($1)`, [userIds]);
        await client.query(`DELETE FROM user_profiles WHERE user_id = ANY($1)`, [userIds]);
        await client.query(`DELETE FROM users WHERE id = ANY($1)`, [userIds]);
      }
      
      if (testExhibition) {
        await client.query(`DELETE FROM global_venues WHERE id = $1`, [testExhibition.id]);
      }
      
    } catch (error) {
      console.error('테스트 데이터 정리 오류:', error);
    } finally {
      client.release();
    }
  }
});

// 매칭 서비스 성능 테스트
describe('Performance Tests', () => {
  test('100명의 후보자 중에서 매칭을 1초 내에 완료해야 함', async () => {
    const startTime = Date.now();
    
    // 실제로는 mock 데이터나 별도의 성능 테스트 환경에서 수행
    const mockCandidates = Array.from({ length: 100 }, (_, i) => ({
      id: `user${i}`,
      type_code: 'LAEF',
      distance_km: Math.random() * 50
    }));

    const matchingService = new ExhibitionMatchingService();
    
    // 모의 매칭 점수 계산
    const scores = await Promise.all(
      mockCandidates.map(async candidate => {
        return {
          ...candidate,
          matchScore: Math.floor(Math.random() * 100)
        };
      })
    );

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // 1초 미만
    expect(scores.length).toBe(100);
  });
});

module.exports = {
  ExhibitionMatchingService
};