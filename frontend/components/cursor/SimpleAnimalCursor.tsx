'use client';

import { useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

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

// CSS 전용 간단한 버전 - 성능 우선
export default function SimpleAnimalCursor() {
  const { personalityType } = useUserProfile();
  
  const animalType = personalityType 
    ? animalMapping[personalityType] 
    : 'fox';

  useEffect(() => {
    // body에 동물 커서 클래스 추가
    document.body.classList.add(`cursor-${animalType}`);
    
    // 트레일 효과 활성화 (선택적)
    const enableTrails = localStorage.getItem('enableCursorTrails') === 'true';
    if (enableTrails) {
      document.body.classList.add('cursor-trails-enabled');
    }

    return () => {
      document.body.classList.remove(`cursor-${animalType}`);
      document.body.classList.remove('cursor-trails-enabled');
    };
  }, [animalType]);

  return null; // CSS로만 작동하므로 렌더링할 것이 없음
}