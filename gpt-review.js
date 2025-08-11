const fs = require('fs');
require('dotenv').config({ path: 'frontend/.env.local' });

async function callOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 프론트엔드 아키텍트이자 UX 전문가입니다. SAYU는 16가지 성격 유형(APT)을 기반으로 한 예술 큐레이션 플랫폼입니다. 모바일 전략을 객관적이고 전문적으로 분석해주세요. 한국어로 답변해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  return data.choices[0].message.content;
}

async function main() {
  try {
    // 검토 요청 파일 읽기
    const reviewRequest = fs.readFileSync('mobile-strategy-review.txt', 'utf-8');
    
    console.log('GPT에게 모바일 전략 검토 요청 중...\n');
    
    // GPT에게 검토 요청
    const response = await callOpenAI(reviewRequest);
    
    console.log('=== GPT 모바일 전략 검토 결과 ===\n');
    console.log(response);
    
    // 결과를 파일로 저장
    fs.writeFileSync('gpt-mobile-strategy-review-result.md', `# GPT 모바일 전략 검토 결과\n\n${response}`, 'utf-8');
    console.log('\n=== 검토 결과가 gpt-mobile-strategy-review-result.md 파일에 저장되었습니다 ===');
    
  } catch (error) {
    console.error('에러 발생:', error.message);
  }
}

main();