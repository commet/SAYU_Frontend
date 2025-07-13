#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Sharp 라이브러리 설치 확인 및 사용
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('📦 Sharp 라이브러리가 설치되지 않았습니다. 설치 중...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    sharp = require('sharp');
    console.log('✅ Sharp 설치 완료!');
  } catch (installError) {
    console.error('❌ Sharp 설치 실패:', installError);
    process.exit(1);
  }
}

class AnimalImageProcessor {
  constructor() {
    this.sourceDir = './public/images/personality-animals';
    this.avatarDir = './public/images/personality-animals/avatars';
    this.mainDir = './public/images/personality-animals/main';
    this.illustrationDir = './public/images/personality-animals/illustrations';
    
    this.sizes = {
      avatar: 128,
      main: 200,
      illustration: 300
    };

    this.animalMapping = {
      '1. LAEF (Fox)': 'fox-laef',
      '2. LAEC (Cat)': 'cat-laec',
      '3. LAMF (Owl)': 'owl-lamf',
      '4. LAMC (Turtle)': 'turtle-lamc',
      '5. LREF (Chameleon)': 'chameleon-lref',
      '6. LREC (Hedgehog)': 'hedgehog-lrec',
      '7. LRMF (Octopus)': 'octopus-lrmf',
      '8. LRMC (Beaver)': 'beaver-lrmc',
      '9. SAEF (Butterfly)': 'butterfly-saef',
      '10. SAEC (Penguin)': 'penguin-saec',
      '11. SAMF (Parrot)': 'parrot-samf',
      '12. SAMC (Deer)': 'deer-samc',
      '13. SREF (Dog)': 'dog-sref',
      '14. SREC (Duck)': 'duck-srec',
      '15. SRMF (Elephant)': 'elephant-srmf',
      '16. SRMC (Eagle)': 'eagle-srmc'
    };
  }

  async createDirectories() {
    const dirs = [this.avatarDir, this.mainDir, this.illustrationDir];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 디렉토리 생성: ${dir}`);
      }
    }
  }

  async getSourceFiles() {
    const files = fs.readdirSync(this.sourceDir);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg'].includes(ext) && !fs.statSync(path.join(this.sourceDir, file)).isDirectory();
    });
  }

  getTargetFileName(sourceFileName) {
    // 파일명에서 확장자 제거
    const nameWithoutExt = path.parse(sourceFileName).name;
    
    // 매핑 테이블에서 찾기
    for (const [key, value] of Object.entries(this.animalMapping)) {
      if (nameWithoutExt.includes(key) || nameWithoutExt === key) {
        return value;
      }
    }
    
    // 매핑이 없으면 파일명 정리해서 사용
    return nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async resizeImage(inputPath, outputPath, size) {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png({
          quality: 90,
          compressionLevel: 6
        })
        .toFile(outputPath);
      
      return true;
    } catch (error) {
      console.error(`❌ 리사이징 실패 (${inputPath} -> ${outputPath}):`, error.message);
      return false;
    }
  }

  async processFile(fileName) {
    const sourcePath = path.join(this.sourceDir, fileName);
    const targetName = this.getTargetFileName(fileName);
    
    console.log(`\n🔄 처리 중: ${fileName} -> ${targetName}`);
    
    const tasks = [
      {
        size: this.sizes.avatar,
        outputPath: path.join(this.avatarDir, `${targetName}-avatar.png`),
        label: 'Avatar (128x128)'
      },
      {
        size: this.sizes.main,
        outputPath: path.join(this.mainDir, `${targetName}.png`),
        label: 'Main (200x200)'
      },
      {
        size: this.sizes.illustration,
        outputPath: path.join(this.illustrationDir, `${targetName}-full.png`),
        label: 'Illustration (300x300)'
      }
    ];

    let successCount = 0;
    
    for (const task of tasks) {
      const success = await this.resizeImage(sourcePath, task.outputPath, task.size);
      if (success) {
        console.log(`  ✅ ${task.label}: ${path.basename(task.outputPath)}`);
        successCount++;
      } else {
        console.log(`  ❌ ${task.label}: 실패`);
      }
    }
    
    return successCount;
  }

  async updateDataFile() {
    console.log('\n📝 데이터 파일 업데이트 중...');
    
    const dataFilePath = './data/personality-animals.ts';
    
    if (!fs.existsSync(dataFilePath)) {
      console.log('⚠️  personality-animals.ts 파일을 찾을 수 없습니다.');
      return;
    }
    
    let content = fs.readFileSync(dataFilePath, 'utf8');
    
    // 이미지 경로 업데이트 로직
    for (const targetName of Object.values(this.animalMapping)) {
      const imagePathPattern = new RegExp(
        `(${targetName.split('-')[1].toUpperCase()}:\\s*{[^}]*?)(?:image:.*?(?=,|\\n|}))?`,
        'g'
      );
      
      content = content.replace(imagePathPattern, (match) => {
        if (match.includes('image:')) {
          return match;
        }
        
        const imagePaths = `
    image: '/images/personality-animals/main/${targetName}.png',
    avatar: '/images/personality-animals/avatars/${targetName}-avatar.png',
    illustration: '/images/personality-animals/illustrations/${targetName}-full.png'`;
        
        return match.replace(/(\s*}$)/, `${imagePaths}$1`);
      });
    }
    
    fs.writeFileSync(dataFilePath, content);
    console.log('✅ personality-animals.ts 업데이트 완료');
  }

  async run() {
    console.log('🎨 SAYU 동물 캐릭터 이미지 자동 처리 시작\n');
    
    try {
      // 1. 디렉토리 생성
      await this.createDirectories();
      
      // 2. 소스 파일 찾기
      const sourceFiles = await this.getSourceFiles();
      
      if (sourceFiles.length === 0) {
        console.log('❌ 처리할 이미지 파일이 없습니다.');
        console.log(`📁 확인 위치: ${this.sourceDir}`);
        return;
      }
      
      console.log(`📊 총 ${sourceFiles.length}개 파일 발견:`);
      sourceFiles.forEach(file => console.log(`  - ${file}`));
      
      // 3. 각 파일 처리
      let totalProcessed = 0;
      let totalGenerated = 0;
      
      for (const fileName of sourceFiles) {
        const generated = await this.processFile(fileName);
        totalProcessed++;
        totalGenerated += generated;
      }
      
      // 4. 결과 요약
      console.log('\n📊 처리 완료 요약:');
      console.log(`  • 처리된 원본 파일: ${totalProcessed}개`);
      console.log(`  • 생성된 리사이즈 파일: ${totalGenerated}개`);
      console.log(`  • 목표 파일 수: ${totalProcessed * 3}개`);
      
      if (totalGenerated === totalProcessed * 3) {
        console.log('🎉 모든 이미지 처리 성공!');
      } else {
        console.log('⚠️  일부 이미지 처리 실패. 위의 오류 메시지를 확인해주세요.');
      }
      
      // 5. 데이터 파일 업데이트
      // await this.updateDataFile();
      
      console.log('\n✨ 이제 다음을 실행해서 확인해보세요:');
      console.log('npm run dev');
      console.log('그리고 /results 페이지에서 동물 캐릭터를 확인하세요!');
      
    } catch (error) {
      console.error('❌ 처리 중 오류 발생:', error);
    }
  }
}

// 스크립트 실행
const processor = new AnimalImageProcessor();
processor.run();