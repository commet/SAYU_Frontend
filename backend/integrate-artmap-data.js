const fs = require('fs').promises;
const path = require('path');

class ArtmapSayuIntegrator {
  constructor() {
    this.processedExhibitions = [];
    this.duplicates = [];
    this.validationErrors = [];
  }

  // 최신 Artmap 데이터 파일 찾기
  async findLatestArtmapData() {
    try {
      const files = await fs.readdir(__dirname);
      const artmapFiles = files.filter(file => 
        file.startsWith('artmap-sayu-format-') && file.endsWith('.json')
      );
      
      if (artmapFiles.length === 0) {
        throw new Error('Artmap 데이터 파일을 찾을 수 없습니다.');
      }
      
      // 가장 최신 파일 선택
      artmapFiles.sort((a, b) => b.localeCompare(a));
      const latestFile = artmapFiles[0];
      
      console.log(`📁 최신 데이터 파일: ${latestFile}`);
      return path.join(__dirname, latestFile);
    } catch (error) {
      console.error('❌ 데이터 파일 검색 실패:', error.message);
      throw error;
    }
  }

  // Artmap 데이터 로드
  async loadArtmapData(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const exhibitions = JSON.parse(data);
      
      console.log(`📊 ${exhibitions.length}개 전시 데이터 로드 완료`);
      return exhibitions;
    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error.message);
      throw error;
    }
  }

  // 데이터 검증
  validateExhibition(exhibition) {
    const errors = [];
    
    // 필수 필드 검증
    if (!exhibition.title) {
      errors.push('제목 누락');
    }
    
    if (!exhibition.period || !exhibition.period.text) {
      errors.push('전시 기간 누락');
    }
    
    if (!exhibition.artists || exhibition.artists.length === 0) {
      errors.push('작가 정보 누락 (추후 보완 필요)');
    }
    
    // 날짜 형식 검증
    if (exhibition.period && exhibition.period.text) {
      const datePattern = /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\w+)\s+-\s+\d{1,2}/;
      if (!datePattern.test(exhibition.period.text)) {
        errors.push('날짜 형식 비표준');
      }
    }
    
    return errors;
  }

  // 중복 검사
  checkDuplicates(exhibitions) {
    const seen = new Set();
    const duplicates = [];
    
    exhibitions.forEach((exhibition, index) => {
      const key = `${exhibition.title}_${exhibition.period.text}`;
      
      if (seen.has(key)) {
        duplicates.push({
          index,
          title: exhibition.title,
          period: exhibition.period.text,
          reason: 'title_period_duplicate'
        });
      } else {
        seen.add(key);
      }
    });
    
    return duplicates;
  }

  // SAYU 데이터베이스 포맷으로 최종 변환
  convertToSayuDbFormat(exhibition) {
    // 날짜 파싱 시도
    const parsedPeriod = this.parsePeriod(exhibition.period.text);
    
    return {
      // 기본 정보
      title: exhibition.title,
      title_en: exhibition.titleEn || exhibition.title,
      description: exhibition.description,
      
      // 전시 기간
      start_date: parsedPeriod.startDate,
      end_date: parsedPeriod.endDate,
      period_text: exhibition.period.text,
      
      // 장소 정보
      venue_name: exhibition.venue.name !== 'N/A' ? exhibition.venue.name : null,
      venue_location: exhibition.venue.location !== 'N/A' ? exhibition.venue.location : null,
      venue_country: exhibition.venue.country !== 'Unknown' ? exhibition.venue.country : null,
      
      // 작가 정보
      artists: exhibition.artists.length > 0 ? exhibition.artists : null,
      primary_artist: exhibition.artists.length > 0 ? exhibition.artists[0] : null,
      
      // 카테고리 & 태그
      category: exhibition.category,
      art_movement: exhibition.artMovement,
      region: exhibition.region,
      emotion_tags: exhibition.emotionTags,
      
      // 부가 정보
      price_range: exhibition.priceRange,
      is_active: exhibition.isActive,
      images: exhibition.images.length > 0 ? exhibition.images : null,
      
      // 메타데이터
      source: exhibition.source,
      source_url: exhibition.sourceUrl,
      extracted_at: exhibition.extractedAt,
      integrated_at: new Date().toISOString(),
      
      // SAYU 특화 필드
      accessibility_wheelchair: exhibition.accessibility.wheelchair,
      accessibility_parking: exhibition.accessibility.parking,
      accessibility_public_transport: exhibition.accessibility.publicTransport,
      
      // 추천 시스템용 필드
      recommendation_score: null, // 추후 계산
      popularity_score: null, // 추후 계산
      user_ratings: null, // 추후 수집
      
      // 상태 필드
      data_quality: this.assessDataQuality(exhibition),
      needs_manual_review: this.needsManualReview(exhibition),
      
      // 검색 최적화
      search_keywords: this.generateSearchKeywords(exhibition)
    };
  }

  // 날짜 파싱
  parsePeriod(periodText) {
    try {
      // "11 Jul - 13 Oct 2025" 형식 파싱
      const match = periodText.match(/(\d{1,2})\s+(\w+)\s+-\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);
      
      if (match) {
        const [, startDay, startMonth, endDay, endMonth, year] = match;
        
        const monthMap = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        const startDate = `${year}-${monthMap[startMonth]}-${startDay.padStart(2, '0')}`;
        const endDate = `${year}-${monthMap[endMonth]}-${endDay.padStart(2, '0')}`;
        
        return { startDate, endDate };
      }
    } catch (error) {
      console.log(`⚠️ 날짜 파싱 실패: ${periodText}`);
    }
    
    return { startDate: null, endDate: null };
  }

  // 데이터 품질 평가
  assessDataQuality(exhibition) {
    let score = 0;
    
    // 필수 정보 존재 (50점)
    if (exhibition.title) score += 20;
    if (exhibition.period.text) score += 15;
    if (exhibition.artists.length > 0) score += 15;
    
    // 부가 정보 존재 (30점)
    if (exhibition.venue.name !== 'N/A') score += 10;
    if (exhibition.venue.location !== 'N/A') score += 10;
    if (exhibition.images.length > 0) score += 10;
    
    // 태그 및 설명 (20점)
    if (exhibition.emotionTags.length > 2) score += 10;
    if (exhibition.description.length > 50) score += 10;
    
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  // 수동 검토 필요 여부
  needsManualReview(exhibition) {
    return exhibition.venue.name === 'N/A' || 
           exhibition.venue.location === 'N/A' ||
           exhibition.images.length === 0;
  }

  // 검색 키워드 생성
  generateSearchKeywords(exhibition) {
    const keywords = [];
    
    // 제목에서 키워드 추출
    keywords.push(...exhibition.title.toLowerCase().split(/\s+/));
    
    // 작가명
    if (exhibition.artists.length > 0) {
      keywords.push(...exhibition.artists.join(' ').toLowerCase().split(/\s+/));
    }
    
    // 감정 태그
    keywords.push(...exhibition.emotionTags);
    
    // 장소 정보
    if (exhibition.venue.location !== 'N/A') {
      keywords.push(exhibition.venue.location.toLowerCase());
    }
    
    // 중복 제거 및 정리
    return [...new Set(keywords)].filter(k => k.length > 2);
  }

  // 메인 통합 프로세스
  async integrate() {
    console.log('🚀 Artmap 데이터 SAYU 통합 시작');
    console.log('');
    
    try {
      // 1. 최신 데이터 파일 찾기
      const dataFilePath = await this.findLatestArtmapData();
      
      // 2. 데이터 로드
      const exhibitions = await this.loadArtmapData(dataFilePath);
      
      // 3. 데이터 검증
      console.log('🔍 데이터 검증 중...');
      exhibitions.forEach((exhibition, index) => {
        const errors = this.validateExhibition(exhibition);
        if (errors.length > 0) {
          this.validationErrors.push({
            index,
            title: exhibition.title,
            errors
          });
        }
      });
      
      // 4. 중복 검사
      console.log('🔍 중복 검사 중...');
      this.duplicates = this.checkDuplicates(exhibitions);
      
      // 5. SAYU DB 포맷으로 변환
      console.log('🔄 SAYU 데이터베이스 포맷으로 변환 중...');
      this.processedExhibitions = exhibitions.map(exhibition => 
        this.convertToSayuDbFormat(exhibition)
      );
      
      // 6. 결과 저장
      await this.saveIntegratedData();
      
      // 7. 통합 리포트 생성
      await this.generateIntegrationReport();
      
      console.log('\n🎯 통합 완료!');
      console.log(`✅ 처리된 전시: ${this.processedExhibitions.length}개`);
      console.log(`⚠️ 검증 오류: ${this.validationErrors.length}개`);
      console.log(`🔁 중복 발견: ${this.duplicates.length}개`);
      
      return {
        processedExhibitions: this.processedExhibitions,
        validationErrors: this.validationErrors,
        duplicates: this.duplicates
      };
      
    } catch (error) {
      console.error('❌ 통합 프로세스 실패:', error.message);
      throw error;
    }
  }

  // 통합된 데이터 저장
  async saveIntegratedData() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // SAYU DB 준비 데이터 저장
      const dbReadyFile = path.join(__dirname, `sayu-db-ready-${timestamp}.json`);
      await fs.writeFile(dbReadyFile, JSON.stringify(this.processedExhibitions, null, 2), 'utf8');
      console.log(`💾 DB 준비 데이터 저장: ${dbReadyFile}`);
      
      // SQL INSERT 문 생성
      const sqlFile = path.join(__dirname, `sayu-exhibitions-insert-${timestamp}.sql`);
      const sqlContent = this.generateSQLInserts();
      await fs.writeFile(sqlFile, sqlContent, 'utf8');
      console.log(`📝 SQL INSERT 문 저장: ${sqlFile}`);
      
    } catch (error) {
      console.error('❌ 데이터 저장 실패:', error.message);
    }
  }

  // SQL INSERT 문 생성
  generateSQLInserts() {
    const tableName = 'exhibitions'; // SAYU 전시 테이블명
    
    let sql = `-- Artmap.com 전시 데이터 INSERT 문\n`;
    sql += `-- 생성일: ${new Date().toISOString()}\n`;
    sql += `-- 총 ${this.processedExhibitions.length}개 전시\n\n`;
    
    this.processedExhibitions.forEach((exhibition, index) => {
      sql += `-- ${index + 1}. ${exhibition.title}\n`;
      sql += `INSERT INTO ${tableName} (\n`;
      sql += `  title, title_en, description, start_date, end_date, period_text,\n`;
      sql += `  venue_name, venue_location, venue_country, artists, primary_artist,\n`;
      sql += `  category, art_movement, region, emotion_tags, price_range, is_active,\n`;
      sql += `  images, source, source_url, extracted_at, integrated_at,\n`;
      sql += `  accessibility_wheelchair, accessibility_parking, accessibility_public_transport,\n`;
      sql += `  data_quality, needs_manual_review, search_keywords\n`;
      sql += `) VALUES (\n`;
      sql += `  ${this.escapeSqlValue(exhibition.title)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.title_en)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.description)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.start_date)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.end_date)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.period_text)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.venue_name)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.venue_location)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.venue_country)},\n`;
      sql += `  ${this.escapeSqlArray(exhibition.artists)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.primary_artist)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.category)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.art_movement)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.region)},\n`;
      sql += `  ${this.escapeSqlArray(exhibition.emotion_tags)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.price_range)},\n`;
      sql += `  ${exhibition.is_active},\n`;
      sql += `  ${this.escapeSqlArray(exhibition.images)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.source)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.source_url)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.extracted_at)},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.integrated_at)},\n`;
      sql += `  ${exhibition.accessibility_wheelchair},\n`;
      sql += `  ${exhibition.accessibility_parking},\n`;
      sql += `  ${exhibition.accessibility_public_transport},\n`;
      sql += `  ${this.escapeSqlValue(exhibition.data_quality)},\n`;
      sql += `  ${exhibition.needs_manual_review},\n`;
      sql += `  ${this.escapeSqlArray(exhibition.search_keywords)}\n`;
      sql += `);\n\n`;
    });
    
    return sql;
  }

  // SQL 값 이스케이프
  escapeSqlValue(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  // SQL 배열 이스케이프 (PostgreSQL 배열 형식)
  escapeSqlArray(array) {
    if (!array || array.length === 0) {
      return 'NULL';
    }
    const escapedItems = array.map(item => `"${String(item).replace(/"/g, '\\"')}"`);
    return `'{${escapedItems.join(',')}}'`;
  }

  // 통합 리포트 생성
  async generateIntegrationReport() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      const report = {
        timestamp: new Date().toISOString(),
        source: 'artmap.com',
        integrationType: 'sayu_database_integration',
        summary: {
          totalProcessed: this.processedExhibitions.length,
          totalErrors: this.validationErrors.length,
          totalDuplicates: this.duplicates.length,
          dataQualityDistribution: this.getDataQualityDistribution(),
          manualReviewRequired: this.processedExhibitions.filter(e => e.needs_manual_review).length
        },
        validationErrors: this.validationErrors,
        duplicates: this.duplicates,
        recommendations: this.generateRecommendations(),
        nextSteps: [
          'SQL 파일을 사용하여 데이터베이스에 삽입',
          '수동 검토가 필요한 전시 정보 보완',
          '이미지 URL 검증 및 로컬 저장',
          '추천 시스템에서 활용할 수 있도록 메타데이터 보강'
        ]
      };
      
      const reportFile = path.join(__dirname, `artmap-integration-report-${timestamp}.json`);
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf8');
      console.log(`📊 통합 리포트 저장: ${reportFile}`);
      
    } catch (error) {
      console.error('❌ 리포트 생성 실패:', error.message);
    }
  }

  // 데이터 품질 분포 계산
  getDataQualityDistribution() {
    const distribution = { high: 0, medium: 0, low: 0 };
    
    this.processedExhibitions.forEach(exhibition => {
      distribution[exhibition.data_quality]++;
    });
    
    return distribution;
  }

  // 권장사항 생성
  generateRecommendations() {
    const recommendations = [];
    
    if (this.validationErrors.length > 0) {
      recommendations.push('일부 전시의 필수 정보가 누락되어 있습니다. 추가 데이터 수집이 필요합니다.');
    }
    
    if (this.duplicates.length > 0) {
      recommendations.push('중복된 전시 데이터가 발견되었습니다. 중복 제거 후 통합하세요.');
    }
    
    const lowQualityCount = this.processedExhibitions.filter(e => e.data_quality === 'low').length;
    if (lowQualityCount > 0) {
      recommendations.push(`${lowQualityCount}개 전시의 데이터 품질이 낮습니다. 정보 보완이 필요합니다.`);
    }
    
    const noImagesCount = this.processedExhibitions.filter(e => !e.images || e.images.length === 0).length;
    if (noImagesCount > 0) {
      recommendations.push(`${noImagesCount}개 전시의 이미지가 없습니다. 시각적 콘텐츠 추가가 필요합니다.`);
    }
    
    recommendations.push('모든 전시에 대해 감정 분석을 실행하여 SAYU 성격 매칭 시스템과 연동하세요.');
    recommendations.push('사용자 리뷰 및 평점 수집 시스템을 구축하여 추천 정확도를 향상시키세요.');
    
    return recommendations;
  }
}

// 메인 실행 함수
async function main() {
  console.log('🎯 Artmap → SAYU 데이터 통합 시스템');
  console.log('수집된 Artmap 데이터를 SAYU 데이터베이스 형식으로 변환합니다.');
  console.log('');
  
  const integrator = new ArtmapSayuIntegrator();
  
  try {
    await integrator.integrate();
    console.log('\n✅ 통합 프로세스 완료!');
    console.log('생성된 파일들을 확인하여 다음 단계를 진행하세요.');
  } catch (error) {
    console.error('\n❌ 통합 프로세스 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main();
}

module.exports = ArtmapSayuIntegrator;