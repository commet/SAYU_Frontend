const Replicate = require('replicate');
require('dotenv').config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testReplicateAPI() {
  console.log('🎨 Replicate API 테스트 시작...');
  console.log('API Token:', process.env.REPLICATE_API_TOKEN ? 'OK' : 'Missing');

  try {
    // 1. Van Gogh 스타일 테스트
    console.log('\n🖼️  Van Gogh 스타일 이미지 생성 중...');
    
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: "painting in the style of Vincent van Gogh, a person contemplating art in a gallery, swirling brushstrokes, vivid colors, emotional",
          negative_prompt: "realistic, photo, calm, modern",
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      }
    );

    console.log('✅ 성공! 생성된 이미지 URL:', output[0]);

    // 2. 픽셀 아트 스타일 테스트
    console.log('\n🎮 픽셀 아트 스타일 테스트 중...');
    
    const pixelOutput = await replicate.run(
      "andreasjansson/pixray-text2image:5c347a4bfa1d4523a58ae614c2194e15f2ae682b57e3797a5bb468920aa70ebf",
      {
        input: {
          prompts: "SAYU art platform user profile, pixel art style, 8-bit, retro game aesthetic",
          drawer: "pixel",
          pixelart: true,
          width: 512,
          height: 512
        }
      }
    );

    console.log('✅ 픽셀 아트 성공! URL:', pixelOutput);

    console.log('\n🎉 모든 테스트 성공! Replicate API가 정상 작동합니다.');
    
    return {
      vangogh: output[0],
      pixel: pixelOutput,
      success: true
    };

  } catch (error) {
    console.error('❌ Replicate API 오류:', error.message);
    
    if (error.message.includes('Authentication')) {
      console.log('🔑 API 토큰을 확인해주세요.');
    } else if (error.message.includes('insufficient_quota')) {
      console.log('💳 Replicate 계정에 크레딧이 부족합니다.');
    }
    
    return { success: false, error: error.message };
  }
}

// 스타일별 테스트 함수
async function testAllStyles() {
  const styles = {
    'monet-impressionism': 'impressionist painting in the style of Claude Monet, soft brushstrokes, pastel colors',
    'picasso-cubism': 'cubist painting in the style of Pablo Picasso, geometric shapes, multiple perspectives',
    'warhol-popart': 'pop art in the style of Andy Warhol, bright colors, high contrast, repetitive patterns',
    'korean-minhwa': 'traditional Korean folk painting, minhwa style, colorful, decorative'
  };

  console.log('\n🎨 모든 스타일 테스트 시작...');

  for (const [style, prompt] of Object.entries(styles)) {
    try {
      console.log(`\n🖼️  ${style} 테스트 중...`);
      
      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: `${prompt}, a person experiencing art`,
            width: 512,
            height: 512,
            num_outputs: 1,
            num_inference_steps: 15 // 빠른 테스트용
          }
        }
      );

      console.log(`✅ ${style} 성공!`, output[0]);
      
    } catch (error) {
      console.error(`❌ ${style} 실패:`, error.message);
    }
  }
}

if (require.main === module) {
  testReplicateAPI()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 SAYU AI 아트 프로필 기능이 활성화되었습니다!');
        console.log('🚀 이제 frontend에서 아트 프로필 생성을 테스트할 수 있습니다.');
      }
    })
    .catch(console.error);
}

module.exports = { testReplicateAPI, testAllStyles };