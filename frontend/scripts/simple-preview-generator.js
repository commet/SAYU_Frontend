/**
 * 간단한 스타일 프리뷰 생성기
 * CSS 필터를 사용하여 임시 스타일 프리뷰 생성
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// 베이스 이미지 URL (Unsplash에서 가져온 공개 이미지)
const BASE_IMAGE_URL = 'https://images.unsplash.com/photo-1494790108755-2616c96b99c0?w=300&h=300&fit=crop&crop=face';

// CSS 필터 기반 스타일 변환
const styleFilters = {
  'monet': {
    filter: 'blur(1px) saturate(1.2) brightness(1.1)',
    overlay: 'rgba(173, 216, 230, 0.3)' // 연한 파란색 오버레이
  },
  'picasso': {
    filter: 'contrast(1.5) saturate(0.8) hue-rotate(45deg)',
    overlay: 'rgba(139, 69, 19, 0.2)' // 갈색 오버레이
  },
  'vangogh': {
    filter: 'saturate(1.8) contrast(1.3) brightness(1.2)',
    overlay: 'rgba(255, 215, 0, 0.3)' // 노란색 오버레이
  },
  'warhol': {
    filter: 'contrast(2) saturate(2) brightness(1.1)',
    overlay: 'rgba(255, 20, 147, 0.2)' // 핑크 오버레이
  },
  'pixel': {
    filter: 'contrast(1.2) saturate(1.3)',
    pixelate: 8 // 픽셀 크기
  },
  'minhwa': {
    filter: 'saturate(1.5) brightness(1.1) contrast(1.1)',
    overlay: 'rgba(220, 20, 60, 0.2)' // 빨간색 오버레이
  },
  'klimt': {
    filter: 'saturate(1.2) brightness(1.3) sepia(0.3)',
    overlay: 'rgba(255, 215, 0, 0.4)' // 골드 오버레이
  },
  'mondrian': {
    filter: 'contrast(2) saturate(2) brightness(1.0)',
    overlay: 'rgba(255, 0, 0, 0.1)' // 빨간색 오버레이
  }
};

// 16진수 색상을 RGBA로 변환
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 픽셀화 효과 적용
function pixelateImage(canvas, ctx, pixelSize) {
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const pixelIndex = (y * width + x) * 4;
      const r = imageData.data[pixelIndex];
      const g = imageData.data[pixelIndex + 1];
      const b = imageData.data[pixelIndex + 2];
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
}

// 색상 오버레이 적용
function applyColorOverlay(ctx, width, height, color) {
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
}

// 단일 스타일 프리뷰 생성
async function generateStylePreview(styleName, config) {
  try {
    console.log(`🎨 Generating ${styleName} preview...`);
    
    // 캔버스 생성
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext('2d');
    
    // 베이스 이미지 로드
    const baseImage = await loadImage(BASE_IMAGE_URL);
    ctx.drawImage(baseImage, 0, 0, 300, 300);
    
    // 스타일별 효과 적용
    if (config.pixelate) {
      pixelateImage(canvas, ctx, config.pixelate);
    }
    
    if (config.overlay) {
      applyColorOverlay(ctx, 300, 300, config.overlay);
    }
    
    // 이미지 저장
    const outputPath = path.join(__dirname, '..', 'public', 'samples', `preview-${styleName}.jpg`);
    
    // 디렉토리가 없으면 생성
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 파일 저장
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ ${styleName} preview saved`);
    return outputPath;
    
  } catch (error) {
    console.error(`❌ Failed to generate ${styleName}:`, error.message);
    return null;
  }
}

// 베이스 이미지 다운로드
async function downloadBaseImage() {
  try {
    console.log('📥 Downloading base portrait...');
    const image = await loadImage(BASE_IMAGE_URL);
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0, 300, 300);
    
    const outputPath = path.join(__dirname, '..', 'public', 'samples', 'base-portrait.jpg');
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputPath, buffer);
    
    console.log('✅ Base portrait saved');
    return outputPath;
  } catch (error) {
    console.error('❌ Failed to download base image:', error.message);
    return null;
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Generating style previews...');
  console.log('⚠️  Note: This creates simplified previews using filters');
  console.log('   For production, use the Replicate API script instead.\n');
  
  // 베이스 이미지 다운로드
  await downloadBaseImage();
  
  // 각 스타일별 프리뷰 생성
  const results = [];
  for (const [styleName, config] of Object.entries(styleFilters)) {
    const result = await generateStylePreview(styleName, config);
    results.push({ styleName, success: result !== null });
  }
  
  // 결과 요약
  console.log('\n📋 Generation Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  console.log('\n🎉 Preview generation completed!');
  console.log('📂 Images saved to: public/samples/');
  console.log('\n💡 Run the Replicate script for higher quality previews.');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateStylePreview, downloadBaseImage };