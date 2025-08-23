import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== TEST API ROUTE CALLED ===');
  console.log('Environment variables:');
  console.log('REPLICATE_API_TOKEN:', !!process.env.REPLICATE_API_TOKEN);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  return NextResponse.json({ 
    success: true,
    message: 'Test API Route working!',
    hasApiKey: !!process.env.REPLICATE_API_TOKEN,
    env: process.env.NODE_ENV
  });
}