'use client';

import { useOnboardingV2 } from '@/contexts/OnboardingContextV2';
import { useState } from 'react';

export default function TestOnboardingPage() {
  const { 
    isNewUser,
    showWelcomeModal,
    currentJourney,
    progress,
    allJourneys,
    setShowWelcomeModal,
    completeTask,
    resetOnboarding,
    isOnboardingComplete,
    getDaysRemaining,
    getCompletionPercentage
  } = useOnboardingV2();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">온보딩 시스템 테스트</h1>
        
        {/* 상태 정보 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">현재 상태</h2>
          <div className="space-y-2 text-sm">
            <p>신규 사용자: {isNewUser ? '예' : '아니오'}</p>
            <p>환영 모달 표시: {showWelcomeModal ? '예' : '아니오'}</p>
            <p>온보딩 완료: {isOnboardingComplete ? '예' : '아니오'}</p>
            <p>진행률: {getCompletionPercentage()}%</p>
            <p>남은 일수: {getDaysRemaining()}일</p>
            <p>현재 날짜: Day {currentJourney?.day || 'N/A'}</p>
            <p>APT 타입: {progress.userAPTType || '미설정'}</p>
          </div>
        </div>

        {/* 현재 여정 */}
        {currentJourney && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Day {currentJourney.day}: {currentJourney.title}
            </h2>
            <p className="text-gray-400 mb-4">{currentJourney.morningNudge}</p>
            
            <div className="space-y-3">
              <div className={`p-3 rounded ${currentJourney.mainTask.completed ? 'bg-green-900/20' : 'bg-purple-900/20'}`}>
                <h3 className="font-medium">
                  {currentJourney.mainTask.title} 
                  {currentJourney.mainTask.completed && ' ✓'}
                </h3>
                <p className="text-sm text-gray-400">{currentJourney.mainTask.description}</p>
                {!currentJourney.mainTask.completed && (
                  <button
                    onClick={() => completeTask(currentJourney.mainTask.id)}
                    className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                  >
                    완료하기
                  </button>
                )}
              </div>
              
              {currentJourney.bonusTasks?.map(task => (
                <div key={task.id} className={`p-3 rounded ${task.completed ? 'bg-gray-700' : 'bg-gray-800'}`}>
                  <h3 className="font-medium text-sm">
                    {task.title}
                    {task.completed && ' ✓'}
                  </h3>
                  {!task.completed && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                    >
                      완료
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            환영 모달 표시
          </button>
          <button
            onClick={resetOnboarding}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            온보딩 초기화
          </button>
        </div>

        {/* 전체 여정 목록 */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">전체 7일 여정</h2>
          <div className="space-y-2">
            {allJourneys.map(journey => (
              <div 
                key={journey.day}
                className={`p-3 rounded ${
                  journey.completed ? 'bg-green-900/20' : 
                  journey.day === currentJourney?.day ? 'bg-purple-900/20' : 
                  'bg-gray-700'
                }`}
              >
                <span className="font-medium">
                  Day {journey.day}: {journey.title}
                </span>
                {journey.completed && ' ✓'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}