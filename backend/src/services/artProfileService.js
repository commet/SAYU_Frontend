const Replicate = require('replicate');
const sharp = require('sharp');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const { hybridDB } = require('../config/hybridDatabase');
const redis = require('../config/redis');
const logger = require('../utils/logger');

class ArtProfileService {
  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Cloudinary 설정
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // 스타일별 최적 모델 매핑
    this.styleModels = {
      'monet-impressionism': {
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        prompt: 'impressionist painting in the style of Claude Monet, soft brushstrokes, pastel colors',
        negative_prompt: 'realistic, photo, modern'
      },
      'picasso-cubism': {
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        prompt: 'cubist painting in the style of Pablo Picasso, geometric shapes, multiple perspectives',
        negative_prompt: 'realistic, photo, smooth'
      },
      'vangogh-postimpressionism': {
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        prompt: 'painting in the style of Vincent van Gogh, swirling brushstrokes, vivid colors, emotional',
        negative_prompt: 'realistic, photo, calm'
      },
      'warhol-popart': {
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        prompt: 'pop art in the style of Andy Warhol, bright colors, high contrast, repetitive patterns',
        negative_prompt: 'realistic, subtle, muted colors'
      },
      'pixel-art': {
        model: 'andreasjansson/pixray-text2image:5c347a4bfa1d4523a58ae614c2194e15f2ae682b57e3797a5bb468920aa70ebf',
        prompt: 'pixel art style, 8-bit, retro game aesthetic',
        settings: { 
          drawer: 'pixel',
          pixelart: true 
        }
      },
      'korean-minhwa': {
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        prompt: 'Korean traditional folk art minhwa style, vibrant colors, decorative patterns, flat perspective',
        negative_prompt: 'western, realistic, 3d'
      },
      'klimt-artnouveau': {
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        prompt: 'painting in the style of Gustav Klimt, gold leaf, decorative patterns, art nouveau',
        negative_prompt: 'realistic, simple, minimal'
      },
      'mondrian-neoplasticism': {
        model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        prompt: 'abstract painting in the style of Piet Mondrian, primary colors, black lines, geometric grid',
        negative_prompt: 'realistic, curved, organic'
      }
    };
  }

  /**
   * 사용자의 월간 크레딧 확인
   */
  async checkUserCredits(userId) {
    try {
      const query = `
        SELECT 
          u.is_premium,
          COUNT(ap.id) as used_this_month
        FROM users u
        LEFT JOIN art_profiles ap ON u.id = ap.user_id
          AND ap.created_at >= date_trunc('month', CURRENT_DATE)
          AND ap.created_at < date_trunc('month', CURRENT_DATE) + interval '1 month'
        WHERE u.id = $1
        GROUP BY u.id, u.is_premium
      `;
      
      const result = await hybridDB.query(query, [userId]);
      const user = result.rows[0];
      
      if (!user) {
        throw new Error('User not found');
      }

      const monthlyLimit = user.is_premium 
        ? parseInt(process.env.ART_PROFILE_PREMIUM_MONTHLY_LIMIT || '30')
        : parseInt(process.env.ART_PROFILE_FREE_MONTHLY_LIMIT || '3');

      return {
        isPremium: user.is_premium,
        used: parseInt(user.used_this_month || 0),
        remaining: monthlyLimit - parseInt(user.used_this_month || 0),
        limit: monthlyLimit
      };
    } catch (error) {
      logger.error('Error checking user credits:', error);
      throw error;
    }
  }

  /**
   * 이미지를 base64에서 버퍼로 변환하고 최적화
   */
  async processImage(base64Image) {
    try {
      // base64 데이터 URI에서 실제 base64 데이터만 추출
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Sharp로 이미지 최적화 (512x512 리사이즈)
      const optimizedBuffer = await sharp(imageBuffer)
        .resize(512, 512, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // 이미지 해시 생성 (캐싱용)
      const imageHash = crypto
        .createHash('md5')
        .update(optimizedBuffer)
        .digest('hex');

      return { optimizedBuffer, imageHash };
    } catch (error) {
      logger.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Cloudinary에 이미지 업로드
   */
  async uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `art-profiles/${folder}`,
          resource_type: 'image',
          format: 'jpg'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * AI 아트 프로필 생성
   */
  async generateArtProfile(userId, base64Image, styleId, customSettings = {}) {
    try {
      // 1. 크레딧 확인
      const credits = await this.checkUserCredits(userId);
      if (credits.remaining <= 0) {
        throw new Error('No credits remaining this month');
      }

      // 2. 이미지 처리
      const { optimizedBuffer, imageHash } = await this.processImage(base64Image);

      // 3. 캐싱 체크
      const cacheKey = `art:${userId}:${styleId}:${imageHash}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info('Returning cached art profile');
        return JSON.parse(cached);
      }

      // 4. 원본 이미지 Cloudinary 업로드
      const originalImageUrl = await this.uploadToCloudinary(optimizedBuffer, 'originals');

      // 5. 스타일 설정 가져오기
      const styleConfig = this.styleModels[styleId];
      if (!styleConfig) {
        throw new Error('Invalid style ID');
      }

      // 6. Replicate API 호출
      logger.info(`Generating art profile with style: ${styleId}`);
      
      let output;
      if (styleId === 'pixel-art') {
        // 픽셀 아트는 다른 모델 사용
        output = await this.replicate.run(
          styleConfig.model,
          {
            input: {
              prompts: styleConfig.prompt,
              ...styleConfig.settings
            }
          }
        );
      } else {
        // SDXL 모델 사용
        output = await this.replicate.run(
          styleConfig.model,
          {
            input: {
              prompt: `${styleConfig.prompt}, portrait of a person`,
              negative_prompt: styleConfig.negative_prompt,
              image: originalImageUrl,
              prompt_strength: 0.8,
              num_outputs: 1,
              guidance_scale: 7.5,
              scheduler: "K_EULER",
              num_inference_steps: 50,
              ...customSettings
            }
          }
        );
      }

      // 7. 결과 이미지 Cloudinary에 저장
      const transformedImageUrl = output[0];
      
      // 8. 데이터베이스에 저장
      const artProfileId = uuidv4();
      const insertQuery = `
        INSERT INTO art_profiles (
          id, user_id, original_image, transformed_image, 
          style_id, settings, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;

      const values = [
        artProfileId,
        userId,
        originalImageUrl,
        transformedImageUrl,
        styleId,
        JSON.stringify(customSettings)
      ];

      const result = await hybridDB.query(insertQuery, values);
      const artProfile = result.rows[0];

      // 9. 결과 캐싱 (1시간)
      const cacheData = {
        id: artProfile.id,
        userId: artProfile.user_id,
        originalImage: artProfile.original_image,
        transformedImage: artProfile.transformed_image,
        styleUsed: {
          id: styleId,
          ...styleConfig
        },
        createdAt: artProfile.created_at
      };

      await redis.setex(cacheKey, 3600, JSON.stringify(cacheData));

      // 10. 사용량 로깅
      logger.info(`Art profile generated: ${artProfileId} for user: ${userId}`);

      return cacheData;
    } catch (error) {
      logger.error('Error generating art profile:', error);
      throw error;
    }
  }

  /**
   * 사용자의 전시 관람 기록을 바탕으로 추천 스타일 가져오기
   */
  async getRecommendedStyles(userId) {
    try {
      // 사용자의 최근 전시 관람 기록에서 선호 스타일 분석
      const query = `
        SELECT 
          e.tags,
          COUNT(*) as visit_count
        FROM exhibition_visits ev
        JOIN exhibitions e ON ev.exhibition_id = e.id
        WHERE ev.user_id = $1
          AND ev.visited_at >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY e.tags
        ORDER BY visit_count DESC
        LIMIT 10
      `;

      const result = await hybridDB.query(query, [userId]);
      
      // 태그 분석하여 추천 스타일 결정
      const recommendedStyles = [];
      const allStyles = Object.keys(this.styleModels);

      // 태그 기반 매칭 로직
      result.rows.forEach(row => {
        if (row.tags) {
          const tags = row.tags.toLowerCase();
          
          if (tags.includes('인상') || tags.includes('impression')) {
            recommendedStyles.push('monet-impressionism');
          }
          if (tags.includes('현대') || tags.includes('contemporary')) {
            recommendedStyles.push('warhol-popart', 'mondrian-neoplasticism');
          }
          if (tags.includes('한국') || tags.includes('korean')) {
            recommendedStyles.push('korean-minhwa');
          }
          if (tags.includes('디지털') || tags.includes('digital')) {
            recommendedStyles.push('pixel-art');
          }
        }
      });

      // 중복 제거 및 상위 3개 반환
      const uniqueStyles = [...new Set(recommendedStyles)].slice(0, 3);
      
      // 추천이 부족하면 인기 스타일 추가
      if (uniqueStyles.length < 3) {
        const popularStyles = ['monet-impressionism', 'vangogh-postimpressionism', 'pixel-art'];
        popularStyles.forEach(style => {
          if (!uniqueStyles.includes(style) && uniqueStyles.length < 3) {
            uniqueStyles.push(style);
          }
        });
      }

      return uniqueStyles.map(styleId => ({
        id: styleId,
        ...this.styleModels[styleId]
      }));
    } catch (error) {
      logger.error('Error getting recommended styles:', error);
      // 에러 시 기본 추천 반환
      return ['monet-impressionism', 'pixel-art', 'warhol-popart'].map(id => ({
        id,
        ...this.styleModels[id]
      }));
    }
  }

  /**
   * 갤러리용 아트 프로필 목록 가져오기
   */
  async getGallery(filter = {}) {
    try {
      let query = `
        SELECT 
          ap.*,
          u.nickname,
          u.personality_type,
          COUNT(apl.id) as like_count
        FROM art_profiles ap
        JOIN users u ON ap.user_id = u.id
        LEFT JOIN art_profile_likes apl ON ap.id = apl.art_profile_id
        WHERE ap.is_public = true
      `;

      const values = [];
      let valueIndex = 1;

      // 스타일 필터
      if (filter.style) {
        query += ` AND ap.style_id = $${valueIndex}`;
        values.push(filter.style);
        valueIndex++;
      }

      // 기간 필터
      if (filter.period) {
        const periodMap = {
          'today': '1 day',
          'week': '7 days',
          'month': '30 days'
        };
        query += ` AND ap.created_at >= CURRENT_DATE - INTERVAL '${periodMap[filter.period]}'`;
      }

      query += ` GROUP BY ap.id, u.id, u.nickname, u.personality_type`;

      // 정렬
      if (filter.sort === 'popular') {
        query += ` ORDER BY like_count DESC, ap.created_at DESC`;
      } else {
        query += ` ORDER BY ap.created_at DESC`;
      }

      query += ` LIMIT 50`;

      const result = await hybridDB.query(query, values);

      return result.rows.map(row => ({
        id: row.id,
        user: {
          id: row.user_id,
          nickname: row.nickname,
          personalityType: row.personality_type
        },
        artProfile: {
          transformedImage: row.transformed_image,
          styleUsed: this.styleModels[row.style_id] || {},
          createdAt: row.created_at
        },
        likeCount: parseInt(row.like_count || 0)
      }));
    } catch (error) {
      logger.error('Error fetching gallery:', error);
      throw error;
    }
  }

  /**
   * 아트 프로필 좋아요
   */
  async likeArtProfile(artProfileId, userId) {
    try {
      // 이미 좋아요 했는지 확인
      const checkQuery = `
        SELECT id FROM art_profile_likes 
        WHERE art_profile_id = $1 AND user_id = $2
      `;
      const existing = await db.query(checkQuery, [artProfileId, userId]);

      if (existing.rows.length > 0) {
        // 이미 좋아요한 경우 취소
        await hybridDB.query(
          'DELETE FROM art_profile_likes WHERE art_profile_id = $1 AND user_id = $2',
          [artProfileId, userId]
        );
        return { liked: false };
      } else {
        // 좋아요 추가
        await hybridDB.query(
          'INSERT INTO art_profile_likes (art_profile_id, user_id) VALUES ($1, $2)',
          [artProfileId, userId]
        );
        return { liked: true };
      }
    } catch (error) {
      logger.error('Error liking art profile:', error);
      throw error;
    }
  }
}

module.exports = new ArtProfileService();