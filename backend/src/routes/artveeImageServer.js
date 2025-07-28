const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Serve Artvee images from local storage
router.get('/images/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;

    // Validate type
    if (!['full', 'thumbnails'].includes(type)) {
      return res.status(400).json({ error: 'Invalid image type' });
    }

    // Sanitize filename
    const sanitizedFilename = path.basename(filename);

    // Construct image path
    const imagePath = path.join(process.cwd(), '../artvee-crawler/images', type, sanitizedFilename);

    // Check if file exists
    try {
      await fs.access(imagePath);
    } catch {
      // If not found, try with .jpg extension
      const imagePathWithExt = `${imagePath}.jpg`;
      try {
        await fs.access(imagePathWithExt);
        return res.sendFile(imagePathWithExt);
      } catch {
        return res.status(404).json({ error: 'Image not found' });
      }
    }

    // Send the file
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available images for a personality type
router.get('/available/:personalityType', async (req, res) => {
  try {
    const { personalityType } = req.params;

    // Load artwork data
    const artworksPath = path.join(process.cwd(), '../artvee-crawler/data/famous-artists-artworks.json');
    const artworksData = await fs.readFile(artworksPath, 'utf8');
    const artworks = JSON.parse(artworksData);

    // Filter by personality type
    const filteredArtworks = artworks.filter(artwork =>
      artwork.sayuType === personalityType
    );

    // Check which images are actually available
    const availableArtworks = [];
    for (const artwork of filteredArtworks) {
      const fullImagePath = path.join(process.cwd(), '../artvee-crawler/images/full', `${artwork.artveeId}.jpg`);
      const thumbPath = path.join(process.cwd(), '../artvee-crawler/images/thumbnails', `${artwork.artveeId}.jpg`);

      try {
        await fs.access(fullImagePath);
        // Image exists, add to available list
        availableArtworks.push({
          ...artwork,
          imageUrl: `/api/artvee/images/full/${artwork.artveeId}.jpg`,
          thumbnailUrl: `/api/artvee/images/thumbnails/${artwork.artveeId}.jpg`
        });
      } catch {
        // Image doesn't exist, skip
      }
    }

    res.json({
      personalityType,
      totalArtworks: filteredArtworks.length,
      availableArtworks: availableArtworks.length,
      artworks: availableArtworks.slice(0, 50) // Limit to 50 for performance
    });
  } catch (error) {
    console.error('Error getting available images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get random artworks for a personality type
router.get('/random/:personalityType/:count?', async (req, res) => {
  try {
    const { personalityType } = req.params;
    const count = parseInt(req.params.count) || 5;

    // Load artwork data
    const artworksPath = path.join(process.cwd(), '../artvee-crawler/data/famous-artists-artworks.json');
    const artworksData = await fs.readFile(artworksPath, 'utf8');
    const artworks = JSON.parse(artworksData);

    // Filter by personality type
    const filteredArtworks = artworks.filter(artwork =>
      artwork.sayuType === personalityType
    );

    // Shuffle and select random artworks
    const shuffled = filteredArtworks.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // Add image URLs
    const artworksWithUrls = selected.map(artwork => ({
      ...artwork,
      imageUrl: `/api/artvee/images/full/${artwork.artveeId}.jpg`,
      thumbnailUrl: `/api/artvee/images/thumbnails/${artwork.artveeId}.jpg`
    }));

    res.json({
      personalityType,
      count: artworksWithUrls.length,
      artworks: artworksWithUrls
    });
  } catch (error) {
    console.error('Error getting random artworks:', error);
    console.error('Error details:', {
      personalityType,
      count,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
