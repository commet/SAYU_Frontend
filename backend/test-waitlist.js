require('dotenv').config();
const sequelize = require('./src/config/sequelize');
const Waitlist = require('./src/models/waitlistModel');
const waitlistService = require('./src/services/waitlistService');

async function testWaitlist() {
  try {
    console.log('🧪 Testing Waitlist System...\n');

    // 1. 테이블 동기화
    console.log('1️⃣ Syncing Waitlist table...');
    await Waitlist.sync({ force: true }); // force: true로 변경하여 테이블 재생성
    
    // 자기 참조 관계 추가
    await sequelize.query(`
      ALTER TABLE waitlists 
      ADD CONSTRAINT fk_waitlists_referred_by 
      FOREIGN KEY ("referredBy") 
      REFERENCES waitlists(id) 
      ON DELETE SET NULL
    `).catch(() => {}); // 이미 존재할 수 있으므로 에러 무시
    
    console.log('✅ Table synced successfully\n');

    // 2. 첫 번째 사용자 등록
    console.log('2️⃣ Registering first user...');
    const user1 = await waitlistService.joinWaitlist(
      'test1@example.com',
      null,
      { source: 'test' }
    );
    console.log('✅ User 1 registered:', {
      position: user1.data.position,
      referralCode: user1.data.referralCode
    });
    console.log('\n');

    // 3. 레퍼럴로 두 번째 사용자 등록
    console.log('3️⃣ Registering second user with referral...');
    const user2 = await waitlistService.joinWaitlist(
      'test2@example.com',
      user1.data.referralCode,
      { source: 'referral' }
    );
    console.log('✅ User 2 registered with referral');
    console.log('\n');

    // 4. APT 테스트 완료
    console.log('4️⃣ Completing APT test for user 1...');
    const aptResult = await waitlistService.completeAptTest(
      'test1@example.com',
      {
        dominant: 'INTJ',
        secondary: 'INFJ',
        scores: { I: 80, N: 75, T: 70, J: 85 }
      }
    );
    console.log('✅ APT test completed:', {
      newPosition: aptResult.data.newPosition,
      accessGranted: aptResult.data.accessGranted
    });
    console.log('\n');

    // 5. 통계 확인
    console.log('5️⃣ Getting waitlist stats...');
    const stats = await waitlistService.getWaitlistStats();
    console.log('✅ Stats:', stats);
    console.log('\n');

    // 6. 위치 확인
    console.log('6️⃣ Checking position for user 1...');
    const position = await waitlistService.getPosition('test1@example.com');
    console.log('✅ Position info:', position);
    console.log('\n');

    // 7. 레퍼럴 통계
    console.log('7️⃣ Getting referral stats...');
    const referralStats = await waitlistService.getReferralStats(user1.data.referralCode);
    console.log('✅ Referral stats:', {
      email: referralStats.email,
      referralCount: referralStats.referralCount,
      referrals: referralStats.referrals?.length || 0
    });
    console.log('\n');

    console.log('🎉 All tests passed successfully!');

    // 테스트 데이터 정리
    console.log('\n🧹 Cleaning up test data...');
    await Waitlist.destroy({ where: { email: ['test1@example.com', 'test2@example.com'] } });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

// 실행
testWaitlist();