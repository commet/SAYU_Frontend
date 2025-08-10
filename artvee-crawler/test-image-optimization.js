const CompleteArtworkDownloader = require('./download-and-upload-complete');
const path = require('path');
const { existsSync } = require('fs');

/**
 * 이미지 최적화 기능 테스트
 */
async function testOptimization() {
  console.log('🧪 이미지 최적화 기능 테스트 시작\n');
  
  const downloader = new CompleteArtworkDownloader();
  
  // 테스트용 이미지 URL (큰 이미지)
  const testCases = [
    {
      name: 'Large Van Gogh painting',
      url: 'https://mdl.artvee.com/sftb/86047vg.jpg',
      expectedSize: '> 10MB'
    },
    {
      name: 'Medium Mucha artwork', 
      url: 'https://mdl.artvee.com/sftb/17568am.jpg',
      expectedSize: '5-10MB'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📋 테스트 ${i + 1}: ${testCase.name}`);
    console.log(`🔗 URL: ${testCase.url}`);
    
    try {
      const testImagePath = path.join(downloader.baseDir, `test-${i + 1}.jpg`);
      
      // 디렉토리 생성
      await downloader.init();
      
      console.log('⬇️ 이미지 다운로드 중...');
      await downloader.downloadImage(testCase.url, testImagePath);
      
      if (existsSync(testImagePath)) {
        const fs = require('fs');
        const stats = fs.statSync(testImagePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        
        console.log(`✅ 최적화 완료: ${sizeMB}MB`);
        console.log(`📊 10MB 제한 준수: ${stats.size <= 10485760 ? '✅' : '❌'}`);
        
        // 테스트 파일 정리
        fs.unlinkSync(testImagePath);
      } else {
        console.log('❌ 파일이 생성되지 않음');
      }
      
    } catch (error) {
      console.log(`❌ 테스트 실패: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
  
  // 임시 파일 정리
  await downloader.cleanupTempFiles();
  
  console.log('\n🎯 테스트 완료');
}

if (require.main === module) {
  testOptimization().catch(console.error);
}