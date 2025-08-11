const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config({ path: 'frontend/.env.local' });

async function callGemini(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent([
    {
      text: `당신은 모바일 UX/UI 디자인과 프론트엔드 성능 최적화 전문가입니다. 
      SAYU는 사용자의 16가지 성격 유형(APT)에 따라 개인화된 예술 작품을 큐레이션하는 플랫폼입니다.
      
      모바일 전략을 기술적 관점과 사용자 경험 관점에서 면밀히 검토해주세요. 
      특히 성능 최적화, 접근성, 사용자 참여도 측면에서 분석해주세요. 한국어로 답변해주세요.
      
      ${prompt}`
    }
  ]);
  
  return result.response.text();
}

async function main() {
  try {
    // 검토 요청 파일 읽기
    const reviewRequest = fs.readFileSync('mobile-strategy-review.txt', 'utf-8');
    
    console.log('Gemini에게 모바일 전략 검토 요청 중...\n');
    
    // Gemini에게 검토 요청
    const response = await callGemini(reviewRequest);
    
    console.log('=== Gemini 모바일 전략 검토 결과 ===\n');
    console.log(response);
    
    // 결과를 파일로 저장
    fs.writeFileSync('gemini-mobile-strategy-review-result.md', `# Gemini 모바일 전략 검토 결과\n\n${response}`, 'utf-8');
    console.log('\n=== 검토 결과가 gemini-mobile-strategy-review-result.md 파일에 저장되었습니다 ===');
    
  } catch (error) {
    console.error('에러 발생:', error.message);
  }
}

main();