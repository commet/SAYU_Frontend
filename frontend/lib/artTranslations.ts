// Art terminology translations and color mappings for SAYU
export const artTranslations = {
  movements: {
    // Classic movements
    'Impressionism': '인상주의',
    'Abstract Expressionism': '추상 표현주의',
    'Romanticism': '낭만주의',
    'Surrealism': '초현실주의',
    'Post-Impressionism': '후기 인상주의',
    'Symbolism': '상징주의',
    'Abstract art': '추상미술',
    'Color Field': '색면 회화',
    'Metaphysical art': '형이상학적 미술',
    'Conceptual art': '개념 미술',
    'Minimalism': '미니멀리즘',
    'Zen art': '선 미술',
    'Classical art': '고전 미술',
    'Renaissance': '르네상스',
    'Academic art': '아카데미 미술',
    'Neo-classicism': '신고전주의',
    'Realism': '사실주의',
    'Naturalism': '자연주의',
    'Expressionism': '표현주의',
    'Fauvism': '야수파',
    'Cubism': '입체파',
    'Futurism': '미래파',
    'Dadaism': '다다이즘',
    'Pop Art': '팝 아트',
    'Contemporary art': '현대 미술'
  },
  
  colors: {
    // Color descriptions
    'Soft pastels': '부드러운 파스텔',
    'Dreamy blues': '몽환적인 블루',
    'Warm earth tones': '따뜻한 대지색',
    'Rich blues': '진한 블루',
    'Deep purples': '깊은 퍼플',
    'Subtle gradients': '은은한 그라데이션',
    'Monochromatic': '단색',
    'Earth tones': '대지색',
    'Natural palettes': '자연 팔레트',
    'Classical palettes': '클래식 팔레트',
    'Muted tones': '차분한 톤',
    'Traditional colors': '전통적인 색상',
    'Bold primary colors': '강렬한 원색',
    'High contrast': '높은 대비',
    'Vibrant hues': '생생한 색조',
    'Neutral tones': '중성 톤',
    'Metallic accents': '메탈릭 악센트',
    'Saturated colors': '채도 높은 색상',
    'Cool tones': '쿨톤',
    'Warm tones': '웜톤'
  },
  
  themes: {
    // Thematic content
    'Nature': '자연',
    'Dreams': '꿈',
    'Emotions': '감정',
    'Spirituality': '영성',
    'Psychology': '심리학',
    'Inner worlds': '내면 세계',
    'Contemplation': '명상',
    'Philosophy': '철학',
    'Existence': '존재',
    'Time': '시간',
    'History': '역사',
    'Literature': '문학',
    'Mythology': '신화',
    'Human condition': '인간의 조건',
    'Social commentary': '사회 비판',
    'Politics': '정치',
    'Identity': '정체성',
    'Relationships': '관계',
    'Beauty': '아름다움',
    'Transformation': '변화',
    'Memory': '기억',
    'Technology': '기술',
    'Urban life': '도시 생활',
    'Tradition': '전통',
    'Innovation': '혁신'
  }
};

// Color code mappings for visual representation
export const colorCodes = {
  'Soft pastels': ['#FFE4E1', '#E6E6FA', '#F0F8FF', '#FFF8DC'],
  'Dreamy blues': ['#87CEEB', '#B0E0E6', '#ADD8E6', '#E0F6FF'],
  'Warm earth tones': ['#DEB887', '#D2B48C', '#BC9A6A', '#A0522D'],
  'Rich blues': ['#000080', '#003366', '#1E3A8A', '#1E40AF'],
  'Deep purples': ['#4B0082', '#663399', '#6A0DAD', '#800080'],
  'Subtle gradients': ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA'],
  'Monochromatic': ['#000000', '#404040', '#808080', '#C0C0C0'],
  'Earth tones': ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],
  'Natural palettes': ['#228B22', '#8FBC8F', '#F4A460', '#DEB887'],
  'Bold primary colors': ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
  'High contrast': ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
  'Vibrant hues': ['#FF6B35', '#F7931E', '#FFD700', '#32CD32'],
  'Cool tones': ['#0080FF', '#4169E1', '#8A2BE2', '#00CED1'],
  'Warm tones': ['#FF4500', '#FF6347', '#FFD700', '#FFA500']
};

// Emoji mappings for themes and movements
export const artEmojis = {
  movements: {
    'Impressionism': '🌅',
    'Abstract Expressionism': '🎨',
    'Romanticism': '🌹',
    'Surrealism': '🌙',
    'Post-Impressionism': '🎭',
    'Symbolism': '🔮',
    'Abstract art': '🖼️',
    'Color Field': '🌈',
    'Minimalism': '⚪',
    'Classical art': '🏛️',
    'Renaissance': '👑',
    'Pop Art': '💥',
    'Contemporary art': '🚀'
  },
  
  themes: {
    'Nature': '🌿',
    'Dreams': '💭',
    'Emotions': '💫',
    'Spirituality': '🕊️',
    'Psychology': '🧠',
    'Philosophy': '🤔',
    'History': '📜',
    'Technology': '⚡',
    'Beauty': '✨',
    'Time': '⏰',
    'Memory': '💾',
    'Identity': '🪞',
    'Relationships': '💞',
    'Urban life': '🏙️',
    'Tradition': '🏺'
  }
};

// Get translated text with fallback
export const getTranslatedText = (
  category: keyof typeof artTranslations,
  text: string,
  language: 'en' | 'ko' = 'ko'
): string => {
  if (language === 'en') return text;
  return artTranslations[category][text as keyof typeof artTranslations[typeof category]] || text;
};

// Get color codes for a color description
export const getColorCodes = (colorDescription: string): string[] => {
  return colorCodes[colorDescription as keyof typeof colorCodes] || ['#808080'];
};

// Get emoji for art term
export const getArtEmoji = (
  category: 'movements' | 'themes',
  text: string
): string => {
  return artEmojis[category][text as keyof typeof artEmojis[typeof category]] || '🎨';
};