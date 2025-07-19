const sharp = require('sharp');
const axios = require('axios');
const colorThief = require('colorthief');
const { createCanvas, loadImage } = require('canvas');

/**
 * 고급 예술 작품 분석기
 * 이미지 분석을 통한 APT 매칭 및 메타데이터 추출
 */
class ArtworkAnalyzer {
  constructor() {
    // APT 차원별 시각적 특성 매핑
    this.aptVisualMapping = {
      // E vs I (외향 vs 내향)
      E: {
        colors: ['vibrant', 'bright', 'warm', 'saturated'],
        composition: ['dynamic', 'crowded', 'open', 'expansive'],
        subjects: ['groups', 'celebrations', 'public spaces', 'action'],
        energy: 'high'
      },
      I: {
        colors: ['muted', 'cool', 'monochromatic', 'subtle'],
        composition: ['minimal', 'focused', 'intimate', 'contained'],
        subjects: ['solitary figures', 'quiet spaces', 'nature', 'introspection'],
        energy: 'low'
      },
      
      // N vs S (직관 vs 감각)
      N: {
        style: ['abstract', 'surreal', 'symbolic', 'conceptual'],
        reality: 'distorted',
        interpretation: 'multiple meanings',
        elements: ['metaphorical', 'dreamlike', 'imaginative']
      },
      S: {
        style: ['realistic', 'detailed', 'photographic', 'precise'],
        reality: 'accurate',
        interpretation: 'literal',
        elements: ['tangible', 'observable', 'concrete']
      },
      
      // T vs F (사고 vs 감정)
      T: {
        structure: ['geometric', 'symmetrical', 'organized', 'logical'],
        emotion: 'neutral',
        palette: ['cool', 'monochromatic'],
        focus: 'form over feeling'
      },
      F: {
        structure: ['organic', 'flowing', 'expressive', 'free-form'],
        emotion: 'strong',
        palette: ['warm', 'varied'],
        focus: 'feeling over form'
      },
      
      // J vs P (판단 vs 인식)
      J: {
        composition: ['structured', 'planned', 'finished', 'complete'],
        technique: ['precise', 'controlled', 'refined'],
        boundaries: 'defined'
      },
      P: {
        composition: ['spontaneous', 'loose', 'unfinished', 'open-ended'],
        technique: ['expressive', 'experimental', 'rough'],
        boundaries: 'fluid'
      }
    };
    
    // 감정-색상 매핑
    this.emotionColorMapping = {
      serene: {
        hues: [180, 240], // 청록색-파란색
        saturation: [0, 50],
        brightness: [50, 80]
      },
      joyful: {
        hues: [30, 90], // 노란색-주황색
        saturation: [60, 100],
        brightness: [70, 100]
      },
      melancholic: {
        hues: [200, 280], // 파란색-보라색
        saturation: [10, 40],
        brightness: [20, 50]
      },
      dramatic: {
        hues: [0, 30, 300, 360], // 빨간색
        saturation: [70, 100],
        brightness: [20, 40] // 어두운 톤
      },
      mysterious: {
        hues: [240, 300], // 보라색-자주색
        saturation: [20, 60],
        brightness: [10, 30]
      },
      energetic: {
        hues: [0, 60], // 빨간색-주황색
        saturation: [80, 100],
        brightness: [60, 90]
      }
    };
  }

  /**
   * 작품 이미지 종합 분석
   */
  async analyzeArtwork(imageUrl, metadata = {}) {
    try {
      const analysis = {
        technical: await this.analyzeTechnicalQuality(imageUrl),
        colors: await this.analyzeColors(imageUrl),
        composition: await this.analyzeComposition(imageUrl),
        apt: {},
        emotions: [],
        quality_score: 0
      };
      
      // APT 매칭 점수 계산
      analysis.apt = this.calculateAPTScores(analysis);
      
      // 감정 태그 추출
      analysis.emotions = this.extractEmotions(analysis.colors);
      
      // 품질 점수 계산
      analysis.quality_score = this.calculateQualityScore(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Artwork analysis failed:', error);
      return null;
    }
  }

  /**
   * 기술적 품질 분석
   */
  async analyzeTechnicalQuality(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const stats = await image.stats();
    
    return {
      dimensions: {
        width: metadata.width,
        height: metadata.height,
        aspect_ratio: metadata.width / metadata.height
      },
      format: metadata.format,
      size: buffer.length,
      quality: {
        resolution: metadata.width * metadata.height,
        is_high_res: metadata.width >= 1920 || metadata.height >= 1920,
        sharpness: this.calculateSharpness(stats),
        contrast: this.calculateContrast(stats),
        dynamic_range: this.calculateDynamicRange(stats)
      }
    };
  }

  /**
   * 색상 분석
   */
  async analyzeColors(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // Sharp로 이미지 리사이즈 (분석 속도 향상)
    const resized = await sharp(buffer)
      .resize(400, 400, { fit: 'inside' })
      .toBuffer();
    
    // 주요 색상 추출
    const image = await loadImage(resized);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = this.extractColorPalette(imageData);
    
    return {
      dominant: colors.dominant,
      palette: colors.palette,
      distribution: colors.distribution,
      temperature: this.calculateColorTemperature(colors.palette),
      saturation: this.calculateAverageSaturation(colors.palette),
      brightness: this.calculateAverageBrightness(colors.palette),
      contrast: this.calculateColorContrast(colors.palette)
    };
  }

  /**
   * 구도 분석
   */
  async analyzeComposition(imageUrl) {
    // 실제로는 TensorFlow.js나 OpenCV를 사용하여 구현
    // 여기서는 간단한 규칙 기반 분석
    
    return {
      rule_of_thirds: this.checkRuleOfThirds(),
      symmetry: this.checkSymmetry(),
      balance: this.checkBalance(),
      focal_points: this.detectFocalPoints(),
      depth: this.estimateDepth(),
      movement: this.detectMovement()
    };
  }

  /**
   * APT 점수 계산
   */
  calculateAPTScores(analysis) {
    const scores = {
      E: 0, I: 0,
      N: 0, S: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };
    
    // E/I 차원 평가
    if (analysis.colors.saturation > 70 && analysis.colors.brightness > 60) {
      scores.E += 2;
    } else if (analysis.colors.saturation < 40 && analysis.colors.brightness < 50) {
      scores.I += 2;
    }
    
    // 색상 온도 기반
    if (analysis.colors.temperature > 0.6) scores.E += 1;
    if (analysis.colors.temperature < 0.4) scores.I += 1;
    
    // N/S 차원 평가 (추상성)
    if (analysis.technical.quality.sharpness < 0.5) scores.N += 1;
    if (analysis.technical.quality.sharpness > 0.8) scores.S += 1;
    
    // T/F 차원 평가 (감정성)
    if (analysis.colors.temperature > 0.7) scores.F += 2;
    if (analysis.colors.temperature < 0.3) scores.T += 2;
    
    // J/P 차원 평가 (구조성)
    if (analysis.composition.symmetry > 0.8) scores.J += 2;
    if (analysis.composition.symmetry < 0.3) scores.P += 2;
    
    // 최종 APT 유형 결정
    const aptType = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.N > scores.S ? 'N' : 'S') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');
    
    return {
      type: aptType,
      scores: scores,
      confidence: this.calculateConfidence(scores)
    };
  }

  /**
   * 감정 추출
   */
  extractEmotions(colorAnalysis) {
    const emotions = [];
    const dominantHue = this.rgbToHue(colorAnalysis.dominant);
    
    for (const [emotion, criteria] of Object.entries(this.emotionColorMapping)) {
      let match = 0;
      
      // 색조 매칭
      if (criteria.hues.some(range => 
        (typeof range === 'number' && Math.abs(dominantHue - range) < 30) ||
        (Array.isArray(range) && dominantHue >= range[0] && dominantHue <= range[1])
      )) {
        match += 1;
      }
      
      // 채도 매칭
      if (colorAnalysis.saturation >= criteria.saturation[0] && 
          colorAnalysis.saturation <= criteria.saturation[1]) {
        match += 1;
      }
      
      // 명도 매칭
      if (colorAnalysis.brightness >= criteria.brightness[0] && 
          colorAnalysis.brightness <= criteria.brightness[1]) {
        match += 1;
      }
      
      if (match >= 2) {
        emotions.push({
          emotion: emotion,
          confidence: match / 3
        });
      }
    }
    
    return emotions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 품질 점수 계산
   */
  calculateQualityScore(analysis) {
    let score = 0;
    
    // 해상도 점수 (30%)
    if (analysis.technical.quality.is_high_res) score += 30;
    else if (analysis.technical.quality.resolution > 1000000) score += 20;
    else if (analysis.technical.quality.resolution > 500000) score += 10;
    
    // 선명도 점수 (20%)
    score += analysis.technical.quality.sharpness * 20;
    
    // 대비 점수 (20%)
    score += analysis.technical.quality.contrast * 20;
    
    // 색상 풍부도 (15%)
    if (analysis.colors.palette.length >= 5) score += 15;
    else score += (analysis.colors.palette.length / 5) * 15;
    
    // 구도 점수 (15%)
    const compositionScore = (
      analysis.composition.rule_of_thirds * 0.5 +
      analysis.composition.balance * 0.5
    ) * 15;
    score += compositionScore;
    
    return Math.min(100, Math.round(score));
  }

  // 유틸리티 메서드들
  extractColorPalette(imageData) {
    // K-means 클러스터링을 사용한 색상 팔레트 추출
    // 실제 구현은 더 복잡하지만, 여기서는 간단한 버전
    const pixels = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      pixels.push([
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2]
      ]);
    }
    
    // 색상 빈도 계산
    const colorMap = new Map();
    pixels.forEach(pixel => {
      const key = pixel.join(',');
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    });
    
    // 상위 10개 색상 추출
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([color, count]) => ({
        rgb: color.split(',').map(Number),
        frequency: count / pixels.length
      }));
    
    return {
      dominant: sortedColors[0].rgb,
      palette: sortedColors.map(c => c.rgb),
      distribution: sortedColors
    };
  }

  calculateSharpness(stats) {
    // 표준편차를 이용한 선명도 계산
    const avgStdDev = stats.channels.reduce((sum, channel) => 
      sum + channel.stdev, 0) / stats.channels.length;
    return Math.min(1, avgStdDev / 128);
  }

  calculateContrast(stats) {
    // 최대값과 최소값의 차이를 이용한 대비 계산
    const contrasts = stats.channels.map(channel => 
      (channel.max - channel.min) / 255
    );
    return contrasts.reduce((sum, c) => sum + c, 0) / contrasts.length;
  }

  calculateDynamicRange(stats) {
    // 히스토그램 분포를 이용한 다이나믹 레인지 계산
    return stats.channels.reduce((sum, channel) => 
      sum + (channel.max - channel.min), 0) / (stats.channels.length * 255);
  }

  calculateColorTemperature(palette) {
    // 따뜻한 색상 vs 차가운 색상 비율
    let warm = 0, cool = 0;
    
    palette.forEach(rgb => {
      const hue = this.rgbToHue(rgb);
      if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
        warm++;
      } else if (hue >= 180 && hue <= 300) {
        cool++;
      }
    });
    
    return warm / (warm + cool + 1);
  }

  calculateAverageSaturation(palette) {
    const saturations = palette.map(rgb => {
      const hsl = this.rgbToHsl(rgb);
      return hsl.s;
    });
    return saturations.reduce((sum, s) => sum + s, 0) / saturations.length * 100;
  }

  calculateAverageBrightness(palette) {
    const brightnesses = palette.map(rgb => {
      const hsl = this.rgbToHsl(rgb);
      return hsl.l;
    });
    return brightnesses.reduce((sum, b) => sum + b, 0) / brightnesses.length * 100;
  }

  calculateColorContrast(palette) {
    if (palette.length < 2) return 0;
    
    // 가장 밝은 색과 가장 어두운 색의 대비
    const luminances = palette.map(rgb => this.calculateLuminance(rgb));
    const maxLum = Math.max(...luminances);
    const minLum = Math.min(...luminances);
    
    return (maxLum + 0.05) / (minLum + 0.05);
  }

  rgbToHue(rgb) {
    const [r, g, b] = rgb.map(v => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let hue = 0;
    if (delta === 0) return 0;
    
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    
    return hue;
  }

  rgbToHsl(rgb) {
    const [r, g, b] = rgb.map(v => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max === min) return { h: 0, s: 0, l };
    
    const delta = max - min;
    const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
    let h = 0;
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / delta + 2) / 6;
    else h = ((r - g) / delta + 4) / 6;
    
    return { h: h * 360, s, l };
  }

  calculateLuminance(rgb) {
    const [r, g, b] = rgb.map(v => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // 더미 메서드들 (실제 구현 시 OpenCV 등 사용)
  checkRuleOfThirds() { return Math.random(); }
  checkSymmetry() { return Math.random(); }
  checkBalance() { return Math.random(); }
  detectFocalPoints() { return []; }
  estimateDepth() { return Math.random(); }
  detectMovement() { return Math.random(); }
  
  calculateConfidence(scores) {
    // 각 차원의 점수 차이를 기반으로 신뢰도 계산
    const diffs = [
      Math.abs(scores.E - scores.I),
      Math.abs(scores.N - scores.S),
      Math.abs(scores.T - scores.F),
      Math.abs(scores.J - scores.P)
    ];
    const avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
    return Math.min(1, avgDiff / 2);
  }
}

module.exports = ArtworkAnalyzer;