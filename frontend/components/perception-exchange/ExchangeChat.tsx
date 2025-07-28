'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Lightbulb, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { perceptionExchangeApi } from '@/lib/api/perception-exchange';
import { useToast } from '@/hooks/use-toast';
import { PHASE_INFO } from '@sayu/shared';
import type { PerceptionExchangeSession, PerceptionMessage } from '@sayu/shared';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ExchangeChatProps {
  sessionId: string;
}

export function ExchangeChat({ sessionId }: ExchangeChatProps) {
  const [session, setSession] = useState<PerceptionExchangeSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    // 새 메시지가 있을 때 스크롤
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages]);

  const loadSession = async () => {
    try {
      const data = await perceptionExchangeApi.getSession(sessionId);
      if (data) {
        setSession(data);
        
        // 읽지 않은 메시지 읽음 처리
        data.messages?.forEach(msg => {
          if (!msg.sender_info?.is_me && !msg.read_at) {
            perceptionExchangeApi.markMessageAsRead(msg.id);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      toast({
        title: '대화를 불러올 수 없습니다',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || trimmedMessage.length < 50 || !session) return;

    setIsSending(true);
    try {
      const message = await perceptionExchangeApi.sendMessage(
        sessionId,
        trimmedMessage
      );

      // 로컬 상태 업데이트
      setSession({
        ...session,
        messages: [...(session.messages || []), {
          ...message,
          sender_info: { is_me: true }
        }]
      });

      setNewMessage('');

      // 다음 단계로 진행 가능한지 확인
      checkPhaseAdvance();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: '메시지 전송에 실패했습니다',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const checkPhaseAdvance = async () => {
    if (!session) return;

    // 현재 단계에서 양측 모두 메시지를 보냈는지 확인
    const currentPhaseMessages = session.messages?.filter(
      msg => msg.phase === session.current_phase
    ) || [];

    const senderIds = new Set(currentPhaseMessages.map(msg => msg.sender_id));
    
    if (senderIds.size >= 2 && session.current_phase < 4) {
      // 다음 단계로 진행 제안
      setTimeout(() => {
        toast({
          title: '다음 단계로 진행할 수 있습니다',
          description: PHASE_INFO[session.current_phase + 1 as 2 | 3 | 4].description,
          action: (
            <Button
              size="sm"
              onClick={handlePhaseAdvance}
            >
              진행하기
            </Button>
          )
        });
      }, 1000);
    }
  };

  const handlePhaseAdvance = async () => {
    try {
      const advanced = await perceptionExchangeApi.requestPhaseAdvance(sessionId);
      if (advanced) {
        toast({
          title: '다음 단계로 진행했습니다',
          description: '더 깊은 대화를 나눠보세요'
        });
        loadSession(); // 세션 정보 새로고침
      }
    } catch (error) {
      console.error('Failed to advance phase:', error);
    }
  };

  const handleReaction = async (messageId: string, reaction: 'resonate' | 'thoughtful' | 'inspiring') => {
    try {
      await perceptionExchangeApi.addReaction(messageId, reaction);
      
      // 로컬 상태 업데이트
      if (session) {
        setSession({
          ...session,
          messages: session.messages?.map(msg =>
            msg.id === messageId ? { ...msg, reaction } : msg
          ) || []
        });
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  if (isLoading) {
    return <ExchangeChatSkeleton />;
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            대화를 찾을 수 없습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  const wordCount = newMessage.trim().split(/\s+/).filter(Boolean).length;
  const phaseInfo = PHASE_INFO[session.current_phase];

  return (
    <Card className="h-[600px] flex flex-col">
      {/* 헤더 */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session.current_phase >= 3 ? (
              <Avatar>
                <AvatarImage src={session.partner?.profile_image_url} />
                <AvatarFallback>
                  {session.partner?.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">
                {session.current_phase >= 2 
                  ? session.partner?.username 
                  : '익명의 감상자'}
              </CardTitle>
              {session.current_phase >= 3 && session.partner?.apt_type && (
                <p className="text-sm text-muted-foreground">
                  {session.partner.apt_type}
                </p>
              )}
            </div>
          </div>
          
          {/* 현재 단계 */}
          <Badge variant="outline">
            {phaseInfo.title}
          </Badge>
        </div>
      </CardHeader>

      {/* 메시지 영역 */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {/* 작품 정보 */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              "{session.artwork_data.title}"에 대한 감상 교환
            </p>
          </div>

          {/* 메시지 목록 */}
          {session.messages?.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentPhase={session.current_phase}
              onReaction={(reaction) => handleReaction(message.id, reaction)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* 입력 영역 */}
      {session.status === 'active' && (
        <div className="border-t p-4 space-y-3">
          {/* 단계 진행 알림 */}
          {session.current_phase < 4 && (
            <Alert className="py-2">
              <AlertDescription className="text-sm">
                <strong>단계 {session.current_phase}/4:</strong> {phaseInfo.description}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`이 작품에 대한 ${session.current_phase === 1 ? '순수한 ' : ''}감상을 나눠주세요... (최소 50자)`}
              rows={3}
              className="resize-none"
              disabled={isSending}
            />
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm",
                wordCount < 50 ? "text-destructive" : "text-muted-foreground"
              )}>
                {wordCount}자 / 최소 50자
              </span>
              <Button
                onClick={handleSend}
                disabled={isSending || wordCount < 50}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                전송
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// 메시지 버블 컴포넌트
function MessageBubble({
  message,
  currentPhase,
  onReaction
}: {
  message: PerceptionMessage;
  currentPhase: number;
  onReaction: (reaction: 'resonate' | 'thoughtful' | 'inspiring') => void;
}) {
  const isMe = message.sender_info?.is_me;

  return (
    <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] space-y-2",
        isMe ? "items-end" : "items-start"
      )}>
        {/* 발신자 정보 (상대방 메시지만) */}
        {!isMe && currentPhase >= 2 && message.sender_info?.nickname && (
          <p className="text-xs text-muted-foreground px-1">
            {message.sender_info.nickname}
          </p>
        )}

        {/* 메시지 버블 */}
        <div className={cn(
          "rounded-lg px-4 py-3",
          isMe 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {/* 감정 태그 */}
          {message.emotion_tags && message.emotion_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.emotion_tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant={isMe ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 시간 & 반응 */}
        <div className={cn(
          "flex items-center gap-2 px-1",
          isMe ? "justify-end" : "justify-start"
        )}>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.sent_at), 'HH:mm', { locale: ko })}
          </span>
          
          {/* 반응 버튼 (상대방 메시지만) */}
          {!isMe && !message.reaction && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onReaction('resonate')}
              >
                <Heart className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onReaction('thoughtful')}
              >
                <Lightbulb className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onReaction('inspiring')}
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* 반응 표시 */}
          {message.reaction && (
            <Badge variant="outline" className="text-xs">
              {message.reaction === 'resonate' && <Heart className="h-3 w-3 mr-1" />}
              {message.reaction === 'thoughtful' && <Lightbulb className="h-3 w-3 mr-1" />}
              {message.reaction === 'inspiring' && <Sparkles className="h-3 w-3 mr-1" />}
              {message.reaction}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function ExchangeChatSkeleton() {
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardHeader>
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <Skeleton className="h-16 w-48" />
          <Skeleton className="h-16 w-64 ml-auto" />
          <Skeleton className="h-16 w-56" />
        </div>
      </div>
    </Card>
  );
}