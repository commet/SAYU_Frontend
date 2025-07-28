const waitlistService = require('../services/waitlistService');
const { validationResult } = require('express-validator');

class WaitlistController {
  // 대기 목록 가입
  async join(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, referralCode, source } = req.body;

      const result = await waitlistService.joinWaitlist(
        email,
        referralCode,
        { source, userAgent: req.get('user-agent') }
      );

      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      console.error('Waitlist join error:', error);
      res.status(500).json({
        success: false,
        message: '대기 목록 등록 중 오류가 발생했습니다.'
      });
    }
  }

  // APT 테스트 완료
  async completeApt(req, res) {
    try {
      const { email, aptScore } = req.body;

      const result = await waitlistService.completeAptTest(email, aptScore);

      res.json(result);
    } catch (error) {
      console.error('APT completion error:', error);
      res.status(500).json({
        success: false,
        message: 'APT 테스트 완료 처리 중 오류가 발생했습니다.'
      });
    }
  }

  // 대기 목록 통계
  async getStats(req, res) {
    try {
      const stats = await waitlistService.getWaitlistStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: '통계 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 내 순위 확인
  async checkPosition(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: '이메일이 필요합니다.'
        });
      }

      const position = await waitlistService.getPosition(email);

      if (!position) {
        return res.status(404).json({
          success: false,
          message: '대기 목록에서 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: position
      });
    } catch (error) {
      console.error('Check position error:', error);
      res.status(500).json({
        success: false,
        message: '순위 확인 중 오류가 발생했습니다.'
      });
    }
  }

  // 레퍼럴 통계
  async getReferralStats(req, res) {
    try {
      const { referralCode } = req.params;

      const referrer = await waitlistService.getReferralStats(referralCode);

      if (!referrer) {
        return res.status(404).json({
          success: false,
          message: '유효하지 않은 레퍼럴 코드입니다.'
        });
      }

      res.json({
        success: true,
        data: {
          referralCount: referrer.referralCount,
          needMore: Math.max(0, 3 - referrer.referralCount),
          accessGranted: referrer.accessGranted
        }
      });
    } catch (error) {
      console.error('Get referral stats error:', error);
      res.status(500).json({
        success: false,
        message: '레퍼럴 통계 조회 중 오류가 발생했습니다.'
      });
    }
  }
}

module.exports = new WaitlistController();
