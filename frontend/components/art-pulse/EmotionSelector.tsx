'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { EmotionType, EMOTION_CONFIGS } from '@/types/art-pulse';
import { cn } from '@/lib/utils';

interface EmotionSelectorProps {
  selectedEmotion: EmotionType | null;
  onEmotionSelect: (emotion: EmotionType, intensity: number) => void;
  disabled?: boolean;
  className?: string;
}

export function EmotionSelector({ 
  selectedEmotion, 
  onEmotionSelect, 
  disabled = false,
  className 
}: EmotionSelectorProps) {
  const [intensity, setIntensity] = useState(1.0);
  const [hoveredEmotion, setHoveredEmotion] = useState<EmotionType | null>(null);

  const emotions: EmotionType[] = [
    'wonder', 'melancholy', 'joy', 'contemplation', 'nostalgia',
    'awe', 'serenity', 'passion', 'mystery', 'hope'
  ];

  const handleEmotionClick = (emotion: EmotionType) => {
    if (disabled) return;
    onEmotionSelect(emotion, intensity);
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 0.3) return '약간';
    if (value <= 0.7) return '보통';
    return '강하게';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="text-center space-y-2">
          <h4 className="font-medium">이 작품을 보며 느끼는 감정을 선택해주세요</h4>
          <p className="text-sm text-muted-foreground">
            감정의 강도도 함께 조절할 수 있습니다
          </p>
        </div>

        {/* Emotion Grid */}
        <div className="grid grid-cols-5 gap-2">
          {emotions.map((emotion) => {
            const config = EMOTION_CONFIGS[emotion];
            const isSelected = selectedEmotion === emotion;
            const isHovered = hoveredEmotion === emotion;

            return (
              <motion.div
                key={emotion}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredEmotion(emotion)}
                onHoverEnd={() => setHoveredEmotion(null)}
              >
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "w-full h-16 p-2 flex flex-col items-center justify-center gap-1 transition-all duration-200",
                    isSelected && "ring-2 ring-offset-2",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  style={{
                    backgroundColor: isSelected ? config.color : undefined,
                    borderColor: isSelected || isHovered ? config.color : undefined,
                    ringColor: isSelected ? config.color : undefined
                  }}
                  onClick={() => handleEmotionClick(emotion)}
                  disabled={disabled}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-xs font-medium truncate">
                    {config.name}
                  </span>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Emotion Description */}
        <AnimatePresence mode="wait">
          {(hoveredEmotion || selectedEmotion) && (
            <motion.div
              key={hoveredEmotion || selectedEmotion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center p-3 rounded-lg"
              style={{ 
                backgroundColor: EMOTION_CONFIGS[hoveredEmotion || selectedEmotion!].bgColor 
              }}
            >
              <p className="text-sm font-medium">
                {EMOTION_CONFIGS[hoveredEmotion || selectedEmotion!].name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {EMOTION_CONFIGS[hoveredEmotion || selectedEmotion!].description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intensity Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">감정 강도</label>
            <span className="text-sm text-muted-foreground">
              {getIntensityLabel(intensity)}
            </span>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={[intensity]}
              onValueChange={([value]) => setIntensity(value)}
              min={0.1}
              max={1.0}
              step={0.1}
              disabled={disabled}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>약하게</span>
              <span>강하게</span>
            </div>
          </div>

          {/* Intensity Preview */}
          {selectedEmotion && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                style={{
                  backgroundColor: EMOTION_CONFIGS[selectedEmotion].color,
                  transform: `scale(${0.8 + intensity * 0.4})`,
                  opacity: 0.6 + intensity * 0.4
                }}
              >
                {EMOTION_CONFIGS[selectedEmotion].icon}
              </div>
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        {selectedEmotion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <Button
              onClick={() => handleEmotionClick(selectedEmotion)}
              disabled={disabled}
              className="w-full"
              style={{ backgroundColor: EMOTION_CONFIGS[selectedEmotion].color }}
            >
              감정 공유하기
            </Button>
          </motion.div>
        )}

        {/* Helper Text */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            선택한 감정은 실시간으로 다른 참여자들과 공유됩니다
          </p>
        </div>
      </CardContent>
    </Card>
  );
}