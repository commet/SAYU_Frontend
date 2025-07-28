// Mock Redis for testing without Redis server
const mockRedisClient = {
  connect: async () => console.log('✅ Connected to Mock Redis (for testing)'),
  get: async (key) => null,
  set: async (key, value) => 'OK',
  setEx: async (key, ttl, value) => 'OK',
  del: async (key) => 1,
  on: (event, callback) => {}
};

async function connectRedis() {
  await mockRedisClient.connect();
}

module.exports = { redisClient: mockRedisClient, connectRedis };
