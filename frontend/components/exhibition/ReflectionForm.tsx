'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Cloud, Sun, CloudRain, Tag, Camera, Mic, Save, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { reflectionsAPI, type CreateReflectionData } from '@/lib/reflections-api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';

interface ReflectionFormProps {
  exhibitionId?: string;
  exhibitionName: string;
  museumName?: string;
  onComplete?: () => void;
}

const emotions = [
  { id: 'inspired', icon: '✨', label: { ko: '영감받음', en: 'Inspired' } },
  { id: 'peaceful', icon: '🕊️', label: { ko: '평화로움', en: 'Peaceful' } },
  { id: 'thoughtful', icon: '🤔', label: { ko: '사색적', en: 'Thoughtful' } },
  { id: 'joyful', icon: '😊', label: { ko: '기쁨', en: 'Joyful' } },
  { id: 'moved', icon: '🥺', label: { ko: '감동', en: 'Moved' } },
  { id: 'curious', icon: '🔍', label: { ko: '호기심', en: 'Curious' } }
];

const weatherOptions = [
  { id: 'sunny', icon: <Sun className="w-5 h-5" />, label: { ko: '맑음', en: 'Sunny' } },
  { id: 'cloudy', icon: <Cloud className="w-5 h-5" />, label: { ko: '흐림', en: 'Cloudy' } },
  { id: 'rainy', icon: <CloudRain className="w-5 h-5" />, label: { ko: '비', en: 'Rainy' } }
];

const popularTags = ['현대미술', '추상화', '인상주의', '조각', '사진전', '미디어아트', '설치미술'];

export default function ReflectionForm({ 
  exhibitionId, 
  exhibitionName, 
  museumName,
  onComplete 
}: ReflectionFormProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [emotion, setEmotion] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [favoriteArtwork, setFavoriteArtwork] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [visitDuration, setVisitDuration] = useState(60);
  const [weather, setWeather] = useState('');
  const [moodBefore, setMoodBefore] = useState('');
  const [moodAfter, setMoodAfter] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [voiceNoteBlob, setVoiceNoteBlob] = useState<Blob | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exhibitionName) {
      toast.error(language === 'ko' ? '전시 이름이 필요합니다' : 'Exhibition name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateReflectionData = {
        exhibition_id: exhibitionId,
        exhibition_name: exhibitionName,
        museum_name: museumName,
        overall_rating: rating || undefined,
        emotion: emotion || undefined,
        reflection_text: reflectionText || undefined,
        favorite_artwork: favoriteArtwork || undefined,
        key_takeaway: keyTakeaway || undefined,
        companion_name: companionName || undefined,
        visit_duration: visitDuration,
        weather: weather || undefined,
        mood_before: moodBefore || undefined,
        mood_after: moodAfter || undefined,
        tags: tags.length > 0 ? tags : undefined,
        is_public: isPublic
      };

      const reflection = await reflectionsAPI.createReflection(data);
      
      // Upload voice note if exists
      if (voiceNoteBlob && reflection.id) {
        try {
          await reflectionsAPI.uploadVoiceNote(reflection.id, voiceNoteBlob);
          toast.success(language === 'ko' ? '음성 메모가 포함된 성찰이 저장되었습니다!' : 'Reflection with voice note saved!');
        } catch (voiceError) {
          console.error('Error uploading voice note:', voiceError);
          toast.error(language === 'ko' ? '음성 메모 업로드 실패 (성찰은 저장됨)' : 'Failed to upload voice note (reflection saved)');
        }
      } else {
        toast.success(language === 'ko' ? '성찰이 저장되었습니다!' : 'Reflection saved!');
      }
      
      if (onComplete) {
        onComplete();
      } else {
        router.push('/profile?tab=reflections');
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error(language === 'ko' ? '저장 중 오류가 발생했습니다' : 'Error saving reflection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      addTag(customTag.trim());
      setCustomTag('');
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">
            {language === 'ko' ? '전시 관람 성찰' : 'Exhibition Reflection'}
          </h2>
          <p className="text-muted-foreground">
            {exhibitionName} {museumName && `@ ${museumName}`}
          </p>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === 'ko' ? '전체 평점' : 'Overall Rating'}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="transition-all"
              >
                <Star
                  className={`w-8 h-8 ${
                    value <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Emotion */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === 'ko' ? '관람 후 감정' : 'How did you feel?'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {emotions.map((em) => (
              <button
                key={em.id}
                type="button"
                onClick={() => setEmotion(em.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  emotion === em.id
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{em.icon}</div>
                <div className="text-sm">{em.label[language]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === 'ko' ? '관람 소감' : 'Your Thoughts'}
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder={language === 'ko' 
              ? '어떤 작품이 가장 인상적이었나요? 무엇을 느끼셨나요?' 
              : 'What impressed you most? How did the exhibition make you feel?'
            }
            className="w-full p-3 border rounded-lg resize-none h-32"
          />
        </div>

        {/* Favorite Artwork */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === 'ko' ? '가장 인상 깊었던 작품' : 'Favorite Artwork'}
          </label>
          <input
            type="text"
            value={favoriteArtwork}
            onChange={(e) => setFavoriteArtwork(e.target.value)}
            placeholder={language === 'ko' ? '작품명 또는 작가명' : 'Artwork or artist name'}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Key Takeaway */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === 'ko' ? '핵심 메시지' : 'Key Takeaway'}
          </label>
          <input
            type="text"
            value={keyTakeaway}
            onChange={(e) => setKeyTakeaway(e.target.value)}
            placeholder={language === 'ko' 
              ? '한 문장으로 요약한다면?' 
              : 'Summarize in one sentence'
            }
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Additional Details */}
        <details className="space-y-4">
          <summary className="cursor-pointer font-medium text-sm">
            {language === 'ko' ? '추가 정보 (선택)' : 'Additional Details (Optional)'}
          </summary>
          
          <div className="space-y-4 pt-4">
            {/* Companion */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'ko' ? '동행자' : 'Companion'}
              </label>
              <input
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                placeholder={language === 'ko' ? '누구와 함께 관람하셨나요?' : 'Who did you visit with?'}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Visit Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'ko' ? `관람 시간: ${visitDuration}분` : `Visit Duration: ${visitDuration} min`}
              </label>
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={visitDuration}
                onChange={(e) => setVisitDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Weather */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'ko' ? '날씨' : 'Weather'}
              </label>
              <div className="flex gap-2">
                {weatherOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setWeather(option.id)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      weather === option.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Before/After */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'ko' ? '관람 전 기분' : 'Mood Before'}
                </label>
                <input
                  type="text"
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(e.target.value)}
                  placeholder={language === 'ko' ? '한 단어로' : 'One word'}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'ko' ? '관람 후 기분' : 'Mood After'}
                </label>
                <input
                  type="text"
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(e.target.value)}
                  placeholder={language === 'ko' ? '한 단어로' : 'One word'}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </details>

        {/* Voice Note */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mic className="w-4 h-4" />
            {language === 'ko' ? '음성 메모' : 'Voice Note'}
          </label>
          <p className="text-sm text-muted-foreground">
            {language === 'ko' 
              ? '전시 관람 소감을 음성으로 남겨보세요 (최대 3분)'
              : 'Record your thoughts about the exhibition (max 3 minutes)'
            }
          </p>
          <VoiceRecorder 
            onRecordingComplete={(blob) => setVoiceNoteBlob(blob)}
            maxDuration={180}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {language === 'ko' ? '태그' : 'Tags'}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                disabled={tags.includes(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  tags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={handleCustomTag}
            placeholder={language === 'ko' ? '태그 추가 (Enter)' : 'Add tag (Enter)'}
            className="w-full p-2 border rounded-lg text-sm"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-primary/60 hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="is-public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="is-public" className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4" />
            {language === 'ko' 
              ? '다른 사용자와 성찰 공유하기' 
              : 'Share reflection with other users'
            }
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              {language === 'ko' ? '저장 중...' : 'Saving...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              {language === 'ko' ? '성찰 저장하기' : 'Save Reflection'}
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}