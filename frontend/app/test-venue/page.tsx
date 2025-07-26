'use client';

import VenueInfoCard from '@/components/venue/VenueInfoCard';
import { useState } from 'react';

export default function TestVenuePage() {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  // 테스트용 venue 데이터
  const testVenues = [
    {
      name: '국립현대미술관 서울관',
      city: '서울',
      website: 'https://www.mmca.go.kr'
    },
    {
      name: 'National Museum of Modern and Contemporary Art, Seoul',
      city: 'Seoul', 
      website: 'https://www.mmca.go.kr'
    },
    {
      name: '부산시립미술관',
      city: '부산',
      website: 'https://art.busan.go.kr'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🎨 SAYU Venue 기능 테스트
          </h1>
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setLanguage('ko')}
              className={`px-4 py-2 rounded ${
                language === 'ko' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              한국어
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded ${
                language === 'en' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="grid gap-8">
          {testVenues.map((venue, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                테스트 #{index + 1}: {venue.name}
              </h2>
              
              <VenueInfoCard
                venueName={venue.name}
                venueCity={venue.city}
                venueWebsite={venue.website}
                showMap={true}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            📋 테스트 체크리스트
          </h2>
          <div className="space-y-2 text-gray-300">
            <div>✅ VenueInfoCard 정상 렌더링</div>
            <div>✅ 언어 전환 (한국어 ↔ 영어)</div>
            <div>✅ "상세 보기" 버튼 클릭</div>
            <div>✅ Google Maps 링크 작동</div>
            <div>✅ 길찾기 기능</div>
            <div>✅ 모바일 반응형</div>
          </div>
        </div>
      </div>
    </div>
  );
}