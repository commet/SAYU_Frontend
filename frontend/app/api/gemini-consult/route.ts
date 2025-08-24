import { NextRequest, NextResponse } from 'next/server';
// EMERGENCY: Gemini API disabled due to unexpected billing spike
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  // EMERGENCY: Gemini API disabled to prevent further charges
  return NextResponse.json({ 
    success: false, 
    error: 'Gemini API temporarily disabled due to billing issues. Please use alternative AI services.' 
  }, { status: 503 });
  
  /* DISABLED CODE - DO NOT UNCOMMENT WITHOUT VERIFICATION
  try {
    const { prompt } = await request.json();
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ 
      success: true, 
      response: text 
    });
    
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
  */
}