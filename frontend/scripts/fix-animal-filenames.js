const fs = require('fs');
const path = require('path');

// SAYU_TYPE_DEFINITIONS.md 기준 정확한 매핑
const correctMapping = {
  'laef': 'fox',
  'laec': 'cat',      // NOT swan!
  'lamf': 'owl',
  'lamc': 'turtle',   // NOT elephant!
  'lref': 'chameleon',// NOT deer!
  'lrec': 'hedgehog', // NOT cat!
  'lrmf': 'octopus',  // NOT wolf!
  'lrmc': 'beaver',   // NOT bear!
  'saef': 'butterfly',// NOT rabbit!
  'saec': 'penguin',  // NOT dolphin!
  'samf': 'parrot',   // NOT butterfly!
  'samc': 'deer',     // NOT bee!
  'sref': 'dog',      // NOT penguin!
  'srec': 'duck',     // NOT parrot!
  'srmf': 'elephant', // NOT eagle!
  'srmc': 'eagle'     // NOT lion!
};

// 현재 잘못된 매핑
const wrongMapping = {
  'swan-laec': 'cat-laec',
  'wolf-lrmf': 'octopus-lrmf',
  'elephant-lamc': 'turtle-lamc',
  'bear-lrmc': 'beaver-lrmc',
  'bee-samc': 'deer-samc',
  'cat-lrec': 'hedgehog-lrec',
  'deer-lref': 'chameleon-lref',
  'butterfly-samf': 'parrot-samf',
  'rabbit-saef': 'butterfly-saef',
  'dolphin-saec': 'penguin-saec',
  'penguin-sref': 'dog-sref',
  'parrot-srec': 'duck-srec',
  'eagle-srmf': 'elephant-srmf',
  'lion-srmc': 'eagle-srmc'
};

const baseDir = path.join(__dirname, '../public/images/personality-animals');
const folders = ['avatars', 'illustrations', 'main'];

console.log('🔧 SAYU 동물 파일명 수정 스크립트');
console.log('================================\n');

let totalRenamed = 0;
let totalErrors = 0;

folders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  console.log(`📁 ${folder} 폴더 처리 중...`);
  
  // 폴더의 모든 파일 읽기
  const files = fs.readdirSync(folderPath);
  
  files.forEach(file => {
    // 잘못된 매핑 찾기
    for (const [wrong, correct] of Object.entries(wrongMapping)) {
      if (file.includes(wrong)) {
        const newFileName = file.replace(wrong, correct);
        const oldPath = path.join(folderPath, file);
        const newPath = path.join(folderPath, newFileName);
        
        try {
          // 파일 이름 변경
          fs.renameSync(oldPath, newPath);
          console.log(`  ✅ ${file} → ${newFileName}`);
          totalRenamed++;
        } catch (error) {
          console.error(`  ❌ 오류: ${file} - ${error.message}`);
          totalErrors++;
        }
        break;
      }
    }
  });
  
  console.log('');
});

console.log('================================');
console.log(`📊 결과: ${totalRenamed}개 파일 수정 완료, ${totalErrors}개 오류`);
console.log('\n✨ 완료! 이제 모든 동물 이미지가 올바른 이름을 가지고 있습니다.');

// 검증: 모든 타입에 대한 파일이 있는지 확인
console.log('\n📋 파일 존재 확인:');
folders.forEach(folder => {
  console.log(`\n${folder}:`);
  const folderPath = path.join(baseDir, folder);
  
  Object.entries(correctMapping).forEach(([type, animal]) => {
    const suffix = folder === 'main' ? '.png' : `-${folder.slice(0, -1)}.png`;
    const fileName = `${animal}-${type}${suffix}`;
    const filePath = path.join(folderPath, fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${type.toUpperCase()}: ${fileName}`);
    } else {
      console.log(`  ❌ ${type.toUpperCase()}: ${fileName} (파일 없음)`);
    }
  });
});