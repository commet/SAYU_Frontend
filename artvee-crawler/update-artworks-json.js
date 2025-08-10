const fs = require('fs').promises;
const path = require('path');

/**
 * 업로드된 Artvee 작품들을 artworks.json에 업데이트
 */
class ArtworksUpdater {
  constructor() {
    this.progressFile = path.join(__dirname, 'images-complete', 'upload-progress.json');
    this.collectionFile = path.join(__dirname, 'data', 'complete-artists-collection-2025-08-06T14-24-00.json');
    this.artworksFile = path.join(__dirname, '..', 'frontend', 'public', 'data', 'artworks.json');
  }

  async updateArtworksJson() {
    console.log('🎨 artworks.json 업데이트 시작\n');

    try {
      // 1. 기존 artworks.json 로드
      console.log('📂 기존 artworks.json 로드...');
      const artworksData = await this.loadJson(this.artworksFile);
      const existingArtworks = artworksData.artworks || [];
      console.log(`✅ 기존 작품 수: ${existingArtworks.length}개`);

      // 2. 업로드 진행 상황 로드
      console.log('\n📊 업로드 진행 상황 로드...');
      const uploadProgress = await this.loadJson(this.progressFile);
      const uploadedCount = Object.keys(uploadProgress).length;
      console.log(`✅ 업로드된 작품 수: ${uploadedCount}개`);

      // 3. 수집된 작품 데이터 로드
      console.log('\n📚 수집된 작품 데이터 로드...');
      const collectedArtworks = await this.loadJson(this.collectionFile);
      console.log(`✅ 수집된 작품 수: ${collectedArtworks.length}개`);

      // 4. 새로운 작품들 생성
      console.log('\n🔄 새로운 작품 데이터 생성...');
      const newArtworks = [];
      let successCount = 0;
      let skippedCount = 0;

      for (const artwork of collectedArtworks) {
        const artveeId = artwork.artveeId;
        const uploadData = uploadProgress[artveeId];

        if (uploadData && uploadData.uploaded && uploadData.cloudinary_url) {
          // 이미 존재하는지 확인 (URL 기준)
          const exists = existingArtworks.some(existing => 
            existing.image_url === uploadData.cloudinary_url ||
            existing.title === artwork.title && existing.artist === artwork.artist
          );

          if (!exists) {
            const newArtwork = {
              id: `artvee-${artveeId}`,
              title: artwork.title || 'Untitled',
              artist: artwork.artist,
              year: uploadData.year || '',
              description: this.cleanDescription(uploadData.description || ''),
              image_url: uploadData.cloudinary_url,
              thumbnail_url: uploadData.cloudinary_thumb_url || uploadData.cloudinary_url,
              medium: 'Painting',
              dimensions: '',
              location: '',
              source: 'Artvee',
              source_url: artwork.url,
              tags: this.generateTags(artwork.artist, artwork.title),
              color_palette: [],
              style: this.determineStyle(artwork.artist),
              movement: this.determineMovement(artwork.artist),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            newArtworks.push(newArtwork);
            successCount++;
          } else {
            skippedCount++;
          }
        }
      }

      console.log(`✅ 새로운 작품: ${successCount}개`);
      console.log(`⏭️ 중복 스킵: ${skippedCount}개`);

      // 5. 기존 작품들과 병합
      console.log('\n🔀 작품 데이터 병합...');
      const updatedArtworks = [...existingArtworks, ...newArtworks];
      console.log(`📊 최종 작품 수: ${updatedArtworks.length}개`);

      // 6. artworks.json 백업
      console.log('\n💾 기존 파일 백업...');
      const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
      const backupFile = this.artworksFile.replace('.json', `-backup-${timestamp}.json`);
      await fs.copyFile(this.artworksFile, backupFile);
      console.log(`✅ 백업 완료: ${path.basename(backupFile)}`);

      // 7. 메타데이터 업데이트
      const updatedData = {
        metadata: {
          ...artworksData.metadata,
          total: updatedArtworks.length,
          sources: {
            ...artworksData.metadata.sources,
            "Artvee": successCount
          },
          lastUpdate: new Date().toISOString(),
          artveeAddedCount: successCount
        },
        artworks: updatedArtworks
      };

      // 8. 새로운 artworks.json 저장
      console.log('\n💾 업데이트된 artworks.json 저장...');
      await fs.writeFile(this.artworksFile, JSON.stringify(updatedData, null, 2));
      console.log('✅ 저장 완료');

      // 9. 통계 출력
      this.printStats(existingArtworks.length, successCount, updatedArtworks.length);

    } catch (error) {
      console.error('❌ 업데이트 실패:', error.message);
    }
  }

  cleanDescription(description) {
    if (!description) return '';
    
    // "View ... by ... and other Artworks on Artvee" 패턴 제거
    return description
      .replace(/^View\s+/, '')
      .replace(/\s+by\s+[^)]+and\s+other\s+Artworks\s+on\s+Artvee$/i, '')
      .trim();
  }

  generateTags(artist, title) {
    const tags = ['artwork', 'painting'];
    
    if (artist) {
      tags.push(artist.toLowerCase().replace(/\s+/g, '-'));
    }
    
    // 아티스트별 특별 태그
    const artistTags = {
      'Alphonse Mucha': ['art-nouveau', 'poster', 'decorative'],
      'Henri Matisse': ['fauvism', 'modern-art', 'colorful'],
      'Vincent van Gogh': ['post-impressionism', 'expressionist', 'oil-painting'],
      'Edvard Munch': ['expressionism', 'symbolism', 'psychological'],
      'John Singer Sargent': ['portraiture', 'realism', 'society'],
      'Claude Monet': ['impressionism', 'landscape', 'plein-air'],
      'Pierre-Auguste Renoir': ['impressionism', 'figurative', 'joyful'],
      'Paul Cézanne': ['post-impressionism', 'geometric', 'modern'],
      'Gustav Klimt': ['vienna-secession', 'golden', 'decorative'],
      'Wassily Kandinsky': ['abstract', 'expressionism', 'color-theory'],
      'Paul Klee': ['abstract', 'surrealism', 'pedagogical']
    };
    
    if (artistTags[artist]) {
      tags.push(...artistTags[artist]);
    }
    
    return tags;
  }

  determineStyle(artist) {
    const styles = {
      'Alphonse Mucha': 'Art Nouveau',
      'Henri Matisse': 'Fauvism',
      'Vincent van Gogh': 'Post-Impressionism',
      'Edvard Munch': 'Expressionism',
      'John Singer Sargent': 'Realism',
      'Claude Monet': 'Impressionism',
      'Pierre-Auguste Renoir': 'Impressionism',
      'Paul Cézanne': 'Post-Impressionism',
      'Gustav Klimt': 'Art Nouveau',
      'Wassily Kandinsky': 'Abstract Expressionism',
      'Paul Klee': 'Abstract Art'
    };
    
    return styles[artist] || 'Unknown';
  }

  determineMovement(artist) {
    const movements = {
      'Alphonse Mucha': 'Art Nouveau',
      'Henri Matisse': 'Modernism',
      'Vincent van Gogh': 'Post-Impressionism',
      'Edvard Munch': 'Symbolism',
      'John Singer Sargent': 'Academic Art',
      'Claude Monet': 'Impressionism',
      'Pierre-Auguste Renoir': 'Impressionism',
      'Paul Cézanne': 'Post-Impressionism',
      'Gustav Klimt': 'Vienna Secession',
      'Wassily Kandinsky': 'Abstract Art',
      'Paul Klee': 'Bauhaus'
    };
    
    return movements[artist] || 'Unknown';
  }

  async loadJson(filepath) {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  }

  printStats(originalCount, newCount, finalCount) {
    console.log('\n' + '='.repeat(50));
    console.log('📊 artworks.json 업데이트 완료');
    console.log('='.repeat(50));
    console.log(`기존 작품 수: ${originalCount}`);
    console.log(`추가 작품 수: ${newCount}`);
    console.log(`최종 작품 수: ${finalCount}`);
    console.log(`증가율: +${((newCount / originalCount) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
  }
}

// 실행
async function main() {
  const updater = new ArtworksUpdater();
  await updater.updateArtworksJson();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ArtworksUpdater;