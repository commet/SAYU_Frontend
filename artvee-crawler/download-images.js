const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream').promises;
require('dotenv').config();

/**
 * Artvee 이미지 다운로드 스크립트
 * 크롤링된 작품 데이터에서 이미지를 다운로드합니다
 */

class ArtveeImageDownloader {
  constructor() {
    this.baseDir = './images';
    this.delay = parseInt(process.env.DELAY_MS) || 2000;
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0
    };
  }

  async downloadImages(dataFile, limit = null) {
    console.log('🖼️ Artvee 이미지 다운로드 시작...\n');
    
    // 이미지 디렉토리 생성
    await this.createDirectories();
    
    // 데이터 파일 로드
    const artworks = await this.loadArtworks(dataFile);
    const targetArtworks = limit ? artworks.slice(0, limit) : artworks;
    
    console.log(`📊 다운로드 대상: ${targetArtworks.length}개 작품\n`);
    this.stats.total = targetArtworks.length;

    // 진행상황 표시하며 다운로드
    for (let i = 0; i < targetArtworks.length; i++) {
      const artwork = targetArtworks[i];
      const progress = ((i + 1) / targetArtworks.length * 100).toFixed(1);
      
      console.log(`\n[${i + 1}/${targetArtworks.length}] (${progress}%) 처리 중...`);
      console.log(`작품: ${artwork.title || artwork.artveeId}`);
      
      try {
        const result = await this.downloadArtworkImages(artwork);
        if (result.downloaded) {
          this.stats.success++;
          console.log(`✅ 성공: ${result.images.join(', ')}`);
        } else {
          this.stats.skipped++;
          console.log(`⏭️ 스킵: 이미 존재함`);
        }
      } catch (error) {
        this.stats.failed++;
        console.error(`❌ 실패: ${error.message}`);
      }
      
      // 서버 부하 방지
      if (i < targetArtworks.length - 1) {
        await this.sleep(this.delay);
      }
    }
    
    // 결과 요약
    this.printSummary();
  }

  async createDirectories() {
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'thumbnails'),
      path.join(this.baseDir, 'full'),
      path.join(this.baseDir, 'medium')
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async loadArtworks(dataFile) {
    const data = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(data);
  }

  async downloadArtworkImages(artwork) {
    const artveeId = artwork.artveeId || this.extractArtveeId(artwork.url);
    const downloaded = [];
    
    // 이미 다운로드했는지 확인
    const fullPath = path.join(this.baseDir, 'full', `${artveeId}.jpg`);
    if (await this.fileExists(fullPath)) {
      return { downloaded: false, images: [] };
    }
    
    // 1. 작품 페이지에서 이미지 URL 추출
    const imageUrls = await this.extractImageUrls(artwork.url);
    
    // 2. 각 이미지 다운로드
    if (imageUrls.full) {
      await this.downloadImage(imageUrls.full, fullPath);
      downloaded.push('full');
    }
    
    if (imageUrls.thumbnail) {
      const thumbPath = path.join(this.baseDir, 'thumbnails', `${artveeId}.jpg`);
      await this.downloadImage(imageUrls.thumbnail, thumbPath);
      downloaded.push('thumbnail');
    }
    
    // 3. 중간 크기 생성 (나중에 sharp로 리사이즈)
    // TODO: sharp를 사용한 리사이즈 구현
    
    return { downloaded: true, images: downloaded };
  }

  async extractImageUrls(artworkUrl) {
    try {
      const response = await axios.get(artworkUrl);
      const html = response.data;
      
      // 정규식으로 이미지 URL 추출
      const imageUrls = {
        full: null,
        thumbnail: null
      };
      
      // 다운로드 링크 찾기 (고화질)
      const downloadMatch = html.match(/<a[^>]*class="[^"]*download[^"]*"[^>]*href="([^"]+)"/i);
      if (downloadMatch) {
        imageUrls.full = downloadMatch[1];
        if (!imageUrls.full.startsWith('http')) {
          imageUrls.full = `https://artvee.com${imageUrls.full}`;
        }
      }
      
      // Open Graph 이미지 (중간 품질)
      const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      if (ogMatch) {
        imageUrls.thumbnail = ogMatch[1];
      }
      
      // 메인 이미지 찾기
      if (!imageUrls.full) {
        const imgMatch = html.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i);
        if (imgMatch) {
          imageUrls.full = imgMatch[1];
        }
      }
      
      return imageUrls;
    } catch (error) {
      console.error(`이미지 URL 추출 실패: ${error.message}`);
      return { full: null, thumbnail: null };
    }
  }

  async downloadImage(url, filepath) {
    if (!url) return;
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'SAYU-Bot/1.0 (Educational Platform)'
      }
    });
    
    const writer = createWriteStream(filepath);
    await pipeline(response.data, writer);
  }

  extractArtveeId(url) {
    const match = url.match(/\/dl\/([^\/]+)\/?$/);
    return match ? match[1] : 'unknown';
  }

  async fileExists(filepath) {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 다운로드 완료 요약:');
    console.log('='.repeat(50));
    console.log(`총 대상: ${this.stats.total}개`);
    console.log(`✅ 성공: ${this.stats.success}개`);
    console.log(`⏭️ 스킵: ${this.stats.skipped}개`);
    console.log(`❌ 실패: ${this.stats.failed}개`);
    console.log(`성공률: ${(this.stats.success / this.stats.total * 100).toFixed(1)}%`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const downloader = new ArtveeImageDownloader();
  
  // 명령줄 인자 처리
  const args = process.argv.slice(2);
  const dataFile = args[0] || './data/famous-artists-artworks.json';
  const limit = args[1] ? parseInt(args[1]) : null;
  
  console.log(`📁 데이터 파일: ${dataFile}`);
  if (limit) {
    console.log(`🔢 다운로드 제한: ${limit}개`);
  }
  
  await downloader.downloadImages(dataFile, limit);
}

main().catch(console.error);