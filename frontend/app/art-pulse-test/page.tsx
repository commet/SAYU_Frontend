'use client';

import React, { useState } from 'react';
import { ArtPulseWidget } from '@/components/art-pulse/ArtPulseWidget';
import { ArtPulseSession } from '@/components/art-pulse/ArtPulseSession';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// 테스트용 Mock 데이터
const mockChallenge = {
  id: 'test-challenge-1',
  artwork_id: 'test-artwork-1',
  artwork_image: 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg',
  artwork_title: 'The Starry Night',
  artwork_artist: 'Vincent van Gogh'
};

export default function ArtPulseTestPage() {
  const [showArtPulse, setShowArtPulse] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Art Pulse 테스트 페이지</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">테스트 안내</h2>
          <ul className="space-y-2 text-gray-700">
            <li>1. 우측 하단의 Art Pulse 위젯을 확인하세요</li>
            <li>2. 위젯을 클릭하여 세션을 시작하세요</li>
            <li>3. 작품 이미지를 클릭하여 터치 히트맵을 확인하세요</li>
            <li>4. 공명 타입을 선택해보세요 (감각적/감정적/인지적)</li>
            <li>5. 실시간 참여자 수와 타이머를 확인하세요</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">환경 설정</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Mock Supabase:</strong> {process.env.NEXT_PUBLIC_USE_MOCK_SUPABASE}
            </div>
            <div>
              <strong>Demo Mode:</strong> {process.env.NEXT_PUBLIC_ART_PULSE_DEMO}
            </div>
            <div>
              <strong>Art Pulse Enabled:</strong> {process.env.NEXT_PUBLIC_ENABLE_ART_PULSE}
            </div>
            <div>
              <strong>Current Time:</strong> {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* 수동 테스트 버튼 */}
        <div className="mt-8">
          <button
            onClick={() => setShowArtPulse(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Art Pulse 세션 열기 (수동)
          </button>
        </div>
      </div>

      {/* Art Pulse 위젯 */}
      <ArtPulseWidget 
        onOpenSession={() => setShowArtPulse(true)}
      />

      {/* Art Pulse 세션 다이얼로그 */}
      <Dialog open={showArtPulse} onOpenChange={setShowArtPulse}>
        <DialogContent className="max-w-5xl p-0">
          <ArtPulseSession
            dailyChallengeId={mockChallenge.id}
            artwork={{
              id: mockChallenge.artwork_id,
              imageUrl: mockChallenge.artwork_image,
              title: mockChallenge.artwork_title,
              artist: mockChallenge.artwork_artist
            }}
            userId="test-user"
            userAptType="LAEF"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}