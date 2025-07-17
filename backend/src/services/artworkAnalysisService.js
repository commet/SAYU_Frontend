const sharp = require('sharp');
const logger = require('../utils/logger');
const { redisClient } = require('../config/redis');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for vector storage
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

class ArtworkAnalysisService {
  constructor() {
    this.colorMappings = {
      emotional: {
        warm: ['#FF6B6B', '#FFA07A', '#FFD700', '#FF8C00'],
        cool: ['#4169E1', '#00CED1', '#48D1CC', '#4682B4'],
        neutral: ['#808080', '#A9A9A9', '#C0C0C0', '#696969']
      },
      mood: {
        happy: 0.8,
        calm: 0.6,
        melancholic: 0.4,
        intense: 0.9
      }
    };
  }

  // Main analysis pipeline
  async analyzeArtwork(imageUrl, artworkId = null) {
    try {
      // Check cache first
      if (artworkId) {
        const cached = await this.getCachedAnalysis(artworkId);
        if (cached) return cached;
      }

      // Fetch and analyze image
      const buffer = await this.fetchImage(imageUrl);
      
      // Run analyses in parallel
      const [visualFeatures, composition, colorAnalysis] = await Promise.all([
        this.analyzeVisualFeatures(buffer),
        this.analyzeComposition(buffer),
        this.analyzeColors(buffer)
      ]);

      // Map to SAYU personality dimensions
      const personalityMapping = this.mapToSAYUPersonality(
        visualFeatures,
        composition,
        colorAnalysis
      );

      const result = {
        artworkId,
        imageUrl,
        visualFeatures,
        composition,
        colorAnalysis,
        personalityMapping,
        analyzedAt: new Date().toISOString()
      };

      // Cache and store results
      if (artworkId) {
        await this.cacheAnalysis(artworkId, result);
        await this.storeInDatabase(artworkId, result);
      }

      return result;

    } catch (error) {
      logger.error('Artwork analysis error:', error);
      throw error;
    }
  }

  // Fetch image from URL
  async fetchImage(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return response.buffer();
  }

  // Analyze visual features using Sharp
  async analyzeVisualFeatures(buffer) {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const stats = await image.stats();

    // Calculate brightness and contrast
    const brightness = stats.channels.reduce((sum, channel) => 
      sum + channel.mean, 0) / stats.channels.length / 255;
    
    const contrast = stats.channels.reduce((sum, channel) => 
      sum + channel.stdev, 0) / stats.channels.length / 128;

    // Detect edges for complexity
    const edgeBuffer = await image
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Edge detection kernel
      })
      .raw()
      .toBuffer();

    const complexity = this.calculateComplexity(edgeBuffer, metadata);

    return {
      dimensions: {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.width / metadata.height
      },
      brightness,
      contrast,
      complexity,
      format: metadata.format,
      hasAlpha: metadata.hasAlpha
    };
  }

  // Analyze composition using rule of thirds and golden ratio
  async analyzeComposition(buffer) {
    const image = sharp(buffer);
    const { width, height } = await image.metadata();

    // Divide image into regions
    const regions = await this.divideIntoRegions(image, width, height);
    
    // Calculate visual weight distribution
    const weightDistribution = await this.calculateWeightDistribution(regions);
    
    // Check for symmetry
    const symmetry = await this.checkSymmetry(regions);
    
    // Calculate dynamism based on diagonal elements
    const dynamism = this.calculateDynamism(weightDistribution);

    return {
      balance: this.calculateBalance(weightDistribution),
      symmetry,
      dynamism,
      focalPoints: this.findFocalPoints(weightDistribution),
      complexity: this.calculateCompositionComplexity(weightDistribution)
    };
  }

  // Analyze color palette and emotions
  async analyzeColors(buffer) {
    const image = sharp(buffer);
    
    // Extract dominant colors
    const { dominant } = await image.stats();
    
    // Resize for faster color analysis
    const smallBuffer = await image
      .resize(100, 100, { fit: 'inside' })
      .raw()
      .toBuffer();

    const colorPalette = this.extractColorPalette(smallBuffer);
    const emotionalMapping = this.mapColorsToEmotions(colorPalette);

    return {
      dominantColor: this.rgbToHex(dominant),
      palette: colorPalette.slice(0, 5),
      temperature: this.calculateColorTemperature(colorPalette),
      saturation: this.calculateAverageSaturation(colorPalette),
      emotionalMapping
    };
  }

  // Map analysis to SAYU personality dimensions
  mapToSAYUPersonality(visualFeatures, composition, colorAnalysis) {
    const { brightness, contrast, complexity } = visualFeatures;
    const { balance, symmetry, dynamism } = composition;
    const { temperature, saturation, emotionalMapping } = colorAnalysis;

    return {
      viewingStyle: {
        // High complexity and low brightness favor lone viewing
        lone: (complexity * 0.6 + (1 - brightness) * 0.4),
        // High brightness and warmth favor shared viewing
        shared: (brightness * 0.5 + temperature * 0.5)
      },
      perceptionMode: {
        // Abstract: low symmetry, high complexity, cool colors
        atmospheric: ((1 - symmetry) * 0.4 + complexity * 0.3 + (1 - temperature) * 0.3),
        // Realistic: high symmetry, clear structure, balanced colors
        realistic: (symmetry * 0.5 + balance * 0.5)
      },
      responseType: {
        // Emotional: warm colors, high contrast, dynamic composition
        emotional: (temperature * 0.4 + contrast * 0.3 + emotionalMapping.intensity * 0.3),
        // Meaningful: complex composition, symbolic elements
        meaningful: (complexity * 0.5 + (1 - dynamism) * 0.5)
      },
      explorationFit: {
        // Flow: dynamic, colorful, engaging
        flow: (dynamism * 0.5 + saturation * 0.5),
        // Constructive: structured, balanced, clear focal points
        constructive: (balance * 0.6 + symmetry * 0.4)
      }
    };
  }

  // Helper methods
  calculateComplexity(edgeBuffer, metadata) {
    // Count edge pixels
    let edgeCount = 0;
    const threshold = 30;
    
    for (let i = 0; i < edgeBuffer.length; i++) {
      if (edgeBuffer[i] > threshold) {
        edgeCount++;
      }
    }
    
    // Normalize by image size
    return edgeCount / (metadata.width * metadata.height);
  }

  async divideIntoRegions(image, width, height) {
    const regions = [];
    const regionSize = { width: Math.floor(width / 3), height: Math.floor(height / 3) };
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const region = await image
          .extract({
            left: col * regionSize.width,
            top: row * regionSize.height,
            width: regionSize.width,
            height: regionSize.height
          })
          .stats();
        
        regions.push({
          row,
          col,
          stats: region
        });
      }
    }
    
    return regions;
  }

  calculateWeightDistribution(regions) {
    const weights = regions.map(region => {
      const { mean, stdev } = region.stats.channels[0];
      return mean * 0.7 + stdev * 0.3; // Visual weight calculation
    });
    
    return {
      topLeft: weights[0],
      topCenter: weights[1],
      topRight: weights[2],
      middleLeft: weights[3],
      center: weights[4],
      middleRight: weights[5],
      bottomLeft: weights[6],
      bottomCenter: weights[7],
      bottomRight: weights[8]
    };
  }

  checkSymmetry(regions) {
    // Compare left and right sides
    let symmetryScore = 0;
    const pairs = [[0, 2], [3, 5], [6, 8]]; // Left-right pairs
    
    pairs.forEach(([left, right]) => {
      const leftStats = regions[left].stats.channels[0];
      const rightStats = regions[right].stats.channels[0];
      
      const diff = Math.abs(leftStats.mean - rightStats.mean) / 255;
      symmetryScore += (1 - diff);
    });
    
    return symmetryScore / pairs.length;
  }

  calculateBalance(weights) {
    // Calculate center of mass
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;
    
    Object.entries(weights).forEach(([position, weight], index) => {
      const x = index % 3;
      const y = Math.floor(index / 3);
      
      totalWeight += weight;
      weightedX += weight * x;
      weightedY += weight * y;
    });
    
    const centerX = weightedX / totalWeight;
    const centerY = weightedY / totalWeight;
    
    // Calculate distance from center (1, 1)
    const distance = Math.sqrt(Math.pow(centerX - 1, 2) + Math.pow(centerY - 1, 2));
    
    // Convert to balance score (1 = perfect balance)
    return 1 - (distance / Math.sqrt(2));
  }

  calculateDynamism(weights) {
    // Measure diagonal flow
    const diagonal1 = weights.topLeft + weights.center + weights.bottomRight;
    const diagonal2 = weights.topRight + weights.center + weights.bottomLeft;
    
    const maxDiagonal = Math.max(diagonal1, diagonal2);
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    return maxDiagonal / totalWeight;
  }

  findFocalPoints(weights) {
    const threshold = Object.values(weights).reduce((sum, w) => sum + w, 0) / 9 * 1.5;
    const focalPoints = [];
    
    Object.entries(weights).forEach(([position, weight]) => {
      if (weight > threshold) {
        focalPoints.push(position);
      }
    });
    
    return focalPoints;
  }

  calculateCompositionComplexity(weights) {
    // Calculate variance in weight distribution
    const values = Object.values(weights);
    const mean = values.reduce((sum, w) => sum + w, 0) / values.length;
    const variance = values.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  extractColorPalette(buffer) {
    // Simple k-means clustering for color extraction
    const pixels = [];
    for (let i = 0; i < buffer.length; i += 3) {
      pixels.push({
        r: buffer[i],
        g: buffer[i + 1],
        b: buffer[i + 2]
      });
    }
    
    // Sample pixels for performance
    const sampledPixels = this.samplePixels(pixels, 1000);
    
    // Find dominant colors using simple clustering
    return this.findDominantColors(sampledPixels, 5);
  }

  samplePixels(pixels, sampleSize) {
    const sampled = [];
    const step = Math.floor(pixels.length / sampleSize);
    
    for (let i = 0; i < pixels.length; i += step) {
      sampled.push(pixels[i]);
    }
    
    return sampled;
  }

  findDominantColors(pixels, k) {
    // Simple color quantization
    const colors = [];
    const buckets = {};
    
    // Group similar colors
    pixels.forEach(pixel => {
      const key = `${Math.floor(pixel.r / 32)}-${Math.floor(pixel.g / 32)}-${Math.floor(pixel.b / 32)}`;
      if (!buckets[key]) {
        buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
      }
      buckets[key].count++;
      buckets[key].r += pixel.r;
      buckets[key].g += pixel.g;
      buckets[key].b += pixel.b;
    });
    
    // Get average colors from buckets
    Object.values(buckets)
      .sort((a, b) => b.count - a.count)
      .slice(0, k)
      .forEach(bucket => {
        colors.push({
          r: Math.round(bucket.r / bucket.count),
          g: Math.round(bucket.g / bucket.count),
          b: Math.round(bucket.b / bucket.count),
          hex: this.rgbToHex([
            Math.round(bucket.r / bucket.count),
            Math.round(bucket.g / bucket.count),
            Math.round(bucket.b / bucket.count)
          ])
        });
      });
    
    return colors;
  }

  calculateColorTemperature(palette) {
    // Calculate warmth based on red/orange vs blue/green
    let warmScore = 0;
    
    palette.forEach(color => {
      const warmth = (color.r - color.b) / 255;
      warmScore += warmth;
    });
    
    // Normalize to 0-1 range
    return (warmScore / palette.length + 1) / 2;
  }

  calculateAverageSaturation(palette) {
    let totalSaturation = 0;
    
    palette.forEach(color => {
      const max = Math.max(color.r, color.g, color.b) / 255;
      const min = Math.min(color.r, color.g, color.b) / 255;
      const saturation = max === 0 ? 0 : (max - min) / max;
      totalSaturation += saturation;
    });
    
    return totalSaturation / palette.length;
  }

  mapColorsToEmotions(palette) {
    let emotionalIntensity = 0;
    let mood = 'neutral';
    
    palette.forEach(color => {
      // Red and orange: passionate, energetic
      if (color.r > 200 && color.g < 150) {
        emotionalIntensity += 0.9;
        mood = 'passionate';
      }
      // Blue: calm, serene
      else if (color.b > 150 && color.r < 100) {
        emotionalIntensity += 0.4;
        mood = 'calm';
      }
      // Green: balanced, natural
      else if (color.g > 150 && color.r < 150 && color.b < 150) {
        emotionalIntensity += 0.5;
        mood = 'balanced';
      }
      // Yellow: happy, energetic
      else if (color.r > 200 && color.g > 200 && color.b < 100) {
        emotionalIntensity += 0.8;
        mood = 'happy';
      }
    });
    
    return {
      intensity: Math.min(emotionalIntensity / palette.length, 1),
      mood,
      palette: palette.map(c => c.hex)
    };
  }

  rgbToHex(rgb) {
    if (Array.isArray(rgb)) {
      const [r, g, b] = rgb;
      return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }
    
    return '#' + [rgb.r, rgb.g, rgb.b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Caching methods
  async getCachedAnalysis(artworkId) {
    try {
      const cached = await redisClient.get(`artwork:analysis:${artworkId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Cache retrieval error:', error);
      return null;
    }
  }

  async cacheAnalysis(artworkId, analysis) {
    try {
      await redisClient.setex(
        `artwork:analysis:${artworkId}`,
        86400, // 24 hours
        JSON.stringify(analysis)
      );
    } catch (error) {
      logger.error('Cache storage error:', error);
    }
  }

  // Database storage with vector embeddings
  async storeInDatabase(artworkId, analysis) {
    try {
      // Create vector embedding from personality mapping
      const vector = this.createVector(analysis.personalityMapping);
      
      // Store in Supabase with pgvector
      const { error } = await supabase
        .from('artwork_analyses')
        .upsert({
          artwork_id: artworkId,
          visual_features: analysis.visualFeatures,
          composition: analysis.composition,
          color_analysis: analysis.colorAnalysis,
          personality_mapping: analysis.personalityMapping,
          personality_vector: vector,
          analyzed_at: analysis.analyzedAt
        });
      
      if (error) {
        logger.error('Database storage error:', error);
      }
    } catch (error) {
      logger.error('Database storage error:', error);
    }
  }

  createVector(personalityMapping) {
    // Flatten personality mapping to vector for similarity searches
    return [
      personalityMapping.viewingStyle.lone,
      personalityMapping.viewingStyle.shared,
      personalityMapping.perceptionMode.atmospheric,
      personalityMapping.perceptionMode.realistic,
      personalityMapping.responseType.emotional,
      personalityMapping.responseType.meaningful,
      personalityMapping.explorationFit.flow,
      personalityMapping.explorationFit.constructive
    ];
  }

  // Find similar artworks based on personality mapping
  async findSimilarArtworks(artworkId, limit = 10) {
    try {
      const currentAnalysis = await this.getCachedAnalysis(artworkId);
      if (!currentAnalysis) {
        throw new Error('Artwork analysis not found');
      }
      
      const vector = this.createVector(currentAnalysis.personalityMapping);
      
      // Use pgvector for similarity search
      const { data, error } = await supabase
        .rpc('find_similar_artworks', {
          query_vector: vector,
          limit_count: limit,
          exclude_id: artworkId
        });
      
      if (error) {
        logger.error('Similarity search error:', error);
        return [];
      }
      
      return data;
    } catch (error) {
      logger.error('Find similar artworks error:', error);
      return [];
    }
  }
}

module.exports = new ArtworkAnalysisService();