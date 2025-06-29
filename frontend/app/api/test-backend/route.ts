import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://sayubackend-production.up.railway.app/api/quiz/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      proxy: true,
      data: data
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      proxy: true,
      error: error.message
    }, { status: 500 });
  }
}