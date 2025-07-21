'use client';

import dynamic from 'next/dynamic';

// Dynamic import with no SSR for Three.js
const ThreeScene = dynamic(
  () => import('@/components/spatial/ThreeScene'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading 3D Gallery...</div>
      </div>
    )
  }
);

export default function Gallery3DPage() {
  return <ThreeScene />;
}