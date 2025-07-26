'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReflectionInputProps {
  onSubmit: (reflection: string, isAnonymous: boolean) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function ReflectionInput({
  onSubmit,
  onTyping,
  disabled = false,
  className
}: ReflectionInputProps) {
  const [reflection, setReflection] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const maxLength = 500;
  const minLength = 10;
  const remainingChars = maxLength - reflection.length;
  const isValid = reflection.trim().length >= minLength && reflection.trim().length <= maxLength;

  // Handle typing indicator
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (reflection.length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1500);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [reflection, isTyping, onTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [reflection]);

  const handleSubmit = () => {
    if (!isValid || disabled) return;
    
    onSubmit(reflection.trim(), isAnonymous);
    setReflection('');
    setIsTyping(false);
    onTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="reflection" className="text-sm font-medium">
              이 작품에 대한 당신의 사유를 나누어주세요
            </Label>
            <div className={cn(
              "text-xs transition-colors",
              remainingChars < 50 ? "text-red-500" : "text-muted-foreground"
            )}>
              {remainingChars}자 남음
            </div>
          </div>
          
          <Textarea
            ref={textareaRef}
            id="reflection"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="작품을 보며 떠오르는 생각, 감정, 기억을 자유롭게 표현해보세요...\n\n예: \"이 작품의 색채가 어린 시절 할머니 집의 따뜻한 오후를 떠올리게 합니다. 그 시절의 평온함과 안전함이 그리워지네요.\""
            className={cn(
              "min-h-[120px] resize-none transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20",
              !isValid && reflection.length > 0 && "border-red-300 focus:border-red-400"
            )}
            disabled={disabled}
            maxLength={maxLength}
          />
          
          {reflection.length > 0 && reflection.length < minLength && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500"
            >
              최소 {minLength}자 이상 작성해주세요 (현재 {reflection.length}자)
            </motion.p>
          )}
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <Label htmlFor="anonymous" className="text-sm cursor-pointer">
              익명으로 공유하기
            </Label>
          </div>
          <Switch
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
            disabled={disabled}
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || disabled}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            사유 공유하기
            <span className="text-xs opacity-70">(Ctrl+Enter)</span>
          </Button>
        </div>

        {/* Help text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• 작품에 대한 개인적인 감상과 해석을 자유롭게 표현해주세요</p>
          <p>• 다른 참여자들의 다양한 관점을 존중해주세요</p>
          <p>• 익명 모드에서는 사용자명과 프로필이 숨겨집니다</p>
        </div>
      </CardContent>
    </Card>
  );
}