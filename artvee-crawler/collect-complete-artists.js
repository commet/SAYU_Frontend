const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

/**
 * Artvee 특정 작가들의 모든 작품 수집
 */
class CompleteArtistCollector {
  constructor() {
    this.baseUrl = 'https://artvee.com';
    this.delay = 2000; // 요청 간 2초 대기
    this.pageDelay = 3000; // 페이지 간 3초 대기
    
    // 수집할 주요 작가들 (슬러그, 예상 작품 수)
    this.targetArtists = [
      { slug: 'alphonse-mucha', name: 'Alphonse Mucha', expectedCount: 200 },
      { slug: 'henri-matisse', name: 'Henri Matisse', expectedCount: 180 },
      { slug: 'vincent-van-gogh', name: 'Vincent van Gogh', expectedCount: 283 },
      { slug: 'edvard-munch', name: 'Edvard Munch', expectedCount: 472 },
      { slug: 'john-singer-sargent', name: 'John Singer Sargent', expectedCount: 648 },
      // 추가 유명 작가들
      { slug: 'claude-monet', name: 'Claude Monet', expectedCount: 300 },
      { slug: 'pierre-auguste-renoir', name: 'Pierre-Auguste Renoir', expectedCount: 400 },
      { slug: 'paul-cezanne', name: 'Paul Cézanne', expectedCount: 250 },
      { slug: 'gustav-klimt', name: 'Gustav Klimt', expectedCount: 150 },
      { slug: 'johannes-vermeer', name: 'Johannes Vermeer', expectedCount: 40 },
      { slug: 'rembrandt-van-rijn', name: 'Rembrandt van Rijn', expectedCount: 350 },
      { slug: 'leonardo-da-vinci', name: 'Leonardo da Vinci', expectedCount: 100 },
      { slug: 'michelangelo', name: 'Michelangelo', expectedCount: 150 },
      { slug: 'raphael', name: 'Raphael', expectedCount: 120 },
      { slug: 'sandro-botticelli', name: 'Sandro Botticelli', expectedCount: 100 },
      { slug: 'pablo-picasso', name: 'Pablo Picasso', expectedCount: 500 },
      { slug: 'salvador-dali', name: 'Salvador Dalí', expectedCount: 300 },
      { slug: 'wassily-kandinsky', name: 'Wassily Kandinsky', expectedCount: 200 },
      { slug: 'paul-klee', name: 'Paul Klee', expectedCount: 250 },
      { slug: 'marc-chagall', name: 'Marc Chagall', expectedCount: 300 }
    ];
    
    this.collectedArtworks = [];
    this.stats = {
      total: 0,
      byArtist: {}
    };
  }

  async init() {
    const dataDir = path.join(__dirname, 'data');
    if (!existsSync(dataDir)) {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // 진행 상황 파일 로드
    const progressFile = path.join(dataDir, 'collection-progress.json');
    if (existsSync(progressFile)) {
      try {
        const data = await fs.readFile(progressFile, 'utf8');
        const progress = JSON.parse(data);
        this.collectedArtworks = progress.artworks || [];
        this.stats = progress.stats || { total: 0, byArtist: {} };
        console.log(`📂 이전 진행 상황 로드: ${this.collectedArtworks.length}개 작품`);
      } catch (e) {
        console.log('📂 새로운 수집 시작');
      }
    }
  }

  /**
   * 모든 대상 작가들의 작품 수집
   */
  async collectAll() {
    console.log('🎨 Artvee 주요 작가 전체 작품 수집 시작\n');
    console.log(`📋 수집 대상: ${this.targetArtists.length}명의 작가\n`);
    
    await this.init();
    
    for (const artist of this.targetArtists) {
      console.log('\n' + '='.repeat(60));
      console.log(`🎯 ${artist.name} (${artist.slug})`);
      console.log(`   예상 작품 수: ${artist.expectedCount}개`);
      console.log('='.repeat(60));
      
      try {
        const artworks = await this.collectArtistComplete(artist);
        console.log(`✅ ${artist.name}: ${artworks.length}개 작품 수집 완료`);
        
        // 진행 상황 저장
        await this.saveProgress();
        
      } catch (error) {
        console.error(`❌ ${artist.name} 수집 실패: ${error.message}`);
      }
      
      // 작가 간 대기
      await this.sleep(this.pageDelay);
    }
    
    // 최종 결과 저장
    await this.saveFinalResults();
    this.printStats();
  }

  /**
   * 특정 작가의 모든 작품 수집
   */
  async collectArtistComplete(artistInfo) {
    const { slug, name } = artistInfo;
    const collectedForArtist = [];
    let page = 1;
    let hasMore = true;
    
    // 이미 수집된 작품 확인
    const existingIds = new Set(
      this.collectedArtworks
        .filter(a => a.artistSlug === slug)
        .map(a => a.artveeId)
    );
    
    if (existingIds.size > 0) {
      console.log(`   📦 기존 수집: ${existingIds.size}개`);
    }
    
    while (hasMore) {
      try {
        const url = page === 1 
          ? `${this.baseUrl}/artist/${slug}/`
          : `${this.baseUrl}/artist/${slug}/page/${page}/`;
        
        console.log(`   📄 페이지 ${page} 처리 중...`);
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 30000
        });
        
        const $ = cheerio.load(response.data);
        
        // 작품 수집
        const pageArtworks = [];
        $('.product').each((i, el) => {
          const $item = $(el);
          const $link = $item.find('a').first();
          const $img = $item.find('img').first();
          
          if ($link.length) {
            const artworkUrl = $link.attr('href');
            const artveeId = this.extractId(artworkUrl);
            
            // 이미 수집된 작품은 스킵
            if (existingIds.has(artveeId)) {
              return;
            }
            
            const artwork = {
              url: artworkUrl,
              artist: name,
              artistSlug: slug,
              title: $img.attr('alt') || $img.attr('title') || 'Untitled',
              thumbnail: $img.attr('src') || $img.attr('data-src'),
              artveeId: artveeId,
              collectedAt: new Date().toISOString()
            };
            
            pageArtworks.push(artwork);
            collectedForArtist.push(artwork);
            this.collectedArtworks.push(artwork);
          }
        });
        
        console.log(`      ✓ ${pageArtworks.length}개 작품 발견`);
        
        // 다음 페이지 확인
        const hasNextPage = $('.woocommerce-pagination .next').length > 0 || 
                           $('a[href*="/page/' + (page + 1) + '/"]').length > 0;
        
        if (!hasNextPage || pageArtworks.length === 0) {
          hasMore = false;
        } else {
          page++;
          await this.sleep(this.delay);
        }
        
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   📄 페이지 ${page}: 더 이상 페이지 없음`);
          hasMore = false;
        } else {
          console.error(`   ❌ 페이지 ${page} 오류: ${error.message}`);
          // 오류 발생 시 재시도
          if (page === 1) {
            throw error; // 첫 페이지 실패 시 작가 스킵
          }
          hasMore = false;
        }
      }
    }
    
    // 통계 업데이트
    this.stats.byArtist[slug] = collectedForArtist.length;
    this.stats.total = this.collectedArtworks.length;
    
    return collectedForArtist;
  }

  /**
   * 진행 상황 저장
   */
  async saveProgress() {
    const dataDir = path.join(__dirname, 'data');
    const progressFile = path.join(dataDir, 'collection-progress.json');
    
    await fs.writeFile(progressFile, JSON.stringify({
      artworks: this.collectedArtworks,
      stats: this.stats,
      lastUpdate: new Date().toISOString()
    }, null, 2));
  }

  /**
   * 최종 결과 저장
   */
  async saveFinalResults() {
    const dataDir = path.join(__dirname, 'data');
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    
    // 전체 데이터 저장
    const fullFile = path.join(dataDir, `complete-artists-collection-${timestamp}.json`);
    await fs.writeFile(fullFile, JSON.stringify(this.collectedArtworks, null, 2));
    
    // URL 목록만 저장
    const urls = this.collectedArtworks.map(a => a.url);
    const urlsFile = path.join(dataDir, `complete-artists-urls-${timestamp}.json`);
    await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2));
    
    // CSV 저장
    const csvContent = [
      'url,artist,artistSlug,title,artveeId,thumbnail',
      ...this.collectedArtworks.map(a => 
        `"${a.url}","${a.artist}","${a.artistSlug}","${a.title}","${a.artveeId}","${a.thumbnail || ''}"`
      )
    ].join('\n');
    
    const csvFile = path.join(dataDir, `complete-artists-collection-${timestamp}.csv`);
    await fs.writeFile(csvFile, csvContent);
    
    console.log(`\n📁 결과 저장됨:`);
    console.log(`   - ${fullFile}`);
    console.log(`   - ${urlsFile}`);
    console.log(`   - ${csvFile}`);
  }

  /**
   * 통계 출력
   */
  printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 수집 완료 통계');
    console.log('='.repeat(60));
    console.log(`총 작품 수: ${this.stats.total}개\n`);
    
    console.log('작가별 수집 현황:');
    for (const artist of this.targetArtists) {
      const count = this.stats.byArtist[artist.slug] || 0;
      const expected = artist.expectedCount;
      const percentage = ((count / expected) * 100).toFixed(1);
      const status = count >= expected * 0.8 ? '✅' : '⚠️';
      
      console.log(`  ${status} ${artist.name}: ${count}/${expected} (${percentage}%)`);
    }
    
    console.log('='.repeat(60));
  }

  extractId(url) {
    if (!url) return null;
    const match = url.match(/\/dl\/([^\/]+)\//);
    return match ? match[1] : url.split('/').filter(s => s).pop();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const collector = new CompleteArtistCollector();
  await collector.collectAll();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CompleteArtistCollector;