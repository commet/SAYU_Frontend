const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { createWriteStream, existsSync } = require('fs');
const { pipeline } = require('stream').promises;
const cheerio = require('cheerio');

/**
 * Artvee 전체 이미지 다운로드
 */
class ArtveeFullDownloader {
  constructor() {
    this.baseDir = './images';
    this.delay = 1500; // 1.5초 간격
    this.retryDelay = 3000; // 재시도 시 3초 대기
    this.maxRetries = 3;
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now()
    };
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

  async downloadAll() {
    console.log('🎨 Artvee 전체 이미지 다운로드 시작\n');
    await this.init();
    
    // 데이터 로드
    const [famousArtworks, bulkArtworks] = await Promise.all([
      this.loadJson('./data/famous-artists-artworks.json'),
      this.loadJson('./data/bulk-artworks.json')
    ]);
    
    // 중복 제거하여 병합
    const allArtworks = [...famousArtworks];
    const existingUrls = new Set(famousArtworks.map(a => a.url));
    
    bulkArtworks.forEach(artwork => {
      if (!existingUrls.has(artwork.url)) {
        allArtworks.push(artwork);
      }
    });
    
    this.stats.total = allArtworks.length;
    console.log(`📊 총 ${this.stats.total}개 작품 다운로드 예정\n`);
    
    // 진행 상황 파일
    const progressFile = path.join(this.baseDir, 'download-progress.json');
    let progress = {};
    
    try {
      const progressData = await fs.readFile(progressFile, 'utf8');
      progress = JSON.parse(progressData);
      console.log(`📈 이전 진행 상황 로드: ${Object.keys(progress).length}개 완료\n`);
    } catch (e) {
      // 진행 파일 없음
    }
    
    // 다운로드 시작
    for (let i = 0; i < allArtworks.length; i++) {
      const artwork = allArtworks[i];
      const artveeId = artwork.artveeId || this.extractId(artwork.url);
      
      // 이미 완료된 경우 스킵
      if (progress[artveeId]?.completed) {
        this.stats.skipped++;
        continue;
      }
      
      const percent = ((i + 1) / allArtworks.length * 100).toFixed(1);
      const elapsed = (Date.now() - this.stats.startTime) / 1000 / 60;
      const rate = (this.stats.success + this.stats.failed) / elapsed;
      const remaining = (allArtworks.length - i) / rate;
      
      console.log(`\n[${i + 1}/${allArtworks.length}] (${percent}%) | ⏱️ ${elapsed.toFixed(1)}분 경과 | 예상 남은 시간: ${remaining.toFixed(1)}분`);
      console.log(`📍 ${artwork.title || artveeId}`);
      console.log(`👤 ${artwork.artist || 'Unknown'}`);
      
      try {
        const result = await this.downloadArtwork(artwork, artveeId);
        
        if (result.success) {
          this.stats.success++;
          progress[artveeId] = {
            completed: true,
            timestamp: new Date().toISOString(),
            sizes: result.downloaded
          };
          
          // 진행 상황 저장
          if (this.stats.success % 10 === 0) {
            await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
          }
        }
        
      } catch (error) {
        this.stats.failed++;
        console.error(`❌ 오류: ${error.message}`);
      }
      
      // 요청 간 대기
      await this.sleep(this.delay);
    }
    
    // 최종 진행 상황 저장
    await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
    
    // 통계 출력
    this.printFinalStats();
  }

  async downloadArtwork(artwork, artveeId) {
    try {
      // 작품 페이지에서 이미지 URL 추출
      const imageUrls = await this.extractImageUrls(artwork.url);
      const downloaded = [];
      
      // 원본 이미지 다운로드
      if (imageUrls.full) {
        const fullPath = path.join(this.baseDir, 'full', `${artveeId}.jpg`);
        if (!existsSync(fullPath)) {
          await this.downloadImage(imageUrls.full, fullPath);
          downloaded.push('full');
          console.log(`  ✅ 원본 다운로드 완료`);
        }
      }
      
      // 중간 크기 다운로드 (또는 생성)
      if (imageUrls.medium) {
        const mediumPath = path.join(this.baseDir, 'medium', `${artveeId}.jpg`);
        if (!existsSync(mediumPath)) {
          await this.downloadImage(imageUrls.medium, mediumPath);
          downloaded.push('medium');
          console.log(`  ✅ 중간 크기 다운로드 완료`);
        }
      }
      
      // 썸네일 다운로드
      if (imageUrls.thumbnail) {
        const thumbPath = path.join(this.baseDir, 'thumbnails', `${artveeId}.jpg`);
        if (!existsSync(thumbPath)) {
          await this.downloadImage(imageUrls.thumbnail, thumbPath);
          downloaded.push('thumbnail');
          console.log(`  ✅ 썸네일 다운로드 완료`);
        }
      }
      
      // 메타데이터 저장
      const metaPath = path.join(this.baseDir, 'metadata', `${artveeId}.json`);
      await fs.writeFile(metaPath, JSON.stringify({
        ...artwork,
        imageUrls,
        downloadDate: new Date().toISOString()
      }, null, 2));
      
      return { success: true, downloaded };
      
    } catch (error) {
      throw error;
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
      medium: null,
      thumbnail: null
    };
    
    // 메인 이미지 URL 추출
    const mainImage = $('.woocommerce-product-gallery__image img').first();
    if (mainImage.length) {
      urls.full = mainImage.attr('src') || mainImage.attr('data-src');
      urls.thumbnail = mainImage.attr('data-thumb') || urls.full;
    }
    
    // 다운로드 링크 찾기
    $('a[download], a[href*="download"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.includes('.jpg')) {
        urls.full = urls.full || href;
      }
    });
    
    // 중간 크기는 보통 없으므로 full을 사용
    urls.medium = urls.full;
    
    return urls;
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
      
    } catch (error) {
      if (retries < this.maxRetries) {
        await this.sleep(this.retryDelay);
        return this.downloadImage(url, filepath, retries + 1);
      }
      throw error;
    }
  }

  async loadJson(filepath) {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  }

  extractId(url) {
    return url.split('/').filter(s => s).pop();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printFinalStats() {
    const totalTime = (Date.now() - this.stats.startTime) / 1000 / 60;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 다운로드 완료 통계:');
    console.log('='.repeat(50));
    console.log(`총 작품 수: ${this.stats.total}`);
    console.log(`✅ 성공: ${this.stats.success}`);
    console.log(`❌ 실패: ${this.stats.failed}`);
    console.log(`⏭️ 스킵: ${this.stats.skipped}`);
    console.log(`⏱️ 총 소요 시간: ${totalTime.toFixed(1)}분`);
    console.log(`📁 저장 위치: ${path.resolve(this.baseDir)}`);
    console.log('='.repeat(50));
  }
}

// 실행
async function main() {
  const downloader = new ArtveeFullDownloader();
  await downloader.downloadAll();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ArtveeFullDownloader;