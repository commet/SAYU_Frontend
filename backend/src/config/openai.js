const OpenAI = require('openai');

// OpenAI 클라이언트 풀링으로 메모리 최적화
class OpenAIPool {
  constructor() {
    this.pool = new Map();
    this.maxPoolSize = 5;
  }

  getClient(config = {}) {
    const key = JSON.stringify(config);
    
    if (!this.pool.has(key)) {
      // 풀 크기 제한
      if (this.pool.size >= this.maxPoolSize) {
        const firstKey = this.pool.keys().next().value;
        this.pool.delete(firstKey);
      }
      
      this.pool.set(key, new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000,
        maxRetries: 2,
        ...config
      }));
    }
    
    return this.pool.get(key);
  }

  // 주기적으로 사용하지 않는 클라이언트 정리
  cleanup() {
    const now = Date.now();
    for (const [key, client] of this.pool.entries()) {
      if (now - client.lastUsed > 300000) { // 5분 미사용
        this.pool.delete(key);
      }
    }
  }
}

const openaiPool = new OpenAIPool();
const openai = openaiPool.getClient();

// 5분마다 정리
setInterval(() => openaiPool.cleanup(), 300000);

// Retry 로직이 포함된 래퍼 함수
const createEmbeddingWithRetry = async (input, options = {}) => {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
        input,
        dimensions: parseInt(process.env.VECTOR_DIMENSIONS) || 256,
        ...options
      });
      return response;
    } catch (error) {
      lastError = error;

      // Rate limit 에러인 경우 대기
      if (error.status === 429) {
        const waitTime = Math.pow(2, i) * 1000; // exponential backoff
        console.log(`Rate limit hit, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // 다른 에러는 즉시 throw
      throw error;
    }
  }

  throw lastError;
};

module.exports = { openai, createEmbeddingWithRetry };
