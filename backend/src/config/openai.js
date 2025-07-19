const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Retry 로직이 포함된 래퍼 함수
const createEmbeddingWithRetry = async (input, options = {}) => {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
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