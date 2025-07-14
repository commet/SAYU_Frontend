'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Clock, MapPin, Tag, Globe, Lock, Play, Pause, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import type { Reflection } from '@/lib/reflections-api';

interface ReflectionCardProps {
  reflection: Reflection;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function ReflectionCard({ 
  reflection, 
  onEdit, 
  onDelete,
  showActions = false 
}: ReflectionCardProps) {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: language === 'ko' ? ko : enUS });
  };

  const handlePlayVoiceNote = () => {
    if (!reflection.voice_note_url) return;

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const newAudio = new Audio(reflection.voice_note_url);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.play();
      setIsPlaying(true);
      setAudio(newAudio);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{reflection.exhibition_name}</h3>
          {reflection.museum_name && (
            <p className="text-sm text-muted-foreground">{reflection.museum_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {reflection.is_public ? (
            <Globe className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
          {reflection.overall_rating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm ml-1">{reflection.overall_rating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Date and Duration */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDate(reflection.visit_date)}
        </span>
        {reflection.visit_duration && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {reflection.visit_duration} {language === 'ko' ? '분' : 'min'}
          </span>
        )}
      </div>

      {/* Emotion */}
      {reflection.emotion && (
        <div className="mb-4">
          <span className="text-2xl">{getEmotionEmoji(reflection.emotion)}</span>
          <span className="ml-2 text-sm">{getEmotionLabel(reflection.emotion, language)}</span>
        </div>
      )}

      {/* Key Takeaway */}
      {reflection.key_takeaway && (
        <p className="text-lg font-medium mb-4 italic">"{reflection.key_takeaway}"</p>
      )}

      {/* Reflection Text */}
      {reflection.reflection_text && (
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {reflection.reflection_text}
        </p>
      )}

      {/* Voice Note */}
      {reflection.voice_note_url && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayVoiceNote}
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <Volume2 className="w-4 h-4" />
            {language === 'ko' ? '음성 메모' : 'Voice Note'}
          </Button>
        </div>
      )}

      {/* Tags */}
      {reflection.tags && reflection.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {reflection.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              {language === 'ko' ? '수정' : 'Edit'}
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive">
              {language === 'ko' ? '삭제' : 'Delete'}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

// Helper functions
function getEmotionEmoji(emotion: string): string {
  const emotions: Record<string, string> = {
    inspired: '✨',
    peaceful: '🕊️',
    thoughtful: '🤔',
    joyful: '😊',
    moved: '🥺',
    curious: '🔍'
  };
  return emotions[emotion] || '😊';
}

function getEmotionLabel(emotion: string, language: 'ko' | 'en'): string {
  const labels: Record<string, { ko: string; en: string }> = {
    inspired: { ko: '영감받음', en: 'Inspired' },
    peaceful: { ko: '평화로움', en: 'Peaceful' },
    thoughtful: { ko: '사색적', en: 'Thoughtful' },
    joyful: { ko: '기쁨', en: 'Joyful' },
    moved: { ko: '감동', en: 'Moved' },
    curious: { ko: '호기심', en: 'Curious' }
  };
  return labels[emotion]?.[language] || emotion;
}