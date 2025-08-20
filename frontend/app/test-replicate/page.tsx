'use client';

import { useState } from 'react';
import { artProfileReplicateAPI } from '@/lib/art-profile-replicate-api';

const STYLE_OPTIONS = [
  { id: 'ghibli-style', name: '지브리 스타일', emoji: '🌸' },
  { id: 'vangogh-postimpressionism', name: '반 고흐', emoji: '🌻' },
  { id: 'monet-impressionism', name: '모네', emoji: '🪷' },
  { id: 'warhol-popart', name: '워홀 팝아트', emoji: '🎨' },
  { id: 'anime-style', name: '애니메 스타일', emoji: '✨' },
  { id: 'cyberpunk-digital', name: '사이버펑크', emoji: '🤖' },
  { id: 'picasso-cubism', name: '피카소 큐비즘', emoji: '🔷' },
  { id: 'klimt-artnouveau', name: '클림트', emoji: '💛' },
];

export default function TestReplicatePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('ghibli-style');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [cost, setCost] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResultUrl('');
      setError('');
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('이미지를 선택해주세요');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError('');
    setResultUrl('');

    try {
      const result = await artProfileReplicateAPI.generateArtProfile({
        image: selectedFile,
        styleId: selectedStyle,
        onProgress: (p) => setProgress(p),
      });

      setResultUrl(result.artworkUrl);
      setCost(result.estimatedCost);
    } catch (err: any) {
      setError(err.message || '생성 실패');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedCost = artProfileReplicateAPI.getEstimatedCost(selectedStyle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Replicate AI Art Profile Test
        </h1>
        <p className="text-center text-gray-600 mb-8">
          진짜 image-to-image 스타일 변환 (DALL-E의 1/40 비용!)
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 파일 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. 이미지 선택
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                선택된 파일: {selectedFile.name}
              </p>
            )}
          </div>

          {/* 스타일 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. 아트 스타일 선택
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedStyle === style.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{style.emoji}</div>
                  <div className="text-xs font-medium">{style.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 예상 비용 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💰 예상 비용: <strong>{estimatedCost}</strong>
              <span className="text-xs ml-2">(DALL-E HD: $0.08)</span>
            </p>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={!selectedFile || isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
              isLoading || !selectedFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            {isLoading ? '생성 중...' : '아트 프로필 생성'}
          </button>

          {/* 진행 상태 */}
          {isLoading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>처리 중...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">❌ {error}</p>
              {error.includes('token') && (
                <p className="text-sm text-red-600 mt-2">
                  👉 .env.local에 REPLICATE_API_TOKEN을 추가하세요
                </p>
              )}
            </div>
          )}

          {/* 결과 이미지 */}
          {resultUrl && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">생성 결과</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedFile && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">원본</p>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Original"
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    변환된 이미지 (비용: {cost})
                  </p>
                  <img
                    src={resultUrl}
                    alt="Generated Art"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
              
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = resultUrl;
                  a.download = `art-profile-${selectedStyle}.png`;
                  a.click();
                }}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                💾 다운로드
              </button>
            </div>
          )}
        </div>

        {/* 기술 정보 */}
        <div className="mt-8 p-6 bg-white/80 rounded-xl">
          <h3 className="font-semibold mb-3">🔧 기술 스펙</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 모델: Stable Diffusion XL / Anything V3</li>
            <li>• 진짜 image-to-image 변환 (원본 구도 유지)</li>
            <li>• 처리 시간: 2-5초</li>
            <li>• 비용: $0.002~$0.005 per image</li>
            <li>• API: Replicate (replicate.com)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}