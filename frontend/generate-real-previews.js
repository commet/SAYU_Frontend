const Replicate = require('replicate');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Replicate 초기화 (환경 변수 사용)
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 베이스 이미지 URL (동일한 인물)
const BASE_IMAGE_URL = 'https://images.unsplash.com/photo-1494790108755-2616c96b99c0?w=512&h=512&fit=crop&crop=face';

// 스타일별 프롬프트 설정
const stylePrompts = {
  'monet': 'portrait of a young woman with brown hair, impressionist oil painting style like Claude Monet, soft brushstrokes, light and color, dreamy atmosphere, oil on canvas',
  'picasso': 'portrait of a young woman with brown hair, cubist style like Pablo Picasso, geometric shapes, multiple perspectives, abstract, fragmented face, modern art',
  'vangogh': 'portrait of a young woman with brown hair, post-impressionist style like Vincent van Gogh, swirling brushstrokes, vibrant colors, expressive, emotional',
  'warhol': 'portrait of a young woman with brown hair, pop art style like Andy Warhol, bright colors, high contrast, screen print effect, bold colors',
  'pixel': 'portrait of a young woman with brown hair, 8-bit pixel art style, retro video game character, low resolution, pixelated',
  'minhwa': 'portrait of a young woman with brown hair, Korean traditional folk art minhwa style, flat colors, decorative patterns, traditional Korean painting',
  'klimt': 'portrait of a young woman with brown hair, Art Nouveau style like Gustav Klimt, golden decorative patterns, ornate, luxurious, byzantine',
  'mondrian': 'portrait of a young woman with brown hair, neoplasticism style like Piet Mondrian, primary colors, geometric grid, abstract, red yellow blue'
};

// 이미지 다운로드 함수
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

// 단일 스타일 변환 함수
async function generateStylePreview(styleId, prompt) {
  console.log(`🎨 Generating ${styleId} style preview...`);
  
  try {
    const output = await replicate.run(
      'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
      {
        input: {
          prompt: prompt,
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          seed: 42 // 일관성을 위한 고정 시드
        }
      }
    );

    if (output && output[0]) {
      const outputPath = path.join(__dirname, 'public', 'samples', `preview-${styleId}.jpg`);
      await downloadImage(output[0], outputPath);
      console.log(`✅ ${styleId} preview saved to ${outputPath}`);
      
      // 생성 성공 후 3초 대기 (API 레이트 리밋 고려)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return outputPath;
    } else {
      throw new Error('No output received from Replicate');
    }
  } catch (error) {
    console.error(`❌ Failed to generate ${styleId}:`, error.message);
    return null;
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Starting REAL style preview generation...');
  console.log('⏰ This will take about 5-10 minutes...\n');
  
  // 베이스 이미지 다운로드
  console.log('📥 Downloading base portrait image...');
  const basePath = path.join(__dirname, 'public', 'samples', 'base-portrait.jpg');
  
  try {
    await downloadImage(BASE_IMAGE_URL, basePath);
    console.log('✅ Base portrait image downloaded\n');
  } catch (error) {
    console.error('❌ Failed to download base image:', error.message);
  }

  // 각 스타일별 변환 이미지 생성
  const results = [];
  const totalStyles = Object.keys(stylePrompts).length;
  let currentIndex = 0;

  for (const [styleId, prompt] of Object.entries(stylePrompts)) {
    currentIndex++;
    console.log(`\n📊 Progress: ${currentIndex}/${totalStyles}`);
    
    const result = await generateStylePreview(styleId, prompt);
    results.push({ styleId, success: result !== null, path: result });
    
    // 프로그레스 표시
    const progress = Math.round((currentIndex / totalStyles) * 100);
    console.log(`🔄 Overall progress: ${progress}%`);
  }

  // 결과 요약
  console.log('\n📋 Generation Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${totalStyles}`);
  console.log(`❌ Failed: ${failed}/${totalStyles}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failed styles:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.styleId}`);
    });
  }

  console.log('\n🎉 REAL style preview generation completed!');
  console.log('📂 Images saved to: public/samples/');
}

main().catch(console.error);