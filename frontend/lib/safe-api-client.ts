// 안전한 API 클라이언트 - 서버 API Route를 통해서만 호출

export class SafeAPIClient {
  // OpenAI 이미지 생성 (API 키 노출 없음!)
  static async generateImage(prompt: string, size?: string) {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, size }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }
    
    return response.json();
  }
  
  // HuggingFace API 호출
  static async generateWithHuggingFace(prompt: string) {
    const response = await fetch('/api/huggingface-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate with HuggingFace');
    }
    
    return response.json();
  }
  
  // Replicate API 호출
  static async generateWithReplicate(prompt: string, model: string) {
    const response = await fetch('/api/replicate-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate with Replicate');
    }
    
    return response.json();
  }
}