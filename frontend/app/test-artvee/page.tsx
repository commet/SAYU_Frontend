'use client';

import { ArtveeGallery } from '@/components/artvee/ArtveeGallery';

export default function TestArtveePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Artvee Gallery Test</h1>
      <p className="text-gray-600 mb-8">
        Testing ArtveeGallery component with LAEC personality type
      </p>
      <ArtveeGallery personalityType="LAEC" />
    </div>
  );
}