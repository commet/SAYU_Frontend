'use client';

import { useState, useEffect } from 'react';
import { getArtworkRecommendations } from '@/lib/artworkRecommendations';
import PersonalityIcon from '@/components/PersonalityIcon';

export default function DebugPage() {
  const [testType] = useState('LAEF');
  const [apiTest, setApiTest] = useState<any>(null);
  const [imageTest, setImageTest] = useState<any>({});

  useEffect(() => {
    // Test API
    fetch(`/api/personality-types?type=${testType}`)
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        setApiTest(data);
      })
      .catch(err => console.error('API Error:', err));

    // Test images
    const testImages = [
      { type: 'backgrounds', name: 'city-view' },
      { type: 'choices', name: 'modern-museum' }
    ];

    testImages.forEach(img => {
      fetch(`/api/museum-image?type=${img.type}&name=${img.name}`)
        .then(res => {
          setImageTest((prev: any) => ({
            ...prev,
            [`${img.type}-${img.name}`]: res.ok ? 'OK' : `Error: ${res.status}`
          }));
        })
        .catch((err: any) => {
          setImageTest((prev: any) => ({
            ...prev,
            [`${img.type}-${img.name}`]: `Error: ${err.message}`
          }));
        });
    });
  }, [testType]);

  const artworks = getArtworkRecommendations(testType);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">SAYU Debug Page</h1>
      
      <div className="space-y-8">
        {/* 1. Personality Icon Test */}
        <section className="bg-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">1. Personality Icon Test</h2>
          <div className="flex gap-4 items-center">
            <PersonalityIcon type={testType} size="small" />
            <PersonalityIcon type={testType} size="medium" />
            <PersonalityIcon type={testType} size="large" />
          </div>
          <p className="mt-2 text-sm">Testing type: {testType}</p>
        </section>

        {/* 2. API Response Test */}
        <section className="bg-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">2. Backend API Test</h2>
          <pre className="text-xs overflow-auto bg-black/50 p-4 rounded">
            {JSON.stringify(apiTest, null, 2)}
          </pre>
        </section>

        {/* 3. Artwork Recommendations Test */}
        <section className="bg-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">3. Artwork Recommendations</h2>
          {artworks ? (
            <div>
              <p>Title: {artworks.representativeWork.title}</p>
              <p>Artist: {artworks.representativeWork.artist}</p>
              <img 
                src={artworks.representativeWork.image} 
                alt={artworks.representativeWork.title}
                className="w-64 h-auto mt-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder-image?type=choices&name=abstract-art';
                }}
              />
            </div>
          ) : (
            <p>No artwork data found</p>
          )}
        </section>

        {/* 4. Museum Image API Test */}
        <section className="bg-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">4. Museum Image API Test</h2>
          <div className="space-y-2">
            {Object.entries(imageTest).map(([key, status]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className={status === 'OK' ? 'text-green-400' : 'text-red-400'}>
                  {status as string}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-2">Background Test:</p>
              <img 
                src="/api/museum-image?type=backgrounds&name=city-view" 
                alt="City View"
                className="w-full h-32 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder-image?type=backgrounds&name=city-view';
                }}
              />
            </div>
            <div>
              <p className="text-sm mb-2">Choice Test:</p>
              <img 
                src="/api/museum-image?type=choices&name=modern-museum" 
                alt="Modern Museum"
                className="w-full h-32 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder-image?type=choices&name=modern-museum';
                }}
              />
            </div>
          </div>
        </section>

        {/* 5. Environment Check */}
        <section className="bg-white/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">5. Environment Check</h2>
          <div className="space-y-1 text-sm">
            <p>NODE_ENV: {process.env.NODE_ENV}</p>
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
            <p>Build Time: {new Date().toISOString()}</p>
          </div>
        </section>
      </div>
    </div>
  );
}