const CompleteArtworkDownloader = require('./download-and-upload-complete');
const path = require('path');
const { existsSync, statSync } = require('fs');

/**
 * 기존 대용량 이미지 파일들의 압축 테스트
 */
async function testExistingFiles() {
  console.log('🧪 기존 대용량 파일 압축 테스트 시작\n');
  
  const downloader = new CompleteArtworkDownloader();
  
  const largeFiles = [
    'factories-at-clichy.jpg',
    'river-bank-in-springtime.jpg', 
    'sheaves-of-wheat.jpg',
    'stairway-at-auvers.jpg'
  ];
  
  for (const filename of largeFiles) {
    const filepath = path.join(downloader.baseDir, 'full', filename);
    
    if (!existsSync(filepath)) {
      console.log(`❌ 파일 없음: ${filename}`);
      continue;
    }
    
    const originalStats = statSync(filepath);
    const originalSizeMB = (originalStats.size / 1024 / 1024).toFixed(2);
    
    console.log(`📋 테스트 파일: ${filename}`);
    console.log(`📏 원본 크기: ${originalSizeMB}MB`);
    
    try {
      // 검증 및 최적화 수행
      await downloader.validateAndOptimizeImage(filepath);
      
      // 결과 확인
      if (existsSync(filepath)) {
        const newStats = statSync(filepath);
        const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2);
        const reduction = ((originalStats.size - newStats.size) / originalStats.size * 100).toFixed(1);
        
        console.log(`✅ 압축 완료: ${newSizeMB}MB`);
        console.log(`📊 크기 감소: ${reduction}%`);
        console.log(`🎯 10MB 제한 준수: ${newStats.size <= 10485760 ? '✅' : '❌'}`);
      } else {
        console.log('❌ 파일이 삭제됨 (검증 실패)');
      }
      
    } catch (error) {
      console.log(`❌ 압축 실패: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
  
  // 임시 파일 정리
  await downloader.cleanupTempFiles();
  
  console.log('\n🎯 압축 테스트 완료');
}

if (require.main === module) {
  testExistingFiles().catch(console.error);
}