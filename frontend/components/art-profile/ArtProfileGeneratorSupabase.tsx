'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const styles = [
  { id: 'monet-impressionism', name: 'Monet Impressionism', nameKo: '모네 인상파' },
  { id: 'picasso-cubism', name: 'Picasso Cubism', nameKo: '피카소 큐비즘' },
  { id: 'vangogh-postimpressionism', name: 'Van Gogh', nameKo: '반 고흐' },
  { id: 'warhol-popart', name: 'Warhol Pop Art', nameKo: '워홀 팝아트' },
  { id: 'pixel-art', name: 'Pixel Art', nameKo: '픽셀 아트' },
  { id: 'korean-minhwa', name: 'Korean Minhwa', nameKo: '한국 민화' },
  { id: 'klimt-artnouveau', name: 'Klimt Art Nouveau', nameKo: '클림트' },
  { id: 'mondrian-neoplasticism', name: 'Mondrian', nameKo: '몬드리안' },
];

export default function ArtProfileGeneratorSupabase() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedStyle) {
      toast.error('이미지와 스타일을 선택해주세요');
      return;
    }

    setIsGenerating(true);
    try {
      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        router.push('/login');
        return;
      }

      // API 호출
      const response = await fetch('/api/art-profile/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          styleId: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(`월간 한도 초과 (${data.used}/${data.limit})`);
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setGeneratedImage(data.artProfile.transformedImage);
      toast.success('아트 프로필이 생성되었습니다!');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || '생성 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">AI 아트 프로필 생성</h1>

      {/* 이미지 업로드 */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          프로필 사진 선택
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Selected"
            className="mt-4 w-48 h-48 object-cover rounded-lg"
          />
        )}
      </div>

      {/* 스타일 선택 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">화풍 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedStyle === style.id
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{style.name}</div>
              <div className="text-sm text-gray-500">{style.nameKo}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={!selectedImage || !selectedStyle || isGenerating}
        className="w-full py-3 px-4 bg-violet-600 text-white rounded-lg
          disabled:bg-gray-400 disabled:cursor-not-allowed
          hover:bg-violet-700 transition-colors"
      >
        {isGenerating ? '생성 중...' : '아트 프로필 생성'}
      </button>

      {/* 결과 표시 */}
      {generatedImage && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">생성된 아트 프로필</h2>
          <img
            src={generatedImage}
            alt="Generated art profile"
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
          <button
            onClick={() => {
              // 프로필 이미지로 설정하는 로직
              toast.success('프로필 이미지로 설정되었습니다');
            }}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg
              hover:bg-green-700 transition-colors"
          >
            프로필 이미지로 설정
          </button>
        </div>
      )}
    </div>
  );
}