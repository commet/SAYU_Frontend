'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArtworkViewingProvider, useArtworkViewing } from '@/contexts/ArtworkViewingContext';
import { ArtCuratorChatbot } from '@/components/chatbot/ArtCuratorChatbot';
import { motion } from 'framer-motion';
import { ZoomIn, Heart, Share2, Info } from 'lucide-react';

// Example artwork data
const demoArtworks = [
  {
    id: 'demo-1',
    title: '별이 빛나는 밤',
    artist: '빈센트 반 고흐',
    year: 1889,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    medium: '캔버스에 유화',
    dimensions: '73.7 cm × 92.1 cm',
    museum: '뉴욕 현대미술관',
    description: '소용돌이치는 밤하늘과 평화로운 마을의 대비가 인상적인 작품'
  },
  {
    id: 'demo-2',
    title: '모나리자',
    artist: '레오나르도 다 빈치',
    year: 1503,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    medium: '포플러 패널에 유화',
    dimensions: '77 cm × 53 cm',
    museum: '루브르 박물관',
    description: '신비로운 미소로 유명한 르네상스 초상화의 걸작'
  },
  {
    id: 'demo-3',
    title: '절규',
    artist: '에드바르 뭉크',
    year: 1893,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
    medium: '판지에 유화, 템페라, 파스텔',
    dimensions: '91 cm × 73.5 cm',
    museum: '노르웨이 국립미술관',
    description: '불안과 공포를 표현한 표현주의의 대표작'
  }
];

// Inner component that uses the context
function ArtworkDemoContent() {
  const { setCurrentArtwork, updateViewingStats, getViewingTime } = useArtworkViewing();
  const [selectedArtwork, setSelectedArtwork] = useState(demoArtworks[0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  // companionMood state removed - now handled inside ArtCuratorChatbot
  
  // Set current artwork when selection changes
  const selectArtwork = (artwork: typeof demoArtworks[0]) => {
    setSelectedArtwork(artwork);
    setCurrentArtwork(artwork);
    setIsZoomed(false);
    setIsLiked(false);
  };

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
    updateViewingStats({ zoomed: true, interactions: 1 });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    updateViewingStats({ interactions: 1 });
  };

  const handleShare = () => {
    updateViewingStats({ shared: true, interactions: 1 });
    // Copy link to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">🎨 SAYU 아트워크 데모</h1>
          <p className="text-sm text-gray-600 mt-1">동물 큐레이터와 함께하는 미술 감상 체험</p>
        </div>
      </div>

      {/* Artwork Selection */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">작품 선택</h2>
          <div className="grid grid-cols-3 gap-4">
            {demoArtworks.map(artwork => (
              <button
                key={artwork.id}
                onClick={() => selectArtwork(artwork)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  selectedArtwork.id === artwork.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-sm font-medium">{artwork.title}</p>
                <p className="text-xs text-gray-600">{artwork.artist}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artwork display */}
          <div className="relative">
            <motion.div
              animate={{ scale: isZoomed ? 1.5 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative overflow-hidden rounded-lg shadow-2xl cursor-zoom-in"
              onClick={handleZoom}
            >
              <Image
                src={selectedArtwork.imageUrl}
                alt={selectedArtwork.title}
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />
            </motion.div>
            
            {/* Artwork controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleZoom}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <ZoomIn className={`w-5 h-5 ${isZoomed ? 'text-primary' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={handleLike}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Artwork information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{selectedArtwork.title}</h1>
              <p className="text-xl text-gray-600">{selectedArtwork.artist}, {selectedArtwork.year}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">재료:</span> {selectedArtwork.medium}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">크기:</span> {selectedArtwork.dimensions}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">소장:</span> {selectedArtwork.museum}
              </p>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {selectedArtwork.description}
            </p>
            
            {/* Viewing stats */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                감상 정보
              </h3>
              <p className="text-sm text-gray-600">
                감상 시간: {Math.floor(getViewingTime() / 60)}분 {getViewingTime() % 60}초
              </p>
              <p className="text-sm text-gray-600">
                상호작용: {isZoomed ? '확대함 ' : ''}{isLiked ? '좋아요 ' : ''}
              </p>
            </div>

            {/* Demo instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">💡 사용 방법</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 오른쪽 하단의 동물 캐릭터를 클릭하면 AI 큐레이터와 대화할 수 있습니다</li>
                <li>• 작품 이미지를 클릭하면 확대/축소됩니다</li>
                <li>• ❤️ 버튼으로 작품을 좋아요 표시할 수 있습니다</li>
                <li>• 공유 버튼으로 작품 링크를 복사할 수 있습니다</li>
                <li>• 상단에서 다른 작품을 선택해보세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Curator Chatbot with integrated animal companion */}
      <ArtCuratorChatbot position="bottom-right" defaultOpen={true} />
    </div>
  );
}

// Main component with provider
export default function ArtworkDemoPage() {
  return (
    <ArtworkViewingProvider>
      <ArtworkDemoContent />
    </ArtworkViewingProvider>
  );
}