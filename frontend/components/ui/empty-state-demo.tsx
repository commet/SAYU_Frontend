'use client';

import React from 'react';
import { EmptyState } from "./empty-state";
import { 
  FileText, 
  Link, 
  Files, 
  Search, 
  MessageSquare, 
  Mail, 
  Image,
  FileQuestion,
  Settings,
  Palette,
  Users,
  Calendar,
  Star,
  Trophy,
  Crown,
  Heart,
  Camera,
  BookOpen,
  Clock,
  UserPlus
} from "lucide-react";

// 원본 데모들
function EmptyStateDefault() {
  return (
    <EmptyState
      title="No Forms Created"
      description="You can create a new template to add in your pages."
      icons={[FileText, Link, Files]}
      action={{
        label: "Create Form",
        onClick: () => console.log("Create form clicked")
      }}
    />
  )
}

function EmptyStateMessages() {
  return (
    <EmptyState
      title="No Messages"
      description="Start a conversation by sending a message."
      icons={[MessageSquare, Mail]}
      action={{
        label: "Send Message",
        onClick: () => console.log("Send message clicked")
      }}
    />
  )
}

function EmptyStateSearch() {
  return (
    <EmptyState
      title="No Results Found"
      description="Try adjusting your search filters."
      icons={[Search, FileQuestion]}
    />
  )
}

function EmptyStateMedia() {
  return (
    <EmptyState
      title="No Images"
      description="Upload images to get started with your gallery."
      icons={[Image]}
      action={{
        label: "Upload Images",
        onClick: () => console.log("Upload clicked")
      }}
    />
  )
}

function EmptyStateSettings() {
  return (
    <EmptyState
      title="No Settings"
      description="Configure your application settings to get started."
      icons={[Settings]}
      action={{
        label: "Configure",
        onClick: () => console.log("Configure clicked")
      }}
    />
  )
}

// SAYU APT 테스트 결과 없음
export const SayuEmptyAptResults = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            SAYU APT 테스트
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            나의 예술적 성향을 발견해보세요
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <EmptyState
            title="아직 테스트 결과가 없습니다"
            description="16가지 동물 캐릭터 중 당신의 예술적 성향을 찾아보세요.&#10;개인화된 작품 추천과 갤러리 투어 경험이 기다립니다."
            icons={[Palette, Star, Heart]}
            action={{
              label: "APT 테스트 시작하기",
              onClick: () => console.log("APT 테스트 시작")
            }}
            className="mx-auto bg-purple-50/50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700"
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              16가지 성격 유형
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              각 유형별 맞춤 UI와 추천 시스템
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI 작품 추천
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              성향 기반 개인화된 갤러리 큐레이션
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-pink-600 dark:text-pink-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              커뮤니티 매칭
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              비슷한 성향의 사람들과 전시 동행
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 갤러리 컬렉션 없음
export const SayuEmptyGalleryCollection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            나의 갤러리
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            관심 있는 작품들을 수집하고 관리하세요
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <EmptyState
            title="컬렉션이 비어있습니다"
            description="마음에 드는 작품을 저장하여 나만의 갤러리를 만들어보세요.&#10;언제든지 다시 찾아보고 친구들과 공유할 수 있습니다."
            icons={[Image, Heart, BookOpen]}
            action={{
              label: "작품 둘러보기",
              onClick: () => console.log("작품 탐색 시작")
            }}
            className="mx-auto bg-indigo-50/50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 text-center cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
            <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 dark:text-white">작품 검색</h4>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 text-center cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
            <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 dark:text-white">추천 작품</h4>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 text-center cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
            <Calendar className="w-8 h-8 text-green-600 dark:text-green-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 dark:text-white">전시 일정</h4>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 text-center cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
            <Users className="w-8 h-8 text-pink-600 dark:text-pink-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 dark:text-white">커뮤니티</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 팔로우 목록 없음
export const SayuEmptyFollowList = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            팔로우 관리
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            관심 있는 아티스트와 큐레이터를 팔로우하세요
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <EmptyState
            title="아직 팔로우한 사람이 없습니다"
            description="좋아하는 아티스트나 큐레이터를 팔로우하여&#10;그들의 새로운 작품과 전시 소식을 받아보세요."
            icons={[UserPlus, Heart, Star]}
            action={{
              label: "아티스트 찾아보기",
              onClick: () => console.log("아티스트 탐색")
            }}
            className="mx-auto bg-emerald-50/50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Palette className="w-6 h-6 text-emerald-600 dark:text-emerald-300 mr-3" />
              추천 아티스트
            </h3>
            <div className="space-y-4">
              {[
                { name: "김예진 작가", specialty: "현대 추상화", followers: "1.2K" },
                { name: "박현수 작가", specialty: "조각 및 설치", followers: "856" },
                { name: "이지아 작가", specialty: "디지털 아트", followers: "2.1K" },
              ].map((artist, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{artist.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{artist.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{artist.followers} 팔로워</p>
                    <button className="text-emerald-600 dark:text-emerald-300 text-sm font-medium hover:underline">
                      팔로우
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Users className="w-6 h-6 text-teal-600 dark:text-teal-300 mr-3" />
              추천 큐레이터
            </h3>
            <div className="space-y-4">
              {[
                { name: "SAYU 큐레이터 팀", specialty: "종합 미술", followers: "5.2K" },
                { name: "모던 갤러리", specialty: "현대미술", followers: "3.1K" },
                { name: "아트 스페이스", specialty: "실험 예술", followers: "1.8K" },
              ].map((curator, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-teal-600 dark:text-teal-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{curator.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{curator.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{curator.followers} 팔로워</p>
                    <button className="text-teal-600 dark:text-teal-300 text-sm font-medium hover:underline">
                      팔로우
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 전시 일정 없음
export const SayuEmptyExhibitionSchedule = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-100 dark:from-rose-900 dark:to-orange-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            전시 일정
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            관심 있는 전시회 일정을 관리하세요
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
          <EmptyState
            title="예정된 전시 관람이 없습니다"
            description="관심 있는 전시회를 예약하고 일정을 관리해보세요.&#10;놓치지 않도록 알림도 설정할 수 있습니다."
            icons={[Calendar, Clock, Bell]}
            action={{
              label: "전시회 둘러보기",
              onClick: () => console.log("전시회 탐색")
            }}
            className="mx-auto bg-rose-50/50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700"
          />
        </div>

        {/* Upcoming Exhibitions */}
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            이번 달 주요 전시회
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "모네: 빛의 인상",
                venue: "국립현대미술관",
                period: "2월 15일 - 5월 31일",
                status: "예매 중"
              },
              {
                title: "한국 현대미술의 새로운 물결",
                venue: "서울시립미술관",
                period: "3월 1일 - 6월 30일",
                status: "사전 예약"
              },
              {
                title: "디지털 아트 페스티벌",
                venue: "DDP",
                period: "3월 20일 - 4월 20일",
                status: "오픈 예정"
              }
            ].map((exhibition, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-6 text-center">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {exhibition.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {exhibition.venue}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {exhibition.period}
                </p>
                <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300 rounded-full text-xs font-medium">
                  {exhibition.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveEmptyStateDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: (
      <div className="space-y-12 p-8">
        <h2 className="text-3xl font-bold text-center mb-8">원본 데모들</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EmptyStateDefault />
          <EmptyStateMessages />
          <EmptyStateSearch />
          <EmptyStateMedia />
          <EmptyStateSettings />
        </div>
      </div>
    ),
    aptResults: <SayuEmptyAptResults />,
    gallery: <SayuEmptyGalleryCollection />,
    follow: <SayuEmptyFollowList />,
    schedule: <SayuEmptyExhibitionSchedule />
  };

  const demoNames = {
    original: '원본 데모',
    aptResults: 'APT 테스트 결과',
    gallery: '갤러리 컬렉션',
    follow: '팔로우 목록',
    schedule: '전시 일정'
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
const EmptyStateDemo = () => {
  return <InteractiveEmptyStateDemo />;
};

export default EmptyStateDemo;

export {
  EmptyStateDefault,
  EmptyStateMessages,
  EmptyStateSearch,
  EmptyStateMedia,
  EmptyStateSettings,
};