'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArtPulseReflection, TypingIndicator } from '@/types/art-pulse';
import { Heart, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ReflectionFeedProps {
  reflections: ArtPulseReflection[];
  onLike: (reflectionId: string) => void;
  typingUsers: TypingIndicator[];
  currentUserId?: string;
  canVote?: boolean;
  className?: string;
}

export function ReflectionFeed({
  reflections,
  onLike,
  typingUsers,
  currentUserId,
  canVote = false,
  className
}: ReflectionFeedProps) {

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ko
      });
    } catch {
      return '방금 전';
    }
  };

  const getSayuTypeColor = (sayuType?: string) => {
    const colors: Record<string, string> = {
      'curious-fox': '#FF6B6B',
      'wise-owl': '#4ECDC4',
      'gentle-deer': '#95A5A6',
      'brave-lion': '#F39C12',
      'peaceful-dove': '#3498DB'
    };
    return colors[sayuType || ''] || '#6B7280';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Typing Indicators */}
      <AnimatePresence>
        {typingUsers.map((user) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{user.username}님이 입력 중...</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Reflections */}
      <AnimatePresence>
        {reflections.map((reflection, index) => (
          <motion.div
            key={reflection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {reflection.isAnonymous ? (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: getSayuTypeColor(reflection.sayuType) }}
                        >
                          {reflection.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {reflection.isAnonymous ? '익명' : reflection.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(reflection.timestamp)}
                        </span>
                      </div>
                    </div>

                    {!reflection.isAnonymous && reflection.sayuType && (
                      <Badge variant="outline" className="text-xs">
                        {reflection.sayuType}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="text-sm leading-relaxed">
                    {reflection.reflection}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLike(reflection.id)}
                      className={cn(
                        "text-muted-foreground hover:text-primary",
                        reflection.likedBy?.includes(currentUserId || '') && "text-primary"
                      )}
                    >
                      <Heart 
                        className={cn(
                          "w-4 h-4 mr-1",
                          reflection.likedBy?.includes(currentUserId || '') && "fill-current"
                        )} 
                      />
                      {reflection.likes || 0}
                    </Button>

                    {canVote && (
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          👍
                        </Button>
                        <Button variant="outline" size="sm">
                          ❤️
                        </Button>
                        <Button variant="outline" size="sm">
                          🤔
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Like animation */}
                <AnimatePresence>
                  {reflection.likedBy?.includes(currentUserId || '') && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-2 right-2"
                    >
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white fill-current" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {reflections.length === 0 && typingUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">아직 공유된 사유가 없습니다</p>
          <p className="text-xs mt-1">첫 번째로 당신의 생각을 나누어보세요</p>
        </motion.div>
      )}
    </div>
  );
}