// 주요 현대 작가 Wiki 데이터 수집
require('dotenv').config();
const fs = require('fs');
const path = require('path');

class MajorArtistsCollector {
  constructor() {
    this.outputFile = path.join(__dirname, 'major_artists_wiki_data.csv');
  }

  // 2단계 대상: 중요 현대 작가 200명 리스트
  getMajorContemporaryArtists() {
    return {
      // 20세기 후반 거장들 (1950-2000년대)
      lateModernMasters: [
        'Cy Twombly', 'Robert Rauschenberg', 'Jasper Johns', 'Roy Lichtenstein',
        'David Hockney', 'Lucian Freud', 'Francis Bacon', 'Gerhard Richter',
        'Anselm Kiefer', 'Georg Baselitz', 'Sigmar Polke', 'Martin Kippenberger',
        'Jean-Michel Basquiat', 'Keith Haring', 'Barbara Kruger', 'Cindy Sherman',
        'Jeff Koons', 'Damien Hirst', 'Tracey Emin', 'Yves Klein', 'Piero Manzoni'
      ],

      // 동시대 미술 스타들 (1970년대 이후 출생)
      contemporaryStars: [
        'Kaws', 'Takashi Murakami', 'Yoshitomo Nara', 'Yayoi Kusama',
        'Ai Weiwei', 'Zhang Xiaogang', 'Liu Wei', 'Zeng Fanzhi',
        'Kehinde Wiley', 'Kerry James Marshall', 'Kara Walker', 'Amy Sherald',
        'Banksy', 'Shepard Fairey', 'JR', 'Invader',
        'Olafur Eliasson', 'Anish Kapoor', 'Tino Sehgal', 'Felix Gonzalez-Torres'
      ],

      // 유럽 현대미술
      europeanContemporary: [
        'Marlene Dumas', 'Luc Tuymans', 'Neo Rauch', 'Peter Doig',
        'Chris Ofili', 'Rachel Whiteread', 'Antony Gormley', 'Marc Quinn',
        'Thomas Struth', 'Andreas Gursky', 'Wolfgang Tillmans', 'Candida Höfer',
        'Pierre Huyghe', 'Philippe Parreno', 'Xavier Veilhan', 'Thomas Hirschhorn'
      ],

      // 아시아 현대미술
      asianContemporary: [
        'Do Ho Suh', 'Lee Ufan', 'Park Seo-bo', 'Ha Chong-hyun', 'Yun Hyong-keun',
        'Bharti Kher', 'Subodh Gupta', 'Anselm Reyle', 'Ryan Gander',
        'Rirkrit Tiravanija', 'Apichatpong Weerasethakul', 'Montien Boonma'
      ],

      // 라틴아메리카 현대미술
      latinAmericanContemporary: [
        'Gabriel Orozco', 'Carlos Amorales', 'Teresa Margolles', 'Santiago Sierra',
        'Doris Salcedo', 'Beatriz Milhazes', 'Vik Muniz', 'Cildo Meireles',
        'Felix Gonzalez-Torres', 'Ana Mendieta', 'Tania Bruguera', 'Wilfredo Lam'
      ],

      // 아프리카 현대미술
      africanContemporary: [
        'El Anatsui', 'Yinka Shonibare', 'Marlene Dumas', 'William Kentridge',
        'David Goldblatt', 'Zwelethu Mthethwa', 'Nicholas Hlobo', 'Mary Sibande',
        'Hassan Hajjaj', 'Lalla Essaydi', 'Chéri Samba', 'Barthélémy Toguo'
      ],

      // 여성 아티스트 (역사적으로 과소평가된)
      femalePioneers: [
        'Louise Bourgeois', 'Agnes Martin', 'Eva Hesse', 'Lee Krasner',
        'Helen Frankenthaler', 'Bridget Riley', 'Yoko Ono', 'Carolee Schneemann',
        'Judy Chicago', 'Miriam Schapiro', 'Nancy Spero', 'Joan Jonas',
        'Martha Rosler', 'Adrian Piper', 'Laurie Anderson', 'Jenny Holzer'
      ],

      // 디지털/뉴미디어 아티스트
      digitalPioneers: [
        'Bill Viola', 'Gary Hill', 'Tony Oursler', 'Isaac Julien',
        'Pipilotti Rist', 'Cao Fei', 'Lu Yang', 'Ian Cheng',
        'Memo Akten', 'Stephanie Dinkins', 'Sarah Meyohas', 'Sondra Perry'
      ],

      // 사진 작가들
      photographers: [
        'Diane Arbus', 'Richard Avedon', 'Helmut Newton', 'Guy Bourdin',
        'Vivian Maier', 'Sally Mann', 'Nan Goldin', 'Wolfgang Tillmans',
        'Gregory Crewdson', 'Jeff Wall', 'Thomas Demand', 'Hiroshi Sugimoto'
      ]
    };
  }

  // 카테고리별 중요도 가중치
  getCategoryWeights() {
    return {
      lateModernMasters: 92,      // 검증된 거장들
      contemporaryStars: 88,      // 현재 주요 작가들
      europeanContemporary: 85,   // 유럽 현대미술
      asianContemporary: 86,      // 아시아 현대미술 (문화적 다양성 가산점)
      latinAmericanContemporary: 84, // 라틴아메리카
      africanContemporary: 83,    // 아프리카 현대미술
      femalePioneers: 87,         // 여성 작가 (역사적 재평가)
      digitalPioneers: 81,        // 뉴미디어 (새로운 영역)
      photographers: 82           // 사진 예술
    };
  }

  async generatePriorityList() {
    try {
      console.log('🎨 2단계 중요 현대 작가 우선순위 리스트 생성');
      console.log('='.repeat(80));

      const artistCategories = this.getMajorContemporaryArtists();
      const categoryWeights = this.getCategoryWeights();

      const priorityList = [];

      // 카테고리별로 작가 리스트 생성
      Object.entries(artistCategories).forEach(([category, artists]) => {
        const baseImportance = categoryWeights[category];

        artists.forEach((artist, index) => {
          // 카테고리 내 순서에 따른 미세 조정 (-2점 범위)
          const finalImportance = baseImportance - (index * 0.1);

          priorityList.push({
            name: artist,
            category,
            estimated_importance: Math.round(finalImportance * 10) / 10,
            priority_tier: this.calculatePriorityTier(finalImportance),
            cultural_significance: this.assessCulturalSignificance(artist, category),
            data_availability: 'to_be_assessed'
          });
        });
      });

      // 중요도순 정렬
      priorityList.sort((a, b) => b.estimated_importance - a.estimated_importance);

      // 상위 200명 선택
      const top200 = priorityList.slice(0, 200);

      // CSV 형태로 저장
      const csvHeader = 'rank,name,category,estimated_importance,priority_tier,cultural_significance,data_availability\n';
      const csvContent = top200.map((artist, index) =>
        `${index + 1},"${artist.name}","${artist.category}",${artist.estimated_importance},"${artist.priority_tier}","${artist.cultural_significance}","${artist.data_availability}"`
      ).join('\n');

      fs.writeFileSync(this.outputFile, csvHeader + csvContent);

      // 카테고리별 통계
      console.log('\n📊 카테고리별 선정 현황:');
      const categoryStats = {};
      top200.forEach(artist => {
        categoryStats[artist.category] = (categoryStats[artist.category] || 0) + 1;
      });

      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`${category}: ${count}명`);
      });

      // 지역별 다양성 체크
      console.log('\n🌍 문화적 다양성 체크:');
      const culturalStats = {};
      top200.forEach(artist => {
        culturalStats[artist.cultural_significance] = (culturalStats[artist.cultural_significance] || 0) + 1;
      });

      Object.entries(culturalStats).forEach(([region, count]) => {
        console.log(`${region}: ${count}명`);
      });

      console.log(`\n✅ 상위 200명 우선순위 리스트 생성 완료`);
      console.log(`📄 파일 저장: ${this.outputFile}`);

      return top200;

    } catch (error) {
      console.error('우선순위 리스트 생성 실패:', error);
      return null;
    }
  }

  calculatePriorityTier(importance) {
    if (importance >= 90) return 'Tier_1_Essential';
    if (importance >= 85) return 'Tier_2_Important';
    if (importance >= 80) return 'Tier_3_Significant';
    return 'Tier_4_Emerging';
  }

  assessCulturalSignificance(artistName, category) {
    // 카테고리 기반으로 문화권 추정
    const culturalMapping = {
      asianContemporary: 'Asian_Contemporary',
      latinAmericanContemporary: 'Latin_American',
      africanContemporary: 'African_Contemporary',
      europeanContemporary: 'European_Contemporary',
      femalePioneers: 'Gender_Diversity',
      digitalPioneers: 'Digital_Native',
      photographers: 'Photography_Medium',
      lateModernMasters: 'Western_Canon',
      contemporaryStars: 'Global_Contemporary'
    };

    return culturalMapping[category] || 'Global_Contemporary';
  }
}

async function main() {
  const collector = new MajorArtistsCollector();
  await collector.generatePriorityList();
}

main();
