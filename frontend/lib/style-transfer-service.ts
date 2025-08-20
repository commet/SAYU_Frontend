// 스타일 변환 서비스 - 대안 솔루션들
// DALL-E 3 API는 image-to-image를 지원하지 않으므로 대안 필요

export class StyleTransferService {
  
  // 옵션 1: Replicate API (Stable Diffusion img2img)
  async styleTransferWithReplicate(imageFile: File, styleId: string) {
    // Replicate는 image-to-image와 ControlNet을 지원
    // 비용: $0.0011 per second (약 2-5초 소요 = $0.002~$0.005)
    // 장점: 원본 구도 유지, 진짜 스타일 변환
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    // stable-diffusion-img2img 모델 사용
    // https://replicate.com/stability-ai/stable-diffusion-img2img
  }
  
  // 옵션 2: Stability AI API (공식 Stable Diffusion)
  async styleTransferWithStability(imageFile: File, styleId: string) {
    // Stability AI의 image-to-image API
    // 비용: $0.002 per image (512x512)
    // 장점: 공식 API, 안정적
    const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
    
    // POST https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image
  }
  
  // 옵션 3: ComfyUI 자체 호스팅
  async styleTransferWithComfyUI(imageFile: File, styleId: string) {
    // Railway나 Modal에 ComfyUI 워크플로우 배포
    // 비용: Railway $5~20/월 or Modal pay-per-use
    // 장점: 완전한 컨트롤, ControlNet + LoRA 모델 사용 가능
    
    // 지브리 LoRA 모델: https://civitai.com/models/6526/studio-ghibli-style-lora
    // 워홀 LoRA: https://civitai.com/models/5644/andy-warhol-style
  }
  
  // 옵션 4: Hugging Face Inference API (무료 티어 있음)
  async styleTransferWithHuggingFace(imageFile: File, styleId: string) {
    // timbrooks/instruct-pix2pix 모델 사용
    // 비용: 무료 티어 있음 (rate limit 있음)
    const HF_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    
    // POST https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix
  }
  
  // 옵션 5: DeepAI API (가장 저렴)
  async styleTransferWithDeepAI(imageFile: File, styleId: string) {
    // 비용: $5 for 1000 API calls
    // 장점: 매우 저렴, 다양한 스타일 필터
    const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY;
    
    // https://deepai.org/machine-learning-model/fast-style-transfer
  }
  
  // 옵션 6: Clipdrop API by Stability AI
  async styleTransferWithClipdrop(imageFile: File, styleId: string) {
    // Stable Diffusion Reimagine API
    // 비용: $0.01 per image
    // 장점: 간단한 API, 빠른 속도
    const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
    
    // POST https://clipdrop-api.co/reimagine/v1/reimagine
  }
}

// 비용 비교:
// 1. DALL-E 3 (현재): $0.08 per image (HD) - image-to-image 불가
// 2. Replicate: $0.002~$0.005 per image
// 3. Stability AI: $0.002 per image  
// 4. ComfyUI 자체호스팅: $5~20/월 (무제한)
// 5. Hugging Face: 무료 티어 있음
// 6. DeepAI: $0.005 per image
// 7. Clipdrop: $0.01 per image

// 추천: Replicate 또는 Stability AI
// - 진짜 image-to-image 지원
// - DALL-E보다 16~40배 저렴
// - ControlNet으로 원본 구도 유지 가능