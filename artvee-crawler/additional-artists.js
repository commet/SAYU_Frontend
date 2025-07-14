/**
 * 서양미술사 핵심 작가 중 누락된 작가들 추가 목록
 * SAYU 타입별로 적절히 분류
 */

const additionalArtists = {
  // 르네상스 거장들
  'SRMC': [
    'masaccio',                // 르네상스 초기 혁신가
    'fra-angelico',            // 천상적 아름다움
    'giorgione',               // 베네치아파
  ],
  
  'LAMF': [
    'hieronymus-bosch',        // 환상적, 상징적
    'pieter-bruegel-the-elder', // 북부 르네상스, 농민 생활
  ],
  
  // 바로크
  'LRMF': [
    'georges-de-la-tour',      // 빛과 어둠의 대가
    'artemisia-gentileschi',   // 여성 바로크 화가
  ],
  
  'SRMF': [
    'claude-lorrain',          // 이상적 풍경화
  ],
  
  // 로코코
  'LREC': [
    'antoine-watteau',         // 로코코 창시자
    'giovanni-battista-tiepolo', // 이탈리아 로코코
  ],
  
  // 사실주의
  'LREF': [
    'honore-daumier',          // 사회 비판적 사실주의
  ],
  
  // 인상주의
  'LAEC': [
    'gustave-caillebotte',     // 도시 풍경 인상주의
  ],
  
  // 후기 인상주의
  'LAEF': [
    'georges-seurat',          // 점묘법 창시자
    'henri-de-toulouse-lautrec', // 몽마르트의 화가
  ],
  
  // 20세기 초 현대미술
  'SAEF': [
    'gustav-klimt',            // 빈 분리파, 황금 장식
    'amedeo-modigliani',       // 독특한 초상화 스타일
  ],
  
  'LRMF': [
    'emil-nolde',              // 독일 표현주의
    'ernst-ludwig-kirchner',   // Die Brücke 창시자
  ],
  
  'SAMF': [
    'salvador-dali',           // 초현실주의 거장
    'joan-miro',               // 추상 초현실주의
    'max-ernst',               // 다다, 초현실주의
  ]
};

// Artvee에서 찾을 수 있는 작가들 확인용
const artistsToCheck = [
  // 르네상스
  'masaccio',
  'fra-angelico', 
  'giorgione',
  'hieronymus-bosch',
  'pieter-bruegel-the-elder',
  
  // 바로크
  'georges-de-la-tour',
  'artemisia-gentileschi',
  'claude-lorrain',
  
  // 로코코
  'antoine-watteau',
  'giovanni-battista-tiepolo',
  
  // 19세기
  'honore-daumier',
  'gustave-caillebotte',
  'georges-seurat',
  'henri-de-toulouse-lautrec',
  
  // 20세기
  'gustav-klimt',
  'emil-nolde',
  'ernst-ludwig-kirchner',
  'salvador-dali',
  'joan-miro',
  'max-ernst',
  'amedeo-modigliani'
];

module.exports = { additionalArtists, artistsToCheck };