import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle manifest.json requests
  if (request.nextUrl.pathname === '/manifest.json') {
    const response = NextResponse.next();
    
    // Set proper headers for manifest.json
    response.headers.set('Content-Type', 'application/manifest+json');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    
    return response;
  }

  // Handle icon requests
  if (request.nextUrl.pathname.startsWith('/icons/')) {
    const response = NextResponse.next();
    
    // Set proper headers for icons
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manifest.json', '/icons/:path*']
};