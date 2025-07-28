'use client';

import React from 'react';
import { FullScreenCalendar } from './fullscreen-calendar';
import { Calendar, MapPin, Users, Palette, Heart, Star, Trophy, Clock, Zap, Crown, Sparkles } from 'lucide-react';

// 원본 데모
const dummyEvents = [
  {
    day: new Date("2025-01-02"),
    events: [
      {
        id: 1,
        name: "Q1 Planning Session",
        time: "10:00 AM",
        datetime: "2025-01-02T00:00",
      },
      {
        id: 2,
        name: "Team Sync",
        time: "2:00 PM",
        datetime: "2025-01-02T00:00",
      },
    ],
  },
  {
    day: new Date("2025-01-07"),
    events: [
      {
        id: 3,
        name: "Product Launch Review",
        time: "2:00 PM",
        datetime: "2025-01-07T00:00",
      },
      {
        id: 4,
        name: "Marketing Sync",
        time: "11:00 AM",
        datetime: "2025-01-07T00:00",
      },
      {
        id: 5,
        name: "Vendor Meeting",
        time: "4:30 PM",
        datetime: "2025-01-07T00:00",
      },
    ],
  },
  {
    day: new Date("2025-01-10"),
    events: [
      {
        id: 6,
        name: "Team Building Workshop",
        time: "11:00 AM",
        datetime: "2025-01-10T00:00",
      },
    ],
  },
  {
    day: new Date("2025-01-13"),
    events: [
      {
        id: 7,
        name: "Budget Analysis Meeting",
        time: "3:30 PM",
        datetime: "2025-01-14T00:00",
      },
      {
        id: 8,
        name: "Sprint Planning",
        time: "9:00 AM",
        datetime: "2025-01-14T00:00",
      },
      {
        id: 9,
        name: "Design Review",
        time: "1:00 PM",
        datetime: "2025-01-14T00:00",
      },
    ],
  },
  {
    day: new Date("2025-01-16"),
    events: [
      {
        id: 10,
        name: "Client Presentation",
        time: "10:00 AM",
        datetime: "2025-01-16T00:00",
      },
      {
        id: 11,
        name: "Team Lunch",
        time: "12:30 PM",
        datetime: "2025-01-16T00:00",
      },
      {
        id: 12,
        name: "Project Status Update",
        time: "2:00 PM",
        datetime: "2025-01-16T00:00",
      },
    ],
  },
];

export function CalendarDemo() {
  return (
    <div className="flex h-screen flex-1 flex-col scale-90">
      <FullScreenCalendar data={dummyEvents} />
    </div>
  );
}

// SAYU 갤러리 전시 일정 관리자
export const SayuGalleryExhibitionManager = () => {
  const exhibitionEvents = [
    {
      day: new Date("2025-01-28"),
      events: [
        {
          id: 1,
          name: "모네 인상주의 특별전 오프닝",
          time: "18:00",
          datetime: "2025-01-28T18:00",
        },
        {
          id: 2,
          name: "VIP 프리뷰 투어",
          time: "16:00",
          datetime: "2025-01-28T16:00",
        },
      ],
    },
    {
      day: new Date("2025-02-03"),
      events: [
        {
          id: 3,
          name: "한국 현대미술 컬렉션 전시",
          time: "10:00",
          datetime: "2025-02-03T10:00",
        },
        {
          id: 4,
          name: "큐레이터 토크쇼",
          time: "14:00",
          datetime: "2025-02-03T14:00",
        },
        {
          id: 5,
          name: "작가와의 만남",
          time: "19:00",
          datetime: "2025-02-03T19:00",
        },
      ],
    },
    {
      day: new Date("2025-02-08"),
      events: [
        {
          id: 6,
          name: "디지털 아트 페스티벌",
          time: "13:00",
          datetime: "2025-02-08T13:00",
        },
      ],
    },
    {
      day: new Date("2025-02-12"),
      events: [
        {
          id: 7,
          name: "청년 작가 그룹전 개막",
          time: "17:00",
          datetime: "2025-02-12T17:00",
        },
        {
          id: 8,
          name: "아트 컬렉터 네트워킹",
          time: "15:30",
          datetime: "2025-02-12T15:30",
        },
      ],
    },
    {
      day: new Date("2025-02-18"),
      events: [
        {
          id: 9,
          name: "조각 공원 야외 전시",
          time: "11:00",
          datetime: "2025-02-18T11:00",
        },
        {
          id: 10,
          name: "가족 대상 아트 워크샵",
          time: "14:30",
          datetime: "2025-02-18T14:30",
        },
        {
          id: 11,
          name: "후원회 만찬",
          time: "18:30",
          datetime: "2025-02-18T18:30",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <Palette className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            SAYU 갤러리 전시 관리자
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            전국 갤러리와 미술관의 전시 일정을 한눈에 관리하고 계획하세요
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Calendar className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  전시 일정 관리
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">오프닝</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">이벤트</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">워크샵</span>
                </div>
              </div>
            </div>
            <div className="h-[600px]">
              <FullScreenCalendar data={exhibitionEvents} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">28</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">이번 달 전시</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">참여 갤러리</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">2,847</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">예상 관람객</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">평균 만족도</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 커뮤니티 활동 캘린더
export const SayuCommunityActivityCalendar = () => {
  const communityEvents = [
    {
      day: new Date("2025-01-29"),
      events: [
        {
          id: 1,
          name: "APT 성격 테스트 그룹 세션",
          time: "19:00",
          datetime: "2025-01-29T19:00",
        },
        {
          id: 2,
          name: "아트 북클럽 모임",
          time: "15:00",
          datetime: "2025-01-29T15:00",
        },
      ],
    },
    {
      day: new Date("2025-02-05"),
      events: [
        {
          id: 3,
          name: "갤러리 동시 관람 이벤트",
          time: "14:00",
          datetime: "2025-02-05T14:00",
        },
        {
          id: 4,
          name: "퍼셉션 익스체인지 워크샵",
          time: "16:30",
          datetime: "2025-02-05T16:30",
        },
      ],
    },
    {
      day: new Date("2025-02-10"),
      events: [
        {
          id: 5,
          name: "AI 아트 프로필 생성 워크샵",
          time: "18:00",
          datetime: "2025-02-10T18:00",
        },
      ],
    },
    {
      day: new Date("2025-02-15"),
      events: [
        {
          id: 6,
          name: "아트 큐레이터와의 만남",
          time: "17:00",
          datetime: "2025-02-15T17:00",
        },
        {
          id: 7,
          name: "감정 번역 세션",
          time: "19:30",
          datetime: "2025-02-15T19:30",
        },
        {
          id: 8,
          name: "월말 네트워킹 파티",
          time: "20:30",
          datetime: "2025-02-15T20:30",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            SAYU 커뮤니티 활동
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            예술 애호가들과 함께하는 다양한 커뮤니티 활동과 워크샵 일정
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Heart className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  커뮤니티 활동 달력
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">워크샵</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">모임</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">특별 이벤트</span>
                </div>
              </div>
            </div>
            <div className="h-[600px]">
              <FullScreenCalendar data={communityEvents} />
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              이번 달 인기 활동
            </h3>
            <div className="space-y-4">
              {[
                { name: "갤러리 동시 관람", participants: 48, icon: "👥" },
                { name: "APT 테스트 세션", participants: 35, icon: "🧠" },
                { name: "아트 워크샵", participants: 28, icon: "🎨" },
                { name: "큐레이터 토크", participants: 22, icon: "💬" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{activity.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{activity.participants}명 참여</p>
                    </div>
                  </div>
                  <div className="text-blue-500 font-semibold">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              참여 통계
            </h3>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">156</div>
                    <div className="text-blue-100">총 참여 활동</div>
                  </div>
                  <Trophy className="w-12 h-12 text-blue-200" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">89</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">새로운 친구</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">주최한 모임</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 큐레이터 전용 이벤트 관리자
export const SayuCuratorEventManager = () => {
  const curatorEvents = [
    {
      day: new Date("2025-01-30"),
      events: [
        {
          id: 1,
          name: "VIP 컬렉터 프라이빗 투어",
          time: "10:00",
          datetime: "2025-01-30T10:00",
        },
        {
          id: 2,
          name: "작품 감정 및 인증 세션",
          time: "14:00",
          datetime: "2025-01-30T14:00",
        },
      ],
    },
    {
      day: new Date("2025-02-06"),
      events: [
        {
          id: 3,
          name: "신진 작가 포트폴리오 리뷰",
          time: "11:00",
          datetime: "2025-02-06T11:00",
        },
        {
          id: 4,
          name: "국제 아트페어 준비 회의",
          time: "15:30",
          datetime: "2025-02-06T15:30",
        },
        {
          id: 5,
          name: "미디어 인터뷰",
          time: "17:00",
          datetime: "2025-02-06T17:00",
        },
      ],
    },
    {
      day: new Date("2025-02-11"),
      events: [
        {
          id: 6,
          name: "기획전 컨셉 미팅",
          time: "09:30",
          datetime: "2025-02-11T09:30",
        },
      ],
    },
    {
      day: new Date("2025-02-17"),
      events: [
        {
          id: 7,
          name: "해외 갤러리 파트너십 미팅",
          time: "13:00",
          datetime: "2025-02-17T13:00",
        },
        {
          id: 8,
          name: "아트 컬렉션 자문 서비스",
          time: "16:00",
          datetime: "2025-02-17T16:00",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
              <Crown className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            SAYU 큐레이터 관리자
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            전문 큐레이터를 위한 VIP 서비스와 고급 이벤트 관리 시스템
          </p>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Sparkles className="w-6 h-6 text-emerald-500" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  큐레이터 전용 일정
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">VIP 투어</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">비즈니스</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">컨설팅</span>
                </div>
              </div>
            </div>
            <div className="h-[600px]">
              <FullScreenCalendar data={curatorEvents} />
            </div>
          </div>
        </div>

        {/* Premium Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-emerald-200 dark:border-emerald-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">VIP 큐레이션</h3>
              <p className="text-gray-600 dark:text-gray-300">
                개인 맞춤형 아트 컬렉션 큐레이션 서비스
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>• 전문 큐레이터 1:1 상담</p>
                <p>• 맞춤형 컬렉션 포트폴리오</p>
                <p>• 투자 가치 분석 리포트</p>
                <p>• 국제 아트페어 동행</p>
              </div>
              <div className="pt-4">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₩500,000<span className="text-sm">/월</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-blue-200 dark:border-blue-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">빠른 감정 서비스</h3>
              <p className="text-gray-600 dark:text-gray-300">
                신속하고 정확한 작품 감정 및 인증
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>• 24시간 내 감정 결과</p>
                <p>• 블록체인 기반 인증서</p>
                <p>• 보험 가치 산정</p>
                <p>• 경매 출품 자문</p>
              </div>
              <div className="pt-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₩200,000<span className="text-sm">/건</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-purple-200 dark:border-purple-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">프라이빗 전시</h3>
              <p className="text-gray-600 dark:text-gray-300">
                독점적인 프라이빗 전시 기획 서비스
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>• 개인/기업 전용 전시</p>
                <p>• 맞춤형 공간 연출</p>
                <p>• 초청장 및 도록 제작</p>
                <p>• 미디어 홍보 지원</p>
              </div>
              <div className="pt-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₩2,000,000<span className="text-sm">/전시</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            큐레이터 성과 지표
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">완료된 프로젝트</h4>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">47</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">VIP 고객</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">128</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">만족도</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">98%</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">평균 평점</h4>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">4.9</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveFullScreenCalendarDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <CalendarDemo />,
    galleryManager: <SayuGalleryExhibitionManager />,
    communityCalendar: <SayuCommunityActivityCalendar />,
    curatorManager: <SayuCuratorEventManager />
  };

  const demoNames = {
    original: '원본 캘린더',
    galleryManager: '갤러리 전시 관리자',
    communityCalendar: '커뮤니티 활동',
    curatorManager: '큐레이터 관리자'
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
const FullScreenCalendarDemo = () => {
  return <InteractiveFullScreenCalendarDemo />;
};

export default FullScreenCalendarDemo;