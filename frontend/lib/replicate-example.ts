// Replicate와 Stability AI가 image-to-image를 지원하는 이유

/**
 * 핵심 차이점:
 * 
 * 1. DALL-E 3 (OpenAI)
 *    - 텍스트 → 이미지 생성에 특화
 *    - 아키텍처: Autoregressive Transformer
 *    - API 제한: text-to-image만 공개
 *    - ChatGPT 내부에서만 image-to-image 가능 (Diffusion 기법)
 * 
 * 2. Stable Diffusion (Stability AI / Replicate)
 *    - 오픈소스 기반
 *    - 아키텍처: Latent Diffusion Model
 *    - img2img 파이프라인 내장
 *    - ControlNet, LoRA 등 확장 가능
 */

// Replicate 실제 구현 예시
import Replicate from 'replicate';

export async function replicateStyleTransfer(imageFile: File, style: string) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // 1. 이미지를 base64로 변환
  const base64 = await fileToBase64(imageFile);
  const dataUrl = `data:image/png;base64,${base64}`;

  // 2. Stable Diffusion img2img 모델 실행
  const output = await replicate.run(
    "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d",
    {
      input: {
        image: dataUrl,  // 원본 이미지 입력!
        prompt: `Transform to ${style} art style, masterpiece`,
        strength: 0.6,  // 0=원본 유지, 1=완전 변환
        guidance_scale: 7.5,
        num_inference_steps: 50
      }
    }
  );

  return output;
}

// Stability AI 직접 API 예시
export async function stabilityStyleTransfer(imageFile: File, style: string) {
  const formData = new FormData();
  formData.append('init_image', imageFile);
  formData.append('init_image_mode', 'IMAGE_STRENGTH');
  formData.append('image_strength', '0.35');  // 원본 구조 65% 유지
  formData.append('text_prompts[0][text]', `${style} art style`);
  formData.append('text_prompts[0][weight]', '1');
  formData.append('cfg_scale', '7');
  formData.append('samples', '1');
  formData.append('steps', '30');

  const response = await fetch(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'application/json',
      },
      body: formData
    }
  );

  const data = await response.json();
  return `data:image/png;base64,${data.artifacts[0].base64}`;
}

/**
 * 왜 Stable Diffusion은 img2img가 가능한가?
 * 
 * 1. Diffusion Process의 중간 개입
 *    - 노이즈 제거 과정의 특정 단계에서 시작
 *    - 원본 이미지의 latent representation 유지
 * 
 * 2. U-Net 아키텍처
 *    - Encoder: 이미지 → latent space
 *    - Decoder: latent space → 새 이미지
 *    - 중간에 스타일 정보 주입 가능
 * 
 * 3. ControlNet 지원
 *    - 엣지, 포즈, 깊이 맵 등 구조 정보 보존
 *    - 스타일만 변경하고 구도는 유지
 * 
 * 4. 오픈소스의 강점
 *    - 커뮤니티가 다양한 파이프라인 개발
 *    - img2img, inpainting, outpainting 등
 */

// 지브리 스타일 특화 모델 (Replicate)
export async function ghibliStyleTransfer(imageFile: File) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // 지브리 스타일 LoRA가 적용된 모델
  const output = await replicate.run(
    "cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65",
    {
      input: {
        image: await fileToDataUrl(imageFile),
        prompt: "ghibli style, anime, masterpiece, best quality, highly detailed",
        negative_prompt: "lowres, bad anatomy, bad hands",
        strength: 0.6,
        guidance_scale: 7,
        num_inference_steps: 50
      }
    }
  );

  return output;
}

async function fileToBase64(file: File): Promise<string> {
  // 서버 사이드에서는 실행하지 않음
  if (typeof window === 'undefined') {
    throw new Error('FileReader is only available in browser environment');
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  // 서버 사이드에서는 실행하지 않음
  if (typeof window === 'undefined') {
    throw new Error('FileReader is only available in browser environment');
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}