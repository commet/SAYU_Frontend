'use client';

import { useState, useEffect } from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sayuMediaContent: MediaContentCollection = {
  video: {
    src: 'https://videos.pexels.com/video-files/7734219/7734219-uhd_2560_1440_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1280&h=720&fit=crop',
    background: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop',
    title: 'SAYU 아트 갤러리',
    date: '예술 여행의 시작',
    scrollToExpand: '스크롤하여 더 보기',
    about: {
      overview: 'SAYU는 AI 기반 성격 분석을 통해 당신에게 맞는 예술 작품과 전시를 추천합니다. 스크롤을 통해 몰입감 있는 갤러리 경험을 제공하며, 각 사용자의 독특한 취향을 반영한 개인화된 예술 여정을 만들어갑니다.',
      conclusion: 'ScrollExpandMedia 컴포넌트를 통해 SAYU의 갤러리 경험이 더욱 인상적이고 상호작용적으로 구현될 수 있습니다. 사용자는 자연스러운 스크롤 동작을 통해 예술 작품에 더 깊이 몰입할 수 있습니다.',
    },
  },
  image: {
    src: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1280&h=720&fit=crop',
    background: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&h=1080&fit=crop',
    title: 'APT 성격 테스트',
    date: '당신의 예술 성향 발견',
    scrollToExpand: '스크롤하여 더 보기',
    about: {
      overview: 'SAYU의 APT (Art Personality Test)는 16가지 동물 캐릭터를 통해 당신의 예술적 성향을 분석합니다. 각 유형별로 맞춤화된 UI/UX와 개인화된 예술 추천을 제공하여 더욱 의미 있는 예술 경험을 만들어갑니다.',
      conclusion: '이 컴포넌트는 APT 테스트 결과나 성격 유형 소개 페이지에서 강력한 시각적 임팩트를 제공할 수 있습니다. 사용자의 성격 유형에 맞는 이미지와 함께 개인화된 메시지를 전달할 수 있습니다.',
    },
  },
};

const MediaContent = ({ mediaType }: { mediaType: 'video' | 'image' }) => {
  const currentMedia = sayuMediaContent[mediaType];

  return (
    <div className='max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6 text-black dark:text-white'>
        SAYU에서의 활용
      </h2>
      <p className='text-lg mb-8 text-black dark:text-white'>
        {currentMedia.about.overview}
      </p>

      <p className='text-lg mb-8 text-black dark:text-white'>
        {currentMedia.about.conclusion}
      </p>

      {/* SAYU 특화 섹션 */}
      <div className='grid md:grid-cols-2 gap-8 mt-12'>
        <div className='p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl'>
          <h3 className='text-xl font-semibold mb-4 text-purple-800 dark:text-purple-200'>
            갤러리 경험
          </h3>
          <p className='text-gray-700 dark:text-gray-300'>
            스크롤 기반 인터랙션으로 작품을 확대하며 감상할 수 있는 몰입형 갤러리 환경
          </p>
        </div>
        
        <div className='p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl'>
          <h3 className='text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200'>
            개인화된 추천
          </h3>
          <p className='text-gray-700 dark:text-gray-300'>
            APT 결과를 바탕으로 한 맞춤형 작품 및 전시 추천 시스템
          </p>
        </div>
      </div>
    </div>
  );
};

export const VideoExpansionTextBlend = () => {
  const mediaType = 'video';
  const currentMedia = sayuMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className='min-h-screen'>
      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        posterSrc={currentMedia.poster}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
        textBlend
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

export const ImageExpansionTextBlend = () => {
  const mediaType = 'image';
  const currentMedia = sayuMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className='min-h-screen'>
      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
        textBlend
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

export const VideoExpansion = () => {
  const mediaType = 'video';
  const currentMedia = sayuMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className='min-h-screen'>
      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        posterSrc={currentMedia.poster}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

export const ImageExpansion = () => {
  const mediaType = 'image';
  const currentMedia = sayuMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className='min-h-screen'>
      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

const Demo = () => {
  const [mediaType, setMediaType] = useState('video');
  const currentMedia = sayuMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, [mediaType]);

  return (
    <div className='min-h-screen'>
      <div className='fixed top-4 right-4 z-50 flex gap-2'>
        <button
          onClick={() => setMediaType('video')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mediaType === 'video'
              ? 'bg-white text-black shadow-lg'
              : 'bg-black/50 text-white border border-white/30 hover:bg-black/70'
          }`}
        >
          갤러리
        </button>

        <button
          onClick={() => setMediaType('image')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mediaType === 'image'
              ? 'bg-white text-black shadow-lg'
              : 'bg-black/50 text-white border border-white/30 hover:bg-black/70'
          }`}
        >
          APT 테스트
        </button>
      </div>

      <ScrollExpandMedia
        mediaType={mediaType as 'video' | 'image'}
        mediaSrc={currentMedia.src}
        posterSrc={mediaType === 'video' ? currentMedia.poster : undefined}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContent mediaType={mediaType as 'video' | 'image'} />
      </ScrollExpandMedia>
    </div>
  );
};

export default Demo;