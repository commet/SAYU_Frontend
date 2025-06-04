// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/sayu_test';

// Mock external services
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  keys: jest.fn(() => []),
  lRange: jest.fn(() => []),
  lPush: jest.fn(),
  flushDb: jest.fn(),
  dbSize: jest.fn(() => 0),
  info: jest.fn(() => ''),
  slowlogGet: jest.fn(() => []),
  ttl: jest.fn(() => -1)
};

jest.mock('../src/config/redis', () => ({
  redisClient: () => mockRedisClient,
  connectRedis: jest.fn()
}));

jest.mock('../src/config/database', () => ({
  connectDatabase: jest.fn(),
  query: jest.fn()
}));

jest.mock('../src/services/openai', () => ({
  generateResponse: jest.fn(() => 'Mock AI response'),
  generateProfileImage: jest.fn(() => 'https://mock-image-url.com/image.png')
}));