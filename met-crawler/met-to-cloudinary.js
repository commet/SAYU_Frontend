const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 설정
const CONFIG = {
  RATE_LIMIT_DELAY: 1000,      // Cloudinary API 호출 간격
  BATCH_SIZE: 50,              // 한 번에 처리할 이미지 수
  MAX_RETRIES: 3,              // 재시도 횟수
  CLOUDINARY_FOLDER: 'sayu/met-artworks',  // Cloudinary 폴더
  PROGRESS_FILE: './met-artworks-data/upload-progress.json'
};

// 진행 상황 로드
function loadProgress() {
  if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf8'));
  }
  return { uploadedIds: [], failedIds: [], lastProcessedIndex: 0 };
}

// 진행 상황 저장
function saveProgress(progress) {
  fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Cloudinary에 이미지 업로드
async function uploadToCloudinary(artwork, retries = CONFIG.MAX_RETRIES) {
  try {
    const publicId = `met-${artwork.objectID}`;
    
    // 이미 업로드된 이미지인지 확인
    try {
      const existing = await cloudinary.api.resource(
        `${CONFIG.CLOUDINARY_FOLDER}/${publicId}`
      );
      if (existing) {
        console.log(`  ⏭️  이미 업로드됨: ${artwork.title}`);
        return { success: true, url: existing.secure_url, publicId };
      }
    } catch (e) {
      // 이미지가 없으면 계속 진행
    }
    
    // 이미지 업로드
    const result = await cloudinary.uploader.upload(artwork.primaryImage, {
      public_id: publicId,
      folder: CONFIG.CLOUDINARY_FOLDER,
      resource_type: 'image',
      context: {
        title: artwork.title || 'Untitled',
        artist: artwork.artist || 'Unknown',
        date: artwork.date || 'Unknown',
        department: artwork.department || '',
        metObjectId: artwork.objectID.toString(),
        isHighlight: artwork.isHighlight ? 'true' : 'false'
      },
      tags: [
        'met-museum',
        artwork.department?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
        artwork.classification?.toLowerCase().replace(/\s+/g, '-') || 'artwork',
        artwork.isHighlight ? 'highlight' : 'regular',
        artwork.artist?.split(' ').pop()?.toLowerCase() || 'unknown-artist'
      ].filter(Boolean)
    });
    
    console.log(`  ✅ 업로드 성공: ${artwork.title} by ${artwork.artist}`);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
    
  } catch (error) {
    if (retries > 0) {
      console.log(`  🔄 재시도 중... (${CONFIG.MAX_RETRIES - retries + 1}/${CONFIG.MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY * 2));
      return uploadToCloudinary(artwork, retries - 1);
    }
    
    console.error(`  ❌ 업로드 실패: ${artwork.title} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 메인 업로드 함수
async function uploadArtworksToCloudinary(inputFile) {
  console.log('🚀 Met Museum 작품 Cloudinary 업로드 시작...\n');
  
  // 데이터 로드
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const artworks = data.artworks || [];
  
  console.log(`📊 총 ${artworks.length}개 작품 업로드 예정`);
  
  // 진행 상황 로드
  const progress = loadProgress();
  console.log(`🔄 이전 진행 상황: ${progress.uploadedIds.length}개 업로드 완료, ${progress.failedIds.length}개 실패`);
  
  // 이미 처리된 작품들 제외
  const remainingArtworks = artworks.filter(artwork => 
    !progress.uploadedIds.includes(artwork.objectID) && 
    !progress.failedIds.includes(artwork.objectID)
  );
  
  console.log(`📋 남은 작품: ${remainingArtworks.length}개\n`);
  
  const results = [];
  
  // 배치 단위로 처리
  for (let i = 0; i < remainingArtworks.length; i += CONFIG.BATCH_SIZE) {
    const batch = remainingArtworks.slice(i, i + CONFIG.BATCH_SIZE);
    
    console.log(`📦 배치 ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(remainingArtworks.length / CONFIG.BATCH_SIZE)} 처리 중... (${batch.length}개)`);
    
    for (const artwork of batch) {
      try {
        const result = await uploadToCloudinary(artwork);
        
        if (result.success) {
          progress.uploadedIds.push(artwork.objectID);
          results.push({
            ...artwork,
            cloudinaryUrl: result.url,
            cloudinaryPublicId: result.publicId,
            uploadedAt: new Date().toISOString()
          });
        } else {
          progress.failedIds.push(artwork.objectID);
        }
        
        // 진행 상황 저장
        saveProgress(progress);
        
        // API 제한 방지
        await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
        
      } catch (error) {
        console.error(`❌ 처리 오류: ${artwork.title} - ${error.message}`);
        progress.failedIds.push(artwork.objectID);
        saveProgress(progress);
      }
    }
    
    console.log(`✅ 배치 완료. 총 진행률: ${progress.uploadedIds.length}/${artworks.length} (${((progress.uploadedIds.length / artworks.length) * 100).toFixed(1)}%)\n`);
  }
  
  // 최종 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join('./met-artworks-data', `met-artworks-with-cloudinary-${timestamp}.json`);
  
  const finalData = {
    metadata: {
      ...data.metadata,
      uploadDate: new Date().toISOString(),
      totalArtworks: artworks.length,
      uploadedCount: progress.uploadedIds.length,
      failedCount: progress.failedIds.length,
      successRate: `${((progress.uploadedIds.length / artworks.length) * 100).toFixed(1)}%`
    },
    artworks: results
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2));
  
  // 실패한 작품들 기록
  if (progress.failedIds.length > 0) {
    const failedArtworks = artworks.filter(artwork => 
      progress.failedIds.includes(artwork.objectID)
    );
    
    const failedFile = path.join('./met-artworks-data', `failed-uploads-${timestamp}.json`);
    fs.writeFileSync(failedFile, JSON.stringify({
      metadata: {
        totalFailed: failedArtworks.length,
        date: new Date().toISOString()
      },
      failedArtworks
    }, null, 2));
    
    console.log(`❌ 실패한 업로드: ${failedArtworks.length}개 (${failedFile})`);
  }
  
  console.log('\n✨ Cloudinary 업로드 완료!');
  console.log(`📊 최종 결과:`);
  console.log(`  - 총 작품: ${artworks.length}개`);
  console.log(`  - 성공: ${progress.uploadedIds.length}개`);
  console.log(`  - 실패: ${progress.failedIds.length}개`);
  console.log(`  - 성공률: ${((progress.uploadedIds.length / artworks.length) * 100).toFixed(1)}%`);
  console.log(`  - 저장 위치: ${outputFile}`);
  
  return results;
}

// 실행
if (require.main === module) {
  const inputFile = process.argv[2] || './met-artworks-data/maximized-collection-2025-07-17T11-22-19-710Z.json';
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${inputFile}`);
    process.exit(1);
  }
  
  // 환경 변수 확인
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary 환경 변수가 설정되지 않았습니다.');
    console.error('   .env 파일에 다음 변수들을 설정하세요:');
    console.error('   - CLOUDINARY_CLOUD_NAME');
    console.error('   - CLOUDINARY_API_KEY');
    console.error('   - CLOUDINARY_API_SECRET');
    process.exit(1);
  }
  
  uploadArtworksToCloudinary(inputFile).catch(console.error);
}

module.exports = { uploadArtworksToCloudinary };