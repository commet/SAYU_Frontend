import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    let url = 'https://sayubackend-production.up.railway.app/api/personality-types';
    if (type) {
      url += `/${type}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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