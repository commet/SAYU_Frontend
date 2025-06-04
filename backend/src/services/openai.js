const { OpenAI } = require('openai');
const CacheService = require('./cacheService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  // Model selection based on task complexity
  getModel(taskType) {
    const modelMap = {
      'quiz-analysis': 'gpt-4-turbo-preview',  // Complex psychological analysis
      'curator-chat': 'gpt-3.5-turbo',         // Simple conversation
      'artwork-description': 'gpt-3.5-turbo',  // Basic descriptions
      'recommendation': 'gpt-3.5-turbo',       // Simple recommendations
      'reflection': 'gpt-3.5-turbo'            // Simple reflections
    };
    return modelMap[taskType] || 'gpt-3.5-turbo';
  }
  async analyzeQuizResponses(responses) {
    // Check cache first
    const cached = await CacheService.getQuizAnalysis(responses);
    if (cached) {
      return cached.analysis;
    }

    const prompt = `
    Analyze these art preference responses to create a comprehensive psychological and philosophical profile.
    
    Exhibition responses: ${JSON.stringify(responses.exhibition)}
    Artwork responses: ${JSON.stringify(responses.artwork)}
    
    Generate a detailed analysis including:
    1. 4-letter type code (G/S, A/R, E/M, F/C)
    2. Poetic archetype name (2-3 words, evocative)
    3. One-line essence description
    4. Detailed personality analysis (200+ words)
    5. 15-20 emotional tags
    6. Aesthetic preferences
    7. Philosophical orientation (relationship to art)
    8. Growth trajectory potential
    9. Recommended interaction style
    10. Personalization preferences (UI, pace, depth)
    
    Return as structured JSON.
    `;
    
    try {
      const completion = await openai.chat.completions.create({
        model: this.getModel('quiz-analysis'),
        messages: [
          {
            role: "system",
            content: "You are an expert art psychologist and philosopher with deep understanding of human aesthetic experience."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      const analysis = JSON.parse(completion.choices[0].message.content);
      
      // Cache the result for 1 hour (quiz responses are deterministic)
      await CacheService.setQuizAnalysis(responses, analysis, 3600);
      
      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      // Return mock data for testing without OpenAI
      const mockAnalysis = {
        typeCode: "GAEF",
        archetypeName: "Contemplative Explorer",
        description: "You seek deep meaning in solitary art experiences",
        emotionalTags: ["introspective", "curious", "sensitive", "thoughtful"],
        exhibitionScores: { G: 0.8, S: 0.2, A: 0.7, R: 0.3, E: 0.9, M: 0.1, F: 0.8, C: 0.2 },
        artworkScores: { abstract: 0.8, figurative: 0.2 },
        confidence: 0.85,
        interactionStyle: "guided",
        personalizationPreferences: {
          uiMode: "minimal",
          pace: "contemplative",
          depth: "deep"
        }
      };
      
      // Cache mock data too
      await CacheService.setQuizAnalysis(responses, mockAnalysis, 1800);
      return mockAnalysis;
    }
  }

  async generateProfileImage(profile) {
    try {
      const prompt = `
      Create a cinematic, photorealistic image of a person experiencing art.
      
      Profile: ${profile.archetypeName} - ${profile.description}
      Emotional tone: ${profile.emotionalTags.slice(0, 5).join(', ')}
      
      Style: Professional photography, dramatic lighting, depth of field
      Mood: contemplative and sophisticated
      Setting: Modern art gallery
      
      The viewer should be shown from behind or in profile, creating mystery.
      `;
      
      const image = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        quality: "hd",
        style: "natural"
      });
      
      return image.data[0].url;
    } catch (error) {
      console.error('Image generation error:', error);
      // Return placeholder image
      return `https://source.unsplash.com/1792x1024/?art,museum,gallery`;
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 384
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      // Return mock embedding for testing
      return Array(384).fill(0).map(() => Math.random());
    }
  }

  async curatorChat(userId, message, context) {
    // Check cache for similar conversations
    const cacheKey = { userId, message: message.toLowerCase().trim(), profile: context.profile?.typeCode };
    const cached = await CacheService.getAIResponse(message, cacheKey);
    if (cached) {
      return cached.response;
    }

    const systemPrompt = `
    You are SAYU's personal art curator - warm, insightful, and deeply attuned to emotional connections with art.
    
    User Profile: ${JSON.stringify(context.profile)}
    
    Guidelines:
    - Be warm and approachable, never condescending
    - Focus on emotional resonance over historical facts
    - Use sensory language to describe artworks
    - Encourage deeper reflection
    `;
    
    try {
      const completion = await openai.chat.completions.create({
        model: this.getModel('curator-chat'),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.85,
        max_tokens: 400  // Reduced for cost savings
      });
      
      const response = {
        text: completion.choices[0].message.content,
        suggestions: [
          "Tell me more about what draws you to this",
          "Show me similar works",
          "How does this connect to my journey?"
        ]
      };

      // Cache for 30 minutes (conversations can be reused for similar queries)
      await CacheService.setAIResponse(message, cacheKey, response, 1800);
      
      return response;
    } catch (error) {
      console.error('Curator chat error:', error);
      const fallbackResponse = {
        text: "I'd love to explore art with you. What kind of emotions or experiences are you hoping to discover through art today?",
        suggestions: ["Tell me about your mood", "Show me calming artworks", "What is my art personality?"]
      };

      // Cache fallback too
      await CacheService.setAIResponse(message, cacheKey, fallbackResponse, 900);
      return fallbackResponse;
    }
  }
}

module.exports = new AIService();
