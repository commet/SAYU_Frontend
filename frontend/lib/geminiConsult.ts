import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API for consulting on museum simulation design
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function consultGeminiOnSimulation() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
I'm building a museum visit simulation quiz for an art personality test called SAYU. 
Instead of simple text questions, I want to create an immersive narrative experience where users:

1. Start by choosing a museum to visit
2. Meet a docent and decide how to tour
3. React to artworks emotionally or analytically
4. Record their experience in different ways

Key requirements:
- Each stage needs a background image showing the situation
- Choice options should also be visual (image-based)
- The narrative should feel like a real museum visit journey
- Images should create emotional connection and immersion

Current challenge: How to implement images effectively?
- Should we use AI-generated images?
- Stock photos with proper licensing?
- Illustrated/artistic style?
- Or a combination?

Please provide:
1. Best approach for sourcing/creating these images
2. Specific visual style recommendations for consistency
3. Technical implementation suggestions for Next.js
4. Alternative solutions if full images aren't feasible
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini consultation error:', error);
    return null;
  }
}

// Function to generate image prompts for AI image generation
export function generateImagePrompts(stage: any) {
  const baseStyle = "digital art, museum atmosphere, soft lighting, emotional, artistic";
  
  const prompts = {
    backgrounds: {
      "city-view": `${baseStyle}, cityscape with museums in view, afternoon light, inviting atmosphere`,
      "museum-entrance": `${baseStyle}, grand museum entrance, architectural beauty, welcoming`,
      "gallery-space": `${baseStyle}, modern gallery interior, white walls, artwork displays, serene`,
      "viewing-art": `${baseStyle}, silhouettes of people viewing art, contemplative mood`,
      "special-moment": `${baseStyle}, person standing before large artwork, moment of connection`,
      "museum-cafe": `${baseStyle}, cozy museum cafe, warm lighting, peaceful atmosphere`,
      "museum-shop": `${baseStyle}, museum gift shop, colorful displays, artistic merchandise`,
      "sunset-street": `${baseStyle}, city street at sunset, person walking, reflective mood`
    },
    choices: {
      "modern-museum": `${baseStyle}, contemporary museum architecture, glass and steel, innovative`,
      "classical-museum": `${baseStyle}, classical museum building, columns, traditional architecture`,
      "alone-viewing": `${baseStyle}, single person viewing art, solitary contemplation, peaceful`,
      "docent-tour": `${baseStyle}, group with guide in gallery, interactive, engaged`,
      "emotional-response": `${baseStyle}, person moved by artwork, emotional expression, wonder`,
      "analytical-response": `${baseStyle}, person studying artwork closely, thoughtful, analytical`,
      "flow-viewing": `${baseStyle}, casual gallery stroll, relaxed movement, organic path`,
      "reading-labels": `${baseStyle}, person reading museum label, focused, learning`,
      "abstract-art": `${baseStyle}, colorful abstract painting, bold strokes, emotional impact`,
      "portrait-art": `${baseStyle}, detailed realistic portrait, classical technique, precision`,
      "writing-journal": `${baseStyle}, hands writing in notebook, personal reflection, intimate`,
      "sharing-phone": `${baseStyle}, person sharing on phone, social connection, modern`,
      "art-postcard": `${baseStyle}, collection of art postcards, museum shop display, variety`,
      "art-book": `${baseStyle}, exhibition catalogs, coffee table books, knowledge`,
      "emotional-memory": `${baseStyle}, abstract representation of emotion, warm colors, feeling`,
      "new-perspective": `${baseStyle}, abstract concept of insight, light breaking through, revelation`
    }
  };
  
  return prompts;
}

// Temporary image solution using gradient placeholders
export function generatePlaceholderImages() {
  const placeholders = {
    backgrounds: {
      "city-view": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "museum-entrance": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "gallery-space": "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
      "viewing-art": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "special-moment": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "museum-cafe": "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "museum-shop": "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      "sunset-street": "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
    },
    choices: {
      "modern-museum": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "classical-museum": "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
      "alone-viewing": "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
      "docent-tour": "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      "emotional-response": "linear-gradient(135deg, #f77062 0%, #fe5196 100%)",
      "analytical-response": "linear-gradient(135deg, #96e6a1 0%, #d4fc79 100%)",
      "flow-viewing": "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
      "reading-labels": "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      "abstract-art": "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      "portrait-art": "linear-gradient(135deg, #ffeaa7 0%, #dfe6e9 100%)",
      "writing-journal": "linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)",
      "sharing-phone": "linear-gradient(135deg, #50cc7f 0%, #f5d100 100%)",
      "art-postcard": "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
      "art-book": "linear-gradient(135deg, #e8b4b8 0%, #a67c90 100%)",
      "emotional-memory": "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
      "new-perspective": "linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%)"
    }
  };
  
  return placeholders;
}