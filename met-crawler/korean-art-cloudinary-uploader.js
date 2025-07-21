const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class KoreanArtCloudinaryUploader {
  constructor() {
    this.progressFile = './korean-art-upload-progress.json';
    this.progress = this.loadProgress();
    this.rateLimitDelay = 1000; // 1초
  }

  loadProgress() {
    if (fs.existsSync(this.progressFile)) {
      return JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
    }
    return {
      lastProcessedIndex: -1,
      uploadedArtworks: [],
      failedUploads: [],
      startTime: new Date().toISOString()
    };
  }

  saveProgress() {
    fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
  }

  async uploadToCloudinary(imageUrl, artwork) {
    try {
      console.log(`Uploading: ${artwork.title} by ${artwork.artist}`);
      
      const uploadResult = await cloudinary.uploader.upload(imageUrl, {
        folder: 'korean-art',
        public_id: artwork.id,
        context: {
          title: artwork.title || 'Untitled',
          artist: artwork.artist || 'Unknown',
          date: artwork.date || '',
          museum: artwork.museum,
          culture: artwork.culture || 'Korean',
          medium: artwork.medium || '',
          source_url: artwork.metUrl || '',
          license: artwork.license
        },
        tags: ['korean-art', artwork.museum.toLowerCase().replace(/\s+/g, '-'), 'cc0']
      });

      return {
        ...artwork,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Failed to upload ${artwork.id}:`, error.message);
      throw error;
    }
  }

  async processArtworks() {
    // 최신 수집 파일 찾기
    const dataDir = './korean-art-data';
    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('No Korean art data files found!');
      return;
    }

    const latestFile = path.join(dataDir, files[0]);
    console.log(`Loading artworks from: ${latestFile}`);
    
    const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    const artworks = data.artworks;
    
    console.log(`Total artworks to process: ${artworks.length}`);
    console.log(`Starting from index: ${this.progress.lastProcessedIndex + 1}`);

    let successCount = 0;
    let failCount = 0;

    for (let i = this.progress.lastProcessedIndex + 1; i < artworks.length; i++) {
      const artwork = artworks[i];
      
      // 이미지가 없는 경우 스킵
      if (!artwork.primaryImage) {
        console.log(`Skipping ${artwork.id} - no image available`);
        this.progress.lastProcessedIndex = i;
        continue;
      }

      try {
        // 이미 업로드된 경우 스킵
        if (this.progress.uploadedArtworks.find(a => a.id === artwork.id)) {
          console.log(`Skipping ${artwork.id} - already uploaded`);
          continue;
        }

        const uploadedArtwork = await this.uploadToCloudinary(artwork.primaryImage, artwork);
        
        this.progress.uploadedArtworks.push(uploadedArtwork);
        this.progress.lastProcessedIndex = i;
        successCount++;
        
        console.log(`✅ Uploaded ${successCount}/${artworks.length}: ${artwork.title}`);
        
        // 진행 상황 저장 (10개마다)
        if (successCount % 10 === 0) {
          this.saveProgress();
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        
      } catch (error) {
        failCount++;
        this.progress.failedUploads.push({
          artwork: artwork,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        console.error(`❌ Failed ${failCount}: ${artwork.id}`);
        
        // 에러가 많이 발생하면 중단
        if (failCount > 20) {
          console.error('Too many failures. Stopping upload process.');
          break;
        }
      }
    }

    // 최종 진행 상황 저장
    this.saveProgress();

    // 결과 요약
    console.log('\n📊 Upload Summary:');
    console.log('='.repeat(50));
    console.log(`Total artworks: ${artworks.length}`);
    console.log(`Successfully uploaded: ${successCount}`);
    console.log(`Failed uploads: ${failCount}`);
    console.log(`Skipped (no image): ${artworks.filter(a => !a.primaryImage).length}`);
    console.log(`\nUploaded artworks saved to: korean-art-upload-progress.json`);

    // 업로드된 작품 정보를 별도 파일로 저장
    const uploadedData = {
      metadata: {
        date: new Date().toISOString(),
        total: this.progress.uploadedArtworks.length,
        source: 'Korean Art Collection',
        cloudinaryFolder: 'korean-art'
      },
      artworks: this.progress.uploadedArtworks
    };

    const outputFile = `./korean-art-cloudinary-${new Date().toISOString().replace(/:/g, '-')}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(uploadedData, null, 2));
    console.log(`\n💾 Cloudinary URLs saved to: ${outputFile}`);
  }
}

// 실행
if (require.main === module) {
  const uploader = new KoreanArtCloudinaryUploader();
  uploader.processArtworks()
    .then(() => console.log('\n🎉 Korean art upload to Cloudinary completed!'))
    .catch(error => console.error('Upload error:', error));
}

module.exports = KoreanArtCloudinaryUploader;