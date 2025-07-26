const Waitlist = require('../models/waitlistModel');
const crypto = require('crypto');
const { Op } = require('sequelize');
const emailService = require('./emailService');
let redisClient;
try {
  redisClient = require('../config/redis');
} catch (error) {
  console.log('Redis not configured, using in-memory cache');
}

class WaitlistService {
  // 대기자 등록
  async joinWaitlist(email, referralCode = null, metadata = {}) {
    try {
      // 이미 등록되었는지 확인
      const existing = await Waitlist.findOne({ where: { email } });
      if (existing) {
        return {
          success: false,
          message: '이미 등록된 이메일입니다.',
          data: {
            position: existing.position,
            referralCode: existing.referralCode
          }
        };
      }

      // 레퍼럴 코드 생성
      const newReferralCode = this.generateReferralCode();
      
      // 레퍼럴 확인
      let referrer = null;
      if (referralCode) {
        referrer = await Waitlist.findOne({ 
          where: { referralCode } 
        });
        
        if (referrer) {
          // 레퍼럴 카운트 증가
          await referrer.increment('referralCount');
          
          // 3명 초대 시 보상
          if (referrer.referralCount >= 3 && !referrer.accessGranted) {
            await this.grantAccess(referrer.id);
          }
        }
      }

      // 새 대기자 생성
      const waitlistEntry = await Waitlist.create({
        email,
        referralCode: newReferralCode,
        referredBy: referrer?.id || null,
        metadata: {
          ...metadata,
          source: metadata.source || 'direct',
          timestamp: new Date()
        }
      });

      // 환영 이메일 발송
      await this.sendWelcomeEmail(email, waitlistEntry);

      // 실시간 대기자 수 업데이트
      await this.updateRealtimeCount();

      return {
        success: true,
        data: {
          position: waitlistEntry.position,
          referralCode: newReferralCode,
          referralLink: `${process.env.FRONTEND_URL}/beta?ref=${newReferralCode}`
        }
      };
    } catch (error) {
      console.error('Waitlist join error:', error);
      throw error;
    }
  }

  // APT 테스트 완료 처리
  async completeAptTest(email, aptScore) {
    try {
      const waitlistEntry = await Waitlist.findOne({ where: { email } });
      
      if (!waitlistEntry) {
        throw new Error('대기 목록에서 찾을 수 없습니다.');
      }

      await waitlistEntry.update({
        aptTestCompleted: true,
        aptScore
      });

      // APT 완료 시 즉시 기본 접근 권한 부여
      await this.grantAccess(waitlistEntry.id, 'basic');

      // 초기 이용자 혜택 - 초대 코드 3개 제공
      const inviteCodes = await this.generateInviteCodes(waitlistEntry.id, 3);

      return {
        success: true,
        data: {
          accessLevel: 'basic',
          accessGranted: true,
          inviteCodes,
          earlyAdopterBenefits: {
            exclusiveInvites: 3,
            priorityFeatures: true,
            specialBadge: 'early_adopter',
            futurePerks: '추후 프리미엄 기능 우선 접근권'
          }
        }
      };
    } catch (error) {
      console.error('APT test completion error:', error);
      throw error;
    }
  }

  // 접근 권한 부여
  async grantAccess(waitlistId, accessLevel = 'full') {
    try {
      const entry = await Waitlist.findByPk(waitlistId);
      
      if (!entry) {
        return false;
      }

      await entry.update({
        accessGranted: true,
        accessGrantedAt: new Date(),
        accessLevel,
        metadata: {
          ...entry.metadata,
          accessLevel,
          grantedFeatures: this.getFeaturesByAccessLevel(accessLevel)
        }
      });

      // 접근 레벨에 따른 이메일 발송
      if (accessLevel === 'basic') {
        await this.sendBasicAccessEmail(entry.email);
      } else {
        await this.sendBetaAccessEmail(entry.email);
      }

      return true;
    } catch (error) {
      console.error('Grant access error:', error);
      throw error;
    }
  }

  // 대기 목록 통계
  async getWaitlistStats() {
    try {
      const totalCount = await Waitlist.count();
      const aptCompletedCount = await Waitlist.count({
        where: { aptTestCompleted: true }
      });
      const accessGrantedCount = await Waitlist.count({
        where: { accessGranted: true }
      });

      // Redis에서 실시간 카운트 가져오기
      const realtimeCount = redisClient ? await redisClient.get('waitlist:total:count') : totalCount;

      return {
        total: parseInt(realtimeCount),
        aptCompleted: aptCompletedCount,
        accessGranted: accessGrantedCount,
        conversionRate: totalCount > 0 ? (aptCompletedCount / totalCount * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Get waitlist stats error:', error);
      throw error;
    }
  }

  // 레퍼럴 코드 생성
  generateReferralCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // 초대 코드 생성
  async generateInviteCodes(userId, count = 3) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = `EARLY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      codes.push({
        code,
        createdBy: userId,
        type: 'early_adopter',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 유효
      });
    }
    
    // DB에 저장 (InviteCode 모델이 있다고 가정)
    // await InviteCode.bulkCreate(codes);
    
    return codes.map(c => c.code);
  }

  // 접근 레벨별 기능 정의
  getFeaturesByAccessLevel(level) {
    const features = {
      basic: [
        'apt_test',
        'basic_recommendations',
        'community_view',
        'profile_creation',
        'daily_artwork',
        'basic_analytics'
      ],
      premium: [
        'apt_test',
        'advanced_recommendations',
        'community_full',
        'profile_advanced',
        'unlimited_artwork',
        'advanced_analytics',
        'art_pulse_participation',
        'special_exhibitions'
      ],
      full: [
        'all_features'
      ]
    };

    return features[level] || features.basic;
  }

  // 실시간 카운트 업데이트 (Redis)
  async updateRealtimeCount() {
    try {
      const count = await Waitlist.count();
      
      if (redisClient && redisClient.set) {
        await redisClient.set('waitlist:total:count', count, 'EX', 300); // 5분 캐시
      }
      
      // 실시간 이벤트 발행 (Socket.io나 SSE로 전달)
      if (global.io) {
        global.io.emit('waitlist:update', { total: count });
      }
    } catch (error) {
      console.error('Update realtime count error:', error);
    }
  }

  // 환영 이메일 발송
  async sendWelcomeEmail(email, waitlistEntry) {
    const emailContent = `
      <h2>SAYU 베타 대기 목록에 등록되었습니다!</h2>
      <p>현재 대기 순번: <strong>${waitlistEntry.position}번</strong></p>
      
      <h3>더 빨리 입장하는 방법:</h3>
      <ol>
        <li>APT 성격 테스트 완료하기 (50% 순번 단축)</li>
        <li>친구 3명 초대하기 (즉시 입장권 획득)</li>
      </ol>
      
      <p>당신의 초대 링크: ${process.env.FRONTEND_URL}/beta?ref=${waitlistEntry.referralCode}</p>
      
      <a href="${process.env.FRONTEND_URL}/apt-test" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">
        APT 테스트 시작하기
      </a>
    `;

    // emailService가 구현되어 있다면 사용
    try {
      if (emailService && emailService.sendEmail) {
        await emailService.sendEmail({
          to: email,
          subject: 'SAYU 베타 대기 목록 등록 완료 🎨',
          html: emailContent,
          template: 'waitlist-welcome'  // 템플릿 지정
        });
      }
    } catch (error) {
      console.error('Welcome email send error:', error);
    }
  }

  // 베이직 액세스 이메일 발송
  async sendBasicAccessEmail(email) {
    const emailContent = `
      <h2>축하합니다! SAYU를 시작할 수 있습니다! 🎨</h2>
      <p>APT 테스트를 완료하여 SAYU의 기본 기능을 이용할 수 있게 되었습니다.</p>
      
      <h3>지금 사용 가능한 기능:</h3>
      <ul>
        <li>✅ 매일 추천 작품 감상</li>
        <li>✅ 나만의 예술 프로필 생성</li>
        <li>✅ 커뮤니티 감상 보기</li>
        <li>✅ 기본 성장 분석</li>
      </ul>

      <h3>초기 이용자 특별 혜택:</h3>
      <ul>
        <li>🎁 친구 초대 코드 3개 제공</li>
        <li>🏆 얼리 어답터 뱃지</li>
        <li>🚀 향후 프리미엄 기능 우선 접근권</li>
      </ul>
      
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">
        SAYU 시작하기
      </a>
    `;

    try {
      if (emailService && emailService.sendEmail) {
        await emailService.sendEmail({
          to: email,
          subject: '🎨 SAYU에 오신 것을 환영합니다!',
          html: emailContent,
          template: 'basic-access'
        });
      }
    } catch (error) {
      console.error('Basic access email send error:', error);
    }
  }

  // 베타 접근 이메일 발송
  async sendBetaAccessEmail(email) {
    const emailContent = `
      <h2>축하합니다! SAYU 프리미엄 기능이 열렸습니다! 🎉</h2>
      <p>이제 SAYU의 고급 기능을 모두 이용하실 수 있습니다.</p>
      
      <h3>추가로 사용 가능해진 기능:</h3>
      <ol>
        <li>🌟 Art Pulse 실시간 공동 감상</li>
        <li>🎯 고급 AI 추천 시스템</li>
        <li>🏛️ 특별 전시 우선 참여</li>
        <li>📊 심층 성장 분석</li>
      </ol>
      
      <a href="${process.env.FRONTEND_URL}/premium" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">
        프리미엄 기능 둘러보기
      </a>
    `;

    try {
      if (emailService && emailService.sendEmail) {
        await emailService.sendEmail({
          to: email,
          subject: '🎉 SAYU 프리미엄 기능이 열렸습니다!',
          html: emailContent,
          template: 'beta-access'
        });
      }
    } catch (error) {
      console.error('Beta access email send error:', error);
    }
  }

  // 대기 목록 순위 조회
  async getPosition(email) {
    try {
      const entry = await Waitlist.findOne({ where: { email } });
      
      if (!entry) {
        return null;
      }

      // 앞에 있는 사람 수 계산
      const aheadCount = await Waitlist.count({
        where: {
          position: { [Op.lt]: entry.position },
          accessGranted: false
        }
      });

      return {
        position: entry.position,
        aheadCount,
        aptCompleted: entry.aptTestCompleted,
        referralCount: entry.referralCount,
        accessGranted: entry.accessGranted
      };
    } catch (error) {
      console.error('Get position error:', error);
      throw error;
    }
  }

  // 레퍼럴 통계 조회
  async getReferralStats(referralCode) {
    try {
      const referrer = await Waitlist.findOne({ 
        where: { referralCode },
        include: [{
          model: Waitlist,
          as: 'referrals',
          attributes: ['id', 'email', 'createdAt']
        }]
      });
      
      return referrer;
    } catch (error) {
      console.error('Get referral stats error:', error);
      throw error;
    }
  }
}

module.exports = new WaitlistService();