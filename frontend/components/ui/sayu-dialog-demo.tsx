'use client';

import React, { useState } from 'react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './sayu-dialog';
import { Input } from './input';
import { Label } from './label';
import { Palette, User, Calendar, Heart, Star, Trophy, Settings, Camera, Crown, Zap, Shield } from 'lucide-react';

// 원본 데모
export function SayuDialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// SAYU APT 테스트 결과 다이얼로그
export const SayuAptResultDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            SAYU APT 테스트 완료
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            당신의 예술적 성향 분석이 완료되었습니다
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Trophy className="w-5 h-5 mr-2" />
              결과 확인하기
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🦋</span>
                </div>
              </div>
              <DialogTitle className="text-2xl text-center">
                당신은 <span className="text-purple-600">나비형</span> (INFP)
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                창의적이고 감성적인 예술 감상자
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* 성격 특성 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-500" />
                  주요 특성
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {['감정 표현력', '창의성', '직관력', '공감 능력'].map((trait, index) => (
                    <div key={index} className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
                      <div className="text-sm font-medium text-purple-700 dark:text-purple-300">{trait}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 추천 아트 스타일 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Palette className="w-4 h-4 mr-2 text-purple-500" />
                  추천 아트 스타일
                </h4>
                <div className="space-y-2">
                  {[
                    { style: '인상주의', match: '95%' },
                    { style: '추상 표현주의', match: '88%' },
                    { style: '낭만주의', match: '82%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{item.style}</span>
                      <span className="text-sm font-semibold text-purple-600">{item.match}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 추천 활동 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  추천 활동
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    감정 중심의 갤러리 투어
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    아트 저널링 워크샵
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    소규모 아티스트 토크
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                다시 테스트
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                맞춤 추천 받기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// SAYU 전시회 예약 다이얼로그
export const SayuExhibitionBookingDialog = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [ticketCount, setTicketCount] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Exhibition Info */}
        <div className="space-y-6">
          <div className="w-full h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
            <div className="text-white text-center space-y-2">
              <Camera className="w-16 h-16 mx-auto" />
              <h2 className="text-2xl font-bold">모네: 빛의 인상</h2>
              <p className="text-blue-100">2025.02.01 - 2025.05.31</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              특별 전시회 예약
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              인상주의 거장 모네의 대표작을 만나보세요
            </p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Calendar className="w-5 h-5 mr-2" />
              지금 예약하기
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">전시회 예약</DialogTitle>
              <DialogDescription>
                모네: 빛의 인상 전시회 관람 예약을 진행합니다
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* 날짜 선택 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">관람 날짜</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['2025-02-15', '2025-02-16', '2025-02-17', '2025-02-22', '2025-02-23', '2025-02-24'].map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        selectedDate === date
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('ko-KR', { 
                        month: 'short', 
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시간 선택 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">관람 시간</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* 티켓 수량 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">티켓 수량</Label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{ticketCount}</span>
                  <button
                    onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                    className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 개인정보 입력 */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">예약자 정보</Label>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="visitor-name" className="text-right">
                      이름
                    </Label>
                    <Input
                      id="visitor-name"
                      placeholder="김예술"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="visitor-phone" className="text-right">
                      연락처
                    </Label>
                    <Input
                      id="visitor-phone"
                      placeholder="010-1234-5678"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="visitor-email" className="text-right">
                      이메일
                    </Label>
                    <Input
                      id="visitor-email"
                      type="email"
                      placeholder="art@sayu.com"
                      className="col-span-3"
                    />
                  </div>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">총 결제 금액</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      성인 ₩25,000 × {ticketCount}매
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₩{(25000 * ticketCount).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline">
                취소
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={!selectedDate || !selectedTime}
              >
                예약 완료
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 전시 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <User className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">큐레이터 가이드</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              전문가와 함께하는 작품 해설
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <Camera className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AR 체험</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              증강현실로 만나는 작품 정보
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">개인 맞춤</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              APT 결과 기반 추천 루트
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// SAYU 설정 다이얼로그
export const SayuSettingsDialog = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [theme, setTheme] = useState('system');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            SAYU 설정
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            당신만의 예술 감상 환경을 설정하세요
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="px-8 py-4 text-lg">
              <Settings className="w-5 h-5 mr-2" />
              설정 열기
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">SAYU 설정</DialogTitle>
              <DialogDescription>
                개인화된 예술 감상 경험을 위한 설정을 조정하세요
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* 알림 설정 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">알림 설정</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      새로운 전시회와 이벤트 알림을 받습니다
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 자동재생 설정 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">오디오 가이드 자동재생</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      작품 페이지 진입 시 자동으로 오디오 가이드를 재생합니다
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoPlay ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoPlay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 테마 설정 */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">테마 설정</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: '라이트', icon: '☀️' },
                    { value: 'dark', label: '다크', icon: '🌙' },
                    { value: 'system', label: '시스템', icon: '💻' }
                  ].map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => setTheme(themeOption.value)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        theme === themeOption.value
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{themeOption.icon}</div>
                      <div className="text-sm">{themeOption.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 개인정보 설정 */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">개인정보 설정</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="display-name" className="text-right">
                      표시 이름
                    </Label>
                    <Input
                      id="display-name"
                      defaultValue="김예술"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bio" className="text-right">
                      소개
                    </Label>
                    <Input
                      id="bio"
                      placeholder="예술을 사랑하는 사람"
                      className="col-span-3"
                    />
                  </div>
                </div>
              </div>

              {/* 개인정보 및 보안 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  개인정보 및 보안
                </h4>
                <div className="space-y-2 text-sm">
                  <button className="text-left w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    비밀번호 변경
                  </button>
                  <button className="text-left w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    개인정보 다운로드
                  </button>
                  <button className="text-left w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600">
                    계정 삭제
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline">
                취소
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                설정 저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// 인터랙티브 데모
export const InteractiveSayuDialogDemo = () => {
  const [currentDemo, setCurrentDemo] = React.useState('original');

  const demos = {
    original: <SayuDialogDemo />,
    aptResult: <SayuAptResultDialog />,
    booking: <SayuExhibitionBookingDialog />,
    settings: <SayuSettingsDialog />
  };

  const demoNames = {
    original: '원본 다이얼로그',
    aptResult: 'APT 결과',
    booking: '전시회 예약',
    settings: 'SAYU 설정'
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
const SayuDialogDemo = () => {
  return <InteractiveSayuDialogDemo />;
};

export default SayuDialogDemo;