'use client';

import { useState } from 'react';
import { useResponsive } from '@/lib/responsive';

export default function TestMobilePage() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [forceMode, setForceMode] = useState<'auto' | 'mobile' | 'tablet' | 'desktop'>('auto');

  // 강제로 모바일 모드 설정
  const forcedIsMobile = forceMode === 'mobile' || (forceMode === 'auto' && isMobile);
  const forcedIsTablet = forceMode === 'tablet' || (forceMode === 'auto' && isTablet);
  const forcedIsDesktop = forceMode === 'desktop' || (forceMode === 'auto' && isDesktop);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">모바일 반응형 테스트 페이지</h1>
        
        {/* 현재 디바이스 정보 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">현재 디바이스 감지</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded ${isMobile ? 'bg-green-600' : 'bg-gray-700'}`}>
              <div className="text-sm opacity-75">Mobile</div>
              <div className="text-2xl font-bold">{isMobile ? '✓' : '✗'}</div>
            </div>
            <div className={`p-4 rounded ${isTablet ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <div className="text-sm opacity-75">Tablet</div>
              <div className="text-2xl font-bold">{isTablet ? '✓' : '✗'}</div>
            </div>
            <div className={`p-4 rounded ${isDesktop ? 'bg-purple-600' : 'bg-gray-700'}`}>
              <div className="text-sm opacity-75">Desktop</div>
              <div className="text-2xl font-bold">{isDesktop ? '✓' : '✗'}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            현재 뷰포트 너비: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px
          </div>
        </div>

        {/* 강제 모드 전환 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">강제 모드 전환 (테스트용)</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setForceMode('auto')}
              className={`px-4 py-2 rounded ${forceMode === 'auto' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              자동 감지
            </button>
            <button
              onClick={() => setForceMode('mobile')}
              className={`px-4 py-2 rounded ${forceMode === 'mobile' ? 'bg-green-600' : 'bg-gray-700'}`}
            >
              모바일 강제
            </button>
            <button
              onClick={() => setForceMode('tablet')}
              className={`px-4 py-2 rounded ${forceMode === 'tablet' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              태블릿 강제
            </button>
            <button
              onClick={() => setForceMode('desktop')}
              className={`px-4 py-2 rounded ${forceMode === 'desktop' ? 'bg-purple-600' : 'bg-gray-700'}`}
            >
              데스크탑 강제
            </button>
          </div>
        </div>

        {/* 테스트 링크 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">주요 페이지 테스트</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="/" className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-center transition-colors">
              홈
            </a>
            <a href="/quiz" className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-center transition-colors">
              퀴즈
            </a>
            <a href="/gallery" className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-center transition-colors">
              갤러리
            </a>
            <a href="/dashboard" className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-center transition-colors">
              대시보드
            </a>
            <a href="/profile" className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-center transition-colors">
              프로필
            </a>
            <a href="/exhibitions" className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-center transition-colors">
              전시
            </a>
            <a href="/community" className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-center transition-colors">
              커뮤니티
            </a>
            <a href="/login" className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-center transition-colors">
              로그인
            </a>
          </div>
        </div>

        {/* 반응형 콘텐츠 예시 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">반응형 콘텐츠 예시</h2>
          
          {forcedIsMobile && (
            <div className="bg-green-900 p-4 rounded">
              <h3 className="font-bold mb-2">📱 모바일 버전</h3>
              <p>터치 최적화된 UI, 단일 컬럼 레이아웃, 스와이프 제스처 지원</p>
              <div className="mt-4 space-y-2">
                <div className="bg-green-800 p-3 rounded">스와이프 가능한 카드 1</div>
                <div className="bg-green-800 p-3 rounded">스와이프 가능한 카드 2</div>
                <div className="bg-green-800 p-3 rounded">스와이프 가능한 카드 3</div>
              </div>
            </div>
          )}
          
          {forcedIsTablet && (
            <div className="bg-blue-900 p-4 rounded">
              <h3 className="font-bold mb-2">💻 태블릿 버전</h3>
              <p>2컬럼 레이아웃, 중간 크기 UI 요소</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-blue-800 p-3 rounded">카드 1</div>
                <div className="bg-blue-800 p-3 rounded">카드 2</div>
                <div className="bg-blue-800 p-3 rounded">카드 3</div>
                <div className="bg-blue-800 p-3 rounded">카드 4</div>
              </div>
            </div>
          )}
          
          {forcedIsDesktop && (
            <div className="bg-purple-900 p-4 rounded">
              <h3 className="font-bold mb-2">🖥️ 데스크탑 버전</h3>
              <p>다중 컬럼 레이아웃, 호버 효과, 사이드바 표시</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-purple-800 p-3 rounded hover:bg-purple-700 transition-colors cursor-pointer">카드 1</div>
                <div className="bg-purple-800 p-3 rounded hover:bg-purple-700 transition-colors cursor-pointer">카드 2</div>
                <div className="bg-purple-800 p-3 rounded hover:bg-purple-700 transition-colors cursor-pointer">카드 3</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}