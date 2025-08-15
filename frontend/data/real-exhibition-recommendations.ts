// 실제 2025 전시 추천 데이터 - 각 APT 유형별 특성에 맞춰 배치
export const realExhibitionRecommendations: Record<string, {
  title_ko: string;
  title_en: string;
  museum_ko: string;
  museum_en: string;
  period: string;
}> = {
  // L (고독) + A (추상) + E (감정) + C (체계)
  'LAEC': {
    title_ko: '우관중: 흑과 백 사이',
    title_en: 'Wu Guanzhong: Between Black and White',
    museum_ko: '서울서예박물관',
    museum_en: 'Seoul Calligraphy Museum',
    period: '2025.07.25-10.19'
  },
  
  // L (고독) + A (추상) + E (감정) + F (자유)
  'LAEF': {
    title_ko: '마르크 샤갈 특별전: 비욘드 타임',
    title_en: 'Marc Chagall: Beyond Time',
    museum_ko: '한가람미술관',
    museum_en: 'Hangaram Art Museum',
    period: '2025.05.23-09.21'
  },
  
  // L (고독) + A (추상) + M (의미) + C (체계)
  'LAMC': {
    title_ko: 'MMCA 소장품 기획전 - 수채: 물을 그리다',
    title_en: 'MMCA Collection - Watercolor',
    museum_ko: '국립현대미술관 청주',
    museum_en: 'MMCA Cheongju',
    period: '2025.03.21-09.07'
  },
  
  // L (고독) + A (추상) + M (의미) + F (자유)
  'LAMF': {
    title_ko: '이불 개인전',
    title_en: 'Lee Bul Solo Exhibition',
    museum_ko: '리움미술관',
    museum_en: 'Leeum Museum',
    period: '2025.09.04-2026.01.04'
  },
  
  // L (고독) + R (현실) + E (감정) + C (체계)
  'LREC': {
    title_ko: '루이즈 부르주아: 덧없고 영원한',
    title_en: 'Louise Bourgeois: Ephemeral and Eternal',
    museum_ko: '호암미술관',
    museum_en: 'Hoam Museum',
    period: '2025.08.30-2026.01.04'
  },
  
  // L (고독) + R (현실) + E (감정) + F (자유)
  'LREF': {
    title_ko: '오랑주리 - 오르세미술관 특별전: 세잔, 르누아르',
    title_en: 'Orangerie - Orsay Museum: Cézanne, Renoir',
    museum_ko: '한가람디자인미술관',
    museum_en: 'Hangaram Design Museum',
    period: '2025.09.20-2026.01.25'
  },
  
  // L (고독) + R (현실) + M (의미) + C (체계)
  'LRMC': {
    title_ko: '한국근현대미술 II',
    title_en: 'Korean Modern and Contemporary Art II',
    museum_ko: '국립현대미술관 과천',
    museum_en: 'MMCA Gwacheon',
    period: '2025.06.26-2027.06.27'
  },
  
  // L (고독) + R (현실) + M (의미) + F (자유)
  'LRMF': {
    title_ko: '향수, 고향을 그리다',
    title_en: 'Nostalgia, Drawing Home',
    museum_ko: '국립현대미술관 덕수궁',
    museum_en: 'MMCA Deoksugung',
    period: '2025.08.14-11.09'
  },
  
  // S (사교) + A (추상) + E (감정) + C (체계)
  'SAEC': {
    title_ko: '서울미디어시티비엔날레: 강령',
    title_en: 'Seoul Mediacity Biennale: Incantation',
    museum_ko: '서울시립 서소문본관',
    museum_en: 'SeMA Main',
    period: '2025.08.26-11.23'
  },
  
  // S (사교) + A (추상) + E (감정) + F (자유)
  'SAEF': {
    title_ko: '페트라 콜린스: fangirl',
    title_en: 'Petra Collins: fangirl',
    museum_ko: '대림미술관',
    museum_en: 'Daelim Museum',
    period: '2025.08.29-12.31'
  },
  
  // S (사교) + A (추상) + M (의미) + C (체계)
  'SAMC': {
    title_ko: 'MMCA×LG OLED 시리즈: 추수',
    title_en: 'MMCA×LG OLED Series: Harvest',
    museum_ko: '국립현대미술관 서울',
    museum_en: 'MMCA Seoul',
    period: '2025.08.01-2026.02.01'
  },
  
  // S (사교) + A (추상) + M (의미) + F (자유)
  'SAMF': {
    title_ko: '현대카드 컬처프로젝트 29 톰 삭스',
    title_en: 'Hyundai Card Culture Project 29 Tom Sachs',
    museum_ko: 'DDP 뮤지엄',
    museum_en: 'DDP Museum',
    period: '2025.04.25-09.07'
  },
  
  // S (사교) + R (현실) + E (감정) + C (체계)
  'SREC': {
    title_ko: '서도호와 아이들: 아트랜드',
    title_en: 'Do Ho Suh with Children: Artland',
    museum_ko: '서울시립 북서울미술관',
    museum_en: 'SeMA Buk-Seoul',
    period: '2023.05.02-2025.12.31'
  },
  
  // S (사교) + R (현실) + E (감정) + F (자유)
  'SREF': {
    title_ko: '타이틀 매치: 장영혜중공업 vs. 홍진훤',
    title_en: 'Title Match: Chang Younghae vs. Hong Jinhwon',
    museum_ko: '서울시립 북서울미술관',
    museum_en: 'SeMA Buk-Seoul',
    period: '2025.08.14-11.02'
  },
  
  // S (사교) + R (현실) + M (의미) + C (체계)
  'SRMC': {
    title_ko: 'Mark Bradford: Keep Walking',
    title_en: 'Mark Bradford: Keep Walking',
    museum_ko: '아모레퍼시픽미술관',
    museum_en: 'Amorepacific Museum',
    period: '2025.08.01-2026.01.25'
  },
  
  // S (사교) + R (현실) + M (의미) + F (자유)
  'SRMF': {
    title_ko: '젊은 모색 2025: 지금, 여기',
    title_en: 'Young Korean Artists 2025: Here and Now',
    museum_ko: '국립현대미술관 과천',
    museum_en: 'MMCA Gwacheon',
    period: '2025.04.24-10.12'
  }
};