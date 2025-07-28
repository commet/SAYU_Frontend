'use client';

import React, { useState, useActionState, useOptimistic } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Users } from 'lucide-react';
import type { ArtPulseSession, EmotionType } from '../../../shared';

interface OptimizedArtPulseProps {
  session: ArtPulseSession;
  onEmotionSubmit: (emotion: EmotionType) => Promise<void>;
  onReflectionSubmit: (reflection: string) => Promise<void>;
}

interface OptimisticReflection {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  likes: number;
  isPending?: boolean;
}

// Server Action for emotion submission
async function submitEmotionAction(emotion: EmotionType) {
  // 실제 구현에서는 서버로 전송
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, emotion };
}

// Server Action for reflection submission
async function submitReflectionAction(text: string) {
  // 실제 구현에서는 서버로 전송
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id: Date.now().toString(),
    text,
    author: '익명',
    timestamp: new Date(),
    likes: 0
  };
}

export function OptimizedArtPulse({ 
  session, 
  onEmotionSubmit, 
  onReflectionSubmit 
}: OptimizedArtPulseProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [reflections, setReflections] = useState<OptimisticReflection[]>([]);
  
  // useActionState로 서버 액션 상태 관리
  const [emotionState, submitEmotion] = useActionState(
    async (prevState: any, emotion: EmotionType) => {
      try {
        const result = await submitEmotionAction(emotion);
        setSelectedEmotion(emotion);
        return { ...result, error: null };
      } catch (error) {
        return { success: false, error: 'Failed to submit emotion' };
      }
    },
    { success: false, error: null }
  );

  // useOptimistic으로 낙관적 업데이트
  const [optimisticReflections, addOptimisticReflection] = useOptimistic(
    reflections,
    (state, newReflection: string) => [
      ...state,
      {
        id: `temp-${Date.now()}`,
        text: newReflection,
        author: '나',
        timestamp: new Date(),
        likes: 0,
        isPending: true
      }
    ]
  );

  const handleReflectionSubmit = async (text: string) => {
    // 낙관적 업데이트
    addOptimisticReflection(text);
    
    try {
      const newReflection = await submitReflectionAction(text);
      setReflections(prev => [...prev, newReflection]);
    } catch (error) {
      console.error('Failed to submit reflection:', error);
      // 에러 처리 - 낙관적 업데이트 롤백
    }
  };

  const emotions: EmotionType[] = ['joy', 'contemplation', 'wonder', 'melancholy', 'inspiration'];

  return (
    <div className="space-y-6">
      {/* 세션 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Art Pulse Live
            </CardTitle>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <Badge variant="secondary">{session.participantCount}명 참여</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 작품 이미지 */}
          <div className="mb-6">
            <img
              src={session.artwork.image_url}
              alt={session.artwork.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="mt-3">
              <h3 className="font-semibold text-lg">{session.artwork.title}</h3>
              <p className="text-muted-foreground">{session.artwork.artist}</p>
            </div>
          </div>

          {/* 감정 선택 */}
          {session.phase === 'contemplation' && (
            <div className="space-y-4">
              <h4 className="font-medium">실시간으로 감정을 공유하세요</h4>
              <div className="flex flex-wrap gap-2">
                {emotions.map((emotion) => (
                  <form key={emotion} action={submitEmotion.bind(null, emotion)}>
                    <Button
                      type="submit"
                      variant={selectedEmotion === emotion ? "default" : "outline"}
                      size="sm"
                      disabled={emotionState.success && selectedEmotion === emotion}
                    >
                      {emotion}
                    </Button>
                  </form>
                ))}
              </div>
              
              {emotionState.error && (
                <p className="text-sm text-red-500">{emotionState.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 사유 공유 */}
      {session.phase === 'sharing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              실시간 사유
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ReflectionInput onSubmit={handleReflectionSubmit} />
            
            <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
              {optimisticReflections.map((reflection) => (
                <div 
                  key={reflection.id} 
                  className={`p-4 rounded-lg border ${
                    reflection.isPending 
                      ? 'opacity-60 bg-muted/50' 
                      : 'bg-background'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm">{reflection.text}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{reflection.author}</span>
                        <span>•</span>
                        <span>{reflection.timestamp.toLocaleTimeString()}</span>
                        {reflection.isPending && (
                          <>
                            <span>•</span>
                            <span className="text-blue-500">전송 중...</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                      <span className="ml-1">{reflection.likes}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 사유 입력 컴포넌트
function ReflectionInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="이 작품을 보며 떠오르는 생각을 자유롭게 적어보세요..."
        className="w-full p-3 border rounded-lg resize-none h-24"
        maxLength={200}
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {text.length}/200
        </span>
        <Button type="submit" disabled={!text.trim()}>
          공유하기
        </Button>
      </div>
    </form>
  );
}