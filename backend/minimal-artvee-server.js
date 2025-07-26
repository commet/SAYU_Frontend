// Minimal server just for testing artvee endpoints
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://localhost:3000'],
  credentials: true
}));

// Import cloudinary service directly
const cloudinaryArtveeService = require('./src/services/cloudinaryArtveeService');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'minimal-artvee', timestamp: new Date().toISOString() });
});

// Direct artvee endpoints without middleware
app.get('/api/artvee/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const artworks = await cloudinaryArtveeService.getRandomArtworks(limit);
    res.json({
      success: true,
      data: artworks,
      count: artworks.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/artvee/personality/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const artworks = await cloudinaryArtveeService.getArtworksForPersonality(type, { limit });
    res.json({
      success: true,
      data: artworks,
      count: artworks.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found in minimal artvee server' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Minimal server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎨 Minimal SAYU Artvee Server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/health`);
  console.log(`🖼️ Artvee API: http://localhost:${PORT}/api/artvee/random?limit=3`);
});