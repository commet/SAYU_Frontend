const router = require('express').Router();
const ProfileImageMappingService = require('../services/profileImageMapping');
const { adminMiddleware } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// Get all 128 profile combinations
router.get('/combinations', adminMiddleware, (req, res) => {
  try {
    const combinations = ProfileImageMappingService.generateAllProfileCombinations();

    res.json({
      total: combinations.length,
      exhibitionTypes: 16,
      artworkTypes: 8,
      combinations
    });
  } catch (error) {
    console.error('Get combinations error:', error);
    res.status(500).json({ error: 'Failed to get combinations' });
  }
});

// Get batch prompts for AI image generation
router.get('/batch-prompts', adminMiddleware, (req, res) => {
  try {
    const prompts = ProfileImageMappingService.generateBatchPrompts();

    res.json({
      total: prompts.length,
      prompts,
      instructions: {
        usage: 'Use these prompts with DALL-E, Midjourney, or similar AI image generators',
        naming: 'Save each generated image with the corresponding fileName',
        directory: 'Upload images to /public/images/profiles/ directory',
        format: 'Recommended format: JPG, 1024x1024 or higher resolution'
      }
    });
  } catch (error) {
    console.error('Get batch prompts error:', error);
    res.status(500).json({ error: 'Failed to generate batch prompts' });
  }
});

// Export prompts as downloadable file
router.get('/export-prompts', adminMiddleware, async (req, res) => {
  try {
    const prompts = ProfileImageMappingService.generateBatchPrompts();

    // Create formatted text file
    let fileContent = '# SAYU Profile Images - 128 AI Generation Prompts\n\n';
    fileContent += `Total Images: ${prompts.length}\n`;
    fileContent += `Exhibition Types: 16\n`;
    fileContent += `Artwork Types: 8\n\n`;
    fileContent += '## Instructions:\n';
    fileContent += '1. Use each prompt with your AI image generator\n';
    fileContent += '2. Save with the exact fileName specified\n';
    fileContent += '3. Upload to /public/images/profiles/ directory\n';
    fileContent += '4. Recommended size: 1024x1024 or higher\n\n';
    fileContent += '---\n\n';

    prompts.forEach((prompt, index) => {
      fileContent += `## ${index + 1}. ${prompt.fileName}\n`;
      fileContent += `**Exhibition Type:** ${prompt.exhibitionType}\n`;
      fileContent += `**Artwork Type:** ${prompt.artworkType}\n`;
      fileContent += `**Description:** ${prompt.description}\n`;
      fileContent += `**Style:** ${prompt.style}\n`;
      fileContent += `**Mood:** ${prompt.mood}\n\n`;
      fileContent += `**PROMPT:**\n${prompt.prompt}\n\n`;
      fileContent += '---\n\n';
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="sayu_128_prompts.txt"');
    res.send(fileContent);
  } catch (error) {
    console.error('Export prompts error:', error);
    res.status(500).json({ error: 'Failed to export prompts' });
  }
});

// Export as JSON for automated tools
router.get('/export-json', adminMiddleware, (req, res) => {
  try {
    const prompts = ProfileImageMappingService.generateBatchPrompts();
    const fileStructure = ProfileImageMappingService.createImageFileStructure();

    const exportData = {
      metadata: {
        total: prompts.length,
        exhibitionTypes: 16,
        artworkTypes: 8,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      },
      fileStructure,
      prompts
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="sayu_128_prompts.json"');
    res.json(exportData);
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({ error: 'Failed to export JSON' });
  }
});

// Validate image files (check which ones exist)
router.get('/validate-images', adminMiddleware, async (req, res) => {
  try {
    const combinations = ProfileImageMappingService.generateAllProfileCombinations();
    const publicDir = path.join(process.cwd(), 'public');

    const validation = {
      total: combinations.length,
      found: 0,
      missing: [],
      existing: []
    };

    for (const combo of combinations) {
      const fullPath = path.join(publicDir, combo.imagePath);

      try {
        await fs.access(fullPath);
        validation.existing.push({
          fileName: combo.imageFileName,
          exhibitionType: combo.exhibitionType,
          artworkType: combo.artworkType,
          path: combo.imagePath
        });
        validation.found++;
      } catch (error) {
        validation.missing.push({
          fileName: combo.imageFileName,
          exhibitionType: combo.exhibitionType,
          artworkType: combo.artworkType,
          expectedPath: combo.imagePath
        });
      }
    }

    validation.completionRate = Math.round((validation.found / validation.total) * 100);

    res.json(validation);
  } catch (error) {
    console.error('Validate images error:', error);
    res.status(500).json({ error: 'Failed to validate images' });
  }
});

// Get specific profile image info
router.get('/profile/:exhibitionType/:artworkType', (req, res) => {
  try {
    const { exhibitionType, artworkType } = req.params;

    const imageInfo = {
      exhibitionType,
      artworkType,
      combinationId: `${exhibitionType}_${artworkType}`,
      imageFileName: `profile_${exhibitionType}_${artworkType}.jpg`,
      imagePath: `/images/profiles/${exhibitionType}_${artworkType}.jpg`,
      fallbackPath: `/images/profiles/default_${exhibitionType}.jpg`
    };

    // Generate description and prompt for this specific combination
    const description = ProfileImageMappingService.generateProfileDescription(exhibitionType, artworkType);
    const prompt = ProfileImageMappingService.generateImagePrompt(exhibitionType, artworkType);

    res.json({
      imageInfo,
      description,
      prompt
    });
  } catch (error) {
    console.error('Get profile image info error:', error);
    res.status(500).json({ error: 'Failed to get profile image info' });
  }
});

module.exports = router;
