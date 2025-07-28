'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EmotionInput, 
  EmotionColor,
  WeatherMetaphor,
  AbstractShape,
  SoundTexture 
} from '../../../shared';
import EmotionColorPicker from './EmotionColorPicker';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Palette, 
  Cloud, 
  Shapes, 
  Music, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// 입력 모드 타입
type InputMode = 'color' | 'weather' | 'shape' | 'sound' | 'complete';

interface EmotionTranslatorProps {
  onTranslationComplete: (input: EmotionInput) => void;
  className?: string;
}

export default function EmotionTranslator({ 
  onTranslationComplete,
  className 
}: EmotionTranslatorProps) {
  const { language } = useLanguage();
  const [currentMode, setCurrentMode] = useState<InputMode>('color');
  const [emotionData, setEmotionData] = useState<Partial<EmotionInput>>({
    id: `emotion-${Date.now()}`,
    timestamp: new Date()
  });
  
  // 각 단계의 완료 상태
  const [completedSteps, setCompletedSteps] = useState<Set<InputMode>>(new Set());
  
  // 입력 모드별 정보
  const modeInfo = {
    color: {
      icon: Palette,
      title: language === 'ko' ? '색상으로 표현하기' : 'Express with Color',
      subtitle: language === 'ko' 
        ? '마음의 색깔을 선택해주세요' 
        : 'Choose the color of your emotion',
      optional: false
    },
    weather: {
      icon: Cloud,
      title: language === 'ko' ? '날씨로 표현하기' : 'Express with Weather',
      subtitle: language === 'ko' 
        ? '지금 마음의 날씨는 어떤가요?' 
        : 'What\'s the weather in your heart?',
      optional: true
    },
    shape: {
      icon: Shapes,
      title: language === 'ko' ? '형태로 표현하기' : 'Express with Shape',
      subtitle: language === 'ko' 
        ? '감정을 추상적인 형태로 그려보세요' 
        : 'Draw your emotion as an abstract shape',
      optional: true
    },
    sound: {
      icon: Music,
      title: language === 'ko' ? '소리로 표현하기' : 'Express with Sound',
      subtitle: language === 'ko' 
        ? '마음의 소리를 들려주세요' 
        : 'Let us hear the sound of your emotion',
      optional: true
    }
  };
  
  // 색상 선택 완료
  const handleColorSelect = (color: EmotionColor) => {
    setEmotionData({ ...emotionData, color });
    setCompletedSteps(new Set([...completedSteps, 'color']));
    setCurrentMode('weather');
  };
  
  // 다음 단계로
  const handleNext = () => {
    const modes: InputMode[] = ['color', 'weather', 'shape', 'sound', 'complete'];
    const currentIndex = modes.indexOf(currentMode);
    if (currentIndex < modes.length - 1) {
      setCurrentMode(modes[currentIndex + 1]);
    }
  };
  
  // 이전 단계로
  const handlePrevious = () => {
    const modes: InputMode[] = ['color', 'weather', 'shape', 'sound', 'complete'];
    const currentIndex = modes.indexOf(currentMode);
    if (currentIndex > 0) {
      setCurrentMode(modes[currentIndex - 1]);
    }
  };
  
  // 특정 단계로 이동
  const handleModeSelect = (mode: InputMode) => {
    if (mode === 'complete') return;
    setCurrentMode(mode);
  };
  
  // 번역 시작
  const handleStartTranslation = () => {
    const input: EmotionInput = {
      id: emotionData.id || `emotion-${Date.now()}`,
      timestamp: emotionData.timestamp || new Date(),
      color: emotionData.color,
      weather: emotionData.weather,
      shape: emotionData.shape,
      sound: emotionData.sound,
      context: {
        timeOfDay: getTimeOfDay(),
        season: getSeason()
      }
    };
    
    onTranslationComplete(input);
  };
  
  // 현재 시간대 가져오기
  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  };
  
  // 현재 계절 가져오기
  const getSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };
  
  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* 진행 상태 표시 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {(['color', 'weather', 'shape', 'sound'] as const).map((mode, index) => {
            const info = modeInfo[mode];
            const isCompleted = completedSteps.has(mode);
            const isCurrent = currentMode === mode;
            const isAccessible = mode === 'color' || completedSteps.has('color');
            
            return (
              <div key={mode} className="flex items-center">
                <button
                  onClick={() => isAccessible && handleModeSelect(mode)}
                  disabled={!isAccessible}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
                    isCurrent && "bg-primary/10 scale-105",
                    isCompleted && "text-primary",
                    !isAccessible && "opacity-50 cursor-not-allowed",
                    isAccessible && !isCurrent && "hover:bg-muted cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                    isCurrent && "bg-primary text-primary-foreground",
                    isCompleted && !isCurrent && "bg-primary/20 text-primary",
                    !isCompleted && !isCurrent && "bg-muted"
                  )}>
                    <info.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">
                    {info.title.split(' ')[0]}
                  </span>
                  {info.optional && (
                    <span className="text-xs text-muted-foreground">
                      ({language === 'ko' ? '선택' : 'Optional'})
                    </span>
                  )}
                </button>
                
                {index < 3 && (
                  <ChevronRight className={cn(
                    "w-4 h-4 mx-2",
                    completedSteps.has(mode) ? "text-primary" : "text-muted-foreground"
                  )} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* 진행률 바 */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${(completedSteps.size / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* 현재 입력 모드 */}
      <AnimatePresence mode="wait">
        {currentMode !== 'complete' && (
          <motion.div
            key={currentMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              {/* 색상 입력 */}
              {currentMode === 'color' && (
                <EmotionColorPicker
                  onColorSelect={handleColorSelect}
                  initialColor={emotionData.color}
                />
              )}
              
              {/* 날씨 입력 (추후 구현) */}
              {currentMode === 'weather' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                      <Cloud className="w-5 h-5" />
                      마음의 날씨
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      날씨 메타포 선택 기능 (구현 예정)
                    </p>
                  </div>
                  <Button onClick={handleNext} variant="outline">
                    건너뛰기
                  </Button>
                </div>
              )}
              
              {/* 형태 입력 (추후 구현) */}
              {currentMode === 'shape' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                      <Shapes className="w-5 h-5" />
                      감정의 형태
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      추상적 형태 그리기 기능 (구현 예정)
                    </p>
                  </div>
                  <Button onClick={handleNext} variant="outline">
                    건너뛰기
                  </Button>
                </div>
              )}
              
              {/* 소리 입력 (추후 구현) */}
              {currentMode === 'sound' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                      <Music className="w-5 h-5" />
                      마음의 소리
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      음악적 표현 기능 (구현 예정)
                    </p>
                  </div>
                  <Button onClick={() => setCurrentMode('complete')} variant="outline">
                    건너뛰기
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
        
        {/* 완료 화면 */}
        {currentMode === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Layers className="w-10 h-10 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {language === 'ko' 
                      ? '감정 수집이 완료되었습니다' 
                      : 'Emotion Collection Complete'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ko'
                      ? '이제 당신의 감정을 예술로 번역해드릴게요'
                      : 'Now we\'ll translate your emotion into art'}
                  </p>
                </div>
                
                {/* 수집된 데이터 요약 */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  {emotionData.color && (
                    <div className="flex items-center gap-2 text-sm">
                      <Palette className="w-4 h-4 text-primary" />
                      <span>색상 입력됨</span>
                    </div>
                  )}
                  {emotionData.weather && (
                    <div className="flex items-center gap-2 text-sm">
                      <Cloud className="w-4 h-4 text-primary" />
                      <span>날씨 입력됨</span>
                    </div>
                  )}
                  {emotionData.shape && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shapes className="w-4 h-4 text-primary" />
                      <span>형태 입력됨</span>
                    </div>
                  )}
                  {emotionData.sound && (
                    <div className="flex items-center gap-2 text-sm">
                      <Music className="w-4 h-4 text-primary" />
                      <span>소리 입력됨</span>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleStartTranslation}
                  size="lg"
                  className="gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {language === 'ko' ? '예술로 번역하기' : 'Translate to Art'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 도움말 */}
      {currentMode !== 'complete' && (
        <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
          <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            {language === 'ko'
              ? '각 단계는 선택사항입니다. 색상만으로도 감정 번역이 가능하며, 더 많은 정보를 입력할수록 더 정확한 번역이 가능합니다.'
              : 'Each step is optional. Color alone can translate emotions, and more inputs enable more accurate translations.'}
          </p>
        </div>
      )}
    </div>
  );
}