'use client';

import { useState, useEffect } from 'react';

interface UserLevel {
  level: number;
  name: string;
  currentPoints: number;
  nextLevelPoints: number;
  frame: string;
  color: string;
  icon: string;
}

interface ProfileLevelProps {
  userId?: string;
  size?: 'small' | 'medium' | 'large';
}

const LEVEL_CONFIG = [
  { name: "첫 발걸음", minLevel: 1, maxLevel: 10, frame: "점선", color: "#E8E8E8", icon: "🌱" },
  { name: "호기심 가득", minLevel: 11, maxLevel: 25, frame: "물결", color: "#A8D8EA", icon: "👀" },
  { name: "눈뜨는 중", minLevel: 26, maxLevel: 50, frame: "나뭇잎", color: "#AA96DA", icon: "✨" },
  { name: "감성 충만", minLevel: 51, maxLevel: 75, frame: "꽃무늬", color: "#FCBAD3", icon: "🌸" },
  { name: "예술혼", minLevel: 76, maxLevel: 100, frame: "오로라", color: "#FFFFD2", icon: "🎨" }
];

export default function ProfileLevel({ userId, size = 'medium' }: ProfileLevelProps) {
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 1,
    name: "첫 발걸음",
    currentPoints: 0,
    nextLevelPoints: 100,
    frame: "점선",
    color: "#E8E8E8",
    icon: "🌱"
  });

  useEffect(() => {
    // TODO: 실제 API에서 사용자 레벨 정보 가져오기
    fetchUserLevel();
  }, [userId]);

  const fetchUserLevel = async () => {
    // 임시 데이터
    const mockData = {
      level: 27,
      totalPoints: 2750,
      currentLevelPoints: 750,
      nextLevelPoints: 1000
    };

    const levelConfig = LEVEL_CONFIG.find(
      config => mockData.level >= config.minLevel && mockData.level <= config.maxLevel
    ) || LEVEL_CONFIG[0];

    setUserLevel({
      level: mockData.level,
      name: levelConfig.name,
      currentPoints: mockData.currentLevelPoints,
      nextLevelPoints: mockData.nextLevelPoints,
      frame: levelConfig.frame,
      color: levelConfig.color,
      icon: levelConfig.icon
    });
  };

  const getFrameStyle = (frame: string) => {
    switch (frame) {
      case '점선':
        return 'border-2 border-dashed';
      case '물결':
        return 'border-2 border-solid shadow-sm';
      case '나뭇잎':
        return 'border-4 border-double shadow-md';
      case '꽃무늬':
        return 'border-4 border-solid shadow-lg ring-2 ring-offset-2';
      case '오로라':
        return 'border-4 border-solid shadow-xl ring-4 ring-offset-2 animate-pulse';
      default:
        return 'border-2 border-solid';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-20 h-20',
          level: 'text-sm',
          name: 'text-xs',
          icon: 'text-lg'
        };
      case 'large':
        return {
          container: 'w-32 h-32',
          level: 'text-2xl',
          name: 'text-base',
          icon: 'text-3xl'
        };
      default:
        return {
          container: 'w-24 h-24',
          level: 'text-lg',
          name: 'text-sm',
          icon: 'text-2xl'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const progress = (userLevel.currentPoints / userLevel.nextLevelPoints) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 레벨 프레임 */}
      <div className="relative">
        <div
          className={`
            ${sizeClasses.container}
            rounded-full
            flex items-center justify-center
            ${getFrameStyle(userLevel.frame)}
            transition-all duration-300
            hover:scale-105
          `}
          style={{ 
            borderColor: userLevel.color,
            backgroundColor: `${userLevel.color}20`
          }}
        >
          <div className="text-center">
            <div className={sizeClasses.icon}>{userLevel.icon}</div>
            <div className={`font-bold ${sizeClasses.level}`}>
              Lv.{userLevel.level}
            </div>
          </div>
        </div>

        {/* 진행도 링 */}
        <svg
          className="absolute inset-0 -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={userLevel.color}
            strokeWidth="3"
            fill="none"
            opacity="0.2"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={userLevel.color}
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${progress * 2.83} 283`}
            className="transition-all duration-500"
          />
        </svg>
      </div>

      {/* 레벨 이름 */}
      <div className={`font-medium ${sizeClasses.name}`} style={{ color: userLevel.color }}>
        {userLevel.name}
      </div>

      {/* 진행 상황 (medium, large 사이즈만) */}
      {size !== 'small' && (
        <div className="text-xs text-gray-500">
          {userLevel.currentPoints} / {userLevel.nextLevelPoints} pts
        </div>
      )}
    </div>
  );
}