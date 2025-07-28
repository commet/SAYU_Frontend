// Artwork Preference Scoring System
// Based on tag accumulation from user quiz responses

class ArtworkScoringService {
  constructor() {
    // Tag mappings for artwork questions Q1-Q12
    this.questionTags = {
      'Q1': {
        'A': ['symbolic_complexity', 'emotional_resonance'],
        'B': ['clear_narrative', 'representational_form']
      },
      'Q2': {
        'A': ['spatial_complexity', 'vivid_color'],
        'B': ['material_detail', 'calm_mood']
      },
      'Q3': {
        'A': ['symbolic_complexity', 'material_detail'],
        'B': ['clear_narrative', 'representational_form']
      },
      'Q4': {
        'A': ['vivid_color', 'emotional_resonance'],
        'B': ['calm_mood', 'representational_form']
      },
      'Q5': {
        'A': ['symbolic_complexity', 'spatial_complexity'],
        'B': ['clear_narrative', 'material_detail']
      },
      'Q6': {
        'A': ['vivid_color', 'representational_form'],
        'B': ['calm_mood', 'symbolic_complexity']
      },
      'Q7': {
        'A': ['emotional_resonance', 'material_detail'],
        'B': ['representational_form', 'clear_narrative']
      },
      'Q8': {
        'A': ['symbolic_complexity', 'vivid_color'],
        'B': ['clear_narrative', 'calm_mood']
      },
      'Q9': {
        'A': ['spatial_complexity', 'material_detail'],
        'B': ['representational_form', 'calm_mood']
      },
      'Q10': {
        'A': ['emotional_resonance', 'spatial_complexity'],
        'B': ['clear_narrative', 'material_detail']
      },
      'Q11': {
        'A': ['symbolic_complexity', 'calm_mood'],
        'B': ['clear_narrative', 'vivid_color']
      },
      'Q12': {
        'A': ['representational_form', 'emotional_resonance'],
        'B': ['symbolic_complexity', 'spatial_complexity']
      }
    };

    // Image generation prompt templates for each tag
    this.promptTemplates = {
      'symbolic_complexity': 'An abstract, multi-layered artwork filled with symbolic objects, inspired by surrealism',
      'clear_narrative': 'A figurative painting depicting a clear storyline with visible characters and action',
      'material_detail': 'A close-up of a sculpture or texture-rich installation, emphasizing physical material',
      'spatial_complexity': 'A complex 3D installation with varied depth and overlapping structures, playing with space',
      'vivid_color': 'A vibrant, high-saturation painting with energetic brushstrokes and intense hues',
      'calm_mood': 'A minimalist artwork in soft tones, evoking a serene and meditative atmosphere',
      'emotional_resonance': 'An emotionally charged artwork that evokes nostalgia or inner reflection',
      'representational_form': 'A highly realistic painting or photograph capturing tangible everyday moments'
    };
  }

  /**
   * Calculate artwork preference scores from quiz responses
   * @param {Object} responses - Quiz responses in format {Q1: "A", Q2: "B", ...}
   * @returns {Object} - Scoring results with tags, vectors, and prompts
   */
  calculateArtworkPreferences(responses) {
    // Initialize tag counter
    const tagCounter = {};

    // Count tags from each response
    Object.entries(responses).forEach(([questionId, answer]) => {
      // Map core questions (C1-C8) to Q1-Q8, and other sections accordingly
      const mappedQuestionId = this.mapQuestionId(questionId);

      if (this.questionTags[mappedQuestionId]) {
        const tags = this.questionTags[mappedQuestionId][answer.answer || answer];

        if (tags) {
          tags.forEach(tag => {
            tagCounter[tag] = (tagCounter[tag] || 0) + 1;
          });
        }
      }
    });

    // Convert to sorted results
    const resultVector = Object.entries(tagCounter)
      .map(([tag, score]) => ({ tag, score }))
      .sort((a, b) => b.score - a.score);

    // Get top 2 tags for image generation
    const topTags = resultVector.slice(0, 2).map(item => item.tag);

    // Generate artwork recommendation prompt
    const artworkPrompt = this.generateArtworkPrompt(topTags);

    // Create preference profile
    const preferenceProfile = this.createPreferenceProfile(tagCounter);

    return {
      tagScores: tagCounter,
      resultVector,
      topTags,
      artworkPrompt,
      preferenceProfile,
      dominantStyle: this.determineDominantStyle(tagCounter)
    };
  }

  /**
   * Map question IDs from quiz to scoring system
   * @param {string} questionId - Original question ID (C1, C2, etc.)
   * @returns {string} - Mapped question ID (Q1, Q2, etc.)
   */
  mapQuestionId(questionId) {
    // Map core questions C1-C8 to Q1-Q8
    if (questionId.startsWith('C')) {
      const num = parseInt(questionId.substring(1));
      if (num >= 1 && num <= 8) {
        return `Q${num}`;
      }
    }

    // Map painting questions P1-P4 to Q9-Q12
    if (questionId.startsWith('P')) {
      const num = parseInt(questionId.substring(1));
      if (num >= 1 && num <= 4) {
        return `Q${num + 8}`;
      }
    }

    // For multidimensional and mixed, use fallback mapping
    if (questionId.startsWith('M') || questionId.startsWith('X')) {
      // Use modulo to map to existing questions
      const hashCode = questionId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      return `Q${Math.abs(hashCode % 12) + 1}`;
    }

    return 'Q1'; // Default fallback
  }

  /**
   * Generate artwork recommendation prompt from top tags
   * @param {Array} topTags - Array of top-scoring tags
   * @returns {string} - Combined prompt for image generation
   */
  generateArtworkPrompt(topTags) {
    if (topTags.length === 0) {
      return 'A beautiful, contemplative artwork that evokes emotional connection';
    }

    const prompts = topTags.map(tag => this.promptTemplates[tag] || 'artistic expression');
    return prompts.join(' + ');
  }

  /**
   * Create a preference profile summary
   * @param {Object} tagCounter - Tag scores
   * @returns {Object} - Preference profile with categories
   */
  createPreferenceProfile(tagCounter) {
    const totalResponses = Object.values(tagCounter).reduce((sum, count) => sum + count, 0);

    // Calculate percentages
    const preferences = {};
    Object.entries(tagCounter).forEach(([tag, count]) => {
      preferences[tag] = {
        score: count,
        percentage: Math.round((count / totalResponses) * 100)
      };
    });

    // Categorize preferences
    const categories = {
      abstraction: (tagCounter.symbolic_complexity || 0) + (tagCounter.spatial_complexity || 0),
      realism: (tagCounter.clear_narrative || 0) + (tagCounter.representational_form || 0),
      emotion: (tagCounter.emotional_resonance || 0) + (tagCounter.calm_mood || 0),
      technical: (tagCounter.material_detail || 0) + (tagCounter.vivid_color || 0)
    };

    return {
      preferences,
      categories,
      totalResponses
    };
  }

  /**
   * Determine dominant artistic style
   * @param {Object} tagCounter - Tag scores
   * @returns {string} - Dominant style description
   */
  determineDominantStyle(tagCounter) {
    const abstract_score = (tagCounter.symbolic_complexity || 0) + (tagCounter.spatial_complexity || 0);
    const realistic_score = (tagCounter.clear_narrative || 0) + (tagCounter.representational_form || 0);
    const emotional_score = (tagCounter.emotional_resonance || 0) + (tagCounter.calm_mood || 0);
    const material_score = (tagCounter.material_detail || 0) + (tagCounter.vivid_color || 0);

    const maxScore = Math.max(abstract_score, realistic_score, emotional_score, material_score);

    if (maxScore === abstract_score) return 'Abstract Conceptual';
    if (maxScore === realistic_score) return 'Realistic Narrative';
    if (maxScore === emotional_score) return 'Emotional Expressive';
    if (maxScore === material_score) return 'Material Focused';

    return 'Balanced Aesthetic';
  }

  /**
   * Get artwork recommendations based on user preferences
   * @param {Object} preferences - User preference profile
   * @returns {Array} - Array of recommended artwork styles
   */
  getArtworkRecommendations(preferences) {
    const { topTags, dominantStyle, categories } = preferences;

    const recommendations = [];

    // Add primary recommendation based on dominant style
    recommendations.push({
      type: 'primary',
      style: dominantStyle,
      prompt: this.generateArtworkPrompt(topTags),
      confidence: this.calculateConfidence(categories)
    });

    // Add secondary recommendations
    const secondaryTags = Object.entries(preferences.tagScores)
      .sort(([,a], [,b]) => b - a)
      .slice(2, 4)
      .map(([tag]) => tag);

    if (secondaryTags.length > 0) {
      recommendations.push({
        type: 'secondary',
        style: 'Alternative Style',
        prompt: this.generateArtworkPrompt(secondaryTags),
        confidence: 0.7
      });
    }

    return recommendations;
  }

  /**
   * Calculate confidence score for recommendations
   * @param {Object} categories - Category scores
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidence(categories) {
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    const maxCategory = Math.max(...Object.values(categories));

    if (total === 0) return 0.5;
    return Math.min(0.95, 0.5 + (maxCategory / total) * 0.45);
  }
}

module.exports = new ArtworkScoringService();
