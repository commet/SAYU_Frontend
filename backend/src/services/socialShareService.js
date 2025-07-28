const { logger } = require('../config/logger');

class SocialShareService {
  constructor() {
    this.platforms = {
      twitter: {
        baseUrl: 'https://twitter.com/intent/tweet',
        params: ['text', 'url', 'hashtags', 'via']
      },
      facebook: {
        baseUrl: 'https://www.facebook.com/sharer/sharer.php',
        params: ['u', 'quote']
      },
      linkedin: {
        baseUrl: 'https://www.linkedin.com/sharing/share-offsite/',
        params: ['url', 'title', 'summary']
      },
      pinterest: {
        baseUrl: 'https://pinterest.com/pin/create/button/',
        params: ['url', 'media', 'description']
      },
      reddit: {
        baseUrl: 'https://reddit.com/submit',
        params: ['url', 'title', 'text']
      }
    };
  }

  // Generate shareable URLs for different platforms
  generateShareUrl(platform, data) {
    const platformConfig = this.platforms[platform.toLowerCase()];
    if (!platformConfig) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const { baseUrl, params } = platformConfig;
    const urlParams = new URLSearchParams();

    // Map data to platform-specific parameters
    switch (platform.toLowerCase()) {
      case 'twitter':
        if (data.text) urlParams.append('text', data.text);
        if (data.url) urlParams.append('url', data.url);
        if (data.hashtags) urlParams.append('hashtags', data.hashtags.join(','));
        if (data.via) urlParams.append('via', data.via);
        break;

      case 'facebook':
        if (data.url) urlParams.append('u', data.url);
        if (data.quote) urlParams.append('quote', data.quote);
        break;

      case 'linkedin':
        if (data.url) urlParams.append('url', data.url);
        if (data.title) urlParams.append('title', data.title);
        if (data.summary) urlParams.append('summary', data.summary);
        break;

      case 'pinterest':
        if (data.url) urlParams.append('url', data.url);
        if (data.media) urlParams.append('media', data.media);
        if (data.description) urlParams.append('description', data.description);
        break;

      case 'reddit':
        if (data.url) urlParams.append('url', data.url);
        if (data.title) urlParams.append('title', data.title);
        if (data.text) urlParams.append('text', data.text);
        break;
    }

    return `${baseUrl}?${urlParams.toString()}`;
  }

  // Generate share data for artwork
  generateArtworkShareData(artwork, userProfile) {
    const baseUrl = process.env.FRONTEND_URL || 'https://sayu.app';
    const artworkUrl = `${baseUrl}/artworks/${artwork.id}`;

    const title = `Check out this amazing artwork: ${artwork.title}`;
    const description = `I discovered "${artwork.title}" by ${artwork.artist_display_name || 'Unknown Artist'} through my aesthetic journey on SAYU. ${artwork.medium ? `Medium: ${artwork.medium}` : ''}`;

    return {
      url: artworkUrl,
      title,
      text: description,
      quote: description,
      summary: description,
      description,
      media: artwork.primaryImageSmall || artwork.primaryImage,
      hashtags: ['SAYU', 'AestheticJourney', 'Art', 'Culture', 'Discovery'],
      via: 'SAYUApp'
    };
  }

  // Generate share data for quiz results
  generateQuizShareData(quizResult, userProfile) {
    const baseUrl = process.env.FRONTEND_URL || 'https://sayu.app';
    const profileUrl = `${baseUrl}/profile/${userProfile.id}`;

    const archetypeName = userProfile.archetype_name || 'Aesthetic Explorer';
    const title = `I discovered my aesthetic archetype: ${archetypeName}`;
    const description = `I just completed my aesthetic journey quiz on SAYU and discovered I'm a ${archetypeName}! Find out your aesthetic personality and explore art that resonates with your unique perspective.`;

    return {
      url: profileUrl,
      title,
      text: description,
      quote: description,
      summary: description,
      description,
      media: userProfile.generated_image_url,
      hashtags: ['SAYU', 'AestheticPersonality', archetypeName.replace(/\s+/g, ''), 'ArtDiscovery'],
      via: 'SAYUApp'
    };
  }

  // Generate share data for exhibition visit
  generateExhibitionShareData(exhibition, userReflection) {
    const baseUrl = process.env.FRONTEND_URL || 'https://sayu.app';
    const exhibitionUrl = exhibition.web_url || `${baseUrl}/exhibitions/${exhibition.id}`;

    const title = `Visited: ${exhibition.title}`;
    const description = userReflection
      ? `I just visited "${exhibition.title}" and had an incredible experience. ${userReflection.slice(0, 100)}...`
      : `I just visited "${exhibition.title}" - an amazing exhibition that resonated with my aesthetic journey.`;

    return {
      url: exhibitionUrl,
      title,
      text: description,
      quote: description,
      summary: description,
      description,
      media: exhibition.primaryImageSmall,
      hashtags: ['SAYU', 'MuseumVisit', 'Exhibition', 'Culture', 'ArtExperience'],
      via: 'SAYUApp'
    };
  }

  // Generate share data for achievement
  generateAchievementShareData(achievement, userProfile) {
    const baseUrl = process.env.FRONTEND_URL || 'https://sayu.app';
    const profileUrl = `${baseUrl}/profile/${userProfile.id}`;

    const title = `Achievement Unlocked: ${achievement.name}`;
    const description = `I just unlocked the "${achievement.name}" achievement on my SAYU aesthetic journey! ${achievement.description}`;

    return {
      url: profileUrl,
      title,
      text: description,
      quote: description,
      summary: description,
      description,
      hashtags: ['SAYU', 'Achievement', 'AestheticJourney', achievement.name.replace(/\s+/g, '')],
      via: 'SAYUApp'
    };
  }

  // Generate share data for community post
  generateCommunityShareData(topic, forum) {
    const baseUrl = process.env.FRONTEND_URL || 'https://sayu.app';
    const topicUrl = `${baseUrl}/community/topics/${topic.id}`;

    const title = `Join the discussion: ${topic.title}`;
    const description = `Join our community discussion about "${topic.title}" in the ${forum.name} forum. Share your perspective on aesthetic experiences and connect with fellow art lovers.`;

    return {
      url: topicUrl,
      title,
      text: description,
      quote: description,
      summary: description,
      description,
      hashtags: ['SAYU', 'Community', 'Discussion', 'AestheticCommunity'],
      via: 'SAYUApp'
    };
  }

  // Generate all platform URLs for given content
  generateAllPlatformUrls(contentType, data, additionalData = {}) {
    let shareData;

    switch (contentType) {
      case 'artwork':
        shareData = this.generateArtworkShareData(data, additionalData.userProfile);
        break;
      case 'quiz':
        shareData = this.generateQuizShareData(data, additionalData.userProfile);
        break;
      case 'exhibition':
        shareData = this.generateExhibitionShareData(data, additionalData.userReflection);
        break;
      case 'achievement':
        shareData = this.generateAchievementShareData(data, additionalData.userProfile);
        break;
      case 'community':
        shareData = this.generateCommunityShareData(data, additionalData.forum);
        break;
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }

    const platformUrls = {};

    for (const platform of Object.keys(this.platforms)) {
      try {
        platformUrls[platform] = this.generateShareUrl(platform, shareData);
      } catch (error) {
        logger.error(`Failed to generate ${platform} share URL:`, error);
        platformUrls[platform] = null;
      }
    }

    return {
      platforms: platformUrls,
      shareData,
      directUrl: shareData.url
    };
  }

  // Track share event
  async trackShare(userId, contentType, contentId, platform) {
    try {
      const { pool } = require('../config/database');

      const query = `
        INSERT INTO social_shares (
          user_id, content_type, content_id, platform, shared_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING id
      `;

      const result = await pool.query(query, [userId, contentType, contentId, platform]);

      logger.info(`Social share tracked: ${platform} share of ${contentType} ${contentId} by user ${userId}`);
      return result.rows[0];

    } catch (error) {
      logger.error('Failed to track social share:', error);
      throw error;
    }
  }

  // Get share analytics
  async getShareAnalytics(userId, timeframe = '30d') {
    try {
      const { pool } = require('../config/database');

      const timeCondition = timeframe === '7d' ? "shared_at >= NOW() - INTERVAL '7 days'" :
                           timeframe === '30d' ? "shared_at >= NOW() - INTERVAL '30 days'" :
                           timeframe === '90d' ? "shared_at >= NOW() - INTERVAL '90 days'" :
                           "shared_at >= NOW() - INTERVAL '365 days'";

      const query = `
        SELECT 
          platform,
          content_type,
          COUNT(*) as share_count,
          COUNT(DISTINCT content_id) as unique_content_shared
        FROM social_shares 
        WHERE user_id = $1 AND ${timeCondition}
        GROUP BY platform, content_type
        ORDER BY share_count DESC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;

    } catch (error) {
      logger.error('Failed to get share analytics:', error);
      throw error;
    }
  }

  // Generate native share data (for Web Share API)
  generateNativeShareData(contentType, data, additionalData = {}) {
    const { shareData } = this.generateAllPlatformUrls(contentType, data, additionalData);

    return {
      title: shareData.title,
      text: shareData.text || shareData.description,
      url: shareData.url
    };
  }
}

module.exports = new SocialShareService();
