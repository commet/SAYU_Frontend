// Reflection Template System
// Smart templates for exhibition reflections with auto-fill capabilities

import { Exhibition, Artist, Artwork } from './exhibition-detector';

export type TemplateType = 
  | 'overall' 
  | 'artwork' 
  | 'artist' 
  | 'space' 
  | 'personal'
  | 'custom';

export interface ReflectionTemplate {
  id: string;
  type: TemplateType;
  title: string;
  titleKo: string;
  icon: string;
  prompts: TemplatePrompt[];
  aiAssistLevel: 'minimal' | 'moderate' | 'full';
}

export interface TemplatePrompt {
  id: string;
  prefix?: string;
  prefixKo?: string;
  placeholder: string;
  placeholderKo: string;
  suffix?: string;
  suffixKo?: string;
  inputType: 'text' | 'textarea' | 'select' | 'emotion';
  maxLength?: number;
  suggestions?: string[];
}

export interface FilledTemplate {
  template: ReflectionTemplate;
  exhibition: Exhibition;
  responses: Record<string, string>;
  metadata: {
    createdAt: Date;
    location?: { lat: number; lng: number };
    photos?: string[];
    voiceNotes?: string[];
    emotionTags?: string[];
  };
}

export class ReflectionTemplateService {
  // Get all available templates
  getTemplates(): ReflectionTemplate[] {
    return [
      this.getOverallExhibitionTemplate(),
      this.getArtworkTemplate(),
      this.getArtistTemplate(),
      this.getSpaceTemplate(),
      this.getPersonalTemplate()
    ];
  }
  
  // Overall exhibition reflection template
  private getOverallExhibitionTemplate(): ReflectionTemplate {
    return {
      id: 'overall-exhibition',
      type: 'overall',
      title: 'Overall Exhibition',
      titleKo: '전체 전시 감상',
      icon: '🏛️',
      aiAssistLevel: 'moderate',
      prompts: [
        {
          id: 'opening',
          prefix: 'Today I visited',
          prefixKo: '오늘',
          placeholder: '[Exhibition Name] at [Gallery Name]',
          placeholderKo: '[갤러리명]에서 열리는 [전시명]을',
          suffix: '.',
          suffixKo: '다녀왔다.',
          inputType: 'text'
        },
        {
          id: 'impression',
          prefix: 'What impressed me most was',
          prefixKo: '가장 인상적이었던 것은',
          placeholder: 'describe your strongest impression',
          placeholderKo: '가장 강렬했던 인상을 적어주세요',
          inputType: 'textarea',
          maxLength: 200
        },
        {
          id: 'atmosphere',
          prefix: 'The overall atmosphere of the exhibition was',
          prefixKo: '전시의 전체적인 분위기는',
          placeholder: 'describe the mood and feeling',
          placeholderKo: '전시장의 분위기와 느낌을 표현해주세요',
          inputType: 'textarea',
          maxLength: 150
        },
        {
          id: 'question',
          prefix: 'The question this exhibition posed to me was',
          prefixKo: '이 전시가 나에게 던진 질문은',
          placeholder: 'what made you think?',
          placeholderKo: '어떤 생각을 하게 되었나요?',
          inputType: 'textarea',
          maxLength: 200
        }
      ]
    };
  }
  
  // Artwork-specific template
  private getArtworkTemplate(): ReflectionTemplate {
    return {
      id: 'specific-artwork',
      type: 'artwork',
      title: 'Artwork Reflection',
      titleKo: '작품별 감상',
      icon: '🖼️',
      aiAssistLevel: 'minimal',
      prompts: [
        {
          id: 'artwork-intro',
          prefix: 'Looking at',
          prefixKo: '',
          placeholder: "[Artist]'s [Artwork Title]",
          placeholderKo: "[작가명]의 [작품명]을",
          suffix: ',',
          suffixKo: '보며,',
          inputType: 'text'
        },
        {
          id: 'first-impression',
          prefix: 'First impression:',
          prefixKo: '첫인상:',
          placeholder: 'immediate feeling or thought',
          placeholderKo: '처음 본 순간의 느낌',
          inputType: 'textarea',
          maxLength: 100
        },
        {
          id: 'closer-look',
          prefix: 'Upon closer inspection:',
          prefixKo: '자세히 들여다보니:',
          placeholder: 'details you noticed',
          placeholderKo: '발견한 디테일들',
          inputType: 'textarea',
          maxLength: 150
        },
        {
          id: 'artwork-message',
          prefix: 'What this artwork tells me:',
          prefixKo: '이 작품이 나에게 말하는 것:',
          placeholder: 'personal interpretation',
          placeholderKo: '개인적인 해석',
          inputType: 'textarea',
          maxLength: 200
        }
      ]
    };
  }
  
  // Artist reflection template
  private getArtistTemplate(): ReflectionTemplate {
    return {
      id: 'artist-reflection',
      type: 'artist',
      title: 'Artist Reflection',
      titleKo: '작가에 대한 사유',
      icon: '👨‍🎨',
      aiAssistLevel: 'full',
      prompts: [
        {
          id: 'artist-world',
          prefix: '',
          prefixKo: '',
          placeholder: "[Artist]'s artistic world",
          placeholderKo: "[작가명]의 작품 세계는",
          suffix: 'is characterized by',
          suffixKo: '',
          inputType: 'text'
        },
        {
          id: 'artist-characteristic',
          placeholder: 'unique characteristics',
          placeholderKo: '특징을 가지고 있다',
          inputType: 'textarea',
          maxLength: 150
        },
        {
          id: 'artist-perspective',
          prefix: 'The world seen through their eyes is',
          prefixKo: '그의/그녀의 시선으로 본 세상은',
          placeholder: 'describe their worldview',
          placeholderKo: '작가의 세계관',
          inputType: 'textarea',
          maxLength: 150
        },
        {
          id: 'personal-connection',
          prefix: 'Similarities/differences with me:',
          prefixKo: '나와 닮은 점/다른 점:',
          placeholder: 'personal comparison',
          placeholderKo: '개인적인 비교',
          inputType: 'textarea',
          maxLength: 200
        }
      ]
    };
  }
  
  // Space experience template
  private getSpaceTemplate(): ReflectionTemplate {
    return {
      id: 'space-experience',
      type: 'space',
      title: 'Space Experience',
      titleKo: '공간 경험',
      icon: '📍',
      aiAssistLevel: 'moderate',
      prompts: [
        {
          id: 'space-intro',
          prefix: 'The space of',
          prefixKo: '',
          placeholder: '[Gallery/Museum name]',
          placeholderKo: '[갤러리/미술관명]의',
          suffix: 'is',
          suffixKo: '공간은',
          inputType: 'text'
        },
        {
          id: 'space-quality',
          placeholder: 'describe spatial qualities',
          placeholderKo: '공간의 특성을 표현',
          inputType: 'textarea',
          maxLength: 150
        },
        {
          id: 'space-enhancement',
          prefix: 'What this space added to the artworks:',
          prefixKo: '이 공간이 작품에 더한 것:',
          placeholder: 'spatial contribution',
          placeholderKo: '공간의 기여',
          inputType: 'textarea',
          maxLength: 150
        },
        {
          id: 'memorable-moment',
          prefix: 'A memorable moment:',
          prefixKo: '기억에 남는 순간:',
          placeholder: 'specific memory',
          placeholderKo: '특별한 기억',
          inputType: 'textarea',
          maxLength: 200
        }
      ]
    };
  }
  
  // Personal reflection template
  private getPersonalTemplate(): ReflectionTemplate {
    return {
      id: 'personal-reflection',
      type: 'personal',
      title: 'Personal Reflection',
      titleKo: '나에 대한 사유',
      icon: '💭',
      aiAssistLevel: 'minimal',
      prompts: [
        {
          id: 'self-discovery',
          prefix: 'What I discovered about myself today:',
          prefixKo: '오늘 전시를 보며 발견한 나는',
          placeholder: 'personal insight',
          placeholderKo: '개인적인 통찰',
          inputType: 'textarea',
          maxLength: 200
        },
        {
          id: 'different-feeling',
          prefix: 'What felt different from usual:',
          prefixKo: '평소와 다르게 느껴진 것:',
          placeholder: 'new sensation or thought',
          placeholderKo: '새로운 감각이나 생각',
          inputType: 'textarea',
          maxLength: 150
        },
        {
          id: 'future-self',
          prefix: 'What this leaves for my future self:',
          prefixKo: '앞으로의 나에게 남긴 것:',
          placeholder: 'lasting impact',
          placeholderKo: '지속될 영향',
          inputType: 'textarea',
          maxLength: 200
        }
      ]
    };
  }
  
  // Fill template with exhibition data
  fillTemplate(
    template: ReflectionTemplate,
    exhibition: Exhibition,
    selectedArtist?: Artist,
    selectedArtwork?: Artwork
  ): Partial<FilledTemplate> {
    const filledResponses: Record<string, string> = {};
    
    // Auto-fill based on template type
    if (template.type === 'overall') {
      filledResponses['opening'] = `${exhibition.title} at ${exhibition.gallery.name}`;
    } else if (template.type === 'artwork' && selectedArtwork) {
      filledResponses['artwork-intro'] = `${selectedArtwork.artist.name}'s ${selectedArtwork.title}`;
    } else if (template.type === 'artist' && selectedArtist) {
      filledResponses['artist-world'] = `${selectedArtist.name}'s artistic world`;
    } else if (template.type === 'space') {
      filledResponses['space-intro'] = exhibition.gallery.name;
    }
    
    return {
      template,
      exhibition,
      responses: filledResponses,
      metadata: {
        createdAt: new Date(),
        location: exhibition.location
      }
    };
  }
  
  // Get emotion tags
  getEmotionTags(): { ko: string; en: string }[] {
    return [
      { ko: '감동적', en: 'Moving' },
      { ko: '신선한', en: 'Fresh' },
      { ko: '도전적', en: 'Challenging' },
      { ko: '평화로운', en: 'Peaceful' },
      { ko: '강렬한', en: 'Intense' },
      { ko: '사색적', en: 'Contemplative' },
      { ko: '즐거운', en: 'Joyful' },
      { ko: '무거운', en: 'Heavy' },
      { ko: '가벼운', en: 'Light' },
      { ko: '신비로운', en: 'Mysterious' }
    ];
  }
}