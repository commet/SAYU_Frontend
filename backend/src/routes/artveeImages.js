const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// 이미지 캐시 설정
const IMAGE_CACHE_DURATION = 60 * 60 * 24 * 7; // 1주일

// Artvee 이미지 서빙 엔드포인트
router.get('/images/:artveeId', async (req, res) => {
  try {
    const { artveeId } = req.params;
    const { size = 'medium' } = req.query;

    // 크기 유효성 검사
    const validSizes = ['thumbnail', 'medium', 'full'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({ error: 'Invalid size parameter' });
    }

    // 이미지 경로 구성
    const imageDir = path.join(__dirname, '../../../../artvee-crawler/images', size === 'thumbnail' ? 'thumbnails' : size);
    const imagePath = path.join(imageDir, `${artveeId}.jpg`);

    // 파일 존재 확인
    try {
      await fs.access(imagePath);
    } catch (error) {
      // 이미지가 없으면 플레이스홀더 반환
      const placeholderPath = path.join(__dirname, '../../public/placeholder-artwork.jpg');
      return res.sendFile(placeholderPath);
    }

    // 캐시 헤더 설정
    res.set({
      'Cache-Control': `public, max-age=${IMAGE_CACHE_DURATION}`,
      'Content-Type': 'image/jpeg'
    });

    // 이미지 전송
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// 작품 메타데이터와 함께 이미지 URL 반환
router.get('/artworks/:artveeId', async (req, res) => {
  try {
    const { artveeId } = req.params;
    
    // 메타데이터 파일 읽기
    const metadataPath = path.join(__dirname, '../../../../artvee-crawler/images/metadata', `${artveeId}.json`);
    
    let metadata = {};
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataContent);
    } catch (error) {
      // 메타데이터가 없으면 기본값 사용
      metadata = {
        artveeId,
        title: 'Unknown Artwork',
        artist: 'Unknown Artist'
      };
    }

    // 이미지 URL 생성
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const imageUrls = {
      thumbnail: `${baseUrl}/api/artvee/images/${artveeId}?size=thumbnail`,
      medium: `${baseUrl}/api/artvee/images/${artveeId}?size=medium`,
      full: `${baseUrl}/api/artvee/images/${artveeId}?size=full`
    };

    res.json({
      ...metadata,
      imageUrls
    });
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ error: 'Failed to fetch artwork' });
  }
});

// 성격 유형별 작품 목록
router.get('/personalities/:sayuType/artworks', async (req, res) => {
  try {
    const { sayuType } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 데이터 파일 읽기
    const famousArtworksPath = path.join(__dirname, '../../../../artvee-crawler/data/famous-artists-artworks.json');
    const bulkArtworksPath = path.join(__dirname, '../../../../artvee-crawler/data/bulk-artworks.json');

    const [famousData, bulkData] = await Promise.all([
      fs.readFile(famousArtworksPath, 'utf8').then(JSON.parse).catch(() => []),
      fs.readFile(bulkArtworksPath, 'utf8').then(JSON.parse).catch(() => [])
    ]);

    // 성격 유형에 맞는 작품 필터링
    const filteredArtworks = famousData.filter(artwork => artwork.sayuType === sayuType);
    
    // 성격 유형이 명시되지 않은 bulk 작품들 중 일부 추가 (다양성을 위해)
    const additionalArtworks = bulkData
      .filter(artwork => !artwork.sayuType || artwork.sayuType === 'Unknown')
      .slice(0, 50); // 최대 50개까지만

    const allArtworks = [...filteredArtworks, ...additionalArtworks];

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedArtworks = allArtworks.slice(startIndex, endIndex);

    // 이미지 URL 추가
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const artworksWithUrls = paginatedArtworks.map(artwork => ({
      ...artwork,
      imageUrls: {
        thumbnail: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=thumbnail`,
        medium: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=medium`,
        full: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=full`
      }
    }));

    res.json({
      artworks: artworksWithUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allArtworks.length,
        totalPages: Math.ceil(allArtworks.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching personality artworks:', error);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// 작품 검색
router.get('/search', async (req, res) => {
  try {
    const { q, artist, style, period, limit = 20 } = req.query;

    // 모든 작품 데이터 로드
    const famousArtworksPath = path.join(__dirname, '../../../../artvee-crawler/data/famous-artists-artworks.json');
    const bulkArtworksPath = path.join(__dirname, '../../../../artvee-crawler/data/bulk-artworks.json');

    const [famousData, bulkData] = await Promise.all([
      fs.readFile(famousArtworksPath, 'utf8').then(JSON.parse).catch(() => []),
      fs.readFile(bulkArtworksPath, 'utf8').then(JSON.parse).catch(() => [])
    ]);

    const allArtworks = [...famousData, ...bulkData];

    // 검색 필터링
    let filteredArtworks = allArtworks;

    if (q) {
      const searchTerm = q.toLowerCase();
      filteredArtworks = filteredArtworks.filter(artwork => 
        artwork.title?.toLowerCase().includes(searchTerm) ||
        artwork.artist?.toLowerCase().includes(searchTerm) ||
        artwork.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (artist) {
      filteredArtworks = filteredArtworks.filter(artwork => 
        artwork.artist?.toLowerCase() === artist.toLowerCase()
      );
    }

    if (style) {
      filteredArtworks = filteredArtworks.filter(artwork => 
        artwork.style?.toLowerCase().includes(style.toLowerCase())
      );
    }

    if (period) {
      filteredArtworks = filteredArtworks.filter(artwork => 
        artwork.period?.toLowerCase().includes(period.toLowerCase())
      );
    }

    // 결과 제한
    const limitedResults = filteredArtworks.slice(0, parseInt(limit));

    // 이미지 URL 추가
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const resultsWithUrls = limitedResults.map(artwork => ({
      ...artwork,
      imageUrls: {
        thumbnail: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=thumbnail`,
        medium: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=medium`,
        full: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=full`
      }
    }));

    res.json({
      results: resultsWithUrls,
      total: filteredArtworks.length
    });
  } catch (error) {
    console.error('Error searching artworks:', error);
    res.status(500).json({ error: 'Failed to search artworks' });
  }
});

module.exports = router;