// 128 Profile Image Mapping System
// Combines 16 Exhibition Types × 8 Artwork Types = 128 Unique Profiles

class ProfileImageMappingService {
  constructor() {
    // 16 Exhibition Preference Types (from existing system)
    this.exhibitionTypes = [
      'GAEF', 'GAEC', 'GAMF', 'GAMC',
      'GREF', 'GREC', 'GRMF', 'GRMC', 
      'SAEF', 'SAEC', 'SAMF', 'SAMC',
      'SREF', 'SREC', 'SRMF', 'SRMC'
    ];

    // 8 Artwork Preference Types (derived from tag combinations)
    this.artworkTypes = {
      'SYM_EMO': {
        code: 'SYM_EMO',
        name: 'Symbolic Emotional',
        primaryTags: ['symbolic_complexity', 'emotional_resonance'],
        description: 'Drawn to abstract symbolism that evokes deep emotional responses',
        visualTheme: 'abstract expressionist, emotionally charged, symbolic imagery'
      },
      'SYM_SPA': {
        code: 'SYM_SPA',
        name: 'Symbolic Spatial',
        primaryTags: ['symbolic_complexity', 'spatial_complexity'],
        description: 'Appreciates complex abstract compositions with layered spatial relationships',
        visualTheme: 'geometric abstraction, architectural forms, dimensional complexity'
      },
      'NAR_REP': {
        code: 'NAR_REP', 
        name: 'Narrative Representational',
        primaryTags: ['clear_narrative', 'representational_form'],
        description: 'Prefers figurative art that tells clear, understandable stories',
        visualTheme: 'classical realism, storytelling scenes, human figures'
      },
      'MAT_VIV': {
        code: 'MAT_VIV',
        name: 'Material Vivid',
        primaryTags: ['material_detail', 'vivid_color'],
        description: 'Fascinated by texture, craftsmanship, and vibrant color palettes',
        visualTheme: 'textural surfaces, bright colors, tactile materials'
      },
      'CAL_MIN': {
        code: 'CAL_MIN',
        name: 'Calm Minimalist',
        primaryTags: ['calm_mood', 'representational_form'],
        description: 'Seeks peaceful, serene artworks with clear, simple forms',
        visualTheme: 'minimalist compositions, soft colors, tranquil scenes'
      },
      'EMO_SPA': {
        code: 'EMO_SPA',
        name: 'Emotional Spatial',
        primaryTags: ['emotional_resonance', 'spatial_complexity'],
        description: 'Values emotionally impactful art with complex dimensional elements',
        visualTheme: 'immersive installations, emotional environments, spatial drama'
      },
      'VIV_NAR': {
        code: 'VIV_NAR',
        name: 'Vivid Narrative',
        primaryTags: ['vivid_color', 'clear_narrative'],
        description: 'Enjoys bright, colorful artworks that tell engaging stories',
        visualTheme: 'colorful illustrations, dynamic scenes, energetic storytelling'
      },
      'BAL_MIX': {
        code: 'BAL_MIX',
        name: 'Balanced Mixed',
        primaryTags: ['material_detail', 'calm_mood'],
        description: 'Appreciates balanced compositions combining technical skill with peaceful aesthetics',
        visualTheme: 'refined craftsmanship, harmonious balance, subtle sophistication'
      }
    };
  }

  /**
   * Generate all 128 profile combinations
   * @returns {Array} Array of all possible profile combinations
   */
  generateAllProfileCombinations() {
    const combinations = [];
    
    this.exhibitionTypes.forEach(exhibitionType => {
      Object.keys(this.artworkTypes).forEach(artworkType => {
        const combination = {
          id: `${exhibitionType}_${artworkType}`,
          exhibitionType,
          artworkType,
          imageFileName: `profile_${exhibitionType}_${artworkType}.jpg`,
          imagePath: `/images/profiles/${exhibitionType}_${artworkType}.jpg`
        };
        
        combinations.push(combination);
      });
    });
    
    return combinations;
  }

  /**
   * Determine artwork type from user's quiz responses
   * @param {Object} artworkAnalysis - Result from ArtworkScoringService
   * @returns {string} Artwork type code
   */
  determineArtworkType(artworkAnalysis) {
    const { tagScores } = artworkAnalysis;
    
    // Calculate scores for each artwork type based on primary tags
    const typeScores = {};
    
    Object.entries(this.artworkTypes).forEach(([typeCode, typeData]) => {
      const [tag1, tag2] = typeData.primaryTags;
      typeScores[typeCode] = (tagScores[tag1] || 0) + (tagScores[tag2] || 0);
    });
    
    // Return the type with highest score
    const bestType = Object.entries(typeScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return bestType ? bestType[0] : 'BAL_MIX';
  }

  /**
   * Get profile image path for a user
   * @param {string} exhibitionType - User's exhibition preference type (e.g., 'GAEF')
   * @param {Object} artworkAnalysis - User's artwork analysis
   * @returns {Object} Profile image information
   */
  getProfileImage(exhibitionType, artworkAnalysis) {
    const artworkType = this.determineArtworkType(artworkAnalysis);
    
    const imageInfo = {
      exhibitionType,
      artworkType,
      combinationId: `${exhibitionType}_${artworkType}`,
      imageFileName: `profile_${exhibitionType}_${artworkType}.jpg`,
      imagePath: `/images/profiles/${exhibitionType}_${artworkType}.jpg`,
      fallbackPath: `/images/profiles/default_${exhibitionType}.jpg`,
      description: this.generateProfileDescription(exhibitionType, artworkType)
    };
    
    return imageInfo;
  }

  /**
   * Generate descriptive text for a profile combination
   * @param {string} exhibitionType - Exhibition preference type
   * @param {string} artworkType - Artwork preference type
   * @returns {string} Profile description
   */
  generateProfileDescription(exhibitionType, artworkType) {
    const artworkInfo = this.artworkTypes[artworkType];
    
    // Get exhibition type description (would need to import from exhibitionTypes)
    const exhibitionDescriptions = {
      'GAEF': 'grounded, abstract, emotional, flowing',
      'GAEC': 'grounded, abstract, emotional, constructive',
      'GAMF': 'grounded, abstract, meaning-focused, flowing',
      'GAMC': 'grounded, abstract, meaning-focused, constructive',
      'GREF': 'grounded, realistic, emotional, flowing',
      'GREC': 'grounded, realistic, emotional, constructive',
      'GRMF': 'grounded, realistic, meaning-focused, flowing',
      'GRMC': 'grounded, realistic, meaning-focused, constructive',
      'SAEF': 'shared, abstract, emotional, flowing',
      'SAEC': 'shared, abstract, emotional, constructive',
      'SAMF': 'shared, abstract, meaning-focused, flowing',
      'SAMC': 'shared, abstract, meaning-focused, constructive',
      'SREF': 'shared, realistic, emotional, flowing',
      'SREC': 'shared, realistic, emotional, constructive',
      'SRMF': 'shared, realistic, meaning-focused, flowing',
      'SRMC': 'shared, realistic, meaning-focused, constructive'
    };
    
    const exhibitionDesc = exhibitionDescriptions[exhibitionType] || 'balanced exhibition style';
    
    return `A ${exhibitionDesc} visitor who ${artworkInfo.description.toLowerCase()}`;
  }

  /**
   * Generate image prompts for AI generation
   * @param {string} exhibitionType - Exhibition preference type
   * @param {string} artworkType - Artwork preference type
   * @returns {Object} Detailed prompt for image generation
   */
  generateImagePrompt(exhibitionType, artworkType) {
    const artworkInfo = this.artworkTypes[artworkType];
    const exhibitionInfo = this.getExhibitionVisualTheme(exhibitionType);
    
    const prompt = {
      mainPrompt: `A sophisticated art enthusiast profile image featuring ${exhibitionInfo.mood} with ${artworkInfo.visualTheme}`,
      style: `${exhibitionInfo.environment}, ${artworkInfo.visualTheme}`,
      mood: exhibitionInfo.mood,
      artworkFocus: artworkInfo.visualTheme,
      composition: exhibitionInfo.composition,
      
      // Complete prompt for AI image generation
      fullPrompt: [
        `Professional art connoisseur portrait`,
        `${exhibitionInfo.mood} in ${exhibitionInfo.environment}`,
        `Surrounded by ${artworkInfo.visualTheme}`,
        `${exhibitionInfo.composition}`,
        `Sophisticated lighting, museum quality, artistic photography`,
        `Ultra-detailed, 8K resolution, professional photography`
      ].join(', ')
    };
    
    return prompt;
  }

  /**
   * Get visual theme elements for exhibition types
   * @param {string} exhibitionType - Exhibition preference type
   * @returns {Object} Visual theme information
   */
  getExhibitionVisualTheme(exhibitionType) {
    const themes = {
      // Lone types (G)
      'GAEF': { mood: 'contemplative solitude', environment: 'intimate gallery space', composition: 'personal reflection pose' },
      'GAEC': { mood: 'focused study', environment: 'structured museum hall', composition: 'analytical observation' },
      'GAMF': { mood: 'thoughtful analysis', environment: 'open exhibition space', composition: 'intellectual engagement' },
      'GAMC': { mood: 'methodical examination', environment: 'curated gallery section', composition: 'systematic viewing' },
      'GREF': { mood: 'emotional connection', environment: 'classical art gallery', composition: 'intimate artwork encounter' },
      'GREC': { mood: 'serene appreciation', environment: 'traditional museum room', composition: 'peaceful contemplation' },
      'GRMF': { mood: 'scholarly study', environment: 'academic gallery setting', composition: 'research-focused pose' },
      'GRMC': { mood: 'reverent observation', environment: 'formal museum hall', composition: 'respectful viewing stance' },
      
      // Shared types (S)
      'SAEF': { mood: 'collaborative discovery', environment: 'social gallery space', composition: 'group discussion scene' },
      'SAEC': { mood: 'guided exploration', environment: 'interactive exhibition', composition: 'shared learning moment' },
      'SAMF': { mood: 'intellectual discourse', environment: 'contemporary art space', composition: 'animated discussion' },
      'SAMC': { mood: 'structured dialogue', environment: 'educational gallery tour', composition: 'organized group viewing' },
      'SREF': { mood: 'enthusiastic sharing', environment: 'community art space', composition: 'storytelling gesture' },
      'SREC': { mood: 'warm companionship', environment: 'family-friendly gallery', composition: 'inclusive art viewing' },
      'SRMF': { mood: 'knowledge exchange', environment: 'lecture hall with art', composition: 'teaching/learning interaction' },
      'SRMC': { mood: 'cultural celebration', environment: 'public museum event', composition: 'community engagement scene' }
    };
    
    return themes[exhibitionType] || { mood: 'balanced appreciation', environment: 'modern gallery', composition: 'neutral viewing pose' };
  }

  /**
   * Create file structure manifest for image organization
   * @returns {Object} File organization structure
   */
  createImageFileStructure() {
    const structure = {
      baseDirectory: '/images/profiles/',
      naming: {
        pattern: 'profile_{EXHIBITION_TYPE}_{ARTWORK_TYPE}.jpg',
        example: 'profile_GAEF_SYM_EMO.jpg'
      },
      fallbacks: {
        pattern: 'default_{EXHIBITION_TYPE}.jpg',
        example: 'default_GAEF.jpg'
      },
      totalImages: 128,
      exhibitionTypes: this.exhibitionTypes.length,
      artworkTypes: Object.keys(this.artworkTypes).length,
      
      // Generate complete file list
      fileList: this.generateAllProfileCombinations().map(combo => ({
        fileName: combo.imageFileName,
        fullPath: combo.imagePath,
        exhibitionType: combo.exhibitionType,
        artworkType: combo.artworkType
      }))
    };
    
    return structure;
  }

  /**
   * Generate batch prompts for AI image generation
   * @returns {Array} Array of prompts ready for batch generation
   */
  generateBatchPrompts() {
    const prompts = [];
    
    this.exhibitionTypes.forEach(exhibitionType => {
      Object.keys(this.artworkTypes).forEach(artworkType => {
        const prompt = this.generateImagePrompt(exhibitionType, artworkType);
        
        prompts.push({
          fileName: `profile_${exhibitionType}_${artworkType}.jpg`,
          exhibitionType,
          artworkType,
          prompt: prompt.fullPrompt,
          description: this.generateProfileDescription(exhibitionType, artworkType),
          style: prompt.style,
          mood: prompt.mood
        });
      });
    });
    
    return prompts;
  }
}

module.exports = new ProfileImageMappingService();