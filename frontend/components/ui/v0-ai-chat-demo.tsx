'use client';

import React, { useState } from 'react';
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";

// 원본 데모
export function Demo() {
    return <VercelV0Chat />;
}

// SAYU-specific AI chat variants
export const SayuArtChat = () => {
    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                SAYU와 함께 예술을 탐험해보세요
            </h1>
            
            <div className="w-full">
                <div className="relative bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl border border-purple-700">
                    <div className="p-6 text-center text-white">
                        <p className="text-lg mb-4">AI 큐레이터가 당신만의 예술 여정을 안내합니다</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">성격 분석</span>
                            <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">작품 추천</span>
                            <span className="px-3 py-1 bg-pink-600 rounded-full text-sm">감상 가이드</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-full border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 transition-colors">
                        🎨 <span className="text-xs">APT 테스트 시작</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-full border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 transition-colors">
                        🖼️ <span className="text-xs">갤러리 둘러보기</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-pink-100 hover:bg-pink-200 dark:bg-pink-900 dark:hover:bg-pink-800 rounded-full border border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 transition-colors">
                        💫 <span className="text-xs">감정 분석</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-full border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 transition-colors">
                        🤝 <span className="text-xs">커뮤니티 참여</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// APT 테스트용 채팅
export const AptTestChat = () => {
    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                당신의 예술 성향을 알아보세요
            </h1>
            
            <div className="w-full">
                <div className="relative bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl border border-blue-700">
                    <div className="p-6 text-center text-white">
                        <p className="text-lg mb-4">16가지 동물 캐릭터로 알아보는 나만의 예술 취향</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">🐯 호랑이형</span>
                            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">🐱 고양이형</span>
                            <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">🦅 독수리형</span>
                            <span className="px-3 py-1 bg-pink-600 rounded-full text-sm">🐰 토끼형</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-full border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 transition-colors">
                        🎯 <span className="text-xs">성격 테스트</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 rounded-full border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 transition-colors">
                        📊 <span className="text-xs">결과 분석</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 rounded-full border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 transition-colors">
                        🎨 <span className="text-xs">추천 작품</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// 작품 분석용 채팅
export const ArtworkAnalysisChat = () => {
    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                작품을 깊이 있게 이해해보세요
            </h1>
            
            <div className="w-full">
                <div className="relative bg-gradient-to-br from-emerald-900 to-teal-900 rounded-xl border border-emerald-700">
                    <div className="p-6 text-center text-white">
                        <p className="text-lg mb-4">AI가 분석하는 작품의 숨겨진 의미와 감정</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1 bg-emerald-600 rounded-full text-sm">🎨 기법 분석</span>
                            <span className="px-3 py-1 bg-teal-600 rounded-full text-sm">💭 의미 해석</span>
                            <span className="px-3 py-1 bg-cyan-600 rounded-full text-sm">🌈 색채 분석</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 rounded-full border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 transition-colors">
                        📸 <span className="text-xs">작품 업로드</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-100 hover:bg-teal-200 dark:bg-teal-900 dark:hover:bg-teal-800 rounded-full border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 transition-colors">
                        🔍 <span className="text-xs">상세 분석</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900 dark:hover:bg-cyan-800 rounded-full border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 transition-colors">
                        💡 <span className="text-xs">감상 팁</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// 인터랙티브 데모
export const InteractiveV0ChatDemo = () => {
    const [currentDemo, setCurrentDemo] = useState('original');

    const demos = {
        original: <VercelV0Chat />,
        sayuArt: <SayuArtChat />,
        aptTest: <AptTestChat />,
        artworkAnalysis: <ArtworkAnalysisChat />
    };

    const demoNames = {
        original: '원본 V0',
        sayuArt: 'SAYU 예술',
        aptTest: 'APT 테스트',
        artworkAnalysis: '작품 분석'
    };

    return (
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Demo toggle buttons */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {Object.keys(demos).map((key) => (
                    <button
                        key={key}
                        onClick={() => setCurrentDemo(key)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                            currentDemo === key
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white/90 text-gray-800 border border-gray-200 hover:bg-gray-100 backdrop-blur-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                    >
                        {demoNames[key as keyof typeof demoNames]}
                    </button>
                ))}
            </div>

            {/* Demo content */}
            <div className="w-full h-full pt-8">
                {demos[currentDemo as keyof typeof demos]}
            </div>
        </div>
    );
};

// Default export
const V0ChatDemo = () => {
    return <InteractiveV0ChatDemo />;
};

export default V0ChatDemo;