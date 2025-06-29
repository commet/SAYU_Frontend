export interface Exhibition {
  id: string;
  title: {
    ko: string;
    en: string;
  };
  museum: {
    ko: string;
    en: string;
  };
  period: {
    ko: string;
    en: string;
  };
  image: string;
  recommendationReason: {
    ko: string;
    en: string;
  };
}

export function getExhibitionRecommendation(personalityType: string): Exhibition | null {
  const exhibitions: Record<string, Exhibition> = {
    'SRMC': {
      id: 'srmc-1',
      title: {
        ko: '현대미술의 거장들: 추상과 구상의 경계',
        en: 'Masters of Contemporary Art: Between Abstract and Figurative'
      },
      museum: {
        ko: '국립현대미술관',
        en: 'National Museum of Modern and Contemporary Art'
      },
      period: {
        ko: '2024.03.15 - 2024.08.31',
        en: 'Mar 15 - Aug 31, 2024'
      },
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
      recommendationReason: {
        ko: '사회적이고 현실적인 당신에게 현대 사회의 이슈를 다루는 구상과 추상을 넘나드는 작품들이 깊은 인상을 줄 것입니다. 신중하게 큐레이션된 이 전시는 당신의 체계적인 사고방식과 잘 어울립니다.',
        en: 'As someone social and realistic, you\'ll find deep meaning in works that bridge abstract and figurative art while addressing contemporary social issues. This carefully curated exhibition aligns with your methodical thinking.'
      }
    },
    'LAEF': {
      id: 'laef-1',
      title: {
        ko: '감정의 색채: 표현주의 특별전',
        en: 'Colors of Emotion: Expressionism Special Exhibition'
      },
      museum: {
        ko: '서울시립미술관',
        en: 'Seoul Museum of Art'
      },
      period: {
        ko: '2024.04.01 - 2024.09.15',
        en: 'Apr 1 - Sep 15, 2024'
      },
      image: 'https://images.unsplash.com/photo-1565034946487-077786996e27?w=800&q=80',
      recommendationReason: {
        ko: '고독을 즐기며 추상적이고 감정적인 당신에게 색채로 감정을 표현하는 표현주의 작품들이 특별한 영감을 줄 것입니다. 자유로운 관람 동선은 당신의 독립적인 성향과 잘 맞습니다.',
        en: 'As someone who enjoys solitude and embraces abstract emotions, you\'ll find special inspiration in expressionist works that convey feelings through color. The free-flowing exhibition path suits your independent nature.'
      }
    },
    'SAEF': {
      id: 'saef-1',
      title: {
        ko: '인터랙티브 아트: 관객과 작품의 대화',
        en: 'Interactive Art: Dialogue Between Viewer and Work'
      },
      museum: {
        ko: '아트센터 나비',
        en: 'Art Center Nabi'
      },
      period: {
        ko: '2024.05.10 - 2024.10.20',
        en: 'May 10 - Oct 20, 2024'
      },
      image: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&q=80',
      recommendationReason: {
        ko: '사교적이고 추상적이며 감정적인 당신에게 관객과 상호작용하는 인터랙티브 아트는 완벽한 선택입니다. 다른 관람객들과 함께 작품을 경험하며 새로운 감동을 느낄 수 있습니다.',
        en: 'As someone social, abstract, and emotional, interactive art that engages with viewers is perfect for you. Experience artworks alongside other visitors and discover new emotions through shared experiences.'
      }
    },
    'LRMC': {
      id: 'lrmc-1',
      title: {
        ko: '정물화의 정수: 17-21세기 컬렉션',
        en: 'Essence of Still Life: 17th-21st Century Collection'
      },
      museum: {
        ko: '리움미술관',
        en: 'Leeum Museum of Art'
      },
      period: {
        ko: '2024.03.01 - 2024.07.30',
        en: 'Mar 1 - Jul 30, 2024'
      },
      image: 'https://images.unsplash.com/photo-1577720643272-265f09367456?w=800&q=80',
      recommendationReason: {
        ko: '혼자만의 시간을 소중히 여기고 현실적이며 체계적인 당신에게 시대를 아우르는 정물화 컬렉션이 안정감을 줄 것입니다. 작품 하나하나를 천천히 감상할 수 있는 조용한 전시 환경이 매력적입니다.',
        en: 'Valuing solitude, realism, and methodology, you\'ll find comfort in this still life collection spanning centuries. The quiet exhibition environment allows you to appreciate each work at your own pace.'
      }
    },
    'SREF': {
      id: 'sref-1',
      title: {
        ko: '도시의 풍경: 현대 도시를 그리다',
        en: 'Urban Landscapes: Painting the Modern City'
      },
      museum: {
        ko: '대림미술관',
        en: 'Daelim Museum'
      },
      period: {
        ko: '2024.06.01 - 2024.11.30',
        en: 'Jun 1 - Nov 30, 2024'
      },
      image: 'https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=800&q=80',
      recommendationReason: {
        ko: '사회적이고 현실적이며 감정적인 당신에게 도시의 다양한 모습을 담은 이 전시가 공감을 불러일으킬 것입니다. 친구들과 함께 관람하며 도시 생활의 감정을 나누기에 좋습니다.',
        en: 'Social, realistic, and emotional, you\'ll resonate with this exhibition capturing diverse urban scenes. Perfect for visiting with friends and sharing emotions about city life.'
      }
    },
    'LAMC': {
      id: 'lamc-1',
      title: {
        ko: '미니멀리즘: 절제의 미학',
        en: 'Minimalism: Aesthetics of Restraint'
      },
      museum: {
        ko: '플라토 미술관',
        en: 'Plateau Museum'
      },
      period: {
        ko: '2024.04.15 - 2024.09.30',
        en: 'Apr 15 - Sep 30, 2024'
      },
      image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80',
      recommendationReason: {
        ko: '고독을 즐기고 추상적이며 체계적인 당신에게 미니멀리즘의 정제된 아름다움이 깊은 사색의 시간을 제공할 것입니다. 작품과 공간의 완벽한 조화가 인상적입니다.',
        en: 'Enjoying solitude, abstraction, and methodology, you\'ll find deep contemplation in minimalism\'s refined beauty. The perfect harmony between artwork and space is impressive.'
      }
    },
    'SRAC': {
      id: 'srac-1',
      title: {
        ko: '팝아트 레볼루션: 대중문화의 예술',
        en: 'Pop Art Revolution: Art of Popular Culture'
      },
      museum: {
        ko: 'K현대미술관',
        en: 'K Museum of Contemporary Art'
      },
      period: {
        ko: '2024.05.20 - 2024.10.15',
        en: 'May 20 - Oct 15, 2024'
      },
      image: 'https://images.unsplash.com/photo-1549277513-f1b32fe1f8f5?w=800&q=80',
      recommendationReason: {
        ko: '사교적이고 현실적이며 추상적인 당신에게 대중문화와 예술의 경계를 허무는 팝아트가 흥미로울 것입니다. 체계적으로 구성된 전시 동선이 작품 이해를 돕습니다.',
        en: 'Social, realistic, and abstract, you\'ll find pop art\'s boundary-breaking between popular culture and fine art fascinating. The systematic exhibition flow aids understanding.'
      }
    },
    'LREF': {
      id: 'lref-1',
      title: {
        ko: '빛과 그림자: 인상주의 특별전',
        en: 'Light and Shadow: Impressionism Special Exhibition'
      },
      museum: {
        ko: '예술의전당 한가람미술관',
        en: 'Seoul Arts Center Hangaram Art Museum'
      },
      period: {
        ko: '2024.07.01 - 2024.12.31',
        en: 'Jul 1 - Dec 31, 2024'
      },
      image: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800&q=80',
      recommendationReason: {
        ko: '혼자만의 감상을 선호하고 현실적이면서도 감정적인 당신에게 빛의 변화를 포착한 인상주의 작품들이 특별한 감동을 선사할 것입니다. 자유로운 관람이 가능한 넓은 전시 공간이 매력적입니다.',
        en: 'Preferring solitary appreciation, realistic yet emotional, you\'ll be moved by impressionist works capturing changing light. The spacious exhibition allows free-flowing viewing.'
      }
    }
  };

  return exhibitions[personalityType] || exhibitions['SRMC']; // Default fallback
}