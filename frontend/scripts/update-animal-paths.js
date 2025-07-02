#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 실제 생성된 파일명에 기반한 매핑
const animalFileMapping = {
  'LAEF': 'fox-laef',
  'LAEC': 'swan-laec', 
  'LAMF': 'owl-lamf',
  'LAMC': 'elephant-lamc',
  'LREF': 'deer-lref',
  'LREC': 'cat-lrec',
  'LRMF': 'wolf-lrmf',
  'LRMC': 'bear-lrmc',
  'SAEF': 'rabbit-saef',
  'SAEC': 'dolphin-saec',
  'SAMF': 'butterfly-samf',
  'SAMC': 'bee-samc',
  'SREF': 'penguin-sref',
  'SREC': 'parrot-srec',
  'SRMF': 'eagle-srmf',
  'SRMC': 'lion-srmc'
};

function updateAnimalPaths() {
  const dataFilePath = './data/personality-animals.ts';
  
  if (!fs.existsSync(dataFilePath)) {
    console.error('❌ personality-animals.ts 파일을 찾을 수 없습니다.');
    return;
  }
  
  let content = fs.readFileSync(dataFilePath, 'utf8');
  console.log('📝 동물 이미지 경로 업데이트 중...\n');
  
  // 각 타입별로 이미지 경로 추가
  for (const [type, fileName] of Object.entries(animalFileMapping)) {
    console.log(`🔄 ${type} -> ${fileName}`);
    
    // 해당 타입의 객체를 찾아서 이미지 경로 추가
    const typePattern = new RegExp(
      `(\\s*${type}:\\s*{[^}]*?)(?:,\\s*image:.*?illustration:.*?)?((\\s*})|(\\s*},))`,
      'gs'
    );
    
    content = content.replace(typePattern, (match, beforeImages, afterImages) => {
      // 이미 이미지 경로가 있는지 확인
      if (match.includes('image:') && match.includes('avatar:') && match.includes('illustration:')) {
        console.log(`  ✅ 이미 경로가 설정되어 있음`);
        return match;
      }
      
      // 이미지 경로 추가
      const imagePaths = `,
    image: '/images/personality-animals/main/${fileName}.png',
    avatar: '/images/personality-animals/avatars/${fileName}-avatar.png',
    illustration: '/images/personality-animals/illustrations/${fileName}-full.png'`;
      
      console.log(`  ✅ 이미지 경로 추가됨`);
      return beforeImages + imagePaths + afterImages;
    });
  }
  
  // 파일 저장
  fs.writeFileSync(dataFilePath, content);
  console.log('\n🎉 모든 동물 이미지 경로 업데이트 완료!');
  console.log('\n✨ 이제 다음을 실행해서 확인해보세요:');
  console.log('npm run dev');
  console.log('그리고 /results 페이지에서 동물 캐릭터들을 확인하세요!');
}

updateAnimalPaths();