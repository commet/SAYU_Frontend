const fs = require('fs');
const path = require('path');

// 업로드 진행 상황 파일 읽기
const progressFile = path.join(__dirname, 'images-complete', 'upload-progress.json');
const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));

// 모든 다운로드된 파일 목록
const fullDir = path.join(__dirname, 'images-complete', 'full');
const allFiles = fs.readdirSync(fullDir).filter(f => f.endsWith('.jpg'));

// 업로드된 파일과 안 된 파일 구분
const uploadedFiles = [];
const notUploadedFiles = [];

allFiles.forEach(file => {
  const id = file.replace('.jpg', '');
  if (progress[id] && progress[id].uploaded) {
    uploadedFiles.push(file);
  } else {
    notUploadedFiles.push(file);
  }
});

console.log('='.repeat(60));
console.log('📊 업로드 상태 확인');
console.log('='.repeat(60));
console.log(`총 다운로드 파일: ${allFiles.length}개`);
console.log(`✅ Cloudinary 업로드 완료: ${uploadedFiles.length}개`);
console.log(`❌ 업로드 필요: ${notUploadedFiles.length}개`);
console.log('='.repeat(60));

if (notUploadedFiles.length > 0) {
  console.log('\n업로드되지 않은 파일 목록 (처음 20개):');
  notUploadedFiles.slice(0, 20).forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });
  
  // 업로드되지 않은 파일 목록 저장
  const notUploadedListFile = path.join(__dirname, 'images-complete', 'not-uploaded-files.json');
  fs.writeFileSync(notUploadedListFile, JSON.stringify(notUploadedFiles, null, 2));
  console.log(`\n📁 업로드되지 않은 파일 목록 저장: ${notUploadedListFile}`);
}