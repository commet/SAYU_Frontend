'use client';

import React from 'react';
import { ThemeToggle } from './theme-toggle';
import { Palette, Monitor, Settings, Eye, Contrast, Lightbulb } from 'lucide-react';

// 원본 데모
function DefaultToggle() {
  return (
    <div className="space-y-2 text-center">
      <div className="flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
}

export { DefaultToggle };

// SAYU 갤러리 뷰어 설정
export const SayuGalleryViewer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-black p-8 transition-all duration-500">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              SAYU 갤러리 뷰어
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              최적의 감상을 위한 테마 설정
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Eye className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <ThemeToggle />
          </div>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800"></div>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  작품 #{item}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  테마에 따라 최적화된 감상 경험
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">2025</span>
                  <div className="flex items-center space-x-1">
                    <Palette className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-500">추상화</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Theme benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Monitor className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">라이트 모드</h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• 밝은 환경에서 최적의 가독성</li>
              <li>• 클래식한 갤러리 분위기</li>
              <li>• 작품의 밝은 색조 강조</li>
              <li>• 긴 시간 감상시 눈의 피로 최소화</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Contrast className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">다크 모드</h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• 어두운 환경에서 편안한 감상</li>
              <li>• 작품에 집중할 수 있는 몰입감</li>
              <li>• 색상 대비 극대화</li>
              <li>• 현대적이고 세련된 인터페이스</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU APT 테스트 인터페이스
export const SayuAptTestInterface = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-8 transition-all duration-500">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <Lightbulb className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            SAYU APT 테스트
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            당신의 예술적 성향을 발견하기 위한 16가지 동물 캐릭터 분석
          </p>
          
          {/* Theme toggle section */}
          <div className="flex items-center justify-center space-x-4 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg w-fit mx-auto">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="text-sm text-gray-700 dark:text-gray-300">테마 설정</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Test progress mockup */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">질문 3 / 16</div>
              <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="w-1/4 bg-blue-500 h-2 rounded-full transition-all duration-300"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                미술관에서 가장 끌리는 작품은?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { emoji: '🎨', text: '추상적이고 감정적인 작품' },
                  { emoji: '🖼️', text: '사실적이고 정교한 작품' },
                  { emoji: '🌈', text: '화려하고 역동적인 작품' },
                  { emoji: '🌙', text: '고요하고 명상적인 작품' }
                ].map((option, index) => (
                  <button
                    key={index}
                    className="p-6 text-left bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-500"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-gray-900 dark:text-white">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Theme benefits for testing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            테마별 테스트 환경
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">🌞 라이트 모드</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                명확한 질문 읽기와 집중도 향상
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">🌙 다크 모드</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                편안한 환경에서 내면 탐구
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 커뮤니티 인터페이스
export const SayuCommunityInterface = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-8 transition-all duration-500">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Community header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              SAYU 커뮤니티
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              예술 애호가들과의 소통 공간
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg">
            <Palette className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">분위기 설정</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Community content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts */}
          <div className="lg:col-span-2 space-y-6">
            {[
              {
                user: '김예술',
                avatar: '🦋',
                time: '2시간 전',
                content: '오늘 모네 전시회 다녀왔어요! 수련 연작의 파스텔 톤이 정말 인상적이었습니다.',
                likes: 24,
                comments: 8
              },
              {
                user: '이감상',
                avatar: '🐯',
                time: '5시간 전',
                content: '피카소의 청색 시대 작품들을 보면서 우울함과 아름다움이 공존할 수 있다는 걸 깨달았어요.',
                likes: 42,
                comments: 15
              },
              {
                user: '박큐레이터',
                avatar: '🦅',
                time: '1일 전',
                content: '다음 주 국립현대미술관 신작 전시 함께 보실 분 계신가요? 현대 추상화의 새로운 해석이 기대됩니다.',
                likes: 18,
                comments: 23
              }
            ].map((post, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xl">
                    {post.avatar}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{post.user}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{post.time}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <button className="flex items-center space-x-1 hover:text-purple-500">
                        <span>❤️</span>
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-purple-500">
                        <span>💬</span>
                        <span>{post.comments}</span>
                      </button>
                      <button className="hover:text-purple-500">공유</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                오늘의 추천 작품
              </h3>
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-lg"></div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">반 고흐의 별이 빛나는 밤</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">감정의 소용돌이를 표현한 걸작</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                테마별 커뮤니티 경험
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-400">☀️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">라이트 모드</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">활발한 소통과 토론</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400">🌙</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">다크 모드</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">깊이 있는 예술 감상</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveThemeToggleDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <DefaultToggle />,
    galleryViewer: <SayuGalleryViewer />,
    aptTest: <SayuAptTestInterface />,
    community: <SayuCommunityInterface />
  };

  const demoNames = {
    original: '원본 토글',
    galleryViewer: '갤러리 뷰어',
    aptTest: 'APT 테스트',
    community: '커뮤니티'
  };

  return (
    <div className="relative min-h-screen">
      {/* Demo toggle buttons */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {Object.keys(demos).map((key) => (
          <button
            key={key}
            onClick={() => setCurrentDemo(key)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              currentDemo === key
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/90 text-gray-800 border border-gray-200 hover:bg-gray-100 backdrop-blur-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            {demoNames[key as keyof typeof demoNames]}
          </button>
        ))}
      </div>

      {/* Demo content */}
      <div className="w-full h-full">
        {demos[currentDemo as keyof typeof demos]}
      </div>
    </div>
  );
};

// Default export
const ThemeToggleDemo = () => {
  return <InteractiveThemeToggleDemo />;
};

export default ThemeToggleDemo;