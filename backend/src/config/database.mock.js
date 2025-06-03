// Mock database for testing without PostgreSQL
const mockPool = {
  connect: async () => ({
    query: async (text, params) => {
      console.log('Mock query:', text.substring(0, 50) + '...');
      return { rows: [], rowCount: 0 };
    },
    release: () => {}
  }),
  query: async (text, params) => {
    console.log('Mock query:', text.substring(0, 50) + '...');
    return { rows: [], rowCount: 0 };
  },
  end: async () => {}
};

async function connectDatabase() {
  console.log('✅ Connected to Mock PostgreSQL (for testing)');
}

async function withTransaction(callback) {
  const client = await mockPool.connect();
  try {
    const result = await callback(client);
    return result;
  } finally {
    client.release();
  }
}

module.exports = { pool: mockPool, connectDatabase, withTransaction };