/**
 * 전시 파서 테스트를 위한 샘플 텍스트 모음
 */

export interface SampleData {
  name: string;
  category: string;
  text: string;
  expected: {
    title: string;
    venue_name: string;
    venue_city: string;
    start_date: string;
    end_date: string;
    admission_fee?: number;
  };
}

export const parsingExamples: SampleData[] = [
  {
    name: '국립현대미술관 표준 형식',
    category: 'museum_official',
    text: `《현대미술의 거장들》
전시기간: 2024년 3월 15일 - 2024년 8월 31일
장소: 국립현대미술관 서울관
입장료: 4,000원
웹사이트: https://mmca.go.kr

추상과 구상을 넘나드는 현대미술의 흐름을 조망하는 대규모 기획전시입니다.`,
    expected: {
      title: '현대미술의 거장들',
      venue_name: '국립현대미술관',
      venue_city: '서울',
      start_date: '2024-03-15',
      end_date: '2024-08-31',
      admission_fee: 4000
    }
  },
  {
    name: '서울시립미술관 형식',
    category: 'museum_official',
    text: `전시명: 《빛과 그림자: 인상주의 특별전》
기간: 2024.07.01 ~ 2024.12.31
장소: 서울시립미술관 본관 1층
관람료: 무료
주소: 서울시 중구 덕수궁길 61

19세기 말 프랑스에서 시작된 인상주의 회화의 정수를 만나보세요.`,
    expected: {
      title: '빛과 그림자: 인상주의 특별전',
      venue_name: '서울시립미술관',
      venue_city: '서울',
      start_date: '2024-07-01',
      end_date: '2024-12-31',
      admission_fee: 0
    }
  },
  {
    name: '갤러리 형식',
    category: 'gallery',
    text: `정현우 개인전 '기억의 조각들'
2024년 5월 10일(금) - 6월 20일(목)
갤러리 현대 본점
서울시 강남구 압구정로 80길 7
오프닝: 5월 10일 오후 6시
작가와의 대화: 5월 25일 오후 3시`,
    expected: {
      title: '정현우 개인전 기억의 조각들',
      venue_name: '갤러리 현대',
      venue_city: '서울',
      start_date: '2024-05-10',
      end_date: '2024-06-20'
    }
  },
  {
    name: '미술관 협회 공식 발표',
    category: 'museum_official',
    text: `▣ 전시개요
전시명: 한국 현대조각 50년
전시기간: 2024.04.15(월) - 2024.09.30(일)
전시장소: 국립미술관 과천관 제1,2,3전시실
관람료: 성인 5,000원, 청소년 3,000원, 어린이 2,000원
휴관일: 매주 월요일 (공휴일인 경우 다음날)

▣ 전시내용
한국 현대조각의 역사와 흐름을 조망하는 대규모 기획전`,
    expected: {
      title: '한국 현대조각 50년',
      venue_name: '국립미술관',
      venue_city: '과천',
      start_date: '2024-04-15',
      end_date: '2024-09-30',
      admission_fee: 5000
    }
  },
  {
    name: '영문 전시 정보',
    category: 'international',
    text: `Contemporary Korean Art Exhibition
March 1, 2024 - August 30, 2024
Seoul Museum of Art (SeMA)
61 Deoksugung-gil, Jung-gu, Seoul

Featuring works by leading contemporary Korean artists, this exhibition explores the themes of tradition and modernity in Korean art.

Admission: Free
Website: www.sema.seoul.kr`,
    expected: {
      title: 'Contemporary Korean Art Exhibition',
      venue_name: 'Seoul Museum of Art',
      venue_city: 'Seoul',
      start_date: '2024-03-01',
      end_date: '2024-08-30',
      admission_fee: 0
    }
  },
  {
    name: '복잡한 혼합 형식',
    category: 'mixed_format',
    text: `🎨 특별기획전 안내

제목: "디지털 시대의 예술: NFT와 미디어 아트"
일시: 2024년 6월 5일 - 8월 15일
※ 매주 월요일 휴관
장소: 아모레퍼시픽미술관 (용산구 한강대로 100)
요금: 일반 8,000원 / 학생 5,000원 / 65세 이상 무료

디지털 기술과 예술의 만남을 탐구하는 혁신적인 전시입니다.
AR, VR 체험존 운영
작가와의 만남: 매주 토요일 오후 2시

문의: 02-2222-3333
예매: www.apma.org`,
    expected: {
      title: '디지털 시대의 예술: NFT와 미디어 아트',
      venue_name: '아모레퍼시픽미술관',
      venue_city: '서울',
      start_date: '2024-06-05',
      end_date: '2024-08-15',
      admission_fee: 8000
    }
  },
  {
    name: '자연어 형태',
    category: 'natural_language',
    text: `다음 달인 3월부터 국립현대미술관에서 "모던 아트의 흐름"이라는 제목의 전시가 열립니다. 
전시는 3월 20일에 시작해서 7월 말인 31일까지 진행되며, 덕수궁 분관에서 열립니다.
입장료는 성인 기준 6천원이고, 학생은 4천원입니다. 
현대미술의 다양한 흐름을 한눈에 볼 수 있는 좋은 기회가 될 것 같습니다.`,
    expected: {
      title: '모던 아트의 흐름',
      venue_name: '국립현대미술관',
      venue_city: '서울',
      start_date: '2024-03-20',
      end_date: '2024-07-31',
      admission_fee: 6000
    }
  },
  {
    name: '부산 지역 전시',
    category: 'regional',
    text: `부산현대미술관 기획전
《바다와 예술: 부산의 정체성》

전시일정: 2024.5.1 - 2024.10.15
전시장소: 부산현대미술관 (해운대구 우동 1495)
관람시간: 오전 10시 - 오후 6시 (마지막 입장 5시)
관람료: 성인 3,000원, 청소년/학생 2,000원

부산의 바다와 도시 문화를 주제로 한 지역 작가들의 작품 전시`,
    expected: {
      title: '바다와 예술: 부산의 정체성',
      venue_name: '부산현대미술관',
      venue_city: '부산',
      start_date: '2024-05-01',
      end_date: '2024-10-15',
      admission_fee: 3000
    }
  }
];

/**
 * 배치 파싱 테스트용 데이터 (여러 전시를 한 번에)
 */
export const batchParsingSample = `《현대미술의 거장들》
전시기간: 2024년 3월 15일 - 2024년 8월 31일
장소: 국립현대미술관 서울관
입장료: 4,000원

전시명: 《빛과 그림자: 인상주의 특별전》
기간: 2024.07.01 ~ 2024.12.31
장소: 서울시립미술관 본관 1층
관람료: 무료

정현우 개인전 '기억의 조각들'
2024년 5월 10일(금) - 6월 20일(목)
갤러리 현대 본점
서울시 강남구 압구정로 80길 7

디지털 시대의 예술: NFT와 미디어 아트
일시: 2024년 6월 5일 - 8월 15일
장소: 아모레퍼시픽미술관 (용산구 한강대로 100)
요금: 일반 8,000원

부산현대미술관 기획전
《바다와 예술: 부산의 정체성》
전시일정: 2024.5.1 - 2024.10.15
전시장소: 부산현대미술관 (해운대구 우동 1495)
관람료: 성인 3,000원`;

/**
 * 파싱하기 어려운 케이스들
 */
export const challengingCases = [
  {
    name: '날짜 형식이 불분명한 경우',
    text: `추상미술 특별전
다음 주부터 여름 끝까지
시립미술관에서 개최`
  },
  {
    name: '정보가 부족한 경우',
    text: `김영호 작가의 개인전이 갤러리에서 열립니다.`
  },
  {
    name: '여러 언어가 혼재된 경우',
    text: `한국현대미술 Korean Contemporary Art Exhibition
2024.03.01~08.30 @Seoul Museum
Free admission 무료관람`
  },
  {
    name: 'HTML 태그가 포함된 경우',
    text: `<h2>현대조각전</h2>
<p>기간: 2024.04.01 - 2024.06.30</p>
<p>장소: 국립미술관</p>
<strong>입장료: 5,000원</strong>`
  }
];

/**
 * 샘플 데이터 필터링 함수
 */
export function getSamplesByCategory(category?: string): SampleData[] {
  if (!category) return parsingExamples;
  return parsingExamples.filter(sample => sample.category === category);
}

/**
 * 랜덤 샘플 반환
 */
export function getRandomSample(): SampleData {
  const randomIndex = Math.floor(Math.random() * parsingExamples.length);
  return parsingExamples[randomIndex];
}

/**
 * 카테고리 목록
 */
export const categories = [
  { value: '', label: '전체' },
  { value: 'museum_official', label: '미술관 공식' },
  { value: 'gallery', label: '갤러리' },
  { value: 'international', label: '국제 전시' },
  { value: 'mixed_format', label: '혼합 형식' },
  { value: 'natural_language', label: '자연어' },
  { value: 'regional', label: '지역 전시' }
];