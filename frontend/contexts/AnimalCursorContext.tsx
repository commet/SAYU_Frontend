'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AnimalCursorContextType {
  personalityType: string | null;
  setPersonalityType: (type: string | null) => void;
}

const AnimalCursorContext = createContext<AnimalCursorContextType | undefined>(undefined);

const animalCursorMap: Record<string, string> = {
  'LAEF': 'cursor-fox',
  'LAEC': 'cursor-cat',
  'LAMF': 'cursor-owl',
  'LAMC': 'cursor-turtle',
  'LREF': 'cursor-chameleon',
  'LREC': 'cursor-hedgehog',
  'LRMF': 'cursor-octopus',
  'LRMC': 'cursor-beaver',
  'SAEF': 'cursor-butterfly',
  'SAEC': 'cursor-penguin',
  'SAMF': 'cursor-parrot',
  'SAMC': 'cursor-deer',
  'SREF': 'cursor-dog',
  'SREC': 'cursor-duck',
  'SRMF': 'cursor-elephant',
  'SRMC': 'cursor-eagle'
};

export function AnimalCursorProvider({ children }: { children: React.ReactNode }) {
  const [personalityType, setPersonalityType] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        if (parsed.personalityType) {
          setPersonalityType(parsed.personalityType);
        }
      } catch (error) {
        console.error('Failed to parse quiz results:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply/remove cursor classes
    const previousCursor = document.body.className
      .split(' ')
      .find(className => className.startsWith('cursor-'));
    
    if (previousCursor) {
      document.body.classList.remove(previousCursor);
    }

    if (personalityType && animalCursorMap[personalityType]) {
      const cursorClass = animalCursorMap[personalityType];
      document.body.classList.add(cursorClass);
    }

    // Cleanup on unmount
    return () => {
      if (personalityType && animalCursorMap[personalityType]) {
        document.body.classList.remove(animalCursorMap[personalityType]);
      }
    };
  }, [personalityType]);

  return (
    <AnimalCursorContext.Provider value={{ personalityType, setPersonalityType }}>
      {children}
    </AnimalCursorContext.Provider>
  );
}

export function useAnimalCursor() {
  const context = useContext(AnimalCursorContext);
  if (context === undefined) {
    throw new Error('useAnimalCursor must be used within an AnimalCursorProvider');
  }
  return context;
}