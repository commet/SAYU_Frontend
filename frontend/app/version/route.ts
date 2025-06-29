import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '2.2.1',
    buildTime: new Date().toISOString(),
    features: {
      museumSimulation: true,
      stableImages: true,
      personalityIcons: true,
      artworkRecommendations: true,
      koreanTranslations: true,
      aiCouncil: true
    },
    lastUpdate: '2025-06-27 - Reverted to img tags for immediate fix'
  });
}