import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();
    
    console.log('🤖 AI Council Session Starting...');
    console.log('Question:', question);
    
    // Prepare the council
    const responses: Record<string, any> = {};
    
    // 1. Ask Gemini
    try {
      console.log('🟣 Consulting Gemini...');
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const geminiResult = await geminiModel.generateContent(question);
      responses.gemini = {
        success: true,
        response: geminiResult.response.text(),
        model: 'gemini-pro'
      };
    } catch (error: any) {
      console.error('Gemini error:', error);
      responses.gemini = { success: false, error: error.message };
    }
    
    // 2. Ask ChatGPT
    try {
      console.log('🟢 Consulting ChatGPT...');
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an expert in art curation, UX design, and museum experiences.' },
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        responses.chatgpt = {
          success: true,
          response: data.choices[0].message.content,
          model: data.model
        };
      } else {
        throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
      }
    } catch (error: any) {
      console.error('ChatGPT error:', error);
      responses.chatgpt = { success: false, error: error.message };
    }
    
    // 3. Claude's perspective (from the request context)
    responses.claude = {
      success: true,
      response: context?.claudePerspective || "Claude is facilitating this discussion and will synthesize the insights.",
      model: 'claude-3'
    };
    
    // 4. Synthesize insights
    let synthesis = '';
    const successfulResponses = Object.entries(responses)
      .filter(([_, resp]) => resp.success)
      .map(([ai, resp]) => `${ai.toUpperCase()}: ${resp.response}`);
    
    if (successfulResponses.length > 1) {
      // Ask Gemini to synthesize (as a neutral party)
      try {
        const synthesisPrompt = `
Based on these AI perspectives on "${question}":

${successfulResponses.join('\n\n')}

Please provide a balanced synthesis that:
1. Identifies common themes and agreements
2. Highlights unique insights from each AI
3. Suggests the best combined approach
4. Points out any important disagreements
`;
        
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const synthesisResult = await geminiModel.generateContent(synthesisPrompt);
        synthesis = synthesisResult.response.text();
      } catch (error) {
        synthesis = 'Unable to synthesize responses automatically.';
      }
    }
    
    return NextResponse.json({ 
      success: true,
      question,
      responses,
      synthesis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('AI Council error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}