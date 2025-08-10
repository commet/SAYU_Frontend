const fs = require('fs').promises;
const { existsSync, statSync } = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

// Cloudinary 설정
cloudinary.config({
  cloud_name: 'dkdzgpj3n',
  api_key: '257249284342124',
  api_secret: '-JUkBhI-apD5r704sg1X0Uq8lNU'
});

async function uploadRemainingFiles() {
  console.log('🚀 남은 파일 Cloudinary 업로드 시작\n');
  
  // 업로드되지 않은 파일 목록 로드
  const notUploadedFile = path.join(__dirname, 'images-complete', 'not-uploaded-files.json');
  const notUploadedFiles = JSON.parse(await fs.readFile(notUploadedFile, 'utf8'));
  
  // 진행 상황 파일 로드
  const progressFile = path.join(__dirname, 'images-complete', 'upload-progress.json');
  const progress = JSON.parse(await fs.readFile(progressFile, 'utf8'));
  
  console.log(`📊 총 ${notUploadedFiles.length}개 파일 업로드 예정\n`);
  
  let successCount = 0;
  let failCount = 0;
  const failedFiles = [];
  
  for (let i = 0; i < notUploadedFiles.length; i++) {
    const filename = notUploadedFiles[i];
    const id = filename.replace('.jpg', '');
    const fullPath = path.join(__dirname, 'images-complete', 'full', filename);
    
    console.log(`[${i + 1}/${notUploadedFiles.length}] ${filename}`);
    
    try {
      // 파일 존재 확인
      if (!existsSync(fullPath)) {
        console.log('  ❌ 파일이 존재하지 않음');
        failCount++;
        failedFiles.push({ file: filename, reason: 'File not found' });
        continue;
      }
      
      const stats = statSync(fullPath);
      
      // 빈 파일 체크 (228 bytes는 빈 이미지 placeholder)
      if (stats.size === 0 || stats.size === 228) {
        console.log('  ⚠️ 빈 파일 또는 placeholder - 스킵');
        failCount++;
        failedFiles.push({ file: filename, reason: 'Empty or placeholder file' });
        continue;
      }
      
      // 이미지 유효성 검사
      try {
        const metadata = await sharp(fullPath).metadata();
        if (!metadata.width || !metadata.height) {
          throw new Error('Invalid image dimensions');
        }
        console.log(`  📏 크기: ${metadata.width}x${metadata.height}, ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
      } catch (sharpError) {
        console.log('  ❌ 유효하지 않은 이미지 파일');
        failCount++;
        failedFiles.push({ file: filename, reason: 'Invalid image file' });
        continue;
      }
      
      // Cloudinary 업로드
      try {
        const uploadResult = await cloudinary.uploader.upload(fullPath, {
          folder: 'sayu/artvee-complete',
          public_id: `artvee-${id}`,
          overwrite: true,
          resource_type: 'image',
          quality: 'auto:good',
          format: 'jpg',
          timeout: 120000
        });
        
        // 진행 상황 업데이트
        if (!progress[id]) {
          progress[id] = {
            success: true,
            imageUrls: { full: fullPath, thumbnail: fullPath }
          };
        }
        
        progress[id].uploaded = true;
        progress[id].cloudinary_url = uploadResult.secure_url;
        progress[id].timestamp = new Date().toISOString();
        
        console.log('  ✅ Cloudinary 업로드 성공');
        successCount++;
        
        // 10개마다 진행 상황 저장
        if ((i + 1) % 10 === 0) {
          await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
          console.log('  💾 진행 상황 저장됨\n');
        }
        
      } catch (uploadError) {
        const errorMsg = uploadError.message || uploadError.error?.message || 'Unknown error';
        console.log(`  ❌ 업로드 실패: ${errorMsg}`);
        failCount++;
        failedFiles.push({ file: filename, reason: errorMsg });
      }
      
    } catch (error) {
      console.log(`  ❌ 처리 실패: ${error.message}`);
      failCount++;
      failedFiles.push({ file: filename, reason: error.message });
    }
    
    // API 제한 방지를 위한 대기
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // 최종 진행 상황 저장
  await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
  
  // 실패한 파일 목록 저장
  if (failedFiles.length > 0) {
    const failedListFile = path.join(__dirname, 'images-complete', 'failed-uploads.json');
    await fs.writeFile(failedListFile, JSON.stringify(failedFiles, null, 2));
    console.log(`\n📁 실패한 파일 목록 저장: ${failedListFile}`);
  }
  
  // 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 업로드 완료 통계');
  console.log('='.repeat(60));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log('='.repeat(60));
  
  if (failedFiles.length > 0) {
    console.log('\n실패한 파일들:');
    failedFiles.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.file}: ${f.reason}`);
    });
  }
}

// 실행
uploadRemainingFiles().catch(console.error);