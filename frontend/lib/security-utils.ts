// Security Utils - API 키 보안 검증 및 관리

/**
 * 클라이언트 사이드에서 위험한 환경변수 사용을 감지하고 경고
 */
export function validateEnvironmentSecurity() {
  if (typeof window === 'undefined') {
    // 서버사이드에서는 검증하지 않음
    return;
  }

  const dangerousKeys = [
    'NEXT_PUBLIC_OPENAI_API_KEY',
    'NEXT_PUBLIC_REPLICATE_API_TOKEN', 
    'NEXT_PUBLIC_HUGGINGFACE_API_KEY',
    'NEXT_PUBLIC_GROQ_API_KEY',
    'NEXT_PUBLIC_KAKAO_CLIENT_SECRET',
    'NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET',
    'NEXT_PUBLIC_GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_STABILITY_API_KEY'
  ];

  const foundDangerousKeys: string[] = [];

  dangerousKeys.forEach(key => {
    if (process.env[key]) {
      foundDangerousKeys.push(key);
    }
  });

  if (foundDangerousKeys.length > 0) {
    console.error('🚨 SECURITY ALERT: 위험한 환경변수가 클라이언트에 노출되었습니다!');
    console.error('노출된 키들:', foundDangerousKeys);
    console.error('이 키들은 NEXT_PUBLIC_ 접두사를 제거하고 API Route를 통해 사용해야 합니다.');
    
    // 개발 환경에서만 경고 표시
    if (process.env.NODE_ENV === 'development') {
      alert(`보안 경고: ${foundDangerousKeys.length}개의 API 키가 클라이언트에 노출되었습니다. 콘솔을 확인하세요.`);
    }
  }
}

/**
 * API Route 요청 시 기본 보안 헤더 추가
 */
export function getSecureHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // CSRF 보호를 위한 커스텀 헤더
    'X-SAYU-Client': 'web-app'
  };
}

/**
 * API 응답 검증 (예상치 못한 데이터 구조 방지)
 */
export function validateAPIResponse(response: any, expectedKeys: string[]): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }

  return expectedKeys.every(key => key in response);
}

/**
 * Rate limiting을 위한 클라이언트 사이드 요청 간격 관리
 */
class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(endpoint: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, [now]);
      return true;
    }

    const requestTimes = this.requests.get(endpoint)!;
    
    // 윈도우 밖의 요청들 제거
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
    return true;
  }

  getRemainingRequests(endpoint: string, maxRequests: number = 10, windowMs: number = 60000): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(endpoint)) {
      return maxRequests;
    }

    const requestTimes = this.requests.get(endpoint)!;
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    return Math.max(0, maxRequests - validRequests.length);
  }

  getResetTime(endpoint: string, windowMs: number = 60000): number | null {
    if (!this.requests.has(endpoint)) {
      return null;
    }

    const requestTimes = this.requests.get(endpoint)!;
    if (requestTimes.length === 0) {
      return null;
    }

    const oldestRequest = Math.min(...requestTimes);
    return oldestRequest + windowMs;
  }
}

export const clientRateLimiter = new ClientRateLimiter();

/**
 * 안전한 API 요청 래퍼
 */
export async function secureApiRequest(
  endpoint: string,
  options: RequestInit = {},
  rateLimitConfig?: {
    maxRequests?: number;
    windowMs?: number;
  }
): Promise<Response> {
  // Rate limiting 체크
  const { maxRequests = 10, windowMs = 60000 } = rateLimitConfig || {};
  
  if (!clientRateLimiter.canMakeRequest(endpoint, maxRequests, windowMs)) {
    const resetTime = clientRateLimiter.getResetTime(endpoint, windowMs);
    const waitTime = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
    throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
  }

  // 보안 헤더 병합
  const secureHeaders = getSecureHeaders();
  const mergedHeaders = {
    ...secureHeaders,
    ...options.headers
  };

  // 요청 실행
  const response = await fetch(endpoint, {
    ...options,
    headers: mergedHeaders
  });

  // 응답 상태 검증
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  return response;
}

/**
 * 개발 환경에서 보안 체크 자동 실행
 */
if (process.env.NODE_ENV === 'development') {
  // 페이지 로드시 보안 검증 실행
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(validateEnvironmentSecurity, 1000);
    });
  }
}

/**
 * API 키 패턴 검증 (개발용)
 */
export function isValidAPIKeyPattern(key: string, provider: string): boolean {
  const patterns: Record<string, RegExp> = {
    openai: /^sk-[a-zA-Z0-9]{48}$/,
    replicate: /^r8_[a-zA-Z0-9]{32}$/,
    huggingface: /^hf_[a-zA-Z0-9]{37}$/,
    groq: /^gsk_[a-zA-Z0-9]{52}$/
  };

  const pattern = patterns[provider.toLowerCase()];
  return pattern ? pattern.test(key) : true; // 패턴이 없으면 통과
}

/**
 * 환경변수 완성도 체크 (서버사이드용)
 */
export function checkEnvironmentCompleteness(): {
  missing: string[];
  invalid: string[];
  warnings: string[];
} {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called on server-side');
  }

  const requiredKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL'
  ];

  const optionalKeys = [
    'HUGGINGFACE_API_KEY',
    'REPLICATE_API_TOKEN',
    'OPENAI_API_KEY',
    'GROQ_API_KEY',
    'KAKAO_CLIENT_ID',
    'KAKAO_CLIENT_SECRET'
  ];

  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  // 필수 키 체크
  requiredKeys.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // 선택적 키 체크 (경고만)
  optionalKeys.forEach(key => {
    if (!process.env[key]) {
      warnings.push(`${key} not configured - related features will be disabled`);
    }
  });

  // API 키 패턴 검증
  if (process.env.OPENAI_API_KEY && !isValidAPIKeyPattern(process.env.OPENAI_API_KEY, 'openai')) {
    invalid.push('OPENAI_API_KEY has invalid format');
  }

  if (process.env.REPLICATE_API_TOKEN && !isValidAPIKeyPattern(process.env.REPLICATE_API_TOKEN, 'replicate')) {
    invalid.push('REPLICATE_API_TOKEN has invalid format');
  }

  return { missing, invalid, warnings };
}