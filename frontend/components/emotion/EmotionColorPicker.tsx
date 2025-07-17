'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { throttle } from 'lodash';
import { HSLColor, EmotionColor } from '@/types/emotion-translation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Palette, 
  Plus, 
  Sparkles, 
  Wind, 
  Waves, 
  Heart,
  Info
} from 'lucide-react';

interface EmotionColorPickerProps {
  onColorSelect: (color: EmotionColor) => void;
  initialColor?: EmotionColor;
  className?: string;
}

export default function EmotionColorPicker({ 
  onColorSelect, 
  initialColor,
  className 
}: EmotionColorPickerProps) {
  // 주요 색상 상태
  const [primaryColor, setPrimaryColor] = useState<HSLColor>(
    initialColor?.primary || { hue: 200, saturation: 70, lightness: 50 }
  );
  
  // 그라디언트 모드
  const [isGradientMode, setIsGradientMode] = useState(false);
  const [gradientColors, setGradientColors] = useState<HSLColor[]>([
    primaryColor,
    { hue: (primaryColor.hue + 60) % 360, saturation: 70, lightness: 50 }
  ]);
  
  // 애니메이션 효과
  const [animationType, setAnimationType] = useState<'none' | 'breathe' | 'pulse' | 'flow'>('none');
  
  // Canvas ref for color wheel
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 색상환 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // 색상환 그리기
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;
      
      // 채도는 중심에서 바깥쪽으로 증가
      for (let r = 0; r < radius; r++) {
        const saturation = (r / radius) * 100;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, startAngle, endAngle);
        ctx.strokeStyle = `hsl(${angle}, ${saturation}%, ${primaryColor.lightness}%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // 선택된 색상 표시
    const selectedAngle = primaryColor.hue * Math.PI / 180;
    const selectedRadius = (primaryColor.saturation / 100) * radius;
    const x = centerX + selectedRadius * Math.cos(selectedAngle);
    const y = centerY + selectedRadius * Math.sin(selectedAngle);
    
    // 선택 포인트
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [primaryColor]);
  
  // 색상환에서 색상 선택 (throttled for performance)
  const handleCanvasClick = useCallback(throttle((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 극좌표 계산
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = Math.min(centerX, centerY) - 10;
    
    if (distance <= maxRadius) {
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (angle < 0) angle += 360;
      
      const saturation = Math.min((distance / maxRadius) * 100, 100);
      
      setPrimaryColor({
        ...primaryColor,
        hue: Math.round(angle),
        saturation: Math.round(saturation)
      });
      
      if (isGradientMode) {
        const newColors = [...gradientColors];
        newColors[0] = {
          ...primaryColor,
          hue: Math.round(angle),
          saturation: Math.round(saturation)
        };
        setGradientColors(newColors);
      }
    }
  }, 16), [primaryColor, isGradientMode, gradientColors]); // 60fps throttle
  
  // 명도 조절
  const handleLightnessChange = (value: number[]) => {
    setPrimaryColor({ ...primaryColor, lightness: value[0] });
    
    if (isGradientMode) {
      const newColors = gradientColors.map(color => ({
        ...color,
        lightness: value[0]
      }));
      setGradientColors(newColors);
    }
  };
  
  // 그라디언트 색상 추가
  const addGradientColor = () => {
    if (gradientColors.length < 5) {
      const lastColor = gradientColors[gradientColors.length - 1];
      setGradientColors([
        ...gradientColors,
        { 
          hue: (lastColor.hue + 60) % 360, 
          saturation: lastColor.saturation, 
          lightness: lastColor.lightness 
        }
      ]);
    }
  };
  
  // 현재 색상을 CSS 문자열로 변환 (memoized)
  const getColorString = useCallback((color: HSLColor) => {
    return `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;
  }, []);
  
  // 그라디언트 CSS 생성 (memoized)
  const getGradientString = useMemo(() => {
    if (!isGradientMode) return getColorString(primaryColor);
    
    const stops = gradientColors
      .map((color, i) => `${getColorString(color)} ${(i / (gradientColors.length - 1)) * 100}%`)
      .join(', ');
    
    return `linear-gradient(45deg, ${stops})`;
  }, [isGradientMode, primaryColor, gradientColors, getColorString]);
  
  // 색상 선택 완료
  const handleComplete = () => {
    const emotionColor: EmotionColor = {
      primary: primaryColor,
      gradient: isGradientMode ? {
        type: 'linear',
        angle: 45,
        stops: gradientColors.map((color, i) => ({
          color,
          position: (i / (gradientColors.length - 1)) * 100
        }))
      } : undefined,
      animation: animationType !== 'none' ? {
        type: animationType,
        duration: 3000,
        intensity: 0.5
      } : undefined
    };
    
    onColorSelect(emotionColor);
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Palette className="w-5 h-5" />
          지금 마음의 색은 무엇인가요?
        </h3>
        <p className="text-sm text-muted-foreground">
          색상으로 감정을 표현해보세요. 하나의 색 또는 여러 색의 조합도 가능합니다.
        </p>
      </div>
      
      {/* 색상환 */}
      <div className="flex justify-center">
        <div 
          className="relative"
          role="slider"
          aria-label="색상 선택기"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={primaryColor.hue}
          aria-describedby="color-picker-help"
          tabIndex={0}
          onKeyDown={(e) => {
            let newHue = primaryColor.hue;
            let newSaturation = primaryColor.saturation;
            
            switch(e.key) {
              case 'ArrowLeft':
                e.preventDefault();
                newHue = (primaryColor.hue - 5 + 360) % 360;
                break;
              case 'ArrowRight':
                e.preventDefault();
                newHue = (primaryColor.hue + 5) % 360;
                break;
              case 'ArrowUp':
                e.preventDefault();
                newSaturation = Math.min(100, primaryColor.saturation + 5);
                break;
              case 'ArrowDown':
                e.preventDefault();
                newSaturation = Math.max(0, primaryColor.saturation - 5);
                break;
            }
            
            setPrimaryColor({
              ...primaryColor,
              hue: newHue,
              saturation: newSaturation
            });
          }}
        >
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="cursor-crosshair rounded-full shadow-lg"
            onClick={handleCanvasClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={(e) => {
              if (isDragging) handleCanvasClick(e);
            }}
            aria-hidden="true"
          />
          
          {/* 중앙 프리뷰 */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full shadow-inner"
            style={{ background: getGradientString() }}
          >
            {animationType !== 'none' && (
              <motion.div
                className="w-full h-full rounded-full"
                animate={{
                  opacity: animationType === 'breathe' ? [0.5, 1, 0.5] : 1,
                  scale: animationType === 'pulse' ? [0.9, 1.1, 0.9] : 1,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ background: 'inherit' }}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* 명도 조절 */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <span>밝기</span>
          <span className="text-muted-foreground text-xs">
            ({primaryColor.lightness}%)
          </span>
        </label>
        <Slider
          value={[primaryColor.lightness]}
          onValueChange={handleLightnessChange}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>어두움</span>
          <span>밝음</span>
        </div>
      </div>
      
      {/* 그라디언트 모드 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">복잡한 감정 표현</label>
          <Button
            variant={isGradientMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsGradientMode(!isGradientMode)}
          >
            {isGradientMode ? '켜짐' : '꺼짐'}
          </Button>
        </div>
        
        {isGradientMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              {gradientColors.map((color, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-lg shadow-sm cursor-pointer"
                  style={{ backgroundColor: getColorString(color) }}
                  onClick={() => {
                    // 클릭한 색상을 편집 모드로
                    setPrimaryColor(color);
                  }}
                />
              ))}
              {gradientColors.length < 5 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  onClick={addGradientColor}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              색상을 클릭하여 수정하거나 + 버튼으로 추가하세요
            </p>
          </motion.div>
        )}
      </div>
      
      {/* 애니메이션 효과 */}
      <div className="space-y-3">
        <label className="text-sm font-medium">감정의 움직임</label>
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant={animationType === 'none' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnimationType('none')}
          >
            정적
          </Button>
          <Button
            variant={animationType === 'breathe' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnimationType('breathe')}
            className="gap-1"
          >
            <Wind className="w-3 h-3" />
            숨쉬기
          </Button>
          <Button
            variant={animationType === 'pulse' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnimationType('pulse')}
            className="gap-1"
          >
            <Heart className="w-3 h-3" />
            맥박
          </Button>
          <Button
            variant={animationType === 'flow' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnimationType('flow')}
            className="gap-1"
          >
            <Waves className="w-3 h-3" />
            흐름
          </Button>
        </div>
      </div>
      
      {/* 색상 의미 힌트 */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• 따뜻한 색(빨강, 주황): 활동적이고 열정적인 감정</p>
            <p>• 차가운 색(파랑, 초록): 차분하고 평화로운 감정</p>
            <p>• 채도가 높을수록: 감정의 강도가 강함</p>
            <p>• 여러 색상: 복잡하고 혼재된 감정</p>
          </div>
        </div>
      </div>
      
      {/* 완료 버튼 */}
      <Button 
        onClick={handleComplete}
        className="w-full gap-2"
        size="lg"
      >
        <Sparkles className="w-4 h-4" />
        이 색상으로 감정 번역하기
      </Button>
    </div>
  );
}