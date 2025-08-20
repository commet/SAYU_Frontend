// SDXL 이미지 생성 직접 테스트
require('dotenv').config({ path: '.env.local' });
const Replicate = require('replicate');

async function testSDXLGeneration() {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  });

  console.log('Starting SDXL test generation...');

  try {
    // 텍스트에서 이미지 생성 (img2img 대신 txt2img로 먼저 테스트)
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: "a beautiful oil painting of a sunset landscape, masterpiece",
          negative_prompt: "low quality, bad anatomy",
          width: 768,
          height: 768,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          scheduler: "K_EULER",
          seed: -1,
          refine: "no_refiner"
        }
      }
    );

    console.log('Raw output:', output);
    console.log('Output type:', typeof output);
    console.log('Is array:', Array.isArray(output));
    
    if (Array.isArray(output) && output[0]) {
      console.log('\n✅ Success! Image URL:', output[0]);
    } else if (typeof output === 'string') {
      console.log('\n✅ Success! Image URL:', output);
    } else {
      console.log('\n❌ Unexpected output format');
    }
  } catch (error) {
    console.error('Generation failed:', error);
  }
}

testSDXLGeneration();