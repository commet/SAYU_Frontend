'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getImageCacheStats, 
  measureImageLoadTime, 
  supportsWebP, 
  supportsAVIF, 
  getOptimalImageFormat,
  getAdaptiveImageQuality 
} from '@/lib/image-optimization';

/**
 * SAYU 이미지 최적화 디버거
 * 개발 환경에서만 표시되는 성능 모니터링 도구
 */
const ImageOptimizationDebugger: React.FC = () => {
  const [cacheStats, setCacheStats] = useState({ cachedImages: 0, loadingImages: 0, cacheHitRate: 0 });
  const [supportedFormats, setSupportedFormats] = useState<{ webp: boolean; avif: boolean; optimal: string }>({ webp: false, avif: false, optimal: 'png' });
  const [quality, setQuality] = useState(75);
  const [loadTimes, setLoadTimes] = useState<{ url: string; time: number }[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 개발 환경에서만 표시
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
      
      // 포맷 지원 확인
      setSupportedFormats({
        webp: supportsWebP(),
        avif: supportsAVIF(),
        optimal: getOptimalImageFormat()
      });
      
      // 적응형 품질 설정
      setQuality(getAdaptiveImageQuality());
      
      // 캐시 통계 업데이트 (주기적)
      const updateStats = () => {
        setCacheStats(getImageCacheStats());
      };
      
      updateStats();
      const interval = setInterval(updateStats, 2000);
      
      return () => clearInterval(interval);
    }
  }, []);

  // 개성 동물 이미지 로드 시간 테스트
  const testPersonalityAnimalLoadTimes = async () => {
    try {
      const { personalityAnimals } = await import('@/data/personality-animals');
      const testUrls = Object.values(personalityAnimals).slice(0, 4).map(animal => animal.image);
      
      const results = await Promise.all(
        testUrls.map(async url => ({
          url,
          time: await measureImageLoadTime(url)
        }))
      );
      
      setLoadTimes(results.filter(r => r.time > 0));
    } catch (error) {
      console.error('Failed to test load times:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-4 bg-gray-900 text-white text-xs font-mono shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-blue-400">🖼️ Image Debug</h3>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-gray-400 hover:text-white p-1 h-auto"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </Button>
        </div>
        
        {/* 캐시 통계 */}
        <div className="mb-3 p-2 bg-gray-800 rounded">
          <h4 className="text-yellow-400 mb-1">📊 Cache Stats</h4>
          <div>Cached: {cacheStats.cachedImages}</div>
          <div>Loading: {cacheStats.loadingImages}</div>
          <div>Hit Rate: {cacheStats.cacheHitRate.toFixed(1)}%</div>
        </div>

        {/* 포맷 지원 */}
        <div className="mb-3 p-2 bg-gray-800 rounded">
          <h4 className="text-green-400 mb-1">🎨 Format Support</h4>
          <div>WebP: {supportedFormats.webp ? '✅' : '❌'}</div>
          <div>AVIF: {supportedFormats.avif ? '✅' : '❌'}</div>
          <div>Optimal: {supportedFormats.optimal.toUpperCase()}</div>
          <div>Quality: {quality}%</div>
        </div>

        {/* 네트워크 성능 */}
        <div className="mb-3 p-2 bg-gray-800 rounded">
          <h4 className="text-purple-400 mb-1">⚡ Performance</h4>
          <div className="text-xs">Connection: {(navigator as any).connection?.effectiveType || 'Unknown'}</div>
          <div className="text-xs">Downlink: {(navigator as any).connection?.downlink || 'N/A'} Mbps</div>
        </div>

        {/* 로드 시간 테스트 */}
        <div className="mb-3">
          <Button 
            size="sm" 
            onClick={testPersonalityAnimalLoadTimes}
            className="text-xs mb-2 w-full"
          >
            Test Load Times
          </Button>
          
          {loadTimes.length > 0 && (
            <div className="p-2 bg-gray-800 rounded">
              <h4 className="text-orange-400 mb-1">⏱️ Load Times</h4>
              {loadTimes.map(({ url, time }, index) => (
                <div key={index} className="text-xs">
                  {url.split('/').pop()}: {time.toFixed(0)}ms
                </div>
              ))}
              <div className="text-xs text-gray-400 mt-1">
                Avg: {(loadTimes.reduce((sum, { time }) => sum + time, 0) / loadTimes.length).toFixed(0)}ms
              </div>
            </div>
          )}
        </div>

        {/* 최적화 권장사항 */}
        <div className="text-xs text-gray-400">
          {cacheStats.cacheHitRate < 50 && (
            <div className="text-yellow-400">⚠️ Low cache hit rate</div>
          )}
          {!supportedFormats.avif && (
            <div className="text-blue-400">💡 Consider AVIF polyfill</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImageOptimizationDebugger;