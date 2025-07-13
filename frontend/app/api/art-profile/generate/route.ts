import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, getApiUrl } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();

    // Forward request to backend
    const response = await fetch(getApiUrl(API_CONFIG.endpoints.artProfile.generate), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Art profile generation proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate art profile' },
      { status: 500 }
    );
  }
}