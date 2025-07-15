const Replicate = require('replicate');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Replicate 초기화 (환경 변수 사용)
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 안전한 프롬프트 (인물 대신 풍경/객체 사용)
const stylePrompts = {
  'monet': 'beautiful garden with flowers, impressionist oil painting style like Claude Monet, soft brushstrokes, light and color, dreamy atmosphere',
  'picasso': 'abstract composition with shapes, cubist style like Pablo Picasso, geometric forms, multiple perspectives, modern art',
  'vangogh': 'swirling sky with stars, post-impressionist style like Vincent van Gogh, vibrant colors, expressive brushstrokes',
  'warhol': 'colorful pop art composition, bright colors, high contrast, screen print effect like Andy Warhol',
  'pixel': 'retro video game landscape, 8-bit pixel art style, low resolution, pixelated graphics',
  'minhwa': 'traditional Korean folk art with flowers and birds, minhwa style, flat colors, decorative patterns',
  'klimt': 'golden decorative pattern with ornate details, Art Nouveau style like Gustav Klimt, luxurious byzantine',
  'mondrian': 'abstract composition with primary colors, neoplasticism style like Piet Mondrian, geometric grid, red yellow blue'
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
          seed: 42
        }
      }
    );

    if (output && output[0]) {
      const outputPath = path.join(__dirname, 'public', 'samples', `preview-${styleId}.jpg`);
      await downloadImage(output[0], outputPath);
      console.log(`✅ ${styleId} preview saved`);
      
      // 3초 대기
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
  console.log('🚀 Starting SAFE style preview generation...');
  console.log('⏰ This will take about 5-10 minutes...\n');
  
  const results = [];
  const totalStyles = Object.keys(stylePrompts).length;
  let currentIndex = 0;

  for (const [styleId, prompt] of Object.entries(stylePrompts)) {
    currentIndex++;
    console.log(`\n📊 Progress: ${currentIndex}/${totalStyles}`);
    
    const result = await generateStylePreview(styleId, prompt);
    results.push({ styleId, success: result !== null, path: result });
    
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
  
  console.log('\n🎉 Style preview generation completed!');
  console.log('📂 Images saved to: public/samples/');
}

main().catch(console.error);