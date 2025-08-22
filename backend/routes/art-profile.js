const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Replicate API endpoint for image generation
router.post('/generate', async (req, res) => {
  try {
    const { base64Image, styleId } = req.body;
    
    if (!base64Image || !styleId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: base64Image and styleId'
      });
    }

    // Get Replicate API key from environment
    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) {
      console.error('Replicate API key not configured');
      return res.status(500).json({
        success: false,
        message: 'Image generation service not configured'
      });
    }

    console.log(`🎨 Starting image generation with style: ${styleId}`);

    // Get model configuration for style
    const modelConfig = getReplicateModelForStyle(styleId);
    console.log(`Using Replicate model: ${modelConfig.name}`);

    // Create prediction
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: modelConfig.version,
        input: {
          ...modelConfig.baseInput,
          image: base64Image,
          prompt: getPromptForStyle(styleId),
          ...(modelConfig.supportNegativePrompt && {
            negative_prompt: getNegativePromptForStyle(styleId)
          })
        }
      })
    });

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text();
      console.error('Replicate API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to start image generation'
      });
    }

    const prediction = await predictionResponse.json();
    console.log(`Prediction started with ID: ${prediction.id}`);

    // Poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`
          }
        }
      );
      
      if (!pollResponse.ok) {
        console.error('Failed to poll prediction status');
        break;
      }

      result = await pollResponse.json();
      attempts++;
      
      if (attempts % 5 === 0) {
        console.log(`Still processing... (${attempts}s)`);
      }
    }

    if (result.status === 'failed') {
      console.error('Prediction failed:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Image generation failed'
      });
    }

    if (result.status !== 'succeeded') {
      console.error('Prediction timeout');
      return res.status(500).json({
        success: false,
        message: 'Image generation timeout'
      });
    }

    console.log('✅ Image generation completed successfully');

    // Return the generated image
    res.json({
      success: true,
      data: {
        transformedImage: result.output[0],
        predictionId: prediction.id,
        model: modelConfig.name
      }
    });

  } catch (error) {
    console.error('Art profile generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Helper functions
function getPromptForStyle(styleId) {
  const prompts = {
    'vangogh-postimpressionism': 'Transform into Van Gogh style painting with swirling brushstrokes, vibrant yellows and blues, thick impasto texture, post-impressionist masterpiece',
    'monet-impressionism': 'Transform into Claude Monet impressionist painting, soft brushstrokes, water lilies style, natural lighting, beautiful color harmony',
    'picasso-cubism': 'Transform into Pablo Picasso cubist painting, geometric fragmentation, multiple perspectives, bold angular shapes, abstract forms',
    'warhol-popart': 'Transform into Andy Warhol pop art style, bright vivid colors, screen printing effect, commercial art aesthetic, bold contrast',
    'klimt-artnouveau': 'Transform into Gustav Klimt art nouveau style, golden decorative patterns, ornamental elements, byzantine influence',
    'anime-style': 'Transform into beautiful anime art style, cel-shading, vibrant colors, studio ghibli quality, detailed character design',
    'cyberpunk-digital': 'Transform into cyberpunk digital art, neon colors, futuristic aesthetic, holographic effects, blade runner style',
    'pixelart-digital': 'Transform into 16-bit pixel art style, retro gaming aesthetic, crisp pixels, limited color palette'
  };
  
  return prompts[styleId] || 'Transform into artistic painting with enhanced colors and creative style';
}

function getNegativePromptForStyle(styleId) {
  const negativePrompts = {
    'vangogh-postimpressionism': 'photographic, smooth, digital, modern, minimalist',
    'monet-impressionism': 'sharp edges, digital art, photography, geometric',
    'picasso-cubism': 'realistic, photographic, smooth, traditional',
    'warhol-popart': 'muted colors, traditional painting, realistic, dark',
    'klimt-artnouveau': 'modern, minimalist, plain, simple',
    'anime-style': 'realistic, photographic, western style, 3D render',
    'cyberpunk-digital': 'vintage, classical, natural, traditional',
    'pixelart-digital': 'smooth, high resolution, photorealistic, blurry'
  };
  
  return negativePrompts[styleId] || 'low quality, blurry, distorted, amateur';
}

function getReplicateModelForStyle(styleId) {
  const models = {
    // SDXL-Lightning - Fast and high quality for general style transfer
    'default': {
      name: 'SDXL-Lightning Image-to-Image',
      version: '527d2a6296facb8e47ba1eaf17f142c240c19a30894f437feee9b91cc29d8e4f',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 4,
        guidance_scale: 1.5,
        strength: 0.8,
        scheduler: 'K_EULER'
      }
    },
    
    // Artistic styles
    'vangogh-postimpressionism': {
      name: 'Stable Diffusion Img2Img',
      version: '15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 50,
        guidance_scale: 7.5,
        prompt_strength: 0.8,
        scheduler: 'DPMSolverMultistep'
      }
    },
    
    'monet-impressionism': {
      name: 'SDXL Img2Img',
      version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 30,
        guidance_scale: 6,
        strength: 0.75,
        refine: 'expert_ensemble_refiner'
      }
    },
    
    'picasso-cubism': {
      name: 'ControlNet SDXL',
      version: 'f9b9e5bdd896922a8ef17377801e93c9867216b40f95bbc12eff20e20265d665',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 40,
        guidance_scale: 8,
        controlnet_conditioning_scale: 0.5,
        strength: 0.85
      }
    },
    
    'warhol-popart': {
      name: 'SDXL-Lightning Fast',
      version: '527d2a6296facb8e47ba1eaf17f142c240c19a30894f437feee9b91cc29d8e4f',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 4,
        guidance_scale: 2,
        strength: 0.9,
        scheduler: 'K_EULER'
      }
    },
    
    'klimt-artnouveau': {
      name: 'Stable Diffusion XL',
      version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 50,
        guidance_scale: 7,
        strength: 0.8,
        refine: 'expert_ensemble_refiner',
        high_noise_frac: 0.8
      }
    },
    
    // Digital art styles
    'anime-style': {
      name: 'Anything V5 (Anime)',
      version: '42a996d39a96aedc57b2e0aa8105dea39c9c89d9d266caf6bb4327a1c191b061',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 25,
        guidance_scale: 7,
        strength: 0.7,
        scheduler: 'K_EULER_ANCESTRAL'
      }
    },
    
    'cyberpunk-digital': {
      name: 'SDXL CyberRealistic',
      version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 30,
        guidance_scale: 9,
        strength: 0.85,
        refine: 'expert_ensemble_refiner'
      }
    },
    
    'pixelart-digital': {
      name: 'Pixel Art Style',
      version: '527d2a6296facb8e47ba1eaf17f142c240c19a30894f437feee9b91cc29d8e4f',
      supportNegativePrompt: true,
      baseInput: {
        num_inference_steps: 8,
        guidance_scale: 3,
        strength: 0.95,
        scheduler: 'K_EULER'
      }
    }
  };
  
  return models[styleId] || models['default'];
}

module.exports = router;