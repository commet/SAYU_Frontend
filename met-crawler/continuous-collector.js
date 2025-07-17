const { massCollect } = require('./mass-collector');
const fs = require('fs');

// 지속적인 수집 함수
async function continuousCollect() {
  console.log('🔄 지속적인 수집 시작...\n');
  
  let sessionCount = 0;
  const maxSessions = 10; // 최대 10세션
  
  while (sessionCount < maxSessions) {
    try {
      console.log(`\n🎯 세션 ${sessionCount + 1}/${maxSessions} 시작`);
      
      // 현재 진행 상황 체크
      const progressFile = './met-artworks-data/mass-progress.json';
      let currentCount = 0;
      
      if (fs.existsSync(progressFile)) {
        const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
        currentCount = progress.totalCollected;
      }
      
      console.log(`📊 현재 수집: ${currentCount}개`);
      
      // 목표 달성 체크
      if (currentCount >= 2000) {
        console.log('🎉 목표 달성! 2000개 이상 수집 완료');
        break;
      }
      
      // 5분 동안 수집 (300000ms)
      const collectPromise = massCollect();
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve('timeout'), 300000); // 5분 타임아웃
      });
      
      const result = await Promise.race([collectPromise, timeoutPromise]);
      
      if (result === 'timeout') {
        console.log('\n⏰ 5분 세션 완료, 다음 세션 준비...');
      }
      
      sessionCount++;
      
      // 세션 간 휴식 (1분)
      if (sessionCount < maxSessions) {
        console.log('😴 1분 휴식...');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
      
    } catch (error) {
      console.error(`❌ 세션 ${sessionCount + 1} 오류:`, error.message);
      
      // 오류 발생 시 더 긴 휴식 (5분)
      console.log('🛌 5분 휴식 후 재시도...');
      await new Promise(resolve => setTimeout(resolve, 300000));
    }
  }
  
  // 최종 결과 확인
  if (fs.existsSync('./met-artworks-data/mass-progress.json')) {
    const finalProgress = JSON.parse(fs.readFileSync('./met-artworks-data/mass-progress.json', 'utf8'));
    console.log(`\n✨ 최종 결과: ${finalProgress.totalCollected}개 수집`);
    
    // 2000개 이상이면 Cloudinary 업로드 제안
    if (finalProgress.totalCollected >= 1000) {
      console.log('\n🚀 1000개 이상 수집 완료!');
      console.log('💡 다음 단계: Cloudinary 업로드 스크립트 실행');
      console.log('   명령어: npm run upload ./met-artworks-data/met-mass-final-[timestamp].json');
    }
  }
}

// 실행
if (require.main === module) {
  continuousCollect().catch(console.error);
}

module.exports = { continuousCollect };