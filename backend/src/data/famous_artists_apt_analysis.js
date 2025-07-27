// 유명 작가들의 APT 분석 예시
// 각 작가의 특성을 16가지 APT 유형으로 정밀 분류

const famousArtistsAPT = [
  {
    name: "Vincent van Gogh",
    aptType: "LAEF",
    axisScores: {
      L_S: -85,  // 매우 독립적, 고독한 작업
      A_R: -60,  // 표현주의적 추상성
      E_M: -90,  // 극도로 감정적
      F_C: -70   // 자유롭고 즉흥적
    },
    analysis: {
      summary: "고흐는 전형적인 LAEF(몽환적 방랑자) 유형으로, 극도의 고독 속에서 자신의 감정을 색채와 붓터치로 표현했습니다.",
      keyTraits: [
        "고독한 작업실에서의 독립적 창작",
        "강렬한 색채를 통한 감정 표현",
        "표현주의적 붓터치의 자유로움",
        "내면의 격정을 캔버스에 투영"
      ]
    }
  },
  
  {
    name: "Pablo Picasso",
    aptType: "SAMF",
    axisScores: {
      L_S: 65,   // 협업과 그룹 활동
      A_R: -80,  // 입체주의, 추상화
      E_M: 40,   // 지적이고 개념적
      F_C: -85   // 극도로 실험적
    },
    analysis: {
      summary: "피카소는 SAMF(영감 전도사) 유형으로, 다른 예술가들과 활발히 교류하며 추상미술의 새로운 의미를 전파했습니다.",
      keyTraits: [
        "브라크와의 입체주의 공동 창시",
        "파리 예술계의 중심 인물",
        "추상을 통한 새로운 시각 언어 창조",
        "끊임없는 실험과 스타일 변화"
      ]
    }
  },
  
  {
    name: "Leonardo da Vinci",
    aptType: "LRMC",
    axisScores: {
      L_S: -60,  // 독립적 연구
      A_R: 85,   // 정밀한 구상
      E_M: 70,   // 지적이고 과학적
      F_C: 50    // 체계적이면서도 혁신적
    },
    analysis: {
      summary: "다빈치는 LRMC(학구적 연구자) 유형으로, 혼자서 구상 작품의 의미를 체계적으로 연구한 르네상스의 천재입니다.",
      keyTraits: [
        "해부학적 정밀성 추구",
        "과학적 관찰과 예술의 결합",
        "체계적인 스케치와 노트",
        "완벽주의적 작품 접근"
      ]
    }
  },
  
  {
    name: "Andy Warhol",
    aptType: "SAMC",
    axisScores: {
      L_S: 80,   // 팩토리, 사회적 활동
      A_R: -40,  // 추상적 팝아트
      E_M: 60,   // 사회 비평적
      F_C: 30    // 체계적 대량생산
    },
    analysis: {
      summary: "워홀은 SAMC(문화 기획자) 유형으로, 팩토리를 중심으로 대중문화와 예술의 의미를 체계적으로 기획했습니다.",
      keyTraits: [
        "팩토리라는 협업 공간 운영",
        "대중문화 아이콘의 추상화",
        "소비사회에 대한 비평적 시각",
        "실크스크린의 체계적 활용"
      ]
    }
  },
  
  {
    name: "Claude Monet",
    aptType: "LREF",
    axisScores: {
      L_S: -70,  // 지베르니 정원에서 홀로
      A_R: 30,   // 인상주의적 구상
      E_M: -75,  // 빛과 색의 감정
      F_C: -60   // 자유로운 붓터치
    },
    analysis: {
      summary: "모네는 LREF(고독한 관찰자) 유형으로, 자연을 홀로 관찰하며 빛의 변화가 주는 감정을 자유롭게 표현했습니다.",
      keyTraits: [
        "지베르니 정원에서의 고독한 작업",
        "자연 풍경의 감성적 관찰",
        "시간에 따른 빛의 변화 포착",
        "즉흥적이고 자유로운 붓질"
      ]
    }
  },
  
  {
    name: "Frida Kahlo",
    aptType: "LAEC",
    axisScores: {
      L_S: -75,  // 침대에서의 고독한 작업
      A_R: -30,  // 상징적 자화상
      E_M: -85,  // 극도로 감정적
      F_C: 40    // 전통과 개인의 체계
    },
    analysis: {
      summary: "칼로는 LAEC(감성 큐레이터) 유형으로, 고독 속에서 자신의 감정을 상징적으로 체계화한 자화상을 그렸습니다.",
      keyTraits: [
        "병상에서의 독립적 창작",
        "개인적 고통의 상징화",
        "멕시코 전통의 체계적 활용",
        "감정의 시각적 아카이브화"
      ]
    }
  },
  
  {
    name: "Jackson Pollock",
    aptType: "LAEF",
    axisScores: {
      L_S: -80,  // 고독한 스튜디오 작업
      A_R: -95,  // 완전한 추상
      E_M: -80,  // 즉흥적 감정 표현
      F_C: -90   // 극도로 자유로운
    },
    analysis: {
      summary: "폴록은 LAEF(몽환적 방랑자) 유형으로, 홀로 작업하며 액션 페인팅으로 순수한 감정과 움직임을 표현했습니다.",
      keyTraits: [
        "스튜디오에서의 고독한 몰입",
        "드리핑 기법의 완전한 추상",
        "신체 움직임을 통한 감정 표출",
        "통제를 벗어난 자유로운 표현"
      ]
    }
  },
  
  {
    name: "Rembrandt van Rijn",
    aptType: "LREC",
    axisScores: {
      L_S: -50,  // 독립적 작업실
      A_R: 90,   // 정교한 구상
      E_M: -70,  // 깊은 감정 표현
      F_C: 60    // 전통적 기법 숙달
    },
    analysis: {
      summary: "렘브란트는 LREC(섬세한 감정가) 유형으로, 빛과 그림자로 인물의 내면을 섬세하고 체계적으로 표현했습니다.",
      keyTraits: [
        "작업실에서의 깊은 관찰",
        "인물의 심리적 깊이 탐구",
        "명암법의 체계적 활용",
        "자화상을 통한 내면 탐구"
      ]
    }
  },
  
  {
    name: "Yayoi Kusama",
    aptType: "SAEF",
    axisScores: {
      L_S: 40,   // 관객 참여형 설치
      A_R: -70,  // 추상적 무한 패턴
      E_M: -80,  // 강박적 감정 표현
      F_C: -50   // 자유로운 확장
    },
    analysis: {
      summary: "쿠사마는 SAEF(감성 나눔이) 유형으로, 관객과 함께 무한의 감정을 공유하는 몰입형 설치작품을 창작합니다.",
      keyTraits: [
        "인피니티 룸의 관객 참여",
        "점 패턴의 추상적 확장",
        "강박증의 예술적 승화",
        "집단적 감각 경험 창출"
      ]
    }
  },
  
  {
    name: "Banksy",
    aptType: "SAMF",
    axisScores: {
      L_S: 70,   // 대중과의 소통
      A_R: -20,  // 상징적 이미지
      E_M: 80,   // 사회 비평
      F_C: -75   // 게릴라식 자유
    },
    analysis: {
      summary: "뱅크시는 SAMF(영감 전도사) 유형으로, 거리에서 대중과 직접 소통하며 사회적 메시지를 자유롭게 전파합니다.",
      keyTraits: [
        "공공장소에서의 사회적 개입",
        "풍자적 이미지의 활용",
        "정치적 메시지의 전달",
        "익명성을 통한 자유로운 활동"
      ]
    }
  },
  
  {
    name: "Johannes Vermeer",
    aptType: "LREC",
    axisScores: {
      L_S: -85,  // 극도로 고독한 작업
      A_R: 95,   // 완벽한 사실주의
      E_M: -40,  // 고요한 감정
      F_C: 80    // 정교한 기법
    },
    analysis: {
      summary: "베르메르는 LREC(섬세한 감정가) 유형으로, 고독 속에서 일상의 고요한 순간을 극도로 정교하게 포착했습니다.",
      keyTraits: [
        "델프트 작업실의 은둔적 작업",
        "빛의 섬세한 표현",
        "일상의 정적인 아름다움",
        "카메라 옵스큐라의 체계적 활용"
      ]
    }
  },
  
  {
    name: "Jean-Michel Basquiat",
    aptType: "SAEF",
    axisScores: {
      L_S: 50,   // 뉴욕 예술계 활동
      A_R: -60,  // 추상적 표현주의
      E_M: -85,  // 강렬한 감정
      F_C: -80   // 자유로운 즉흥성
    },
    analysis: {
      summary: "바스키아는 SAEF(감성 나눔이) 유형으로, 뉴욕 거리와 갤러리에서 자신의 격렬한 감정을 자유롭게 표현했습니다.",
      keyTraits: [
        "거리 예술에서 시작한 사회적 표현",
        "원시적 에너지의 추상화",
        "인종차별에 대한 감정적 대응",
        "즉흥적이고 폭발적인 작업"
      ]
    }
  },
  
  {
    name: "Wassily Kandinsky",
    aptType: "LAMF",
    axisScores: {
      L_S: -40,  // 독립적 이론가
      A_R: -90,  // 순수 추상
      E_M: 50,   // 영적 의미 추구
      F_C: -60   // 자유로운 실험
    },
    analysis: {
      summary: "칸딘스키는 LAMF(직관적 탐구자) 유형으로, 홀로 추상미술의 영적 의미를 자유롭게 탐구한 선구자입니다.",
      keyTraits: [
        "추상회화의 이론적 정립",
        "색채와 형태의 영적 탐구",
        "음악과 회화의 공감각적 연결",
        "바우하우스에서의 실험적 교육"
      ]
    }
  },
  
  {
    name: "Georgia O'Keeffe",
    aptType: "LREF",
    axisScores: {
      L_S: -90,  // 뉴멕시코의 고독
      A_R: 20,   // 추상화된 자연
      E_M: -60,  // 자연의 감성
      F_C: -40   // 자유로운 확대
    },
    analysis: {
      summary: "오키프는 LREF(고독한 관찰자) 유형으로, 사막의 고독 속에서 자연을 감성적으로 관찰하고 자유롭게 표현했습니다.",
      keyTraits: [
        "뉴멕시코 사막에서의 은둔",
        "꽃과 뼈의 확대된 관찰",
        "자연의 본질적 아름다움 포착",
        "미니멀하면서도 감각적인 표현"
      ]
    }
  },
  
  {
    name: "Jeff Koons",
    aptType: "SRMC",
    axisScores: {
      L_S: 85,   // 대규모 팀 작업
      A_R: 60,   // 키치한 구상
      E_M: 70,   // 대중문화 비평
      F_C: 75    // 체계적 제작
    },
    analysis: {
      summary: "쿤스는 SRMC(체계적 교육자) 유형으로, 대규모 팀과 함께 대중문화의 의미를 체계적으로 재해석합니다.",
      keyTraits: [
        "대규모 스튜디오 시스템 운영",
        "일상 오브제의 기념비화",
        "소비문화에 대한 지적 접근",
        "정교한 산업적 제작 과정"
      ]
    }
  }
];

// APT 유형별 작가 분류 함수
function classifyArtistByAPT(artistData) {
  const { biography, artworks, exhibitions } = artistData;
  
  // 텍스트 분석을 통한 축 점수 계산
  const axisScores = {
    L_S: 0,
    A_R: 0,
    E_M: 0,
    F_C: 0
  };
  
  // 전기 정보 분석
  if (biography) {
    const bioLower = biography.toLowerCase();
    
    // L/S 축 분석
    if (bioLower.includes('solitary') || bioLower.includes('isolated') || bioLower.includes('alone')) {
      axisScores.L_S -= 30;
    }
    if (bioLower.includes('collaborative') || bioLower.includes('group') || bioLower.includes('collective')) {
      axisScores.L_S += 30;
    }
    
    // A/R 축 분석
    if (bioLower.includes('abstract') || bioLower.includes('non-figurative')) {
      axisScores.A_R -= 30;
    }
    if (bioLower.includes('realistic') || bioLower.includes('portrait') || bioLower.includes('landscape')) {
      axisScores.A_R += 30;
    }
    
    // E/M 축 분석
    if (bioLower.includes('emotional') || bioLower.includes('passionate') || bioLower.includes('expressive')) {
      axisScores.E_M -= 30;
    }
    if (bioLower.includes('intellectual') || bioLower.includes('conceptual') || bioLower.includes('philosophical')) {
      axisScores.E_M += 30;
    }
    
    // F/C 축 분석
    if (bioLower.includes('experimental') || bioLower.includes('innovative') || bioLower.includes('revolutionary')) {
      axisScores.F_C -= 30;
    }
    if (bioLower.includes('traditional') || bioLower.includes('classical') || bioLower.includes('academic')) {
      axisScores.F_C += 30;
    }
  }
  
  // 작품 분석
  if (artworks && artworks.length > 0) {
    let abstractCount = 0;
    let figurativeCount = 0;
    
    artworks.forEach(work => {
      if (work.style?.includes('Abstract')) abstractCount++;
      if (work.genre?.includes('Portrait') || work.genre?.includes('Landscape')) figurativeCount++;
    });
    
    const abstractRatio = abstractCount / artworks.length;
    axisScores.A_R += (figurativeCount - abstractCount) * 10;
  }
  
  // 전시 이력 분석
  if (exhibitions && exhibitions.length > 0) {
    let groupCount = 0;
    let soloCount = 0;
    
    exhibitions.forEach(exhibition => {
      if (exhibition.type === 'group') groupCount++;
      if (exhibition.type === 'solo') soloCount++;
    });
    
    axisScores.L_S += (groupCount - soloCount) * 5;
  }
  
  // APT 코드 생성
  let aptCode = '';
  aptCode += axisScores.L_S < 0 ? 'L' : 'S';
  aptCode += axisScores.A_R < 0 ? 'A' : 'R';
  aptCode += axisScores.E_M < 0 ? 'E' : 'M';
  aptCode += axisScores.F_C < 0 ? 'F' : 'C';
  
  return {
    aptType: aptCode,
    axisScores,
    confidence: calculateConfidence(axisScores, artistData)
  };
}

// 신뢰도 계산
function calculateConfidence(axisScores, artistData) {
  let confidence = 50; // 기본 신뢰도
  
  // 데이터 완성도에 따른 가중치
  if (artistData.biography) confidence += 10;
  if (artistData.artworks?.length > 10) confidence += 10;
  if (artistData.exhibitions?.length > 5) confidence += 10;
  if (artistData.birth_year) confidence += 5;
  if (artistData.nationality) confidence += 5;
  
  // 축 점수의 명확성에 따른 가중치
  Object.values(axisScores).forEach(score => {
    if (Math.abs(score) > 50) confidence += 5;
  });
  
  return Math.min(100, confidence);
}

module.exports = {
  famousArtistsAPT,
  classifyArtistByAPT
};