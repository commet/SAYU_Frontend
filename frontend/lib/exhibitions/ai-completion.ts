// AI-Powered Auto-completion Service
// Helps users complete their exhibition reflections with contextual suggestions

import { Exhibition, Artist, Artwork } from './exhibition-detector';
import { FilledTemplate, TemplatePrompt } from './reflection-templates';

export interface CompletionContext {
  exhibition: Exhibition;
  template: FilledTemplate;
  quickNotes?: QuickNote[];
  previousReflections?: FilledTemplate[];
  userPersonality?: string; // SAYU personality type
  language: 'ko' | 'en';
}

export interface QuickNote {
  id: string;
  type: 'text' | 'voice' | 'photo' | 'emotion';
  content: string;
  metadata?: {
    artwork?: Artwork;
    location?: { lat: number; lng: number };
    timestamp: Date;
    emotion?: string;
  };
}

export interface CompletionSuggestion {
  text: string;
  confidence: number;
  reasoning?: string;
}

export class AICompletionService {
  private apiEndpoint = '/api/completions';
  
  // Get AI suggestions for a prompt
  async getSuggestions(
    prompt: TemplatePrompt,
    userInput: string,
    context: CompletionContext
  ): Promise<CompletionSuggestion[]> {
    // Build contextual prompt for AI
    const aiPrompt = this.buildAIPrompt(prompt, userInput, context);
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          maxSuggestions: 3,
          temperature: 0.7,
          language: context.language
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }
      
      const data = await response.json();
      return data.suggestions;
    } catch (error) {
      console.error('AI completion error:', error);
      // Fallback to local suggestions
      return this.getLocalSuggestions(prompt, userInput, context);
    }
  }
  
  // Build contextual prompt for AI
  private buildAIPrompt(
    prompt: TemplatePrompt,
    userInput: string,
    context: CompletionContext
  ): string {
    const { exhibition, template, quickNotes, language } = context;
    
    let aiPrompt = language === 'ko' 
      ? `전시 정보:\n` 
      : `Exhibition Information:\n`;
    
    aiPrompt += `- ${language === 'ko' ? '전시명' : 'Title'}: ${exhibition.title}\n`;
    aiPrompt += `- ${language === 'ko' ? '갤러리' : 'Gallery'}: ${exhibition.gallery.name}\n`;
    aiPrompt += `- ${language === 'ko' ? '작가' : 'Artists'}: ${exhibition.artists.map(a => a.name).join(', ')}\n`;
    
    if (quickNotes && quickNotes.length > 0) {
      aiPrompt += `\n${language === 'ko' ? '사용자 메모' : 'User Notes'}:\n`;
      quickNotes.forEach(note => {
        if (note.type === 'text') {
          aiPrompt += `- ${note.content}\n`;
        } else if (note.type === 'emotion' && note.metadata?.emotion) {
          aiPrompt += `- ${language === 'ko' ? '감정' : 'Emotion'}: ${note.metadata.emotion}\n`;
        }
      });
    }
    
    aiPrompt += `\n${language === 'ko' ? '작성 중인 내용' : 'Current Input'}:\n`;
    aiPrompt += `${prompt.prefix || ''} ${userInput}\n`;
    
    aiPrompt += `\n${language === 'ko' 
      ? '위 정보를 바탕으로 자연스럽고 개인적인 감상문을 완성해주세요. 3가지 다른 스타일의 제안을 해주세요.' 
      : 'Based on the above information, please complete the reflection in a natural and personal way. Provide 3 different style suggestions.'}`;
    
    return aiPrompt;
  }
  
  // Local suggestion generation (fallback)
  private getLocalSuggestions(
    prompt: TemplatePrompt,
    userInput: string,
    context: CompletionContext
  ): CompletionSuggestion[] {
    const suggestions: CompletionSuggestion[] = [];
    const { language } = context;
    
    // Suggestion patterns based on prompt type
    const patterns = this.getSuggestionPatterns(prompt.id, language);
    
    // Generate suggestions based on patterns and user input
    patterns.forEach((pattern, index) => {
      const suggestion = this.applyPattern(pattern, userInput, context);
      suggestions.push({
        text: suggestion,
        confidence: 0.8 - (index * 0.1),
        reasoning: 'Local pattern matching'
      });
    });
    
    return suggestions;
  }
  
  // Get suggestion patterns for different prompt types
  private getSuggestionPatterns(
    promptId: string, 
    language: 'ko' | 'en'
  ): string[] {
    const patterns: Record<string, { ko: string[], en: string[] }> = {
      'impression': {
        ko: [
          '작품들이 하나의 이야기를 들려주는 듯한 {input}',
          '예상과 달리 {input}는 점이 신선했다',
          '{input}라는 생각이 들어 오래 머물렀다'
        ],
        en: [
          'the way the artworks seemed to tell a story of {input}',
          'unexpectedly, {input} which felt refreshing',
          'the feeling of {input} made me linger longer'
        ]
      },
      'atmosphere': {
        ko: [
          '{input}하면서도 묘하게 편안한',
          '마치 {input}한 듯한 공간이었다',
          '{input}한 분위기가 작품과 잘 어우러졌다'
        ],
        en: [
          '{input} yet strangely comfortable',
          'like being in a {input} space',
          'the {input} atmosphere complemented the artworks well'
        ]
      },
      'question': {
        ko: [
          '"{input}"라는 것이었다',
          '과연 {input}일까 하는 의문이었다',
          '{input}에 대해 다시 생각해보게 되었다'
        ],
        en: [
          '"{input}" was what lingered',
          'whether {input} was the question that arose',
          'it made me reconsider {input}'
        ]
      }
    };
    
    return patterns[promptId]?.[language] || ['{input}'];
  }
  
  // Apply pattern with user input
  private applyPattern(
    pattern: string, 
    userInput: string, 
    context: CompletionContext
  ): string {
    // Simple pattern replacement
    let result = pattern.replace('{input}', userInput);
    
    // Add context-specific replacements
    result = result.replace('{exhibition}', context.exhibition.title);
    result = result.replace('{gallery}', context.exhibition.gallery.name);
    
    if (context.exhibition.artists.length > 0) {
      result = result.replace('{artist}', context.exhibition.artists[0].name);
    }
    
    return result;
  }
  
  // Complete entire reflection with AI assistance
  async completeReflection(
    template: FilledTemplate,
    context: CompletionContext
  ): Promise<FilledTemplate> {
    const completedResponses = { ...template.responses };
    
    // For each empty prompt, get AI suggestions
    for (const prompt of template.template.prompts) {
      if (!completedResponses[prompt.id] || completedResponses[prompt.id].trim() === '') {
        const suggestions = await this.getSuggestions(
          prompt,
          '',
          context
        );
        
        if (suggestions.length > 0) {
          // Use the highest confidence suggestion
          completedResponses[prompt.id] = suggestions[0].text;
        }
      }
    }
    
    return {
      ...template,
      responses: completedResponses
    };
  }
  
  // Get writing style suggestions
  getWritingStyles(): { id: string; name: string; nameKo: string; description: string }[] {
    return [
      {
        id: 'poetic',
        name: 'Poetic',
        nameKo: '시적인',
        description: 'Metaphorical and emotionally rich'
      },
      {
        id: 'analytical',
        name: 'Analytical',
        nameKo: '분석적인',
        description: 'Detailed and observational'
      },
      {
        id: 'personal',
        name: 'Personal',
        nameKo: '개인적인',
        description: 'Intimate and reflective'
      },
      {
        id: 'journalistic',
        name: 'Journalistic',
        nameKo: '저널리즘',
        description: 'Objective and informative'
      }
    ];
  }
}