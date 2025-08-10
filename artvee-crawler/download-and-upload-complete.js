const axios = require('axios');
const fs = require('fs').promises;
const { existsSync, createWriteStream, statSync } = require('fs');
const path = require('path');
const { pipeline } = require('stream').promises;
const cheerio = require('cheerio');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');

/**
 * 수집된 작품들을 다운로드하고 Cloudinary에 업로드
 */
class CompleteArtworkDownloader {
  constructor() {
    this.baseDir = './images-complete';
    this.delay = 1500; // 1.5초 간격
    this.retryDelay = 3000; // 재시도 시 3초 대기
    this.maxRetries = 3;
    this.batchSize = 50; // 한 번에 업로드할 배치 크기
    this.maxFileSize = 10 * 1024 * 1024; // 10MB 제한
    this.targetQuality = 85; // JPEG 품질 목표
    
    // Cloudinary 설정
    this.configureCloudinary();
    
    this.stats = {
      total: 0,
      downloaded: 0,
      uploaded: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now()
    };
    
    this.collectionData = [];
  }
  
  configureCloudinary() {
    // 환경변수에서 Cloudinary 설정 로드 또는 기본값 사용
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dkdzgpj3n';
    const apiKey = process.env.CLOUDINARY_API_KEY || '257249284342124';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '-JUkBhI-apD5r704sg1X0Uq8lNU';
    
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    
    this.cloudinaryEnabled = true;
    console.log('✅ Cloudinary 설정 완료');
  }

  async init() {
    // 디렉토리 생성
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'full'),
      path.join(this.baseDir, 'medium'),
      path.join(this.baseDir, 'thumbnails'),
      path.join(this.baseDir, 'metadata')
    ];
    
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 생성: ${dir}`);
      }
    }
  }

  async downloadAndUploadAll() {
    console.log('🎨 수집된 작품 이미지 다운로드 및 업로드 시작\n');
    
    await this.init();
    
    // 수집된 데이터 로드
    const artworksFile = this.findLatestCollectionFile();
    if (!artworksFile) {
      throw new Error('수집된 작품 데이터 파일을 찾을 수 없습니다');
    }
    
    console.log(`📂 데이터 로드: ${artworksFile}`);
    const artworks = await this.loadJson(artworksFile);
    
    this.stats.total = artworks.length;
    console.log(`📊 총 ${this.stats.total}개 작품 처리 예정\n`);
    
    // 진행 상황 파일
    const progressFile = path.join(this.baseDir, 'upload-progress.json');
    let progress = {};
    
    try {
      const progressData = await fs.readFile(progressFile, 'utf8');
      progress = JSON.parse(progressData);
      console.log(`📈 이전 진행 상황 로드: ${Object.keys(progress).length}개 완료\n`);
    } catch (e) {
      // 진행 파일 없음
    }
    
    // 배치 단위로 처리
    for (let i = 0; i < artworks.length; i += this.batchSize) {
      const batch = artworks.slice(i, i + this.batchSize);
      const batchNum = Math.floor(i / this.batchSize) + 1;
      const totalBatches = Math.ceil(artworks.length / this.batchSize);
      
      console.log(`\n📦 배치 ${batchNum}/${totalBatches} 처리 중 (${batch.length}개 작품)`);
      console.log('='.repeat(60));
      
      for (let j = 0; j < batch.length; j++) {
        const artwork = batch[j];
        const globalIndex = i + j;
        const artveeId = artwork.artveeId;
        
        // 이미 완료된 경우 스킵
        if (progress[artveeId]?.uploaded) {
          this.stats.skipped++;
          continue;
        }
        
        const percent = ((globalIndex + 1) / artworks.length * 100).toFixed(1);
        const elapsed = (Date.now() - this.stats.startTime) / 1000 / 60;
        
        console.log(`\n[${globalIndex + 1}/${artworks.length}] (${percent}%)`);
        console.log(`📍 ${artwork.title}`);
        console.log(`👤 ${artwork.artist}`);
        
        try {
          const result = await this.processArtwork(artwork, progress[artveeId] || {});
          
          if (result.success) {
            progress[artveeId] = {
              ...result,
              timestamp: new Date().toISOString()
            };
            
            // 컬렉션 데이터에 추가
            this.collectionData.push({
              artvee_id: artveeId,
              title: artwork.title,
              artist: artwork.artist,
              year: result.year || '',
              description: result.description || '',
              image_url: result.cloudinary_url || result.local_path,
              thumbnail_url: result.cloudinary_thumb_url || result.local_thumb_path,
              source: 'artvee',
              tags: [artwork.artist.toLowerCase().replace(/\s+/g, '-'), 'painting', 'artwork']
            });
            
            if (result.uploaded) {
              this.stats.uploaded++;
            } else {
              this.stats.downloaded++;
            }
          } else {
            this.stats.failed++;
          }
          
          // 진행 상황 저장 (10개마다)
          if ((globalIndex + 1) % 10 === 0) {
            await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
            console.log(`💾 진행 상황 저장됨 (${globalIndex + 1}/${artworks.length})`);
          }
          
        } catch (error) {
          this.stats.failed++;
          console.error(`❌ 오류: ${error.message}`);
        }
        
        // 요청 간 대기
        await this.sleep(this.delay);
      }
      
      // 배치 완료 후 저장
      await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
    }
    
    // 임시 파일 정리
    await this.cleanupTempFiles();
    
    // 최종 컬렉션 데이터 저장
    await this.saveCollectionData();
    
    // 최종 진행 상황 저장
    await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
    
    // 통계 출력
    this.printFinalStats();
  }

  async processArtwork(artwork, existingProgress = {}) {
    const artveeId = artwork.artveeId;
    
    try {
      // 이미지 URL 추출
      let imageUrls = existingProgress.imageUrls;
      if (!imageUrls) {
        imageUrls = await this.extractImageUrls(artwork.url);
      }
      
      if (!imageUrls.full) {
        console.log('  ⚠️ 이미지 URL을 찾을 수 없음');
        return { success: false };
      }
      
      // 로컬 파일 경로
      const fullPath = path.join(this.baseDir, 'full', `${artveeId}.jpg`);
      const thumbPath = path.join(this.baseDir, 'thumbnails', `${artveeId}.jpg`);
      
      // 이미지 다운로드 (아직 없는 경우)
      if (!existsSync(fullPath)) {
        await this.downloadImage(imageUrls.full, fullPath);
        console.log('  ✅ 원본 이미지 다운로드 완료');
      }
      
      if (imageUrls.thumbnail && !existsSync(thumbPath)) {
        await this.downloadImage(imageUrls.thumbnail, thumbPath);
        console.log('  ✅ 썸네일 다운로드 완료');
      }
      
      let cloudinaryUrl = existingProgress.cloudinary_url;
      let thumbnailUrl = existingProgress.cloudinary_thumb_url;
      let uploaded = !!existingProgress.uploaded;
      
      // Cloudinary 업로드 (활성화된 경우)
      if (this.cloudinaryEnabled && !uploaded) {
        try {
          // 파일 존재 및 유효성 검사
          if (!existsSync(fullPath)) {
            throw new Error('파일이 존재하지 않습니다');
          }
          
          const stats = statSync(fullPath);
          if (stats.size === 0) {
            throw new Error('Empty file');
          }
          
          // 이미지 유효성 미리 검사
          try {
            const metadata = await sharp(fullPath).metadata();
            if (!metadata.width || !metadata.height) {
              throw new Error('Invalid image file');
            }
          } catch (sharpError) {
            throw new Error('Invalid image file');
          }
          
          // 원본 이미지 업로드
          const uploadResult = await cloudinary.uploader.upload(fullPath, {
            folder: 'sayu/artvee-complete',
            public_id: `artvee-${artveeId}`,
            overwrite: false,
            resource_type: 'image',
            quality: 'auto:good',
            format: 'jpg'
          });
          
          cloudinaryUrl = uploadResult.secure_url;
          console.log('  ☁️ Cloudinary 업로드 완료');
          
          // 썸네일 업로드
          if (existsSync(thumbPath)) {
            const thumbResult = await cloudinary.uploader.upload(thumbPath, {
              folder: 'sayu/artvee-complete/thumbnails',
              public_id: `thumb-${artveeId}`,
              overwrite: false,
              resource_type: 'image',
              transformation: { width: 300, height: 300, crop: 'limit' }
            });
            
            thumbnailUrl = thumbResult.secure_url;
          }
          
          uploaded = true;
          
        } catch (uploadError) {
          const errorMessage = uploadError.message || uploadError.error?.message || 'Unknown error';
          console.log(`  ⚠️ Cloudinary 업로드 실패: ${errorMessage}`);
          
          // Invalid image file이나 Empty file인 경우 재다운로드 시도
          if (errorMessage.includes('Invalid image file') || errorMessage.includes('Empty file')) {
            try {
              console.log(`  🔄 이미지 재다운로드 시도 중...`);
              if (existsSync(fullPath)) {
                await fs.unlink(fullPath);
              }
              
              await this.downloadImage(imageUrls.full, fullPath);
              console.log('  ✅ 재다운로드 완료');
              
              // 재업로드 시도
              const retryResult = await cloudinary.uploader.upload(fullPath, {
                folder: 'sayu/artvee-complete',
                public_id: `artvee-${artveeId}`,
                overwrite: false,
                resource_type: 'image',
                quality: 'auto:good',
                format: 'jpg'
              });
              
              cloudinaryUrl = retryResult.secure_url;
              uploaded = true;
              console.log('  ☁️ 재다운로드 후 업로드 완료');
              
            } catch (retryError) {
              console.log(`  ❌ 재다운로드 실패: ${retryError.message || 'Unknown retry error'}`);
            }
          }
          // 파일 크기 문제인 경우 추가 압축 시도
          else if (errorMessage.includes('File size too large') && existsSync(fullPath)) {
            try {
              console.log(`  🗜️ 추가 압축 시도 중...`);
              await this.aggressiveCompress(fullPath);
              
              // 재업로드 시도
              const retryResult = await cloudinary.uploader.upload(fullPath, {
                folder: 'sayu/artvee-complete',
                public_id: `artvee-${artveeId}`,
                overwrite: false,
                resource_type: 'image',
                quality: 'auto:low',
                format: 'jpg'
              });
              
              cloudinaryUrl = retryResult.secure_url;
              uploaded = true;
              console.log('  ☁️ 재압축 후 업로드 완료');
              
            } catch (retryError) {
              console.log(`  ❌ 재압축 실패: ${retryError.message || 'Unknown retry error'}`);
            }
          }
          // 업로드 실패해도 다운로드는 성공으로 처리
        }
      }
      
      // 추가 메타데이터 추출
      const metadata = await this.extractMetadata(artwork.url);
      
      return {
        success: true,
        uploaded,
        imageUrls,
        local_path: fullPath,
        local_thumb_path: thumbPath,
        cloudinary_url: cloudinaryUrl,
        cloudinary_thumb_url: thumbnailUrl,
        year: metadata.year,
        description: metadata.description
      };
      
    } catch (error) {
      console.log(`  ❌ 처리 실패: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async extractImageUrls(artworkUrl) {
    const response = await axios.get(artworkUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const urls = {
      full: null,
      thumbnail: null
    };
    
    // 고해상도 다운로드 링크 찾기 (우선순위 1)
    $('a[href*="mdl.artvee.com"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim().toLowerCase();
      if (href && (href.includes('/sdl/') || text.includes('download'))) {
        urls.full = href;
        return false; // break
      }
    });
    
    // 메인 이미지 URL 추출 (우선순위 2)
    if (!urls.full) {
      const mainImage = $('.wp-post-image').first();
      if (mainImage.length) {
        urls.full = mainImage.attr('src');
        urls.thumbnail = urls.full;
      }
    }
    
    // mdl.artvee.com 이미지들 중에서 찾기 (우선순위 3)
    if (!urls.full) {
      $('img[src*="mdl.artvee.com"]').first().each((i, elem) => {
        const src = $(elem).attr('src');
        if (src && !src.includes('/ft/')) { // ft는 썸네일, sftb가 더 큰 이미지
          urls.full = src;
        }
      });
    }
    
    // 썸네일 설정 (메인 이미지를 썸네일로도 사용)
    if (urls.full && !urls.thumbnail) {
      urls.thumbnail = urls.full;
    }
    
    return urls;
  }

  async extractMetadata(artworkUrl) {
    try {
      const response = await axios.get(artworkUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      
      // 년도 추출
      let year = '';
      const yearMatch = $('body').text().match(/\b(1[4-9]\d{2}|20[0-2]\d)\b/);
      if (yearMatch) {
        year = yearMatch[0];
      }
      
      // 설명 추출
      let description = '';
      const descText = $('.woocommerce-Tabs-panel--description').text() || 
                      $('.entry-summary').text() || 
                      $('meta[name="description"]').attr('content') || '';
      
      if (descText) {
        description = descText.trim().substring(0, 200);
      }
      
      return { year, description };
      
    } catch (error) {
      return { year: '', description: '' };
    }
  }

  async downloadImage(url, filepath, retries = 0) {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      await pipeline(response.data, createWriteStream(filepath));
      
      // 다운로드 완료 후 파일 검증
      await this.validateAndOptimizeImage(filepath);
      
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`  ⚠️ 다운로드 재시도 (${retries + 1}/${this.maxRetries}): ${error.message}`);
        await this.sleep(this.retryDelay);
        return this.downloadImage(url, filepath, retries + 1);
      }
      throw error;
    }
  }

  async saveCollectionData() {
    const dataDir = path.join(__dirname, 'data');
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    
    // 컬렉션 데이터 JSON으로 저장
    const collectionFile = path.join(dataDir, `artvee-collection-${timestamp}.json`);
    await fs.writeFile(collectionFile, JSON.stringify(this.collectionData, null, 2));
    
    console.log(`\n📁 컬렉션 데이터 저장됨: ${collectionFile}`);
    console.log(`📊 총 ${this.collectionData.length}개 작품 데이터`);
  }

  findLatestCollectionFile() {
    const dataDir = path.join(__dirname, 'data');
    const files = require('fs').readdirSync(dataDir);
    const collectionFiles = files
      .filter(f => f.startsWith('complete-artists-collection-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (collectionFiles.length === 0) {
      return null;
    }
    
    return path.join(dataDir, collectionFiles[0]);
  }

  async loadJson(filepath) {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async validateAndOptimizeImage(filepath) {
    try {
      // 파일 존재 및 크기 확인
      if (!existsSync(filepath)) {
        throw new Error('파일이 존재하지 않습니다');
      }
      
      const stats = statSync(filepath);
      if (stats.size === 0) {
        throw new Error('빈 파일입니다');
      }
      
      // 이미지 유효성 검사
      const metadata = await sharp(filepath).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error('유효하지 않은 이미지입니다');
      }
      
      console.log(`    📏 원본: ${metadata.width}x${metadata.height}, ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
      
      // 10MB 초과 시 압축
      if (stats.size > this.maxFileSize) {
        await this.compressImage(filepath, metadata);
        const newStats = statSync(filepath);
        console.log(`    🗜️ 압축완료: ${(newStats.size / 1024 / 1024).toFixed(2)}MB`);
      }
      
    } catch (error) {
      console.log(`    ❌ 이미지 검증 실패: ${error.message}`);
      // 잘못된 파일 삭제
      if (existsSync(filepath)) {
        await fs.unlink(filepath);
      }
      throw error;
    }
  }
  
  async compressImage(filepath, metadata) {
    const tempPath = filepath + '.temp';
    
    try {
      let quality = this.targetQuality;
      let resizeWidth = metadata.width;
      
      // 매우 큰 이미지는 크기도 줄임
      if (metadata.width > 4000) {
        resizeWidth = 3000;
      } else if (metadata.width > 2500) {
        resizeWidth = 2000;
      }
      
      let sharpInstance = sharp(filepath)
        .jpeg({ quality, progressive: true, mozjpeg: true })
        .withMetadata();
      
      if (resizeWidth < metadata.width) {
        sharpInstance = sharpInstance.resize(resizeWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }
      
      await sharpInstance.toFile(tempPath);
      
      // 압축 후에도 10MB 초과하면 추가 압축
      let compressedStats = statSync(tempPath);
      let attempts = 0;
      
      while (compressedStats.size > this.maxFileSize && attempts < 3) {
        quality -= 15;
        if (quality < 30) quality = 30;
        
        resizeWidth = Math.floor(resizeWidth * 0.8);
        
        await sharp(filepath)
          .resize(resizeWidth, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality, progressive: true, mozjpeg: true })
          .withMetadata()
          .toFile(tempPath);
          
        compressedStats = statSync(tempPath);
        attempts++;
      }
      
      // 원본을 압축된 파일로 교체
      await fs.unlink(filepath);
      await fs.rename(tempPath, filepath);
      
    } catch (error) {
      // 임시 파일 정리
      if (existsSync(tempPath)) {
        await fs.unlink(tempPath);
      }
      throw error;
    }
  }

  async aggressiveCompress(filepath) {
    const tempPath = filepath + '.aggressive';
    
    try {
      const metadata = await sharp(filepath).metadata();
      let targetWidth = Math.min(1500, metadata.width); // 최대 1500px
      
      await sharp(filepath)
        .resize(targetWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ 
          quality: 60,
          progressive: true,
          mozjpeg: true,
          optimiseScans: true
        })
        .toFile(tempPath);
      
      // 원본 교체
      await fs.unlink(filepath);
      await fs.rename(tempPath, filepath);
      
    } catch (error) {
      if (existsSync(tempPath)) {
        await fs.unlink(tempPath);
      }
      throw error;
    }
  }
  
  async cleanupTempFiles() {
    try {
      // 모든 하위 디렉토리에서 임시 파일 찾기
      const dirs = [
        this.baseDir,
        path.join(this.baseDir, 'full'),
        path.join(this.baseDir, 'medium'),
        path.join(this.baseDir, 'thumbnails')
      ];
      
      for (const dir of dirs) {
        if (existsSync(dir)) {
          const files = await fs.readdir(dir);
          for (const file of files) {
            if (file.includes('.temp') || file.includes('.aggressive')) {
              const tempPath = path.join(dir, file);
              if (existsSync(tempPath)) {
                await fs.unlink(tempPath);
                console.log(`🧹 임시 파일 삭제: ${file}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ 임시 파일 정리 중 오류: ${error.message}`);
    }
  }

  printFinalStats() {
    const totalTime = (Date.now() - this.stats.startTime) / 1000 / 60;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 다운로드 및 업로드 완료 통계');
    console.log('='.repeat(60));
    console.log(`총 작품 수: ${this.stats.total}`);
    console.log(`✅ 다운로드: ${this.stats.downloaded}`);
    console.log(`☁️ 업로드: ${this.stats.uploaded}`);
    console.log(`❌ 실패: ${this.stats.failed}`);
    console.log(`⏭️ 스킵: ${this.stats.skipped}`);
    console.log(`⏱️ 총 소요 시간: ${totalTime.toFixed(1)}분`);
    console.log(`📁 저장 위치: ${path.resolve(this.baseDir)}`);
    console.log('='.repeat(60));
  }
}

// 실행
async function main() {
  // 환경변수 로드
  require('dotenv').config();
  
  const downloader = new CompleteArtworkDownloader();
  
  try {
    await downloader.downloadAndUploadAll();
  } catch (error) {
    console.error('💥 치명적 오류:', error.message);
    console.log('\n🔧 문제 해결 방법:');
    console.log('1. 디스크 공간 확인 (df -h)');
    console.log('2. Cloudinary API 키 확인');
    console.log('3. 네트워크 연결 상태 확인');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CompleteArtworkDownloader;