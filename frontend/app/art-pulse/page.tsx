import { Metadata } from 'next';
import { ArtPulseViewer } from '@/components/art-pulse/ArtPulseViewer';

export const metadata: Metadata = {
  title: 'Art Pulse - 실시간 공동 감상 | SAYU',
  description: '전국의 SAYU 사용자들과 함께 작품을 감상하고 마음을 나누는 실시간 Art Pulse 세션에 참여하세요.',
};

export default function ArtPulsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Art Pulse</h1>
          <p className="text-muted-foreground">
            매일 오후 7시, 전국의 예술 애호가들과 함께하는 실시간 공동 감상
          </p>
        </div>
        
        <ArtPulseViewer className="w-full" />
      </div>
    </div>
  );
}