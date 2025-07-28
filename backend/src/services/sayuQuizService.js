// SAYU Quiz Service
// Backend: /backend/src/services/sayuQuizService.js

const { sayuEnhancedQuizData } = require('../data/sayuEnhancedQuizData');
const { SAYU_TYPES, validateSAYUType } = require('../../../shared/SAYUTypeDefinitions');

class SAYUQuizService {
  constructor() {
    this.sessions = new Map(); // Use Redis in production
  }

  // Create a new quiz session
  createSession(userId, language = 'en') {
    const sessionId = this.generateSessionId();
    const session = {
      sessionId,
      userId,
      language,
      startTime: new Date().toISOString(),
      responses: [],
      currentQuestionIndex: 0,
      dimensions: { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 },
      status: 'active'
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Get session by ID
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // Update session
  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  // Process quiz answer
  processAnswer(sessionId, questionId, answerId, timeSpent) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Find question and answer
    const question = sayuEnhancedQuizData.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const answer = this.findAnswerInQuestion(question, answerId);
    if (!answer) {
      throw new Error('Answer not found');
    }

    // Store response
    session.responses.push({
      questionId,
      answerId,
      weights: answer.weights || answer.weight,
      timeSpent,
      timestamp: new Date().toISOString()
    });

    // Update dimensions
    this.updateDimensions(session, answer.weights || answer.weight);

    // Update progress
    session.currentQuestionIndex++;

    // Check if quiz is complete
    if (session.currentQuestionIndex >= sayuEnhancedQuizData.questions.length) {
      return this.completeQuiz(session);
    }

    // Return next question
    return {
      complete: false,
      nextQuestion: this.formatQuestion(
        sayuEnhancedQuizData.questions[session.currentQuestionIndex],
        session.language
      ),
      progress: (session.currentQuestionIndex / sayuEnhancedQuizData.questions.length) * 100,
      dimensionSnapshot: this.getDimensionSnapshot(session.dimensions),
      feedback: answer.feedback
    };
  }

  // Complete quiz and calculate result
  completeQuiz(session) {
    const result = this.calculateResult(session);
    session.status = 'completed';
    session.result = result;
    session.endTime = new Date().toISOString();

    this.updateSession(session.sessionId, session);

    return {
      complete: true,
      result: this.formatResult(result, session.language)
    };
  }

  // Calculate final personality type and results
  calculateResult(session) {
    const { dimensions } = session;

    // Determine personality type
    const typeCode =
      (dimensions.L > dimensions.S ? 'L' : 'S') +
      (dimensions.A > dimensions.R ? 'A' : 'R') +
      (dimensions.E > dimensions.M ? 'E' : 'M') +
      (dimensions.F > dimensions.C ? 'F' : 'C');

    // Validate type code using central definitions
    validateSAYUType(typeCode);

    // Validate type code
    if (!validateSAYUType(typeCode)) {
      throw new Error(`Invalid SAYU type: ${typeCode}`);
    }

    const personalityType = sayuEnhancedQuizData.personalityTypes[typeCode];

    // Calculate confidence scores
    const confidence = this.calculateConfidence(dimensions);

    // Generate recommendations
    const recommendations = this.generateRecommendations(personalityType);

    return {
      personalityType,
      dimensions,
      confidence,
      recommendations,
      responsePattern: this.analyzeResponsePattern(session.responses)
    };
  }

  // Helper methods
  generateSessionId() {
    return `sayu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  findAnswerInQuestion(question, answerId) {
    return question.options?.find(opt => opt.id === answerId) ||
           question.responses?.find(opt => opt.id === answerId) ||
           question.layouts?.find(opt => opt.id === answerId) ||
           question.approaches?.find(opt => opt.id === answerId) ||
           question.images?.find(opt => opt.id === answerId);
  }

  updateDimensions(session, weights) {
    if (!weights) return;

    Object.entries(weights).forEach(([dimension, value]) => {
      if (session.dimensions.hasOwnProperty(dimension)) {
        session.dimensions[dimension] += value;
      }
    });
  }

  calculateConfidence(dimensions) {
    const axes = [
      { left: 'L', right: 'S' },
      { left: 'A', right: 'R' },
      { left: 'E', right: 'M' },
      { left: 'F', right: 'C' }
    ];

    const confidences = axes.map(axis => {
      const total = dimensions[axis.left] + dimensions[axis.right];
      const diff = Math.abs(dimensions[axis.left] - dimensions[axis.right]);
      return total > 0 ? (diff / total) * 100 : 50;
    });

    return {
      overall: confidences.reduce((a, b) => a + b, 0) / 4,
      byAxis: confidences,
      strength: this.getStrengthLabel(confidences.reduce((a, b) => a + b, 0) / 4)
    };
  }

  getStrengthLabel(confidence) {
    if (confidence >= 80) return 'Very Strong';
    if (confidence >= 60) return 'Strong';
    if (confidence >= 40) return 'Moderate';
    if (confidence >= 20) return 'Mild';
    return 'Balanced';
  }

  getDimensionSnapshot(dimensions) {
    return {
      'L/S': {
        value: dimensions.L - dimensions.S,
        percentage: this.calculateAxisPercentage(dimensions.L, dimensions.S)
      },
      'A/R': {
        value: dimensions.A - dimensions.R,
        percentage: this.calculateAxisPercentage(dimensions.A, dimensions.R)
      },
      'E/M': {
        value: dimensions.E - dimensions.M,
        percentage: this.calculateAxisPercentage(dimensions.E, dimensions.M)
      },
      'F/C': {
        value: dimensions.F - dimensions.C,
        percentage: this.calculateAxisPercentage(dimensions.F, dimensions.C)
      }
    };
  }

  calculateAxisPercentage(left, right) {
    const total = left + right;
    if (total === 0) return 50;
    return (left / total) * 100;
  }

  formatQuestion(question, language) {
    return {
      id: question.id,
      type: question.type,
      title: question.title,
      description: question.description,
      scenario: question.scenario,
      options: this.formatOptions(question, language),
      metadata: question.metadata || {},
      sliderConfig: question.sliderConfig,
      artwork: question.artwork,
      installation: question.installation
    };
  }

  formatOptions(question, language) {
    const options = question.options ||
                   question.responses ||
                   question.styles ||
                   question.layouts ||
                   question.approaches ||
                   question.images ||
                   [];

    return options.map(option => ({
      id: option.id,
      text: option.text || option.name,
      description: option.description,
      icon: option.icon,
      tags: option.tags || option.characteristics || [],
      weights: option.weights || option.weight
    }));
  }

  formatResult(result, language) {
    const { personalityType, dimensions, confidence, recommendations } = result;

    return {
      personalityType: {
        code: personalityType.code,
        name: personalityType.name,
        description: personalityType.description,
        archetype: personalityType.archetype,
        characteristics: personalityType.characteristics,
        scene: personalityType.visualScene,
        galleryBehavior: personalityType.galleryBehavior
      },
      dimensions: this.getDimensionSnapshot(dimensions),
      confidence,
      recommendations: this.formatRecommendations(recommendations, language),
      shareableCard: this.generateShareableCard(personalityType, language)
    };
  }

  generateRecommendations(personalityType) {
    return {
      exhibitions: this.matchExhibitions(personalityType),
      museums: personalityType.recommendations?.museums || [],
      artStyles: personalityType.preferences?.artStyles || [],
      experiences: personalityType.recommendations?.experiences || [],
      apps: personalityType.recommendations?.apps || []
    };
  }

  matchExhibitions(personalityType) {
    // Mock exhibition matching - in production, this would query a database
    const allExhibitions = [
      {
        id: 'ex1',
        title: 'Immersive Digital Art',
        tags: ['immersive', 'digital', 'interactive'],
        matchScore: 0
      },
      {
        id: 'ex2',
        title: 'Classical Masters',
        tags: ['classical', 'traditional', 'historical'],
        matchScore: 0
      },
      {
        id: 'ex3',
        title: 'Contemporary Concepts',
        tags: ['conceptual', 'contemporary', 'intellectual'],
        matchScore: 0
      }
    ];

    // Calculate match scores based on personality preferences
    return allExhibitions
      .map(exhibition => {
        const score = this.calculateExhibitionMatchScore(exhibition, personalityType);
        return { ...exhibition, matchScore: score };
      })
      .filter(ex => ex.matchScore > 0.3)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }

  calculateExhibitionMatchScore(exhibition, personalityType) {
    // Simple tag matching algorithm
    const prefTags = (personalityType.preferences?.exhibitionTypes || [])
      .join(' ')
      .toLowerCase()
      .split(' ');

    const matches = exhibition.tags.filter(tag =>
      prefTags.some(pref => tag.includes(pref) || pref.includes(tag))
    );

    return matches.length / exhibition.tags.length;
  }

  analyzeResponsePattern(responses) {
    return {
      averageTimePerQuestion: this.calculateAverageTime(responses),
      consistencyScore: this.calculateConsistency(responses),
      dominantAxis: this.findDominantAxis(responses)
    };
  }

  calculateAverageTime(responses) {
    const totalTime = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    return totalTime / responses.length;
  }

  calculateConsistency(responses) {
    // Analyze if responses consistently favor certain dimensions
    const dimensionCounts = {};

    responses.forEach(response => {
      Object.keys(response.weights || {}).forEach(dim => {
        dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
      });
    });

    const values = Object.values(dimensionCounts);
    if (values.length === 0) return 100;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;

    return 100 - (Math.sqrt(variance) / avg * 100);
  }

  findDominantAxis(responses) {
    const axisTotals = {
      'L/S': 0,
      'A/R': 0,
      'E/M': 0,
      'F/C': 0
    };

    responses.forEach(response => {
      const weights = response.weights || {};
      axisTotals['L/S'] += Math.abs((weights.L || 0) - (weights.S || 0));
      axisTotals['A/R'] += Math.abs((weights.A || 0) - (weights.R || 0));
      axisTotals['E/M'] += Math.abs((weights.E || 0) - (weights.M || 0));
      axisTotals['F/C'] += Math.abs((weights.F || 0) - (weights.C || 0));
    });

    return Object.entries(axisTotals)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  formatRecommendations(recommendations, language) {
    return {
      exhibitions: recommendations.exhibitions.map(ex => ({
        ...ex,
        title: ex.title
      })),
      museums: recommendations.museums,
      artStyles: recommendations.artStyles,
      experiences: recommendations.experiences,
      apps: recommendations.apps
    };
  }

  generateShareableCard(personalityType, language) {
    return {
      url: `https://sayu.art/api/cards/${personalityType.code}.png`,
      altText: `${personalityType.name} - SAYU Art Personality`,
      dimensions: {
        width: 1200,
        height: 630
      }
    };
  }

  // Get all personality types
  getAllPersonalityTypes(language = 'en') {
    return Object.values(sayuEnhancedQuizData.personalityTypes).map(type => ({
      code: type.code,
      name: type.name,
      description: type.description,
      characteristics: type.characteristics,
      scene: type.visualScene
    }));
  }

  // Compare two personality types
  comparePersonalityTypes(type1Code, type2Code, language = 'en') {
    // Validate both type codes using central definition
    if (!validateSAYUType(type1Code) || !validateSAYUType(type2Code)) {
      throw new Error('Invalid personality type codes');
    }

    const type1 = sayuEnhancedQuizData.personalityTypes[type1Code];
    const type2 = sayuEnhancedQuizData.personalityTypes[type2Code];

    // Find common and different axes
    const axes = ['L/S', 'A/R', 'E/M', 'F/C'];
    const similarities = [];
    const differences = [];

    for (let i = 0; i < 4; i++) {
      if (type1Code[i] === type2Code[i]) {
        similarities.push({
          axis: axes[i],
          shared: type1Code[i]
        });
      } else {
        differences.push({
          axis: axes[i],
          type1: type1Code[i],
          type2: type2Code[i]
        });
      }
    }

    return {
      type1: {
        code: type1Code,
        name: type1.name
      },
      type2: {
        code: type2Code,
        name: type2.name
      },
      compatibility: this.calculateCompatibility(similarities.length),
      similarities,
      differences,
      sharedInterests: this.findSharedInterests(type1, type2),
      complementaryTraits: this.findComplementaryTraits(type1, type2, differences)
    };
  }

  calculateCompatibility(similarityCount) {
    const percentage = (similarityCount / 4) * 100;
    let level;

    if (percentage >= 75) level = 'Highly Compatible';
    else if (percentage >= 50) level = 'Compatible';
    else if (percentage >= 25) level = 'Complementary';
    else level = 'Opposites Attract';

    return {
      percentage,
      level,
      description: this.getCompatibilityDescription(percentage)
    };
  }

  getCompatibilityDescription(percentage) {
    if (percentage >= 75) {
      return 'You share a very similar approach to experiencing art!';
    } else if (percentage >= 50) {
      return 'You have compatible viewing styles with some interesting differences.';
    } else if (percentage >= 25) {
      return 'Your different perspectives can enrich each other\'s art experience.';
    } else {
      return 'Your contrasting styles can lead to fascinating discussions!';
    }
  }

  findSharedInterests(type1, type2) {
    const interests1 = new Set(type1.preferences?.artStyles || []);
    const interests2 = new Set(type2.preferences?.artStyles || []);

    return [...interests1].filter(x => interests2.has(x));
  }

  findComplementaryTraits(type1, type2, differences) {
    const complementary = [];

    differences.forEach(diff => {
      if (diff.axis === 'L/S') {
        complementary.push('One enjoys solitude while the other brings social energy');
      } else if (diff.axis === 'A/R') {
        complementary.push('Abstract and concrete perspectives balance each other');
      } else if (diff.axis === 'E/M') {
        complementary.push('Emotional and analytical approaches create rich discussions');
      } else if (diff.axis === 'F/C') {
        complementary.push('Spontaneous and structured styles offer variety');
      }
    });

    return complementary;
  }
}

module.exports = SAYUQuizService;
