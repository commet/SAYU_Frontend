'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Sparkles, Send, Plus } from 'lucide-react';
import { dailyHabitApi } from '@/lib/api/daily-habit';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface NightSessionProps {
  onClose: () => void;
  onComplete: () => void;
}

const suggestedTags = [
  '평온한', '행복한', '피곤한', '만족스러운', '아쉬운',
  '기대되는', '감사한', '벅찬', '차분한', '설레는',
  '뿌듯한', '도전적인', '편안한', '활기찬', '사색적인'
];

export default function NightSession({ onClose, onComplete }: NightSessionProps) {
  const [loading, setLoading] = useState(true);
  const [artwork, setArtwork] = useState<any>(null);
  const [reflection, setReflection] = useState('');
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, []);

  const loadRecommendation = async () => {
    try {
      setLoading(true);
      const data = await dailyHabitApi.getRecommendation('night');
      setArtwork(data.artwork);
    } catch (error) {
      console.error('Failed to load recommendation:', error);
      toast.error('작품을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (!moodTags.includes(tag) && moodTags.length < 5) {
      setMoodTags([...moodTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMoodTags(moodTags.filter(t => t !== tag));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !moodTags.includes(customTag) && moodTags.length < 5) {
      setMoodTags([...moodTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = async () => {
    if (!reflection.trim() || moodTags.length === 0) {
      toast.error('하루를 돌아본 내용과 감정 태그를 추가해주세요');
      return;
    }

    try {
      setSubmitting(true);
      await dailyHabitApi.recordNight({
        artworkId: artwork.id,
        reflection,
        moodTags
      });
      onComplete();
    } catch (error) {
      console.error('Failed to record night activity:', error);
      toast.error('기록 저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">잠들기 전 10분</h2>
                <p className="text-gray-600">하루 돌아보기</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
          ) : artwork && (
            <>
              {/* Artwork Display */}
              <Card className="overflow-hidden">
                <div className="relative h-96 bg-gray-100">
                  {artwork.primary_image_url ? (
                    <Image
                      src={artwork.primary_image_url}
                      alt={artwork.title}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      이미지가 없습니다
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{artwork.title}</h3>
                  <p className="text-gray-600">{artwork.artist_display_name || '작가 미상'}</p>
                  {artwork.creation_date && (
                    <p className="text-sm text-gray-500 mt-1">{artwork.creation_date}</p>
                  )}
                </div>
              </Card>

              {/* Reflection Prompt */}
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  오늘의 마무리
                </h3>
                <p className="text-gray-700">
                  이 작품을 보며 오늘 하루를 돌아보세요. 
                  오늘 하루를 한 작품으로 표현한다면?
                </p>
              </Card>

              {/* Reflection Text */}
              <div>
                <h4 className="font-medium mb-2">오늘 하루를 돌아보며</h4>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="오늘 하루 중 가장 기억에 남는 순간은 무엇이었나요? 이 작품과 오늘의 나는 어떤 점이 닮았나요?"
                  className="min-h-[150px]"
                />
              </div>

              {/* Mood Tags */}
              <div>
                <h4 className="font-medium mb-3">오늘 하루를 표현하는 감정 태그 (최대 5개)</h4>
                
                {/* Selected Tags */}
                {moodTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {moodTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="gap-1 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Suggested Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestedTags
                    .filter(tag => !moodTags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-50"
                        onClick={() => handleAddTag(tag)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                    placeholder="직접 입력하기"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddCustomTag}
                    disabled={!customTag.trim() || moodTags.length >= 5}
                  >
                    추가
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!reflection.trim() || moodTags.length === 0 || submitting}
                className="w-full gap-2"
                size="lg"
              >
                <Send className="w-4 h-4" />
                {submitting ? '저장 중...' : '오늘 하루 마무리하기'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}