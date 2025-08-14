'use client';

import { getCuratedArtworkUrls } from '@/data/curated-artwork-urls';
import Image from 'next/image';

export default function TestImagesPage() {
  const lrmcImages = getCuratedArtworkUrls('LRMC');
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          LRMC 유형 이미지 테스트 ({lrmcImages.length}개)
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lrmcImages.map((imageUrl, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={imageUrl}
                  alt={`LRMC Artwork ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => console.error(`이미지 로드 실패: ${imageUrl}`)}
                  onLoad={() => console.log(`이미지 로드 성공: ${imageUrl}`)}
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 break-all">
                  {imageUrl.split('/').pop()?.split('.')[0]}
                </p>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Image {index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold mb-2">이미지 URL 목록:</h2>
          <ul className="space-y-1 text-sm">
            {lrmcImages.map((url, index) => (
              <li key={index} className="font-mono text-xs break-all">
                {index + 1}. {url}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}