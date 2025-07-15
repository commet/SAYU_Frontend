/**
 * Replicate API를 사용해서 스타일 변환 예시 이미지들을 생성하는 스크립트
 * 
 * 실행 방법:
 * 1. REPLICATE_API_TOKEN 환경변수 설정
 * 2. npm install replicate
 * 3. node scripts/generate-style-previews.js
 */

const Replicate = require('replicate');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Replicate 초기화
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 베이스 이미지 URL (깨끗한 인물 사진)
const BASE_IMAGE_URL = 'https://images.unsplash.com/photo-1494790108755-2616c96b99c0?w=512&h=512&fit=crop&crop=face';

// 스타일별 프롬프트 설정 (사용 가능한 모델들로 업데이트)
const stylePrompts = {
  'monet-impressionism': {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    prompt: 'impressionist oil painting in the style of Claude Monet, soft brushstrokes, light and color, outdoor scene, dreamy atmosphere, portrait',
    negativePrompt: 'sharp, digital, photographic, realistic, dark, gloomy'
  },
  'picasso-cubism': {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    prompt: 'cubist portrait in the style of Pablo Picasso, geometric shapes, multiple perspectives, abstract, fragmented face',
    negativePrompt: 'realistic, photographic, smooth, traditional portrait'
  },
  'vangogh-postimpressionism': {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    prompt: 'post-impressionist painting in the style of Vincent van Gogh, swirling brushstrokes, vibrant colors, expressive, emotional, portrait',
    negativePrompt: 'smooth, calm, realistic, photographic'
  },
  'warhol-popart': {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    prompt: 'pop art portrait in the style of Andy Warhol, bright colors, high contrast, screen print effect, bold colors',
    negativePrompt: 'realistic, muted colors, traditional, soft'
  },
  'korean-minhwa': {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    prompt: 'Korean traditional folk art minhwa style, flat colors, decorative patterns, traditional Korean painting, folk art, portrait',
    negativePrompt: 'western, realistic, 3d, modern, photographic'
  },
  'klimt-artnouveau': {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    prompt: 'Art Nouveau portrait in the style of Gustav Klimt, golden decorative patterns, ornate, luxurious, byzantine',
    negativePrompt: 'simple, plain, realistic, photographic'
  },
  'mondrian-neoplasticism': {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    prompt: 'neoplasticism portrait in the style of Piet Mondrian, primary colors, geometric grid, abstract, red yellow blue',
    negativePrompt: 'realistic, organic, curved, photographic, complex colors'
  },
  'pixel-art': {
    model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    prompt: '8-bit pixel art portrait, retro video game style, low resolution, pixelated, arcade game character',
    negativePrompt: 'smooth, high resolution, realistic, photographic'
  }
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
      fs.unlink(filename, () => {}); // 실패 시 파일 삭제
      reject(err);
    });
  });
}

// 단일 스타일 변환 함수
async function generateStylePreview(styleId, config) {
  console.log(`\n🎨 Generating ${styleId} style preview...`);
  
  try {
    const output = await replicate.run(config.model, {
      input: {
        prompt: config.prompt,
        negative_prompt: config.negativePrompt,
        width: 512,
        height: 512,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        seed: 42 // 일관성을 위한 고정 시드
      }
    });

    if (output && output[0]) {
      const outputPath = path.join(__dirname, '..', 'public', 'samples', `preview-${styleId.replace(/-.*/, '')}.jpg`);
      
      // 디렉토리가 없으면 생성
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      await downloadImage(output[0], outputPath);
      console.log(`✅ ${styleId} preview saved to ${outputPath}`);
      
      // 생성 성공 후 잠시 대기 (API 레이트 리밋 고려)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return outputPath;
    } else {
      throw new Error('No output received from Replicate');
    }
  } catch (error) {
    console.error(`❌ Failed to generate ${styleId}:`, error.message);
    return null;
  }
}

// 베이스 이미지 다운로드
async function downloadBaseImage() {
  console.log('📥 Downloading base portrait image...');
  const basePath = path.join(__dirname, '..', 'public', 'samples', 'base-portrait.jpg');
  
  try {
    await downloadImage(BASE_IMAGE_URL, basePath);
    console.log('✅ Base portrait image downloaded');
    return basePath;
  } catch (error) {
    console.error('❌ Failed to download base image:', error.message);
    return null;
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Starting style preview generation...');
  console.log('⏰ This may take several minutes...\n');
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN environment variable is required');
    process.exit(1);
  }

  // 베이스 이미지 다운로드
  const baseImagePath = await downloadBaseImage();
  if (!baseImagePath) {
    console.error('❌ Failed to download base image. Exiting...');
    process.exit(1);
  }

  // 각 스타일별 변환 이미지 생성
  const results = [];
  const totalStyles = Object.keys(stylePrompts).length;
  let currentIndex = 0;

  for (const [styleId, config] of Object.entries(stylePrompts)) {
    currentIndex++;
    console.log(`\n📊 Progress: ${currentIndex}/${totalStyles}`);
    
    const result = await generateStylePreview(styleId, config);
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

  console.log('\n🎉 Style preview generation completed!');
  console.log('📂 Images saved to: public/samples/');
  console.log('\n💡 You can now use these images in your StylePreviewGrid component.');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateStylePreview, downloadBaseImage };