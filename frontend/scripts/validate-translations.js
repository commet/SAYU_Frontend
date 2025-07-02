const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../lib/i18n/locales');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// 번역 파일 읽기
const loadTranslations = () => {
  const ko = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'ko.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'en.json'), 'utf8'));
  return { ko, en };
};

// 객체의 모든 키 추출 (중첩된 키 포함)
const getAllKeys = (obj, prefix = '') => {
  let keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
};

// 번역 검증
const validateTranslations = () => {
  console.log(`${colors.blue}🌐 번역 파일 검증 시작...${colors.reset}\n`);
  
  const { ko, en } = loadTranslations();
  const koKeys = getAllKeys(ko);
  const enKeys = getAllKeys(en);
  
  // 한글에만 있는 키
  const koOnly = koKeys.filter(key => !enKeys.includes(key));
  // 영어에만 있는 키
  const enOnly = enKeys.filter(key => !koKeys.includes(key));
  
  let hasErrors = false;
  
  if (koOnly.length > 0) {
    hasErrors = true;
    console.log(`${colors.red}❌ 한글에만 있는 키:${colors.reset}`);
    koOnly.forEach(key => console.log(`   - ${key}`));
    console.log('');
  }
  
  if (enOnly.length > 0) {
    hasErrors = true;
    console.log(`${colors.red}❌ 영어에만 있는 키:${colors.reset}`);
    enOnly.forEach(key => console.log(`   - ${key}`));
    console.log('');
  }
  
  // 빈 값 확인
  const checkEmptyValues = (obj, lang, prefix = '') => {
    const emptyKeys = [];
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        emptyKeys.push(...checkEmptyValues(obj[key], lang, fullKey));
      } else if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
        emptyKeys.push(fullKey);
      }
    }
    
    return emptyKeys;
  };
  
  const koEmpty = checkEmptyValues(ko, 'ko');
  const enEmpty = checkEmptyValues(en, 'en');
  
  if (koEmpty.length > 0) {
    hasErrors = true;
    console.log(`${colors.yellow}⚠️  한글 빈 값:${colors.reset}`);
    koEmpty.forEach(key => console.log(`   - ${key}`));
    console.log('');
  }
  
  if (enEmpty.length > 0) {
    hasErrors = true;
    console.log(`${colors.yellow}⚠️  영어 빈 값:${colors.reset}`);
    enEmpty.forEach(key => console.log(`   - ${key}`));
    console.log('');
  }
  
  // 결과 출력
  if (!hasErrors) {
    console.log(`${colors.green}✅ 모든 번역이 올바르게 설정되어 있습니다!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ 번역 검증 실패. 위의 문제들을 해결해주세요.${colors.reset}`);
    process.exit(1);
  }
  
  // 통계
  console.log(`\n${colors.blue}📊 번역 통계:${colors.reset}`);
  console.log(`   - 총 번역 키: ${koKeys.length}개`);
  console.log(`   - 한글 번역: ${koKeys.length - koEmpty.length}개 완료`);
  console.log(`   - 영어 번역: ${enKeys.length - enEmpty.length}개 완료`);
};

// 실행
validateTranslations();