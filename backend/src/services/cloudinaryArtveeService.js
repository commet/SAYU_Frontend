const cloudinary = require('cloudinary').v2;
const { pool } = require('../config/database');
const { log } = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');

class CloudinaryArtveeService {
  constructor() {
    // Cloudinary 설정
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkdzgpj3n',
      api_key: process.env.CLOUDINARY_API_KEY || '257249284342124',
      api_secret: process.env.CLOUDINARY_API_SECRET || '-JUkBhI-apD5r704sg1X0Uq8lNU'
    });
    
    this.cloudinaryUrlsPath = path.join(__dirname, '../../../artvee-crawler/data/cloudinary-urls.json');
    this.localArtworksPath = path.join(__dirname, '../../../artvee-crawler/data/famous-artists-artworks.json');
    this.cloudinaryUrls = null;
    this.loadCloudinaryUrls();
  }

  async loadCloudinaryUrls() {
    try {
      const data = await fs.readFile(this.cloudinaryUrlsPath, 'utf8');
      this.cloudinaryUrls = JSON.parse(data);
      log.info(`Loaded ${Object.keys(this.cloudinaryUrls).length} Cloudinary URLs`);
    } catch (error) {
      log.warn('Cloudinary URLs not found, will use fallback method');
      this.cloudinaryUrls = {};
    }
  }

  // 성격 유형별 아트웍 조회 (Cloudinary URLs 사용)
  async getArtworksForPersonality(personalityType, options = {}) {
    const { limit = 10, usageType = null, emotionFilter = null } = options;

    try {
      // 로컬 JSON 파일에서 데이터 로드
      const artworksData = await fs.readFile(this.localArtworksPath, 'utf8');
      const allArtworks = JSON.parse(artworksData);

      // 성격 유형에 맞는 작품 필터링
      let filteredArtworks = allArtworks.filter(artwork => 
        artwork.sayuType === personalityType
      );

      // 추가 필터 적용
      if (usageType) {
        filteredArtworks = filteredArtworks.filter(artwork =>
          artwork.usageTags && artwork.usageTags.includes(usageType)
        );
      }

      if (emotionFilter) {
        filteredArtworks = filteredArtworks.filter(artwork =>
          artwork.emotionTags && artwork.emotionTags.includes(emotionFilter)
        );
      }

      // 특정 유형의 작품이 없으면 랜덤으로 선택
      if (filteredArtworks.length === 0) {
        log.info(`No artworks found for personality type ${personalityType}, returning random artworks`);
        filteredArtworks = allArtworks;
      }

      // 랜덤 선택 및 제한
      const shuffled = filteredArtworks.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, limit);

      // Cloudinary URL 추가
      const artworksWithCloudinary = selected.map(artwork => {
        const cloudinaryData = this.cloudinaryUrls[artwork.artveeId] || {};
        
        return {
          ...artwork,
          imageUrl: this.getCloudinaryUrl(artwork.artveeId, 'full'),
          thumbnailUrl: this.getCloudinaryUrl(artwork.artveeId, 'thumbnail'),
          cdnUrl: cloudinaryData.full?.secure_url,
          cdnThumbnailUrl: cloudinaryData.thumbnail?.secure_url,
          cloudinaryData: cloudinaryData
        };
      });

      return artworksWithCloudinary;
    } catch (error) {
      log.error('Error getting artworks for personality:', error);
      throw error;
    }
  }

  // Cloudinary URL 생성 (업로드된 경우 사용, 아니면 동적 생성)
  getCloudinaryUrl(artveeId, type = 'full') {
    // 이미 업로드된 URL이 있으면 사용
    if (this.cloudinaryUrls[artveeId]) {
      const urls = this.cloudinaryUrls[artveeId];
      if (type === 'thumbnail' && urls.thumbnail) {
        return urls.thumbnail.secure_url;
      } else if (type === 'full' && urls.full) {
        return urls.full.secure_url;
      }
    }

    // 업로드된 URL이 없으면 Cloudinary fetch URL 사용
    const folder = type === 'thumbnail' ? 'thumbnails' : 'full';
    const publicId = `artvee/${folder}/${artveeId}`;
    
    // Cloudinary fetch URL - 원본 이미지를 프록시로 가져와서 변환
    const originalUrl = `https://artvee.com/dl/${artveeId}/`;
    
    if (type === 'thumbnail') {
      return cloudinary.url(originalUrl, {
        type: 'fetch',
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      });
    } else {
      return cloudinary.url(originalUrl, {
        type: 'fetch',
        width: 1200,
        quality: 'auto:best',
        format: 'auto'
      });
    }
  }

  // 특정 아트웍 조회
  async getArtworkById(artveeId) {
    try {
      const artworksData = await fs.readFile(this.localArtworksPath, 'utf8');
      const allArtworks = JSON.parse(artworksData);
      
      const artwork = allArtworks.find(a => a.artveeId === artveeId);
      if (!artwork) {
        return null;
      }

      const cloudinaryData = this.cloudinaryUrls[artveeId] || {};
      
      return {
        ...artwork,
        imageUrl: this.getCloudinaryUrl(artveeId, 'full'),
        thumbnailUrl: this.getCloudinaryUrl(artveeId, 'thumbnail'),
        cdnUrl: cloudinaryData.full?.secure_url,
        cdnThumbnailUrl: cloudinaryData.thumbnail?.secure_url,
        cloudinaryData: cloudinaryData
      };
    } catch (error) {
      log.error('Error getting artwork by ID:', error);
      throw error;
    }
  }

  // 랜덤 아트웍 조회
  async getRandomArtworks(limit = 10) {
    try {
      const artworksData = await fs.readFile(this.localArtworksPath, 'utf8');
      const allArtworks = JSON.parse(artworksData);
      
      const shuffled = allArtworks.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, limit);

      return selected.map(artwork => {
        const cloudinaryData = this.cloudinaryUrls[artwork.artveeId] || {};
        
        return {
          ...artwork,
          imageUrl: this.getCloudinaryUrl(artwork.artveeId, 'full'),
          thumbnailUrl: this.getCloudinaryUrl(artwork.artveeId, 'thumbnail'),
          cdnUrl: cloudinaryData.full?.secure_url,
          cdnThumbnailUrl: cloudinaryData.thumbnail?.secure_url,
          cloudinaryData: cloudinaryData
        };
      });
    } catch (error) {
      log.error('Error getting random artworks:', error);
      throw error;
    }
  }

  // 아티스트별 아트웍 조회
  async getArtworksByArtist(artist, limit = 10) {
    try {
      const artworksData = await fs.readFile(this.localArtworksPath, 'utf8');
      const allArtworks = JSON.parse(artworksData);
      
      const artistArtworks = allArtworks
        .filter(a => a.artist.toLowerCase().includes(artist.toLowerCase()))
        .slice(0, limit);

      return artistArtworks.map(artwork => {
        const cloudinaryData = this.cloudinaryUrls[artwork.artveeId] || {};
        
        return {
          ...artwork,
          imageUrl: this.getCloudinaryUrl(artwork.artveeId, 'full'),
          thumbnailUrl: this.getCloudinaryUrl(artwork.artveeId, 'thumbnail'),
          cdnUrl: cloudinaryData.full?.secure_url,
          cdnThumbnailUrl: cloudinaryData.thumbnail?.secure_url,
          cloudinaryData: cloudinaryData
        };
      });
    } catch (error) {
      log.error('Error getting artworks by artist:', error);
      throw error;
    }
  }

  // 통계 정보
  async getStats() {
    try {
      const artworksData = await fs.readFile(this.localArtworksPath, 'utf8');
      const allArtworks = JSON.parse(artworksData);
      
      const stats = {
        totalArtworks: allArtworks.length,
        uploadedToCloudinary: Object.keys(this.cloudinaryUrls).length,
        byPersonalityType: {},
        byArtist: {},
        byPeriod: {}
      };

      // 성격 유형별 통계
      const personalityTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC', 'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
      personalityTypes.forEach(type => {
        stats.byPersonalityType[type] = allArtworks.filter(a => a.sayuType === type).length;
      });

      // 아티스트별 통계 (상위 10명)
      const artistCounts = {};
      allArtworks.forEach(artwork => {
        artistCounts[artwork.artist] = (artistCounts[artwork.artist] || 0) + 1;
      });
      
      stats.byArtist = Object.entries(artistCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [artist, count]) => {
          obj[artist] = count;
          return obj;
        }, {});

      return stats;
    } catch (error) {
      log.error('Error getting stats:', error);
      throw error;
    }
  }
}

module.exports = new CloudinaryArtveeService();