// Wikipedia 조회수 데이터 기반 논리적 APT 매칭 시스템
// 트렌드와 데이터를 기반으로 한 3가지 유형 매칭

require('dotenv').config();
const fs = require('fs').promises;

// 16가지 APT 유형 정의
const APT_TYPES = {
  // Visionary Pathfinders (VPs)
  'VNRT': { name: '호랑이', traits: ['직관적', '혁신적', '리더십'] },
  'VNCM': { name: '독수리', traits: ['비전', '자유', '독립적'] },
  'VSRT': { name: '공작', traits: ['화려함', '표현력', '자신감'] },
  'VSCM': { name: '용', traits: ['신비로움', '창조적', '카리스마'] },
  
  // Harmony Connectors (HCs)
  'HNRT': { name: '코끼리', traits: ['공감', '지혜', '안정감'] },
  'HNCM': { name: '돌고래', traits: ['소통', '유연함', '긍정적'] },
  'HSRT': { name: '나비', traits: ['변화', '아름다움', '섬세함'] },
  'HSCM': { name: '백조', traits: ['우아함', '평화', '조화'] },
  
  // Sensory Realists (SRs)
  'SRRT': { name: '곰', traits: ['실용적', '신중함', '끈기'] },
  'SRCM': { name: '늑대', traits: ['충성', '협동', '직관'] },
  'SRMC': { name: '거북이', traits: ['인내', '지속성', '차분함'] },
  'SRMF': { name: '올빼미', traits: ['관찰력', '지성', '침착함'] },
  
  // Dynamic Explorers (DEs)
  'DERT': { name: '치타', traits: ['속도', '민첩성', '도전'] },
  'DECM': { name: '원숭이', traits: ['호기심', '재치', '활발함'] },
  'DEMC': { name: '여우', traits: ['영리함', '적응력', '전략적'] },
  'DEMF': { name: '토끼', traits: ['기민함', '순수함', '활력'] }
};

// 작가별 특성과 APT 매칭 로직
class LogicalAptMatcher {
  constructor() {
    this.matchingRules = this.initializeMatchingRules();
  }

  initializeMatchingRules() {
    return {
      // Global Icons (조회수 5000+, 언어 150+)
      'Leonardo da Vinci': {
        primary: 'VNRT', // 호랑이 - 르네상스의 완벽한 천재, 혁신적 리더
        secondary: 'VSCM', // 용 - 신비로운 창조력, 다방면의 재능
        tertiary: 'SRRT', // 곰 - 과학적 관찰과 실용성
        reasoning: '다재다능한 천재성(호랑이), 신비로운 창조력(용), 과학적 정밀함(곰)'
      },
      'Vincent van Gogh': {
        primary: 'VSCM', // 용 - 강렬한 감정과 독창적 비전
        secondary: 'HSRT', // 나비 - 섬세한 감수성과 변화
        tertiary: 'SRMC', // 거북이 - 고독과 인내의 삶
        reasoning: '독창적 예술혼(용), 감정적 섬세함(나비), 고독한 인내(거북이)'
      },
      'Frida Kahlo': {
        primary: 'VNRT', // 호랑이 - 강인한 의지와 자기표현
        secondary: 'HSRT', // 나비 - 고통을 아름다움으로 승화
        tertiary: 'VSCM', // 용 - 초현실적 상상력
        reasoning: '불굴의 의지(호랑이), 고통의 승화(나비), 초현실적 표현(용)'
      },
      'Pablo Picasso': {
        primary: 'VSRT', // 공작 - 끊임없는 스타일 변화와 과시
        secondary: 'VNRT', // 호랑이 - 예술계의 혁명가
        tertiary: 'DECM', // 원숭이 - 실험적이고 장난스러운 면
        reasoning: '화려한 변신(공작), 혁명적 리더십(호랑이), 실험정신(원숭이)'
      },
      'Andy Warhol': {
        primary: 'VSRT', // 공작 - 팝아트의 화려함과 상업성
        secondary: 'DEMC', // 여우 - 영리한 마케팅과 전략
        tertiary: 'SRCM', // 늑대 - 팩토리의 협업 시스템
        reasoning: '대중문화의 화려함(공작), 상업적 영리함(여우), 협업 시스템(늑대)'
      },

      // International Masters (조회수 2000-5000)
      'Salvador Dalí': {
        primary: 'VSCM', // 용 - 초현실주의의 극치
        secondary: 'VSRT', // 공작 - 과장된 퍼포먼스와 자기 PR
        tertiary: 'DECM', // 원숭이 - 기발하고 장난스러운 상상력
        reasoning: '초현실적 환상(용), 과장된 자기표현(공작), 기발한 상상력(원숭이)'
      },
      'Claude Monet': {
        primary: 'HSRT', // 나비 - 빛과 색의 섬세한 포착
        secondary: 'HSCM', // 백조 - 자연과의 조화로운 관계
        tertiary: 'SRMC', // 거북이 - 수련 연작의 끈기
        reasoning: '빛의 섬세함(나비), 자연과의 조화(백조), 반복의 인내(거북이)'
      },
      'Michelangelo': {
        primary: 'VNRT', // 호랑이 - 르네상스의 거장, 완벽주의
        secondary: 'SRRT', // 곰 - 육체적 노동과 끈기 (시스티나)
        tertiary: 'VSCM', // 용 - 신성한 주제의 숭고함
        reasoning: '완벽주의적 거장(호랑이), 육체적 인내(곰), 신성한 창조(용)'
      },
      'Jean-Michel Basquiat': {
        primary: 'DERT', // 치타 - 빠르고 강렬한 작품 활동
        secondary: 'VNRT', // 호랑이 - 사회적 메시지의 강렬함
        tertiary: 'DECM', // 원숭이 - 거리 예술의 자유로움
        reasoning: '폭발적 에너지(치타), 사회적 비판(호랑이), 자유로운 표현(원숭이)'
      },

      // Regional Importance (조회수 1000-2000)
      'Jackson Pollock': {
        primary: 'DERT', // 치타 - 액션 페인팅의 역동성
        secondary: 'VSCM', // 용 - 무의식의 표현
        tertiary: 'SRCM', // 늑대 - 추상표현주의 운동의 일원
        reasoning: '역동적 액션(치타), 무의식의 표현(용), 예술 운동 참여(늑대)'
      },
      'Georgia O\'Keeffe': {
        primary: 'HSCM', // 백조 - 자연의 우아한 확대
        secondary: 'SRMC', // 거북이 - 사막에서의 고독한 작업
        tertiary: 'VNRT', // 호랑이 - 여성 예술가로서의 선구자
        reasoning: '자연의 우아함(백조), 고독한 탐구(거북이), 선구자적 역할(호랑이)'
      },
      'Henri Matisse': {
        primary: 'HSRT', // 나비 - 색채의 아름다움과 조화
        secondary: 'HSCM', // 백조 - 우아하고 장식적인 스타일
        tertiary: 'VSRT', // 공작 - 야수파의 대담한 색채
        reasoning: '색채의 조화(나비), 우아한 단순화(백조), 대담한 표현(공작)'
      },

      // Specialized Interest (조회수 500-1000)
      'Wassily Kandinsky': {
        primary: 'VSCM', // 용 - 추상회화의 영적 차원
        secondary: 'SRMF', // 올빼미 - 이론가이자 교육자
        tertiary: 'HSRT', // 나비 - 음악과 색채의 공감각
        reasoning: '영적 추상(용), 이론적 탐구(올빼미), 공감각적 표현(나비)'
      },
      'Paul Klee': {
        primary: 'DECM', // 원숭이 - 어린아이같은 상상력
        secondary: 'SRMF', // 올빼미 - 바우하우스 교수, 이론가
        tertiary: 'HSRT', // 나비 - 섬세하고 시적인 표현
        reasoning: '순수한 상상력(원숭이), 이론적 깊이(올빼미), 시적 섬세함(나비)'
      },
      'Marcel Duchamp': {
        primary: 'DEMC', // 여우 - 개념미술의 영리한 전략
        secondary: 'VNRT', // 호랑이 - 예술 개념의 혁명가
        tertiary: 'SRMF', // 올빼미 - 지적이고 철학적 접근
        reasoning: '개념적 영리함(여우), 혁명적 사고(호랑이), 철학적 깊이(올빼미)'
      },

      // 한국 작가들
      'Nam June Paik': {
        primary: 'VNRT', // 호랑이 - 비디오 아트의 선구자
        secondary: 'DECM', // 원숭이 - 유머러스하고 실험적
        tertiary: 'HNRT', // 코끼리 - 동서양 문화의 가교
        reasoning: '미디어 아트 개척(호랑이), 유머와 실험(원숭이), 문화적 가교(코끼리)'
      },
      'Lee Ufan': {
        primary: 'SRMC', // 거북이 - 모노하의 철학적 깊이
        secondary: 'HSCM', // 백조 - 미니멀한 우아함
        tertiary: 'SRMF', // 올빼미 - 이론가이자 철학자
        reasoning: '철학적 사유(거북이), 미니멀한 조화(백조), 이론적 탐구(올빼미)'
      }
    };
  }

  // 데이터 기반 매칭 로직
  async matchArtistToApt(artistData) {
    const { name, dailyViews, languages } = artistData;
    
    // 사전 정의된 매칭이 있는 경우
    if (this.matchingRules[name]) {
      return this.matchingRules[name];
    }

    // 데이터 기반 자동 매칭
    return this.dataBasedMatching(artistData);
  }

  dataBasedMatching(artistData) {
    const { dailyViews, languages, categories = [] } = artistData;
    
    let primary, secondary, tertiary;
    let reasoning = '';

    // Global Icons (5000+ views)
    if (dailyViews > 5000) {
      primary = 'VNRT'; // 호랑이 - 글로벌 리더십
      secondary = languages > 200 ? 'VSCM' : 'VSRT'; // 용 또는 공작
      tertiary = 'HNRT'; // 코끼리 - 대중적 영향력
      reasoning = '글로벌 인지도와 영향력';
    }
    // International Masters (2000-5000 views)
    else if (dailyViews > 2000) {
      if (categories.some(cat => cat.includes('impressionist'))) {
        primary = 'HSRT'; // 나비
        secondary = 'HSCM'; // 백조
      } else if (categories.some(cat => cat.includes('baroque'))) {
        primary = 'SRRT'; // 곰
        secondary = 'VNRT'; // 호랑이
      } else {
        primary = 'VSRT'; // 공작
        secondary = 'VNRT'; // 호랑이
      }
      tertiary = languages > 100 ? 'VSCM' : 'DECM';
      reasoning = '국제적 명성과 예술적 영향력';
    }
    // Regional Importance (1000-2000 views)
    else if (dailyViews > 1000) {
      primary = languages > 80 ? 'HSRT' : 'SRRT';
      secondary = 'SRCM';
      tertiary = 'SRMF';
      reasoning = '지역적 중요성과 전문적 인정';
    }
    // Specialized Interest
    else {
      primary = 'SRMF'; // 올빼미 - 전문가 관심
      secondary = 'SRMC'; // 거북이 - 꾸준한 연구 대상
      tertiary = 'DEMC'; // 여우 - 틈새 시장
      reasoning = '전문 분야에서의 가치';
    }

    return { primary, secondary, tertiary, reasoning };
  }
}

// 실행 함수
async function createLogicalMatching() {
  console.log('🧠 논리적 APT 매칭 시스템 구축');
  console.log('='.repeat(70));

  try {
    // CSV 데이터 읽기
    const csvData = await fs.readFile('./major_artists_wiki_data.csv', 'utf-8');
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const artists = lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^,]+)/g) || [];
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] ? values[i].replace(/"/g, '') : '';
      });
      return obj;
    });

    const matcher = new LogicalAptMatcher();
    const results = [];

    console.log(`\n📊 ${artists.length}명의 작가 분석 시작\n`);

    for (const artist of artists) {
      const artistData = {
        name: artist['Name'],
        dailyViews: parseInt(artist['Daily Views']),
        languages: parseInt(artist['Languages']),
        pageSize: parseInt(artist['Page Size']),
        url: artist['URL']
      };

      const matching = await matcher.matchArtistToApt(artistData);
      
      results.push({
        ...artistData,
        ...matching,
        primaryName: APT_TYPES[matching.primary].name,
        secondaryName: APT_TYPES[matching.secondary].name,
        tertiaryName: APT_TYPES[matching.tertiary].name
      });

      console.log(`✅ ${artistData.name}`);
      console.log(`   조회수: ${artistData.dailyViews.toLocaleString()}회/일, 언어: ${artistData.languages}개`);
      console.log(`   1차: ${APT_TYPES[matching.primary].name} (${matching.primary})`);
      console.log(`   2차: ${APT_TYPES[matching.secondary].name} (${matching.secondary})`);
      console.log(`   3차: ${APT_TYPES[matching.tertiary].name} (${matching.tertiary})`);
      console.log(`   근거: ${matching.reasoning}\n`);
    }

    // 결과 저장
    const jsonOutput = {
      timestamp: new Date().toISOString(),
      totalArtists: results.length,
      matchingResults: results,
      aptDistribution: calculateDistribution(results)
    };

    await fs.writeFile(
      './logical_apt_matching_results.json',
      JSON.stringify(jsonOutput, null, 2)
    );

    console.log('\n💾 logical_apt_matching_results.json 파일로 저장 완료');

    // 분포 분석
    console.log('\n📈 APT 유형 분포 분석:');
    console.log('='.repeat(70));
    
    const distribution = jsonOutput.aptDistribution;
    Object.entries(distribution.primary).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`${APT_TYPES[type].name} (${type}): ${count}명`);
    });

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// APT 분포 계산
function calculateDistribution(results) {
  const distribution = {
    primary: {},
    secondary: {},
    tertiary: {}
  };

  results.forEach(result => {
    distribution.primary[result.primary] = (distribution.primary[result.primary] || 0) + 1;
    distribution.secondary[result.secondary] = (distribution.secondary[result.secondary] || 0) + 1;
    distribution.tertiary[result.tertiary] = (distribution.tertiary[result.tertiary] || 0) + 1;
  });

  return distribution;
}

// 실행
createLogicalMatching().catch(console.error);