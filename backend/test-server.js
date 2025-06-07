const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'SAYU Backend API',
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic auth endpoints for testing
app.post('/api/auth/register', (req, res) => {
  res.json({
    message: 'Registration endpoint - simplified version',
    received: req.body,
    status: 'test-mode'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login endpoint - simplified version',
    received: req.body,
    status: 'test-mode'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SAYU Backend running on port ${PORT}`);
});