import { NextRequest, NextResponse } from 'next/server';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityGradients } from '@/constants/personality-gradients';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type) {
      // Return specific personality type
      const personality = personalityDescriptions[type];
      const gradient = personalityGradients[type];
      
      if (!personality) {
        return NextResponse.json({
          success: false,
          error: 'Personality type not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: {
          personalityData: {
            code: type,
            name: gradient?.name || personality.title,
            nameEn: gradient?.nameEn || personality.title,
            title: personality.title,
            subtitle: personality.subtitle,
            essence: personality.essence,
            strengths: personality.strengths,
            recognition: personality.recognition,
            lifeExtension: personality.lifeExtension,
            lifeAreas: personality.lifeAreas,
            recommendedArtists: personality.recommendedArtists,
            colors: gradient?.colors || ['#8b5cf6', '#ec4899'],
            gradientClass: gradient?.gradientClass || 'sayu-gradient-purple-pink'
          }
        }
      });
    } else {
      // Return all personality types
      const allTypes = Object.keys(personalityDescriptions).map(key => {
        const personality = personalityDescriptions[key];
        const gradient = personalityGradients[key];
        
        return {
          code: key,
          name: gradient?.name || personality.title,
          nameEn: gradient?.nameEn || personality.title,
          title: personality.title,
          subtitle: personality.subtitle
        };
      });
      
      return NextResponse.json({
        success: true,
        data: allTypes
      });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}