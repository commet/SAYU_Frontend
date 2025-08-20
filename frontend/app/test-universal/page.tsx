'use client';

import { useState } from 'react';

// 심플한 스타일 옵션 (8개로 축소)
const STYLE_OPTIONS = [
  { id: 'oil-painting', name: '유화', emoji: '🎨', color: 'from-amber-500 to-orange-500' },
  { id: 'watercolor', name: '수채화', emoji: '💧', color: 'from-blue-400 to-cyan-400' },
  { id: 'anime', name: '애니메', emoji: '✨', color: 'from-pink-400 to-purple-400' },
  { id: 'sketch', name: '스케치', emoji: '✏️', color: 'from-gray-400 to-gray-600' },
  { id: 'popart', name: '팝아트', emoji: '🌈', color: 'from-red-500 to-yellow-500' },
  { id: 'impressionist', name: '인상주의', emoji: '🌻', color: 'from-purple-400 to-pink-400' },
  { id: 'digital-art', name: '디지털', emoji: '💻', color: 'from-cyan-500 to-blue-500' },
  { id: 'vintage', name: '빈티지', emoji: '📷', color: 'from-yellow-600 to-amber-700' },
];

// 이미지 타입 (자동 감지)
const IMAGE_TYPES = [
  { id: 'auto', name: '자동 감지', icon: '🤖' },
  { id: 'portrait', name: '인물', icon: '👤' },
  { id: 'animal', name: '동물', icon: '🐾' },
  { id: 'landscape', name: '풍경', icon: '🏞️' },
  { id: 'object', name: '사물', icon: '📦' },
];

export default function TestUniversalPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState('oil-painting');
  const [imageType, setImageType] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultData(null);
      setError('');
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('이미지를 선택해주세요');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultData(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('style', selectedStyle);
      formData.append('imageType', imageType);

      const response = await fetch('/api/art-profile/universal', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Generation failed');
      }

      console.log('API Response:', data);
      setResultData(data);
    } catch (err: any) {
      setError(err.message || '생성 실패');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Universal AI Art Profile
          </h1>
          <p className="text-gray-600">
            하나의 AI로 모든 이미지를 예술작품으로 ✨
          </p>
          <div className="mt-4 inline-flex items-center gap-4 text-sm text-gray-500">
            <span>🚀 FLUX Schnell</span>
            <span>💰 $0.003/image</span>
            <span>⚡ 1-2초</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 왼쪽: 입력 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">설정</h2>

            {/* 파일 업로드 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. 이미지 업로드
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer transition-colors"
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="mx-auto max-h-64 rounded-lg"
                    />
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        클릭하여 이미지 선택
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        인물, 동물, 풍경 모두 OK
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* 이미지 타입 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. 이미지 타입 (선택사항)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {IMAGE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setImageType(type.id)}
                    className={`p-2 rounded-lg border-2 transition-all text-center ${
                      imageType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl">{type.icon}</div>
                    <div className="text-xs mt-1">{type.name}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 자동 감지가 가장 편리합니다
              </p>
            </div>

            {/* 스타일 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3. 아트 스타일 선택
              </label>
              <div className="grid grid-cols-4 gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`relative p-3 rounded-xl border-2 transition-all overflow-hidden ${
                      selectedStyle === style.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedStyle === style.id && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-10`} />
                    )}
                    <div className="relative">
                      <div className="text-2xl mb-1">{style.emoji}</div>
                      <div className="text-xs font-medium">{style.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all ${
                isLoading || !selectedFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  처리 중... (1-2초)
                </span>
              ) : (
                '✨ 아트 프로필 생성'
              )}
            </button>

            {/* 에러 메시지 */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">❌ {error}</p>
              </div>
            )}
          </div>

          {/* 오른쪽: 결과 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">결과</h2>

            {resultData ? (
              <div className="space-y-4">
                {/* 결과 이미지 */}
                <div className="relative">
                  {resultData.imageUrl ? (
                    <>
                      <img
                        src={resultData.imageUrl}
                        alt="Generated Art"
                        className="w-full rounded-xl shadow-md"
                        onError={(e) => {
                          console.error('Image load error:', resultData.imageUrl);
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EImage Failed%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                        {resultData.model}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 break-all">
                        URL: {resultData.imageUrl}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                      <span className="text-gray-500">이미지 URL이 없습니다</span>
                    </div>
                  )}
                </div>

                {/* 메타 정보 */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">스타일</div>
                    <div className="font-medium">{resultData.style}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-500">감지된 타입</div>
                    <div className="font-medium">{resultData.imageType}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-gray-500">비용</div>
                    <div className="font-medium text-blue-600">{resultData.cost}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-gray-500">처리 시간</div>
                    <div className="font-medium text-green-600">{resultData.processingTime}</div>
                  </div>
                </div>

                {/* 다운로드 버튼 */}
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = resultData.imageUrl;
                    a.download = `art-profile-${resultData.style}.png`;
                    a.click();
                  }}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  💾 다운로드
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg className="mx-auto h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>생성된 이미지가 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 bg-white/80 rounded-xl p-6">
          <h3 className="font-semibold mb-3">🎯 Universal Model 특징</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>✅ 모든 이미지 타입 지원</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• 인물: 얼굴 특징 보존</li>
                <li>• 동물: 귀여운 느낌 유지</li>
                <li>• 풍경: 구도와 분위기 보존</li>
              </ul>
            </div>
            <div>
              <strong>🚀 FLUX Schnell 기술</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• 2024년 최신 모델</li>
                <li>• 1-2초 초고속 처리</li>
                <li>• SDXL 폴백 지원</li>
              </ul>
            </div>
            <div>
              <strong>💰 경제적인 비용</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• $0.003 per image</li>
                <li>• DALL-E 대비 96% 저렴</li>
                <li>• 월 $30-50 예상 (1만장)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}