const http = require('http');

console.log('모바일 렌더링 테스트 시작...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/dashboard',
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  }
};

http.get(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n응답 상태 코드:', res.statusCode);
    console.log('응답 헤더:', res.headers['content-type']);
    
    // 모바일 컴포넌트 확인
    const hasMobileComponent = data.includes('MobileDashboard');
    const hasMobileClass = data.includes('mobile-') || data.includes('Mobile');
    
    console.log('\n=== 모바일 렌더링 검사 결과 ===');
    console.log('MobileDashboard 컴포넌트 발견:', hasMobileComponent);
    console.log('모바일 관련 클래스 발견:', hasMobileClass);
    
    // Next.js 클라이언트 사이드 렌더링 확인
    const hasNextData = data.includes('__NEXT_DATA__');
    console.log('Next.js 데이터 발견:', hasNextData);
    
    if (hasNextData) {
      // __NEXT_DATA__ 스크립트 추출
      const scriptMatch = data.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
      if (scriptMatch) {
        try {
          const nextData = JSON.parse(scriptMatch[1]);
          console.log('\n=== Next.js 페이지 정보 ===');
          console.log('페이지 경로:', nextData.page);
          console.log('빌드 ID:', nextData.buildId);
          console.log('동적 임포트 모듈 수:', Object.keys(nextData.dynamicIds || {}).length);
        } catch (e) {
          console.log('Next.js 데이터 파싱 실패');
        }
      }
    }
    
    // HTML 구조 분석
    console.log('\n=== HTML 구조 분석 ===');
    const hasDesktopNav = data.includes('max-w-7xl') && data.includes('nav');
    const hasMobileNav = data.includes('mobile-nav') || data.includes('bottom-nav');
    console.log('데스크탑 네비게이션:', hasDesktopNav);
    console.log('모바일 네비게이션:', hasMobileNav);
    
    // 클라이언트 사이드 렌더링 힌트
    if (!hasMobileComponent && !hasMobileNav) {
      console.log('\n⚠️  모바일 컴포넌트가 서버 사이드에서 렌더링되지 않았습니다.');
      console.log('이는 다음과 같은 이유일 수 있습니다:');
      console.log('1. useResponsive 훅이 클라이언트 사이드에서만 작동');
      console.log('2. dynamic import의 ssr: false 설정');
      console.log('3. 서버 사이드에서는 기본적으로 데스크탑 뷰를 렌더링');
    }
    
    // 샘플 HTML 출력
    console.log('\n=== HTML 샘플 (처음 500자) ===');
    console.log(data.substring(0, 500));
  });
}).on('error', (err) => {
  console.error('요청 실패:', err);
});