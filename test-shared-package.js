// 우리가 만든 공통 패키지 테스트
const fs = require('fs');
const path = require('path');

console.log('🧪 공통 패키지 테스트 시작...');

// 1. 패키지 구조 확인
const packagePath = './packages/shared';
const distPath = './packages/shared/dist';

console.log('📁 구조 확인:');
console.log('  - packages/shared 존재:', fs.existsSync(packagePath));
console.log('  - dist 폴더 존재:', fs.existsSync(distPath));
console.log('  - index.js 생성됨:', fs.existsSync(path.join(distPath, 'index.js')));
console.log('  - index.d.ts 생성됨:', fs.existsSync(path.join(distPath, 'index.d.ts')));

// 2. 타입 정의 파일 확인
const typesPath = path.join(distPath, 'types');
console.log('  - types 폴더 존재:', fs.existsSync(typesPath));
console.log('  - SAYUTypeDefinitions.js 생성됨:', fs.existsSync(path.join(typesPath, 'SAYUTypeDefinitions.js')));
console.log('  - SAYUTypeDefinitions.d.ts 생성됨:', fs.existsSync(path.join(typesPath, 'SAYUTypeDefinitions.d.ts')));

// 3. 패키지가 require 가능한지 테스트
try {
  const sharedPackage = require('./packages/shared/dist/index.js');
  console.log('✅ 패키지 로드 성공');
  console.log('📦 Export된 요소들:', Object.keys(sharedPackage));
} catch (error) {
  console.log('❌ 패키지 로드 실패:', error.message);
}

console.log('🎉 테스트 완료!');