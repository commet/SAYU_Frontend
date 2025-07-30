'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Mic, 
  Send, 
  Heart, 
  Palette, 
  Eye,
  Sparkles,
  Clock,
  Music
} from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PersonalityType } from '@/types/sayu-shared';
import { InteractionPrompt, InteractionType } from '@/types/art-persona-matching';

interface ArtworkData {
  id: string;
  title: string;
  artist: string;
  image: string;
  year?: string;
  medium?: string;
  description?: string;
}

interface UserProfile {
  id: string;
  name: string;
  aptType: PersonalityType;
  avatar?: string;
}

interface ArtworkInteractionPromptsProps {
  artwork: ArtworkData;
  userProfile: UserProfile;
  targetProfile?: UserProfile;
  onSendInteraction?: (interaction: InteractionPrompt) => void;
}

// 작품 기반 프롬프트 템플릿
const ARTWORK_PROMPTS = [
  {
    id: 'first-impression',
    question: '이 작품을 처음 봤을 때 어떤 느낌이 들었나요?',
    icon: Eye,
    type: 'ARTWORK_COMMENT' as InteractionType
  },
  {
    id: 'hidden-meaning',
    question: '이 작품에서 숨겨진 의미를 발견했나요?',
    icon: Sparkles,
    type: 'INTERPRETATION' as InteractionType
  },
  {
    id: 'personal-connection',
    question: '이 작품이 당신의 어떤 기억을 떠올리게 하나요?',
    icon: Heart,
    type: 'ARTWORK_COMMENT' as InteractionType
  },
  {
    id: 'color-emotion',
    question: '이 작품의 색상이 전달하는 감정은 무엇인가요?',
    icon: Palette,
    type: 'INTERPRETATION' as InteractionType
  },
  {
    id: 'time-travel',
    question: '이 작품의 시대로 갈 수 있다면 작가에게 뭘 물어보고 싶나요?',
    icon: Clock,
    type: 'ARTWORK_COMMENT' as InteractionType
  },
  {
    id: 'soundtrack',
    question: '이 작품에 어울리는 음악이나 소리는 무엇일까요?',
    icon: Music,
    type: 'INTERPRETATION' as InteractionType
  }
];

export function ArtworkInteractionPrompts({
  artwork,
  userProfile,
  targetProfile,
  onSendInteraction
}: ArtworkInteractionPromptsProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<typeof ARTWORK_PROMPTS[0] | null>(null);
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  // 프롬프트 선택
  const handleSelectPrompt = (prompt: typeof ARTWORK_PROMPTS[0]) => {
    setSelectedPrompt(prompt);
    setResponse('');
  };

  // 응답 전송
  const handleSendResponse = () => {
    if (!selectedPrompt || !response.trim()) return;

    const interaction: InteractionPrompt = {
      id: `interaction-${Date.now()}`,
      type: selectedPrompt.type,
      prompt: selectedPrompt.question,
      targetUserId: targetProfile?.id,
      artworkId: artwork.id,
      metadata: {
        response,
        artworkTitle: artwork.title,
        artworkArtist: artwork.artist,
        promptId: selectedPrompt.id
      },
      createdAt: new Date()
    };

    onSendInteraction?.(interaction);
    setSelectedPrompt(null);
    setResponse('');
  };

  // 음성 녹음 토글
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // 실제 음성 녹음 로직은 여기에 구현
  };

  return (
    <div className="space-y-4">
      {/* 작품 미리보기 */}
      <Card className="p-4 glass-panel">
        <div className="flex gap-4">
          <div className="relative w-24 h-24">
            <OptimizedImage 
              src={artwork.image} 
              alt={artwork.title}
              fill
              className="object-cover rounded-lg"
              sizes="96px" placeholder="blur" quality={90}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{artwork.title}</h3>
            <p className="text-sm text-muted-foreground">{artwork.artist}</p>
            {artwork.year && (
              <p className="text-xs text-muted-foreground">{artwork.year}</p>
            )}
          </div>
        </div>
      </Card>

      {/* 프롬프트 선택 */}
      <AnimatePresence mode="wait">
        {!selectedPrompt ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-center">
              작품에 대한 생각을 공유해보세요
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {(showAllPrompts ? ARTWORK_PROMPTS : ARTWORK_PROMPTS.slice(0, 4)).map((prompt) => {
                const Icon = prompt.icon;
                return (
                  <motion.button
                    key={prompt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPrompt(prompt)}
                    className="p-3 rounded-lg border border-border hover:border-primary 
                             transition-colors text-left group glass-panel"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                      <p className="text-xs leading-relaxed">{prompt.question}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {!showAllPrompts && ARTWORK_PROMPTS.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllPrompts(true)}
                className="w-full"
              >
                더 많은 질문 보기
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {/* 선택된 프롬프트 */}
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-2">
                <selectedPrompt.icon className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-sm font-medium">{selectedPrompt.question}</p>
              </div>
            </Card>

            {/* 응답 입력 */}
            <div className="space-y-2">
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="당신의 생각을 들려주세요..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{response.length}/500</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleRecording}
                    className={cn(
                      "gap-1",
                      isRecording && "text-red-500 animate-pulse"
                    )}
                  >
                    <Mic className="w-4 h-4" />
                    {isRecording ? '녹음 중' : '음성 메모'}
                  </Button>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPrompt(null)}
                className="flex-1"
              >
                다른 질문 선택
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={!response.trim()}
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                보내기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 타겟 프로필 표시 (있을 경우) */}
      {targetProfile && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span>{targetProfile.name}님에게 전송됩니다</span>
        </div>
      )}
    </div>
  );
}