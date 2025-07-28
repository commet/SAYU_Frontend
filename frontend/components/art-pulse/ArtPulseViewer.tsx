'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArtPulseSession, 
  EmotionType, 
  EMOTION_CONFIGS, 
  EmotionDistribution,
  ArtPulseReflection,
  TypingIndicator,
  ArtPulseSocketEvents
} from '../../../shared';
import { EmotionBubbleCanvas } from './EmotionBubbleCanvas';
import { ReflectionFeed } from './ReflectionFeed';
import { EmotionSelector } from './EmotionSelector';
import { ReflectionInput } from './ReflectionInput';
import { ParticipantCounter } from './ParticipantCounter';
import { PhaseIndicator } from './PhaseIndicator';
import { SessionResults } from './SessionResults';
import { Clock, Users, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtPulseViewerProps {
  className?: string;
}

export function ArtPulseViewer({ className }: ArtPulseViewerProps) {
  // State
  const [session, setSession] = useState<ArtPulseSession | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emotions, setEmotions] = useState<EmotionDistribution>({});
  const [reflections, setReflections] = useState<ArtPulseReflection[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);

  // Hooks
  const { user } = useAuth();
  const socket = useSocket();
  
  // Refs
  const emotionCanvasRef = useRef<HTMLDivElement>(null);
  const reflectionFeedRef = useRef<HTMLDivElement>(null);

  // Get current session on mount
  useEffect(() => {
    const getCurrentSession = async () => {
      try {
        const response = await fetch('/api/art-pulse/current', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSession(data.data.session);
          setEmotions(data.data.emotions || {});
          setReflections(data.data.reflections || []);
          setParticipantCount(data.data.participantCount || 0);
        }
      } catch (error) {
        console.error('Failed to get current session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.token) {
      getCurrentSession();
    }
  }, [user?.token]);

  // Calculate time remaining
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(session.endTime).getTime();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setShowResults(true);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Socket event handlers
  const handleSocketEvents = useCallback(() => {
    if (!socket.isConnected()) return;

    // Session events
    socket.on('art_pulse_joined', (data: ArtPulseSocketEvents['art_pulse_joined']) => {
      setSession(data.session);
      setParticipantCount(data.participantCount);
      setIsJoined(true);
    });

    socket.on('art_pulse_state_update', (data: ArtPulseSocketEvents['art_pulse_state_update']) => {
      setEmotions(data.emotions);
      setReflections(data.reflections);
      setParticipantCount(data.participantCount);
    });

    socket.on('art_pulse_participant_joined', (data: ArtPulseSocketEvents['art_pulse_participant_joined']) => {
      setParticipantCount(data.participantCount);
    });

    socket.on('art_pulse_participant_left', (data: ArtPulseSocketEvents['art_pulse_participant_left']) => {
      // Update participant count would be handled by backend
    });

    // Emotion events
    socket.on('art_pulse_emotion_update', (data: ArtPulseSocketEvents['art_pulse_emotion_update']) => {
      setEmotions(data.distribution);
    });

    // Reflection events
    socket.on('art_pulse_new_reflection', (data: ArtPulseSocketEvents['art_pulse_new_reflection']) => {
      setReflections(prev => [data, ...prev]);
    });

    socket.on('art_pulse_reflection_liked', (data: ArtPulseSocketEvents['art_pulse_reflection_liked']) => {
      setReflections(prev => prev.map(reflection => 
        reflection.id === data.reflectionId 
          ? { ...reflection, likes: data.likes, likedBy: data.likedBy }
          : reflection
      ));
    });

    // Typing events
    socket.on('art_pulse_user_typing', (data: ArtPulseSocketEvents['art_pulse_user_typing']) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    // Phase change events
    socket.on('art_pulse_phase_change', (data: ArtPulseSocketEvents['art_pulse_phase_change']) => {
      setSession(prev => prev ? { ...prev, phase: data.phase } : null);
    });

    // Session end events
    socket.on('art_pulse_session_ended', (data: ArtPulseSocketEvents['art_pulse_session_ended']) => {
      setSession(prev => prev ? { ...prev, status: 'completed', results: data.results } : null);
      setShowResults(true);
    });

    // New session events
    socket.on('art_pulse_session_started', (data: ArtPulseSocketEvents['art_pulse_session_started']) => {
      setSession(data.session);
      setIsJoined(false);
      setShowResults(false);
      setEmotions({});
      setReflections([]);
      setParticipantCount(0);
    });

    socket.on('art_pulse_error', (data: ArtPulseSocketEvents['art_pulse_error']) => {
      console.error('Art Pulse error:', data.message);
      // You could show a toast notification here
    });

    return () => {
      socket.off('art_pulse_joined');
      socket.off('art_pulse_state_update');
      socket.off('art_pulse_participant_joined');
      socket.off('art_pulse_participant_left');
      socket.off('art_pulse_emotion_update');
      socket.off('art_pulse_new_reflection');
      socket.off('art_pulse_reflection_liked');
      socket.off('art_pulse_user_typing');
      socket.off('art_pulse_phase_change');
      socket.off('art_pulse_session_ended');
      socket.off('art_pulse_session_started');
      socket.off('art_pulse_error');
    };
  }, [socket]);

  // Setup socket events
  useEffect(() => {
    if (socket.isConnected()) {
      return handleSocketEvents();
    }
  }, [socket, handleSocketEvents]);

  // Join session
  const joinSession = useCallback(() => {
    if (!session || !socket.isConnected()) return;

    socket.joinArtPulse(session.id);
  }, [session, socket]);

  // Leave session
  const leaveSession = useCallback(() => {
    if (!socket.isConnected()) return;

    socket.leaveArtPulse();
    setIsJoined(false);
  }, [socket]);

  // Submit emotion
  const submitEmotion = useCallback((emotion: EmotionType, intensity: number = 1) => {
    if (!session || !socket.isConnected() || session.phase !== 'contemplation') return;

    socket.submitArtPulseEmotion(session.id, emotion, intensity);
    setSelectedEmotion(emotion);
  }, [session, socket]);

  // Submit reflection
  const submitReflection = useCallback((reflection: string, isAnonymous: boolean = false) => {
    if (!session || !socket.isConnected() || session.phase !== 'sharing') return;

    socket.submitArtPulseReflection(session.id, reflection, isAnonymous);
  }, [session, socket]);

  // Like reflection
  const likeReflection = useCallback((reflectionId: string) => {
    if (!session || !socket.isConnected()) return;

    socket.likeArtPulseReflection(session.id, reflectionId);
  }, [session, socket]);

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (!session) return 0;
    const totalDuration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
    const elapsed = totalDuration - timeRemaining;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="text-muted-foreground">Art Pulse 세션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={cn("text-center space-y-6 py-12", className)}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">현재 진행 중인 Art Pulse가 없습니다</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            매일 오후 7시에 새로운 Art Pulse 세션이 시작됩니다. 
            전국의 SAYU 사용자들과 함께 작품을 감상하고 마음을 나누어보세요.
          </p>
        </motion.div>
      </div>
    );
  }

  if (showResults && session.results) {
    return (
      <div className={className}>
        <SessionResults 
          session={session} 
          results={session.results}
          onClose={() => setShowResults(false)}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Art Pulse Live
            </CardTitle>
            <div className="flex items-center gap-4">
              <ParticipantCounter count={participantCount} />
              <PhaseIndicator phase={session.phase} />
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {session.phase === 'contemplation' && '감상 중'}
                {session.phase === 'sharing' && '사유 공유 중'}
                {session.phase === 'voting' && '투표 중'}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTimeRemaining(timeRemaining)}</span>
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Artwork Display */}
          <div className="relative">
            <motion.img
              src={session.artwork.image_url}
              alt={session.artwork.title}
              className="w-full h-64 md:h-96 object-contain rounded-lg bg-gray-50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="bg-black/70 text-white backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{session.artwork.title}</h3>
                  <p className="text-sm opacity-90">{session.artwork.artist}</p>
                  {session.artwork.year && (
                    <p className="text-xs opacity-75">{session.artwork.year}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Join Button */}
          {!isJoined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Button 
                onClick={joinSession} 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Heart className="w-4 h-4 mr-2" />
                Art Pulse 참여하기
              </Button>
            </motion.div>
          )}

          {/* Main Content */}
          {isJoined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Left Column: Emotions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    실시간 감정
                  </h4>
                  <Badge variant="secondary">
                    {Object.values(emotions).reduce((sum, e) => sum + e.count, 0)}명 참여
                  </Badge>
                </div>

                {/* Emotion Bubble Canvas */}
                <div ref={emotionCanvasRef} className="relative h-64 bg-gray-50 rounded-lg overflow-hidden">
                  <EmotionBubbleCanvas 
                    emotions={emotions}
                    container={emotionCanvasRef.current}
                  />
                </div>

                {/* Emotion Selector */}
                {session.phase === 'contemplation' && (
                  <EmotionSelector
                    selectedEmotion={selectedEmotion}
                    onEmotionSelect={submitEmotion}
                    disabled={false}
                  />
                )}
              </div>

              {/* Right Column: Reflections */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    실시간 사유
                  </h4>
                  <Badge variant="secondary">
                    {reflections.length}개 사유
                  </Badge>
                </div>

                {/* Reflection Input */}
                {session.phase === 'sharing' && (
                  <ReflectionInput
                    onSubmit={submitReflection}
                    onTyping={(isTyping) => {
                      if (socket.isConnected()) {
                        socket.artPulseTyping(session.id, isTyping);
                      }
                    }}
                    disabled={false}
                  />
                )}

                {/* Reflection Feed */}
                <div ref={reflectionFeedRef} className="h-96 overflow-y-auto">
                  <ReflectionFeed
                    reflections={reflections}
                    onLike={likeReflection}
                    typingUsers={typingUsers}
                    currentUserId={user?.id}
                    canVote={session.phase === 'voting'}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Leave Button */}
          {isJoined && (
            <div className="text-center">
              <Button onClick={leaveSession} variant="outline" size="sm">
                세션 나가기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}