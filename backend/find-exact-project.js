require('dotenv').config();

console.log('🎯 정확한 Railway 프로젝트 찾기\n');

const dbUrl = process.env.DATABASE_URL;
const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

console.log('🔍 Connection String에서 이 부분들을 확인하세요:\n');

console.log('1️⃣ 전체 패턴:');
console.log('   postgresql://postgres:[비밀번호]@tramway.proxy.rlwy.net:26410/[DB이름]\n');

console.log('2️⃣ 비밀번호 (전체):');
console.log(`   🔑 ${urlParts[2]}\n`);

console.log('3️⃣ 데이터베이스 이름:');
console.log(`   💾 ${urlParts[5]}\n`);

console.log('4️⃣ Railway에서 확인 순서:');
console.log('   1. 각 프로젝트의 PostgreSQL 클릭');
console.log('   2. "Connect" 탭에서 Connection String 확인');
console.log('   3. 비밀번호가 다음과 일치하는지 확인:');
console.log(`      ceqwpOAOTYwYHEMZSkZXbQtVGfyiHriW`);
console.log('   4. DB 이름이 "railway"인지 확인\n');

console.log('5️⃣ 복사해서 찾기:');
console.log('   아래 문자열을 복사해서 Railway에서 검색하세요:');
console.log(`   ceqwpOAOTYwYHEMZSkZXbQtVGfyiHriW\n`);

console.log('💡 팁: Connection String을 텍스트 에디터에 복사 후');
console.log('   위 비밀번호로 검색(Ctrl+F)하면 빠르게 찾을 수 있습니다!');