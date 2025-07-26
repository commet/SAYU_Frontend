'use client';

import VenueList from '@/components/venue/VenueList';

export default function VenuesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            미술관 & 갤러리
          </h1>
          <p className="text-gray-600">
            전 세계 미술관과 갤러리를 탐색하고 새로운 예술 경험을 발견하세요
          </p>
        </div>
        
        <VenueList />
      </div>
    </div>
  );
}