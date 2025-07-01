import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "name": "SAYU - Your Art DNA",
    "short_name": "SAYU",
    "description": "Discover your unique aesthetic personality through art",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#8b5cf6",
    "orientation": "portrait",
    "icons": [
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  };

  return new NextResponse(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}