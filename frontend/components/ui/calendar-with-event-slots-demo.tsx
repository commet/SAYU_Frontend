'use client';

import React from 'react';
import { Calendar31 } from './calendar-with-event-slots';
import { Calendar, Clock, MapPin, Users, Palette, Heart, Star, Trophy } from 'lucide-react';

// 원본 데모
export function Demo() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Calendar31 />
    </div>
  );
}

// SAYU 전시회 일정 관리
export const SayuExhibitionSchedule = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-8 transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <Palette className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            SAYU 전시회 일정
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            전국 미술관과 갤러리의 특별 전시회 일정을 한눈에 확인하세요
          </p>
        </div>

        {/* Calendar component */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <Calendar31 />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">42</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">이번 달 전시회</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <MapPin className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">15</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">참여 갤러리</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1,234</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">참여 예정자</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">4.8</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">평균 만족도</div>
          </div>
        </div>

        {/* Featured exhibitions */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            주목할 만한 전시회
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "모네: 빛의 순간들",
                venue: "국립현대미술관",
                date: "2025.01.15 - 2025.04.30",
                description: "인상주의 거장 모네의 대표작 60점을 한자리에서 만나보세요.",
                image: "from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800",
                attendees: 2840
              },
              {
                title: "한국 현대미술의 새로운 시선",
                venue: "서울시립미술관",
                date: "2025.02.01 - 2025.05.15",
                description: "젊은 작가들이 선보이는 실험적이고 창의적인 현대미술 작품들.",
                image: "from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800",
                attendees: 1650
              },
              {
                title: "디지털 아트의 미래",
                venue: "리움미술관",
                date: "2025.01.20 - 2025.03.31",
                description: "AI와 기술이 만나 탄생한 새로운 형태의 예술 작품 전시.",
                image: "from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800",
                attendees: 980
              }
            ].map((exhibition, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-48 bg-gradient-to-br ${exhibition.image}`}></div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {exhibition.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {exhibition.venue}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-1" />
                      {exhibition.date}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {exhibition.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      {exhibition.attendees.toLocaleString()}명 관심
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                      예약하기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 커뮤니티 이벤트 달력
export const SayuCommunityEvents = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-8 transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            SAYU 커뮤니티 이벤트
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            예술 애호가들과 함께하는 다양한 커뮤니티 활동과 이벤트 일정
          </p>
        </div>

        {/* Calendar with events */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                커뮤니티 활동 달력
              </h2>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">워크샵</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">전시 투어</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">네트워킹</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">특별 이벤트</span>
                </div>
              </div>
            </div>
            <Calendar31 />
          </div>
        </div>

        {/* Upcoming events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              다가오는 이벤트
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "AI 아트 워크샵",
                  date: "1월 28일 (토)",
                  time: "14:00 - 17:00",
                  participants: 12,
                  maxParticipants: 15,
                  type: "워크샵",
                  color: "blue"
                },
                {
                  title: "갤러리 동시 관람",
                  date: "2월 2일 (목)",
                  time: "19:00 - 21:00",
                  participants: 8,
                  maxParticipants: 10,
                  type: "전시 투어",
                  color: "green"
                },
                {
                  title: "아트 컬렉터 밋업",
                  date: "2월 5일 (일)",
                  time: "15:00 - 18:00",
                  participants: 6,
                  maxParticipants: 20,
                  type: "네트워킹",
                  color: "purple"
                }
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      event.color === 'blue' ? 'bg-blue-500' :
                      event.color === 'green' ? 'bg-green-500' :
                      event.color === 'purple' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {event.date} • {event.time}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {event.participants}/{event.maxParticipants}명 참여
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    참여하기
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              활동 통계
            </h3>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">24</div>
                    <div className="text-blue-100">이번 달 참여한 이벤트</div>
                  </div>
                  <Trophy className="w-12 h-12 text-blue-200" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">총 참여 시간</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">89</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">새로운 연결</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">관심 분야</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">현대미술</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="w-3/4 bg-blue-500 h-2 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">디지털 아트</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="w-1/2 bg-green-500 h-2 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">조각</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="w-1/3 bg-purple-500 h-2 rounded-full"></div>
                    </div>
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

// SAYU APT 테스트 예약 시스템
export const SayuAptTestScheduler = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900 p-8 transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <Heart className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            APT 테스트 예약
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            당신의 예술적 성향을 발견하는 16가지 동물 캐릭터 분석 테스트 일정을 예약하세요
          </p>
        </div>

        {/* Scheduler */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                테스트 예약 달력
              </h2>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">개인 테스트</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">그룹 테스트</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">심화 상담</span>
                </div>
              </div>
            </div>
            <Calendar31 />
          </div>
        </div>

        {/* Test types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-emerald-200 dark:border-emerald-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">개인 테스트</h3>
              <p className="text-gray-600 dark:text-gray-300">
                1:1 맞춤형 APT 테스트와 개인 상담
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>• 소요시간: 60분</p>
                <p>• 16가지 성격 유형 분석</p>
                <p>• 개인별 맞춤 아트 추천</p>
                <p>• 상세 리포트 제공</p>
              </div>
              <div className="pt-4">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₩50,000</div>
                <button className="w-full mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  예약하기
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-blue-200 dark:border-blue-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">그룹 테스트</h3>
              <p className="text-gray-600 dark:text-gray-300">
                친구, 연인, 가족과 함께하는 그룹 테스트
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>• 소요시간: 90분</p>
                <p>• 2-4명 동시 진행</p>
                <p>• 관계 호환성 분석</p>
                <p>• 공통 관심사 발견</p>
              </div>
              <div className="pt-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₩35,000<span className="text-sm">/인</span></div>
                <button className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  예약하기
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-purple-200 dark:border-purple-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">심화 상담</h3>
              <p className="text-gray-600 dark:text-gray-300">
                전문 큐레이터와의 깊이 있는 예술 상담
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>• 소요시간: 120분</p>
                <p>• 전문 큐레이터 상담</p>
                <p>• 예술 경력 컨설팅</p>
                <p>• 맞춤 컬렉션 가이드</p>
              </div>
              <div className="pt-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₩150,000</div>
                <button className="w-full mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  예약하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            APT 테스트 후 받을 수 있는 혜택
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                <Palette className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">맞춤 아트 추천</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">당신의 성향에 맞는 작품과 전시회 추천</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">커뮤니티 매칭</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">같은 성향의 예술 애호가들과 연결</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">감정 기반 큐레이션</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">현재 감정 상태에 맞는 예술 경험 제공</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">VIP 혜택</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">특별 전시회와 이벤트 우선 초대</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveCalendarDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <Demo />,
    exhibition: <SayuExhibitionSchedule />,
    community: <SayuCommunityEvents />,
    aptScheduler: <SayuAptTestScheduler />
  };

  const demoNames = {
    original: '원본 달력',
    exhibition: '전시회 일정',
    community: '커뮤니티 이벤트', 
    aptScheduler: 'APT 테스트 예약'
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
const CalendarWithEventSlotsDemo = () => {
  return <InteractiveCalendarDemo />;
};

export default CalendarWithEventSlotsDemo;