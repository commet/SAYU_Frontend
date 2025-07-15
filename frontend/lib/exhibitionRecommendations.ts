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
    },
    'LAEC': {
      id: 'laec-1',
      title: {
        ko: '감각의 정원: 설치미술과 공감각',
        en: 'Garden of Senses: Installation Art and Synesthesia'
      },
      museum: {
        ko: 'MMCA 과천관',
        en: 'MMCA Gwacheon'
      },
      period: {
        ko: '2024.05.15 - 2024.10.30',
        en: 'May 15 - Oct 30, 2024'
      },
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
      recommendationReason: {
        ko: '고독을 즐기며 추상적이고 감정적이면서도 체계적인 당신에게 오감을 자극하는 설치미술이 특별한 경험을 선사할 것입니다. 작품별로 체계적으로 구성된 감상 코스가 인상적입니다.',
        en: 'Enjoying solitude, abstract and emotional yet systematic, you\'ll have a special experience with installation art stimulating all senses. The systematically organized viewing course for each work is impressive.'
      }
    },
    'LAMF': {
      id: 'lamf-1',
      title: {
        ko: '철학과 예술의 만남: 개념미술 특별전',
        en: 'Philosophy Meets Art: Conceptual Art Special Exhibition'
      },
      museum: {
        ko: '아르코미술관',
        en: 'ARKO Art Center'
      },
      period: {
        ko: '2024.06.10 - 2024.11.20',
        en: 'Jun 10 - Nov 20, 2024'
      },
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
      recommendationReason: {
        ko: '홀로 사색하며 추상적이고 의미를 탐구하는 당신에게 철학적 깊이가 있는 개념미술이 지적 자극을 줄 것입니다. 자유로운 해석이 가능한 열린 전시 구성이 매력적입니다.',
        en: 'Contemplating alone, abstract and meaning-seeking, you\'ll find intellectual stimulation in conceptual art with philosophical depth. The open exhibition structure allowing free interpretation is appealing.'
      }
    },
    'LREC': {
      id: 'lrec-1',
      title: {
        ko: '세밀화의 세계: 극사실주의 회화전',
        en: 'World of Detail: Hyperrealism Painting Exhibition'
      },
      museum: {
        ko: '성곡미술관',
        en: 'Sungkok Art Museum'
      },
      period: {
        ko: '2024.04.20 - 2024.09.10',
        en: 'Apr 20 - Sep 10, 2024'
      },
      image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&q=80',
      recommendationReason: {
        ko: '혼자 감상하며 현실적이고 감정적이면서 체계적인 당신에게 극도로 정밀한 극사실주의 작품들이 깊은 인상을 남길 것입니다. 작품 하나하나를 천천히 음미할 수 있는 조용한 환경이 제공됩니다.',
        en: 'Appreciating alone, realistic and emotional yet systematic, you\'ll be deeply impressed by extremely precise hyperrealist works. A quiet environment is provided to slowly savor each piece.'
      }
    },
    'LRMF': {
      id: 'lrmf-1',
      title: {
        ko: '디지털 캔버스: NFT와 미디어 아트',
        en: 'Digital Canvas: NFT and Media Art'
      },
      museum: {
        ko: '아모레퍼시픽미술관',
        en: 'Amorepacific Museum of Art'
      },
      period: {
        ko: '2024.07.15 - 2024.12.20',
        en: 'Jul 15 - Dec 20, 2024'
      },
      image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800&q=80',
      recommendationReason: {
        ko: '독립적이고 현실적이며 의미를 탐구하는 당신에게 디지털 시대의 새로운 예술 형태가 흥미로운 사고의 전환을 제공할 것입니다. 자유롭게 탐험할 수 있는 인터랙티브 전시가 매력적입니다.',
        en: 'Independent, realistic, and meaning-seeking, you\'ll find new art forms of the digital age providing interesting paradigm shifts. The interactive exhibition allowing free exploration is appealing.'
      }
    },
    'SAEC': {
      id: 'saec-1',
      title: {
        ko: '함께하는 예술: 커뮤니티 아트 프로젝트',
        en: 'Art Together: Community Art Project'
      },
      museum: {
        ko: '서울시립 북서울미술관',
        en: 'Seoul Museum of Art Buk-Seoul'
      },
      period: {
        ko: '2024.05.01 - 2024.10.31',
        en: 'May 1 - Oct 31, 2024'
      },
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
      recommendationReason: {
        ko: '사교적이고 추상적이며 감정적이면서 체계적인 당신에게 관람객이 함께 만들어가는 커뮤니티 아트가 특별한 의미를 가질 것입니다. 체계적으로 기획된 참여형 프로그램이 인상적입니다.',
        en: 'Social, abstract, emotional yet systematic, community art created together with visitors will have special meaning for you. The systematically planned participatory programs are impressive.'
      }
    },
    'SAMF': {
      id: 'samf-1',
      title: {
        ko: '상상력의 놀이터: 초현실주의 특별전',
        en: 'Playground of Imagination: Surrealism Special Exhibition'
      },
      museum: {
        ko: '동대문디자인플라자(DDP)',
        en: 'Dongdaemun Design Plaza (DDP)'
      },
      period: {
        ko: '2024.06.20 - 2024.11.30',
        en: 'Jun 20 - Nov 30, 2024'
      },
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
      recommendationReason: {
        ko: '사교적이고 추상적이며 의미를 전달하는 당신에게 무한한 상상력을 자극하는 초현실주의 작품들이 영감의 원천이 될 것입니다. 자유롭게 대화하며 감상할 수 있는 열린 공간이 매력적입니다.',
        en: 'Social, abstract, and meaning-conveying, surrealist works stimulating infinite imagination will be a source of inspiration. The open space allowing free conversation while viewing is appealing.'
      }
    },
    'SAMC': {
      id: 'samc-1',
      title: {
        ko: '예술과 사회: 행동주의 미술전',
        en: 'Art and Society: Activist Art Exhibition'
      },
      museum: {
        ko: '일민미술관',
        en: 'Ilmin Museum of Art'
      },
      period: {
        ko: '2024.05.25 - 2024.10.15',
        en: 'May 25 - Oct 15, 2024'
      },
      image: 'https://images.unsplash.com/photo-1569163139394-de4798d0f3c8?w=800&q=80',
      recommendationReason: {
        ko: '사교적이고 추상적이며 의미를 추구하면서 체계적인 당신에게 사회적 메시지를 담은 행동주의 미술이 깊은 울림을 줄 것입니다. 체계적으로 구성된 주제별 섹션이 인상적입니다.',
        en: 'Social, abstract, meaning-seeking and systematic, activist art with social messages will deeply resonate with you. The systematically organized thematic sections are impressive.'
      }
    },
    'SREC': {
      id: 'srec-1',
      title: {
        ko: '일상의 아름다움: 생활 속 예술 발견',
        en: 'Beauty of Everyday: Discovering Art in Life'
      },
      museum: {
        ko: '하이트컬렉션',
        en: 'Hite Collection'
      },
      period: {
        ko: '2024.04.10 - 2024.09.20',
        en: 'Apr 10 - Sep 20, 2024'
      },
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80',
      recommendationReason: {
        ko: '사교적이고 현실적이며 감정적이면서 체계적인 당신에게 일상에서 발견하는 예술의 아름다움이 따뜻한 공감을 불러일으킬 것입니다. 관람객을 배려한 체계적인 동선이 편안한 감상을 돕습니다.',
        en: 'Social, realistic, emotional and systematic, the beauty of art discovered in everyday life will evoke warm empathy. The systematic flow considering visitors helps comfortable appreciation.'
      }
    },
    'SRMF': {
      id: 'srmf-1',
      title: {
        ko: '거장의 발자취: 20세기 미술사 여행',
        en: 'Masters\' Footsteps: Journey Through 20th Century Art History'
      },
      museum: {
        ko: '호림박물관',
        en: 'Horim Museum'
      },
      period: {
        ko: '2024.03.20 - 2024.08.30',
        en: 'Mar 20 - Aug 30, 2024'
      },
      image: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80',
      recommendationReason: {
        ko: '사교적이고 현실적이며 의미를 전달하는 당신에게 20세기 거장들의 작품 여정이 풍부한 지식과 영감을 제공할 것입니다. 자유롭게 설명하고 토론할 수 있는 교육적 환경이 마련되어 있습니다.',
        en: 'Social, realistic, and meaning-conveying, the journey through 20th century masters\' works will provide rich knowledge and inspiration. An educational environment for free explanation and discussion is provided.'
      }
    }
  };

  return exhibitions[personalityType] || exhibitions['SRMC']; // Default fallback
}