'use client';

import { useEffect, useState, useRef } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface CursorPosition {
  x: number;
  y: number;
}

const animalMapping: Record<string, string> = {
  'LAEF': 'fox',
  'LAEC': 'cat',
  'LAMF': 'owl',
  'LAMC': 'turtle',
  'LREF': 'chameleon',
  'LREC': 'hedgehog',
  'LRMF': 'octopus',
  'LRMC': 'beaver',
  'SAEF': 'butterfly',
  'SAEC': 'penguin',
  'SAMF': 'parrot',
  'SAMC': 'deer',
  'SREF': 'dog',
  'SREC': 'duck',
  'SRMF': 'elephant',
  'SRMC': 'eagle'
};

export default function AnimalCursor() {
  const { personalityType } = useUserProfile();
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);

  // 사용자의 성격 유형에 맞는 동물 가져오기
  const animalType = personalityType 
    ? animalMapping[personalityType] 
    : 'fox'; // 기본값

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // 트레일 효과 생성 (선택적)
      if (e.movementX !== 0 || e.movementY !== 0) {
        createTrail(e.clientX, e.clientY);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // 호버 상태 감지
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.classList.contains('clickable') ||
        target.closest('button, a, .clickable');
      
      setIsHovering(!!isInteractive);
    };

    // 이벤트 리스너 등록
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleElementHover);

    // body에 커서 클래스 추가
    document.body.classList.add(`cursor-${animalType}`);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleElementHover);
      document.body.classList.remove(`cursor-${animalType}`);
    };
  }, [animalType]);

  // 트레일 효과 생성 함수
  const createTrail = (x: number, y: number) => {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = `${x - 4}px`;
    trail.style.top = `${y - 4}px`;
    document.body.appendChild(trail);

    setTimeout(() => {
      trail.remove();
    }, 500);
  };

  // 모바일 디바이스에서는 렌더링하지 않음
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`animal-cursor-container ${isHovering ? 'hovering' : ''} ${isClicking ? 'clicking' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <img
        src={`/images/personality-animals/avatars/${animalType}-${personalityType?.toLowerCase() || 'laef'}-avatar.png`}
        alt={`${animalType} cursor`}
        className="animal-cursor-image"
        draggable={false}
      />
    </div>
  );
}