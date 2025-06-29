# SAYU 128 Profile Images System Guide

## 🎯 Overview

SAYU generates **128 unique profile images** by combining:
- **16 Exhibition Preference Types** (GAEF, GAMC, SREF, etc.)
- **8 Artwork Preference Types** (Symbolic Emotional, Narrative Representational, etc.)
- **Formula**: 16 × 8 = 128 unique combinations

## 📊 System Structure

### Exhibition Types (16)
```
Grounded Types:  GAEF, GAEC, GAMF, GAMC, GREF, GREC, GRMF, GRMC
Shared Types:    SAEF, SAEC, SAMF, SAMC, SREF, SREC, SRMF, SRMC
```

### Artwork Types (8)
```
SYM_EMO  - Symbolic Emotional      (symbolic_complexity + emotional_resonance)
SYM_SPA  - Symbolic Spatial        (symbolic_complexity + spatial_complexity)  
NAR_REP  - Narrative Representational (clear_narrative + representational_form)
MAT_VIV  - Material Vivid          (material_detail + vivid_color)
CAL_MIN  - Calm Minimalist         (calm_mood + representational_form)
EMO_SPA  - Emotional Spatial       (emotional_resonance + spatial_complexity)
VIV_NAR  - Vivid Narrative         (vivid_color + clear_narrative)
BAL_MIX  - Balanced Mixed          (material_detail + calm_mood)
```

## 🖼️ Image Generation Process

### Step 1: Get AI Generation Prompts

**Endpoint**: `GET /api/image-generation/batch-prompts`
**Headers**: `Authorization: Bearer <admin-jwt-token>`

```bash
# First, create an admin user
node src/scripts/createAdmin.js admin@sayu.com your-secure-password

# Login to get admin token
curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@sayu.com","password":"your-secure-password"}'

# Use the token to access admin endpoints
curl -H "Authorization: Bearer <your-admin-token>" \
     http://localhost:3001/api/image-generation/batch-prompts
```

**Response**: 128 detailed prompts for AI image generation

### Step 2: Download Prompt File

**Endpoint**: `GET /api/image-generation/export-prompts`

```bash
curl -H "x-admin-key: your-admin-key" \
     http://localhost:3001/api/image-generation/export-prompts \
     -o sayu_128_prompts.txt
```

### Step 3: Generate Images with AI

Use the prompts with any AI image generator:

#### Option A: DALL-E 3
```python
import openai
import json

# Load prompts
with open('sayu_128_prompts.json', 'r') as f:
    data = json.load(f)

for prompt_data in data['prompts']:
    response = openai.Image.create(
        prompt=prompt_data['prompt'],
        n=1,
        size="1024x1024"
    )
    
    # Save with exact filename
    image_url = response['data'][0]['url']
    # Download and save as prompt_data['fileName']
```

#### Option B: Midjourney
```
/imagine prompt: [Copy prompt from file]
```
Save each image with the corresponding `fileName` from the prompts.

#### Option C: Stable Diffusion
```python
from diffusers import StableDiffusionPipeline

pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")

for prompt_data in prompts:
    image = pipe(prompt_data['prompt']).images[0]
    image.save(f"profiles/{prompt_data['fileName']}")
```

### Step 4: Upload Images to Server

Create the directory structure:
```bash
mkdir -p /home/yclee913/sayu/frontend/public/images/profiles
```

Upload all 128 images with exact filenames:
```
profile_GAEF_SYM_EMO.jpg
profile_GAEF_SYM_SPA.jpg
profile_GAEF_NAR_REP.jpg
... (125 more files)
profile_SRMC_BAL_MIX.jpg
```

### Step 5: Validate Image Upload

**Endpoint**: `GET /api/image-generation/validate-images`

```bash
curl -H "x-admin-key: your-admin-key" \
     http://localhost:3001/api/image-generation/validate-images
```

**Response**:
```json
{
  "total": 128,
  "found": 95,
  "missing": [...],
  "existing": [...],
  "completionRate": 74
}
```

## 🔄 How the System Works

### 1. User Takes Quiz
User completes both exhibition and artwork preference quizzes.

### 2. Profile Calculation
```javascript
// Exhibition result: GAEF (Grounded, Abstract, Emotional, Flow)
// Artwork analysis: User prefers symbolic_complexity + emotional_resonance
// Artwork type determined: SYM_EMO (Symbolic Emotional)
// Final combination: GAEF_SYM_EMO
// Image path: /images/profiles/profile_GAEF_SYM_EMO.jpg
```

### 3. Dynamic Image Selection
The system automatically selects the correct image based on the user's unique combination.

## 📝 File Naming Convention

**Pattern**: `profile_{EXHIBITION_TYPE}_{ARTWORK_TYPE}.jpg`

**Examples**:
- `profile_GAEF_SYM_EMO.jpg` - Grounded + Abstract + Emotional + Flow + Symbolic Emotional
- `profile_SRMC_NAR_REP.jpg` - Shared + Realistic + Meaning + Constructive + Narrative Representational

## 🎨 Image Style Guidelines

### Visual Themes by Exhibition Type

**Grounded Types (G)**:
- Intimate, personal gallery settings
- Individual contemplation poses
- Focused, introspective mood

**Shared Types (S)**:
- Social gallery environments
- Group interactions or discussions
- Collaborative, community atmosphere

### Visual Elements by Artwork Type

**SYM_EMO** - Abstract expressionist, emotionally charged
**SYM_SPA** - Geometric abstraction, architectural forms
**NAR_REP** - Classical realism, storytelling scenes
**MAT_VIV** - Textural surfaces, bright colors
**CAL_MIN** - Minimalist, soft tones, tranquil
**EMO_SPA** - Immersive installations, spatial drama
**VIV_NAR** - Colorful illustrations, dynamic scenes
**BAL_MIX** - Refined craftsmanship, harmonious balance

## 🚀 API Endpoints

### Admin Endpoints (require `x-admin-key` header)

```bash
# Get all 128 combinations
GET /api/image-generation/combinations

# Get batch prompts for AI generation
GET /api/image-generation/batch-prompts

# Export prompts as downloadable text file
GET /api/image-generation/export-prompts

# Export prompts as JSON
GET /api/image-generation/export-json

# Validate uploaded images
GET /api/image-generation/validate-images
```

### Public Endpoints

```bash
# Get specific profile image info
GET /api/image-generation/profile/{exhibitionType}/{artworkType}

# Example:
GET /api/image-generation/profile/GAEF/SYM_EMO
```

## 🔧 Implementation Notes

### Fallback System
If a specific combination image doesn't exist:
1. Try main image: `/images/profiles/profile_GAEF_SYM_EMO.jpg`
2. Fall back to exhibition default: `/images/profiles/default_GAEF.jpg`
3. Final fallback: `/images/profiles/default_profile.jpg`

### Performance Optimization
- Images should be optimized (max 500KB each)
- Consider using WebP format for better compression
- Implement lazy loading for better user experience

### Database Storage
The system stores:
- `exhibition_type_code`: "GAEF"
- `artwork_type_code`: "SYM_EMO"  
- `combination_id`: "GAEF_SYM_EMO"
- `profile_image_path`: "/images/profiles/profile_GAEF_SYM_EMO.jpg"

## 📋 Checklist for Implementation

- [ ] Generate 128 AI prompts using `/batch-prompts` endpoint
- [ ] Create 128 images using AI generation service
- [ ] Upload images to `/public/images/profiles/` with exact filenames
- [ ] Validate upload using `/validate-images` endpoint
- [ ] Test profile generation with various quiz combinations
- [ ] Create fallback images for each exhibition type (16 images)
- [ ] Set up image optimization and compression
- [ ] Monitor system performance and loading times

## 🎯 Success Metrics

- **100% Coverage**: All 128 combinations have corresponding images
- **Fast Loading**: Images load in under 2 seconds
- **Accurate Mapping**: Users receive correct image for their profile
- **Fallback Reliability**: System gracefully handles missing images

Your SAYU platform will now provide each user with a unique, personalized profile image that perfectly represents their combination of exhibition preferences and artwork tastes!