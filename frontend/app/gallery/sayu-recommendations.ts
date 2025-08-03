// SAYU 16가지 유형별 실제 추천 작품 데이터
// 각 유형의 특성에 정확히 맞는 작품을 신중하게 선택했습니다.

export const aptRecommendations: Record<string, Array<{title: string, artist: string, year: string, description: string, category?: string[], image?: string, matchPercent?: number, curatorNote?: string}>> = {
  // LAEF: 몽환적 방랑자 (여우 🦊) - 혼자서 추상 작품을 감정적으로 자유롭게 감상
  'LAEF': [
    {
      title: '구성 VII',
      artist: '바실리 칸딘스키',
      year: '1913',
      description: '감정과 음악이 색채로 폭발하는 추상표현주의의 걸작',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/1280px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg',
      matchPercent: 97,
      curatorNote: '직관적이고 자유로운 감정의 흐름이 LAEF의 몽환적 여정과 완벽하게 공명합니다'
    },
    {
      title: '나와 마을',
      artist: '마르크 샤갈',
      year: '1911',
      description: '꿈과 현실이 뒤섞인 초현실적 환상의 세계',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/0/00/Chagall_IandTheVillage.jpg',
      matchPercent: 95,
      curatorNote: '개인적 추억과 환상이 어우러진 LAEF의 내면 세계를 시각화'
    },
    {
      title: '무제 (바이올렛, 검정, 주황, 노랑 위의 빨강과 노랑)',
      artist: '마크 로스코',
      year: '1955',
      description: '색채 속으로 빠져드는 명상적 경험',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/6/6f/Rothko_No_14.jpg',
      matchPercent: 94,
      curatorNote: '깊은 감정적 몰입과 카타르시스를 추구하는 LAEF의 본질'
    },
    {
      title: '성(城)과 태양',
      artist: '파울 클레',
      year: '1928',
      description: '동화적 상상력과 서정적 추상의 만남',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Paul_Klee%2C_Castle_and_Sun.jpg/800px-Paul_Klee%2C_Castle_and_Sun.jpg',
      matchPercent: 92,
      curatorNote: '자유로운 상상력과 따뜻한 감성이 LAEF의 몽환적 특성과 조화'
    },
    {
      title: '밤의 폭포',
      artist: '아르실 고르키',
      year: '1947',
      description: '무의식과 감정이 흘러내리는 추상표현주의',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/0/08/The_Liver_is_the_Cock%27s_Comb.jpg',
      matchPercent: 90,
      curatorNote: '내면의 흐름을 따라가는 LAEF의 직관적 여정'
    }
  ],

  // LAEC: 감성 큐레이터 (고양이 🐱) - 혼자서 추상 작품을 감정적으로 체계적으로 감상
  'LAEC': [
    {
      title: '오렌지, 빨강, 노랑',
      artist: '마크 로스코',
      year: '1961',
      description: '색채가 만들어내는 감정의 체계적 층위',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/1/10/Orange%2C_Red%2C_Yellow.jpg',
      matchPercent: 96,
      curatorNote: '감정의 미묘한 차이를 체계적으로 분류하고 음미하는 LAEC의 완벽한 작품'
    },
    {
      title: '산과 바다',
      artist: '헬렌 프랑켄탈러',
      year: '1952',
      description: '색채가 캔버스에 스며드는 서정적 추상',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/3/31/Helen_Frankenthaler%27s_painting_%27Mountains_and_Sea%27%2C_1952.jpg',
      matchPercent: 94,
      curatorNote: '감정의 섬세한 그라데이션을 체계적으로 구성하는 LAEC의 방식'
    },
    {
      title: '구성 II in 빨강, 파랑, 노랑',
      artist: '피트 몬드리안',
      year: '1930',
      description: '감정을 기하학적 질서로 승화시킨 작품',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Piet_Mondriaan%2C_1930_-_Mondrian_Composition_II_in_Red%2C_Blue%2C_and_Yellow.jpg/800px-Piet_Mondriaan%2C_1930_-_Mondrian_Composition_II_in_Red%2C_Blue%2C_and_Yellow.jpg',
      matchPercent: 91,
      curatorNote: '감정의 체계적 정리와 미적 균형을 추구하는 LAEC의 이상'
    },
    {
      title: '무제 #3',
      artist: '애그니스 마틴',
      year: '1974',
      description: '섬세한 선과 색채로 표현된 고요한 감정',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Agnes_Martin%27s_painting_%27Untitled_%231%27%2C_2003.jpg',
      matchPercent: 93,
      curatorNote: '미묘한 감정의 차이를 체계적으로 포착하는 LAEC의 섬세함'
    },
    {
      title: '회색 위의 회색',
      artist: '마크 로스코',
      year: '1969',
      description: '절제된 색채 속 깊은 감정의 탐구',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/d/d5/Untitled_%28Black_on_Grey%29.PNG',
      matchPercent: 90,
      curatorNote: '감정의 미니멀한 표현을 체계적으로 분석하는 LAEC'
    }
  ],

  // LAMF: 직관적 탐구자 (올빼미 🦉) - 혼자서 추상 작품의 의미를 자유롭게 탐구
  'LAMF': [
    {
      title: '이것은 파이프가 아니다',
      artist: '르네 마그리트',
      year: '1929',
      description: '언어와 이미지, 현실과 재현의 철학적 탐구',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/b/b9/MagrittePipe.jpg',
      matchPercent: 98,
      curatorNote: '의미와 존재에 대한 자유로운 철학적 탐구가 LAMF의 본질과 완벽히 일치'
    },
    {
      title: '샘',
      artist: '마르셀 뒤샹',
      year: '1917',
      description: '예술의 본질에 대한 근본적 질문',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Marcel_Duchamp%2C_1917%2C_Fountain%2C_photograph_by_Alfred_Stieglitz.jpg/800px-Marcel_Duchamp%2C_1917%2C_Fountain%2C_photograph_by_Alfred_Stieglitz.jpg',
      matchPercent: 96,
      curatorNote: '기존 개념을 전복하는 LAMF의 직관적이고 자유로운 탐구 정신'
    },
    {
      title: 'IKB 79',
      artist: '이브 클라인',
      year: '1959',
      description: '무한과 공(空)을 담은 단색의 우주',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/IKB_79%2C_1959.jpg/600px-IKB_79%2C_1959.jpg',
      matchPercent: 94,
      curatorNote: '존재의 본질과 무한을 직관적으로 탐구하는 LAMF의 철학적 여정'
    },
    {
      title: '무제 (Onement I)',
      artist: '바넷 뉴먼',
      year: '1948',
      description: '존재의 시작점, 창조의 순간',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Onement_1.jpg',
      matchPercent: 92,
      curatorNote: '의식의 흐름과 존재론적 탐구가 LAMF의 사유와 공명'
    },
    {
      title: '시간의 지속',
      artist: '살바도르 달리',
      year: '1931',
      description: '시간과 기억에 대한 초현실적 성찰',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
      matchPercent: 91,
      curatorNote: '시간과 공간의 의미를 자유롭게 재해석하는 LAMF의 특성'
    }
  ],

  // LAMC: 철학적 수집가 (거북이 🐢) - 혼자서 추상 작품의 의미를 체계적으로 정리
  'LAMC': [
    {
      title: '의자 하나와 세 개의 의자',
      artist: '조셉 코수스',
      year: '1965',
      description: '개념, 이미지, 실재의 체계적 분석',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/5/54/One_and_Three_Chairs.jpg',
      matchPercent: 97,
      curatorNote: '철학적 개념을 체계적으로 분류하고 정리하는 LAMC의 완벽한 예시'
    },
    {
      title: '무제 (스택)',
      artist: '도널드 저드',
      year: '1967',
      description: '미니멀리즘의 체계적 구조와 반복',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Untitled_%28Stack%29%2C_1967.jpg/800px-Untitled_%28Stack%29%2C_1967.jpg',
      matchPercent: 95,
      curatorNote: '개념의 체계적 구축과 아카이빙을 실현하는 LAMC의 방법론'
    },
    {
      title: '월 드로잉 #260',
      artist: '솔 르윗',
      year: '1975',
      description: '지시문을 통한 개념미술의 체계화',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Sol_LeWitt_Wall_Drawing_1136.jpg/1024px-Sol_LeWitt_Wall_Drawing_1136.jpg',
      matchPercent: 93,
      curatorNote: '미학 이론을 체계적으로 실행하는 LAMC의 수집가적 접근'
    },
    {
      title: '등가 VIII',
      artist: '칼 안드레',
      year: '1966',
      description: '물질과 공간의 체계적 배열',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Equivalent_VIII.jpg/1024px-Equivalent_VIII.jpg',
      matchPercent: 91,
      curatorNote: '구조와 의미를 체계적으로 정리하는 LAMC의 철학적 시각'
    },
    {
      title: '대각선의 개인적 황홀경',
      artist: '댄 플래빈',
      year: '1963',
      description: '빛과 공간의 체계적 탐구',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/The_Diagonal_of_May_25%2C_1963.jpg/600px-The_Diagonal_of_May_25%2C_1963.jpg',
      matchPercent: 89,
      curatorNote: '개념적 색채 사용을 체계화하는 LAMC의 분석적 접근'
    }
  ],

  // LREF: 고독한 관찰자 (카멜레온 🦎) - 혼자서 구상 작품을 감정적으로 자유롭게 관찰
  'LREF': [
    {
      title: '별이 빛나는 밤',
      artist: '빈센트 반 고흐',
      year: '1889',
      description: '고독한 영혼이 바라본 우주의 위로',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
      matchPercent: 98,
      curatorNote: '혼자만의 세계에서 자연과 교감하며 깊은 감정을 느끼는 LREF의 정수'
    },
    {
      title: '안개 바다 위의 방랑자',
      artist: '카스파르 다비드 프리드리히',
      year: '1818',
      description: '숭고한 자연 앞에 선 고독한 인간',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg',
      matchPercent: 96,
      curatorNote: '독립적이고 자유로운 영혼이 자연에서 찾는 내면의 평화'
    },
    {
      title: '밤의 카페 테라스',
      artist: '빈센트 반 고흐',
      year: '1888',
      description: '따뜻한 빛이 있는 고독한 밤의 풍경',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Vincent_Willem_van_Gogh_-_Cafe_Terrace_at_Night_%28Yorck%29.jpg/800px-Vincent_Willem_van_Gogh_-_Cafe_Terrace_at_Night_%28Yorck%29.jpg',
      matchPercent: 94,
      curatorNote: '혼자만의 시간 속에서 발견하는 일상의 아름다움'
    },
    {
      title: '크리스티나의 세계',
      artist: '앤드루 와이어스',
      year: '1948',
      description: '고독과 갈망이 담긴 광활한 풍경',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Andrew_Wyeth_Christinas_World.jpg',
      matchPercent: 92,
      curatorNote: '세밀한 관찰과 깊은 감정이 만나는 LREF의 시선'
    },
    {
      title: '나이트호크스',
      artist: '에드워드 호퍼',
      year: '1942',
      description: '도시의 고독을 담은 밤의 정경',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg',
      matchPercent: 90,
      curatorNote: '고독한 관찰자가 포착한 현대인의 소외감'
    }
  ],

  // LREC: 섬세한 감정가 (고슴도치 🦔) - 혼자서 구상 작품을 감정적으로 체계적으로 음미
  'LREC': [
    {
      title: '진주 귀걸이를 한 소녀',
      artist: '요하네스 베르메르',
      year: '1665',
      description: '빛과 감정의 섬세한 포착',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg',
      matchPercent: 97,
      curatorNote: '섬세한 감정의 뉘앙스를 체계적으로 음미하는 LREC의 완벽한 작품'
    },
    {
      title: '편지를 읽는 여인',
      artist: '요하네스 베르메르',
      year: '1663',
      description: '고요한 순간에 담긴 내밀한 감정',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Johannes_Vermeer_-_Woman_Reading_a_Letter_-_WGA24664.jpg/800px-Johannes_Vermeer_-_Woman_Reading_a_Letter_-_WGA24664.jpg',
      matchPercent: 95,
      curatorNote: '일상의 미묘한 감정을 체계적으로 관찰하고 음미하는 LREC의 방식'
    },
    {
      title: '오페라 박스',
      artist: '피에르오귀스트 르누아르',
      year: '1874',
      description: '극장의 화려함 속 섬세한 감정 표현',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Pierre-Auguste_Renoir%2C_La_loge_%28The_Theater_Box%29.jpg/800px-Pierre-Auguste_Renoir%2C_La_loge_%28The_Theater_Box%29.jpg',
      matchPercent: 93,
      curatorNote: '세밀한 감수성으로 포착한 인간의 감정적 순간'
    },
    {
      title: '아침 식사',
      artist: '장 시메옹 샤르댕',
      year: '1738',
      description: '일상의 정물에 담긴 고요한 아름다움',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Jean-Baptiste-Sim%C3%A9on_Chardin_001.jpg/800px-Jean-Baptiste-Sim%C3%A9on_Chardin_001.jpg',
      matchPercent: 91,
      curatorNote: '평범한 사물의 섬세한 아름다움을 체계적으로 발견하는 LREC'
    },
    {
      title: '레이스를 뜨는 여인',
      artist: '요하네스 베르메르',
      year: '1669',
      description: '집중과 평온의 순간을 담은 걸작',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Johannes_Vermeer_-_The_Lacemaker_-_Google_Art_Project.jpg/800px-Johannes_Vermeer_-_The_Lacemaker_-_Google_Art_Project.jpg',
      matchPercent: 89,
      curatorNote: '섬세한 동작 속에 담긴 깊은 감정을 음미하는 LREC의 시선'
    }
  ],

  // LRMF: 디지털 탐험가 (문어 🐙) - 혼자서 구상 작품의 의미를 자유롭게 분석
  'LRMF': [
    {
      title: '더 큰 스플래시',
      artist: '데이비드 호크니',
      year: '1967',
      description: '현대적 시각으로 재해석한 일상의 순간',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/b/b4/A_Bigger_Splash.jpg',
      matchPercent: 95,
      curatorNote: '현대적 기술과 전통 회화의 자유로운 융합을 탐구하는 LRMF'
    },
    {
      title: '마릴린 먼로',
      artist: '앤디 워홀',
      year: '1967',
      description: '대중문화 아이콘의 다층적 의미 분석',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/8/87/Marilynmonroe.jpg',
      matchPercent: 93,
      curatorNote: '현대 미디어와 예술의 관계를 자유롭게 탐구하는 LRMF의 시각'
    },
    {
      title: '셀프 포트레이트',
      artist: '척 클로스',
      year: '1997',
      description: '디지털 시대의 하이퍼리얼리즘',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Chuck_Close_1.jpg',
      matchPercent: 91,
      curatorNote: '기술을 활용한 새로운 관찰과 분석의 LRMF적 접근'
    },
    {
      title: '포토리얼리즘 도시',
      artist: '리처드 에스테스',
      year: '1974',
      description: '도시 풍경의 극사실적 재현',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/9/92/Richard_Estes_Telephone_Booths.jpg',
      matchPercent: 89,
      curatorNote: '현대 도시의 복잡성을 자유롭게 분석하는 LRMF의 탐구'
    },
    {
      title: '인피니티 미러룸',
      artist: '야요이 쿠사마',
      year: '2013',
      description: '디지털 시대의 무한 반복과 자아',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Yayoi_Kusama%27s_Infinity_Room.jpg/1024px-Yayoi_Kusama%27s_Infinity_Room.jpg',
      matchPercent: 92,
      curatorNote: '기술과 예술의 경계를 자유롭게 탐험하는 LRMF의 창의성'
    }
  ],

  // LRMC: 학구적 연구자 (비버 🦫) - 혼자서 구상 작품의 의미를 체계적으로 연구
  'LRMC': [
    {
      title: '아르놀피니 부부의 초상',
      artist: '얀 반 에이크',
      year: '1434',
      description: '숨겨진 상징과 의미로 가득한 북유럽 르네상스의 걸작',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/800px-Van_Eyck_-_Arnolfini_Portrait.jpg',
      matchPercent: 98,
      curatorNote: '세밀한 기법과 복잡한 상징체계를 체계적으로 연구하는 LRMC의 이상적 작품'
    },
    {
      title: '대사들',
      artist: '한스 홀바인',
      year: '1533',
      description: '이중적 의미와 숨겨진 죽음의 상징',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg/1280px-Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg',
      matchPercent: 96,
      curatorNote: '깊이 있는 분석과 학술적 접근이 필요한 LRMC의 연구 대상'
    },
    {
      title: '시스티나 성당 천장화',
      artist: '미켈란젤로',
      year: '1512',
      description: '성서와 인문주의가 결합된 르네상스의 정점',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
      matchPercent: 95,
      curatorNote: '종교적, 철학적, 기법적 측면을 체계적으로 연구하는 LRMC의 방법론'
    },
    {
      title: '아테네 학당',
      artist: '라파엘로',
      year: '1511',
      description: '철학과 예술의 완벽한 종합',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
      matchPercent: 94,
      curatorNote: '고전 철학과 르네상스 미학을 체계적으로 분석하는 LRMC'
    },
    {
      title: '다비드',
      artist: '미켈란젤로',
      year: '1504',
      description: '해부학적 완벽함과 인문주의의 결정체',
      category: ['sculpture'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Michelangelo%27s_David_-_63_grijswaarden.jpg/800px-Michelangelo%27s_David_-_63_grijswaarden.jpg',
      matchPercent: 92,
      curatorNote: '기법과 의미를 체계적으로 연구하는 LRMC의 학구적 접근'
    }
  ],

  // SAEF: 감정 지휘자 (나비 🦋) - 함께 추상 작품의 감정을 자유롭게 나눔
  'SAEF': [
    {
      title: '게르니카',
      artist: '파블로 피카소',
      year: '1937',
      description: '전쟁의 공포를 집단의 감정으로 승화시킨 걸작',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg',
      matchPercent: 97,
      curatorNote: '강렬한 감정을 대중과 공유하며 공감대를 형성하는 SAEF의 본질'
    },
    {
      title: 'Number 1 (Lavender Mist)',
      artist: '잭슨 폴록',
      year: '1950',
      description: '에너지와 감정이 폭발하는 액션 페인팅',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/7/74/Number_1_%28Lavender_Mist%29.jpg',
      matchPercent: 95,
      curatorNote: '즉흥적 감정을 관객과 나누며 에너지를 전파하는 SAEF의 방식'
    },
    {
      title: '절규',
      artist: '에드바르드 뭉크',
      year: '1893',
      description: '인류 보편의 불안을 시각화한 표현주의',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
      matchPercent: 93,
      curatorNote: '개인을 넘어선 집단 감정의 공명을 이끌어내는 SAEF'
    },
    {
      title: '색채 교향곡',
      artist: '바실리 칸딘스키',
      year: '1913',
      description: '음악과 색채로 감정을 공유하는 추상표현주의',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/1280px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg',
      matchPercent: 91,
      curatorNote: '다양한 감정을 오케스트라처럼 지휘하는 SAEF의 능력'
    },
    {
      title: '춤',
      artist: '앙리 마티스',
      year: '1910',
      description: '집단의 기쁨과 생명력을 표현한 야수파',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Matissedance.jpg/1280px-Matissedance.jpg',
      matchPercent: 90,
      curatorNote: '함께하는 즐거움과 에너지를 나누는 SAEF의 축제'
    }
  ],

  // SAEC: 느낌의 지도제작자 (펭귄 🐧) - 함께 추상 작품의 감정을 체계적으로 공유
  'SAEC': [
    {
      title: '검은 사각형',
      artist: '카지미르 말레비치',
      year: '1915',
      description: '감정의 제로 지점을 체계적으로 제시',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Malevich.black-square.jpg/800px-Malevich.black-square.jpg',
      matchPercent: 94,
      curatorNote: '감정의 체계적 지도를 만들어 공유하는 SAEC의 시작점'
    },
    {
      title: '옵티컬 페인팅',
      artist: '브리짓 라일리',
      year: '1964',
      description: '시각적 감각을 체계적으로 조직화한 옵아트',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/f/f7/Movement_in_Squares%2C_by_Bridget_Riley_1961.jpg',
      matchPercent: 92,
      curatorNote: '감각과 감정을 체계적으로 매핑하여 관객과 공유하는 SAEC'
    },
    {
      title: '상대성',
      artist: 'M.C. 에셔',
      year: '1953',
      description: '공간과 지각의 체계적 탐구',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Escher%27s_Relativity.jpg',
      matchPercent: 91,
      curatorNote: '복잡한 감정의 구조를 체계화하여 네트워킹하는 SAEC의 방식'
    },
    {
      title: '움직이는 사각형',
      artist: '빅토르 바사렐리',
      year: '1969',
      description: '감정의 움직임을 체계적으로 시각화',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Victor_Vasarely_Zebra_1937.jpg',
      matchPercent: 89,
      curatorNote: '집단 감정의 패턴을 체계적으로 구성하는 SAEC'
    },
    {
      title: '무빙 타겟',
      artist: '재스퍼 존스',
      year: '1958',
      description: '감정의 중심점을 체계적으로 제시',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/c/c0/Target_with_Four_Faces.jpg',
      matchPercent: 88,
      curatorNote: '감정의 초점을 체계적으로 조직하여 공유하는 SAEC'
    }
  ],

  // SAMF: 마음의 연금술사 (앵무새 🦜) - 함께 추상 작품의 의미를 자유롭게 전파
  'SAMF': [
    {
      title: '아비뇽의 처녀들',
      artist: '파블로 피카소',
      year: '1907',
      description: '기존 미술의 개념을 완전히 전복시킨 혁명',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg',
      matchPercent: 96,
      curatorNote: '새로운 의미를 창조하고 열정적으로 전파하는 SAMF의 연금술'
    },
    {
      title: 'LOVE',
      artist: '로버트 인디애나',
      year: '1970',
      description: '단순한 단어를 보편적 아이콘으로 변환',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/b/be/LOVE_sculpture_NY.JPG',
      matchPercent: 94,
      curatorNote: '의미를 변환하여 대중에게 영감을 전파하는 SAMF의 마법'
    },
    {
      title: '무제',
      artist: '장미셸 바스키아',
      year: '1982',
      description: '거리의 에너지를 예술로 승화시킨 그래피티',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/6/61/Untitled_%28Skull%29.jpg',
      matchPercent: 92,
      curatorNote: '원초적 에너지를 예술적 의미로 변환하는 SAMF의 창조력'
    },
    {
      title: '무한 그물',
      artist: '야요이 쿠사마',
      year: '1965',
      description: '반복을 통한 무한의 창조',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/5/52/Yayoi_Kusama_-_Infinity_Net_Yellow.jpg',
      matchPercent: 90,
      curatorNote: '개인적 강박을 보편적 영감으로 변환하는 SAMF'
    },
    {
      title: '팩토리 시리즈',
      artist: '앤디 워홀',
      year: '1964',
      description: '일상을 예술로 변환하는 팝아트',
      category: ['paintings', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Campbell%27s_Soup_Cans_by_Andy_Warhol.jpg',
      matchPercent: 89,
      curatorNote: '대중문화를 예술적 의미로 연금하는 SAMF의 재능'
    }
  ],

  // SAMC: 지혜의 건축가 (사슴 🦌) - 함께 추상 작품의 의미를 체계적으로 기획
  'SAMC': [
    {
      title: '사회조각',
      artist: '요셉 보이스',
      year: '1982',
      description: '예술을 통한 사회변혁의 체계적 기획',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/7000_Oaks_by_Joseph_Beuys.jpg/1024px-7000_Oaks_by_Joseph_Beuys.jpg',
      matchPercent: 97,
      curatorNote: '예술의 사회적 의미를 체계적으로 기획하고 실현하는 SAMC의 이상'
    },
    {
      title: '포장된 독일 의회',
      artist: '크리스토와 잔클로드',
      year: '1995',
      description: '대규모 공공예술의 체계적 실현',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wrapped_Reichstag%2C_Berlin%2C_1995.jpg/1024px-Wrapped_Reichstag%2C_Berlin%2C_1995.jpg',
      matchPercent: 95,
      curatorNote: '거대한 비전을 체계적으로 조직하여 실현하는 SAMC의 능력'
    },
    {
      title: 'The Weather Project',
      artist: '올라푸르 엘리아손',
      year: '2003',
      description: '관객 참여형 대규모 설치미술',
      category: ['sculpture', 'contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/The_weather_project%2C_Olafur_Eliasson%2C_Tate_Modern%2C_London%2C_2003_%283%29.jpg/1024px-The_weather_project%2C_Olafur_Eliasson%2C_Tate_Modern%2C_London%2C_2003_%283%29.jpg',
      matchPercent: 93,
      curatorNote: '대중과의 소통을 체계적으로 설계하는 SAMC의 건축술'
    },
    {
      title: '비디오 아트',
      artist: '백남준',
      year: '1974',
      description: '새로운 매체를 통한 예술의 체계적 확장',
      category: ['contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/TV-Buddha.jpg/800px-TV-Buddha.jpg',
      matchPercent: 91,
      curatorNote: '미디어 아트의 의미를 체계적으로 구축하는 SAMC'
    },
    {
      title: '나오시마 미술관',
      artist: '안도 타다오',
      year: '2004',
      description: '자연과 예술을 체계적으로 융합한 건축',
      category: ['contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Naoshima_Benesse_House_Museum.jpg/1024px-Naoshima_Benesse_House_Museum.jpg',
      matchPercent: 90,
      curatorNote: '예술 경험을 체계적으로 설계하는 SAMC의 지혜'
    }
  ],

  // SREF: 이야기 직조가 (강아지 🐕) - 함께 구상 작품을 감정적으로 자유롭게 즐김
  'SREF': [
    {
      title: '물랑 루즈의 무도회',
      artist: '툴루즈 로트렉',
      year: '1890',
      description: '파리의 활기찬 밤문화와 이야기들',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Henri_de_Toulouse-Lautrec_-_At_the_Moulin_Rouge_-_Google_Art_Project.jpg/1280px-Henri_de_Toulouse-Lautrec_-_At_the_Moulin_Rouge_-_Google_Art_Project.jpg',
      matchPercent: 96,
      curatorNote: '사람들의 이야기가 넘치는 공간에서 즐거움을 나누는 SREF의 세계'
    },
    {
      title: '무도회에서',
      artist: '오귀스트 르누아르',
      year: '1876',
      description: '햇살 가득한 정원의 즐거운 파티',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Mus%C3%A9e_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg/1280px-Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Mus%C3%A9e_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg',
      matchPercent: 95,
      curatorNote: '친구들과 함께 나누는 즐거운 순간들을 직조하는 SREF'
    },
    {
      title: '뱅크시의 풍선 소녀',
      artist: '뱅크시',
      year: '2018',
      description: '현대의 이야기를 유머러스하게 전달',
      category: ['contemporary'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Girl_With_Balloon_%28Banksy%29.jpg/800px-Girl_With_Balloon_%28Banksy%29.jpg',
      matchPercent: 93,
      curatorNote: '재치있는 이야기로 감동을 전하는 SREF의 현대적 표현'
    },
    {
      title: '보트 파티에서의 오찬',
      artist: '피에르오귀스트 르누아르',
      year: '1881',
      description: '강변의 즐거운 오후 파티',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Phillips_Collection.jpg/1280px-Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Phillips_Collection.jpg',
      matchPercent: 91,
      curatorNote: '사람들의 행복한 이야기가 어우러지는 SREF의 축제'
    },
    {
      title: '봄',
      artist: '산드로 보티첼리',
      year: '1482',
      description: '신화 속 이야기의 아름다운 펼쳐짐',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Botticelli-primavera.jpg/1280px-Botticelli-primavera.jpg',
      matchPercent: 89,
      curatorNote: '신화의 이야기를 아름답게 직조하는 SREF의 재능'
    }
  ],

  // SREC: 마음의 큐레이터 (오리 🦆) - 함께 구상 작품을 감정적으로 체계적으로 안내
  'SREC': [
    {
      title: '루앙 대성당 연작',
      artist: '클로드 모네',
      year: '1894',
      description: '시간과 빛에 따른 감정의 변화를 체계적으로 포착',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Claude_Monet_-_Rouen_Cathedral%2C_West_Fa%C3%A7ade%2C_Sunlight_-_Google_Art_Project.jpg/800px-Claude_Monet_-_Rouen_Cathedral%2C_West_Fa%C3%A7ade%2C_Sunlight_-_Google_Art_Project.jpg',
      matchPercent: 95,
      curatorNote: '섬세한 감정의 변화를 체계적으로 안내하는 SREC의 큐레이션'
    },
    {
      title: '수련 연작',
      artist: '클로드 모네',
      year: '1916',
      description: '자연의 평화로운 감정을 체계적으로 전달',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Claude_Monet_-_Water_Lilies_-_1906.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906.jpg',
      matchPercent: 93,
      curatorNote: '관객을 배려하며 감정의 깊이로 안내하는 SREC의 방식'
    },
    {
      title: '라 그랑드 자트 섬의 일요일 오후',
      artist: '조르주 쇠라',
      year: '1886',
      description: '점묘법으로 그린 평화로운 공원의 정경',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1280px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg',
      matchPercent: 92,
      curatorNote: '세심하게 구성된 감정을 따뜻하게 전달하는 SREC'
    },
    {
      title: '키스',
      artist: '구스타프 클림트',
      year: '1908',
      description: '황금빛 사랑의 감정을 섬세하게 표현',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg',
      matchPercent: 90,
      curatorNote: '사랑의 감정을 체계적으로 큐레이션하는 SREC의 따뜻함'
    },
    {
      title: '잠자는 집시',
      artist: '앙리 루소',
      year: '1897',
      description: '꿈같은 평화로움을 전하는 소박한 환상',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Henri_Rousseau_-_The_Sleeping_Gypsy.jpg/1280px-Henri_Rousseau_-_The_Sleeping_Gypsy.jpg',
      matchPercent: 88,
      curatorNote: '편안한 감정으로 안내하는 SREC의 배려심'
    }
  ],

  // SRMF: 문화 항해자 (코끼리 🐘) - 함께 구상 작품의 의미를 자유롭게 가르침
  'SRMF': [
    {
      title: '아테네 학당',
      artist: '라파엘로',
      year: '1511',
      description: '철학과 지혜의 전당을 시각화한 르네상스의 정점',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
      matchPercent: 97,
      curatorNote: '풍부한 지식을 자유롭게 전수하며 문화를 항해하는 SRMF의 이상'
    },
    {
      title: '민중을 이끄는 자유의 여신',
      artist: '외젠 들라크루아',
      year: '1830',
      description: '자유와 혁명의 정신을 열정적으로 전달',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg',
      matchPercent: 95,
      curatorNote: '역사의 의미를 열정적으로 가르치는 SRMF의 항해'
    },
    {
      title: '최후의 만찬',
      artist: '레오나르도 다 빈치',
      year: '1498',
      description: '종교와 인간성이 만나는 극적인 순간',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/1280px-The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg',
      matchPercent: 94,
      curatorNote: '깊은 의미를 자유롭게 풀어내는 SRMF의 지혜'
    },
    {
      title: '나폴레옹의 대관식',
      artist: '자크루이 다비드',
      year: '1807',
      description: '역사적 순간의 장대한 기록',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg/1280px-Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg',
      matchPercent: 92,
      curatorNote: '역사와 문화의 중요성을 전달하는 SRMF의 사명'
    },
    {
      title: '비너스의 탄생',
      artist: '산드로 보티첼리',
      year: '1486',
      description: '신화와 미의 이상을 표현한 르네상스',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
      matchPercent: 90,
      curatorNote: '고전의 지혜를 현대에 전하는 SRMF의 문화 항해'
    }
  ],

  // SRMC: 마스터 도슨트 (독수리 🦅) - 함께 구상 작품의 의미를 체계적으로 교육
  'SRMC': [
    {
      title: '모나리자',
      artist: '레오나르도 다 빈치',
      year: '1503',
      description: '르네상스 초상화의 정점이자 영원한 수수께끼',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      matchPercent: 98,
      curatorNote: '예술사의 핵심을 체계적으로 교육하는 SRMC 마스터 도슨트의 필수 작품'
    },
    {
      title: '별이 빛나는 밤',
      artist: '빈센트 반 고흐',
      year: '1889',
      description: '후기 인상주의의 감정과 기법이 결합된 걸작',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
      matchPercent: 96,
      curatorNote: '기법과 감정을 체계적으로 설명하는 SRMC의 교육적 접근'
    },
    {
      title: '인상, 해돋이',
      artist: '클로드 모네',
      year: '1872',
      description: '인상주의의 시작을 알린 역사적 작품',
      category: ['paintings'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg',
      matchPercent: 95,
      curatorNote: '미술사의 전환점을 체계적으로 교육하는 SRMC의 전문성'
    },
    {
      title: '게르니카',
      artist: '파블로 피카소',
      year: '1937',
      description: '큐비즘과 역사가 만난 20세기의 대작',
      category: ['paintings', 'modern'],
      image: 'https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg',
      matchPercent: 94,
      curatorNote: '현대미술의 의미를 체계적으로 전달하는 SRMC의 교육'
    },
    {
      title: '다비드',
      artist: '미켈란젤로',
      year: '1504',
      description: '르네상스 조각의 완벽한 인체 표현',
      category: ['sculpture'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Michelangelo%27s_David_-_63_grijswaarden.jpg/800px-Michelangelo%27s_David_-_63_grijswaarden.jpg',
      matchPercent: 93,
      curatorNote: '조각의 기법과 의미를 체계적으로 가르치는 SRMC의 권위'
    }
  ]
};