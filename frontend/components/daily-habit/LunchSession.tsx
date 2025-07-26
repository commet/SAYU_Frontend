'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Coffee, Heart, Send } from 'lucide-react';
import { dailyHabitApi } from '@/lib/api/daily-habit';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface LunchSessionProps {
  onClose: () => void;
  onComplete: () => void;
}

const emotions = [
  { value: 'joyful', label: '기쁨', emoji: '😊', color: '#FFD93D' },
  { value: 'peaceful', label: '평온', emoji: '😌', color: '#4ECDC4' },
  { value: 'excited', label: '설렘', emoji: '🤗', color: '#FF6B9D' },
  { value: 'grateful', label: '감사', emoji: '🙏', color: '#C7E9B4' },
  { value: 'thoughtful', label: '사색', emoji: '🤔', color: '#9B59B6' },
  { value: 'tired', label: '피곤', emoji: '😔', color: '#95A5A6' },
  { value: 'anxious', label: '불안', emoji: '😟', color: '#E74C3C' },
  { value: 'neutral', label: '보통', emoji: '😐', color: '#BDC3C7' }
];

export default function LunchSession({ onClose, onComplete }: LunchSessionProps) {
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedEmotion) {
      loadArtworkOptions();
    }
  }, [selectedEmotion]);

  const loadArtworkOptions = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch artworks based on the emotion
      const data = await dailyHabitApi.getRecommendation('lunch');
      // For now, we'll show the same artwork recommendation
      setArtworks([data.artwork]);
    } catch (error) {
      console.error('Failed to load artworks:', error);
      toast.error('작품을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmotion || !selectedArtwork || !reason.trim()) {
      toast.error('모든 항목을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      await dailyHabitApi.recordLunch({
        emotion: selectedEmotion,
        artworkId: selectedArtwork.id,
        reason
      });
      onComplete();
    } catch (error) {
      console.error('Failed to record lunch activity:', error);
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
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">점심시간 5분</h2>
                <p className="text-gray-600">감정 체크인</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Emotion Selection */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-500" />
              지금 이 순간, 어떤 감정을 느끼고 계신가요?
            </h3>
            <RadioGroup value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {emotions.map((emotion) => (
                  <motion.div
                    key={emotion.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Label
                      htmlFor={emotion.value}
                      className={`
                        flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedEmotion === emotion.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-400'
                        }
                      `}
                    >
                      <RadioGroupItem value={emotion.value} id={emotion.value} className="sr-only" />
                      <span className="text-2xl">{emotion.emoji}</span>
                      <span className="font-medium">{emotion.label}</span>
                    </Label>
                  </motion.div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Artwork Selection */}
          {selectedEmotion && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  이 감정과 어울리는 작품을 선택해주세요
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {artworks.map((artwork) => (
                      <motion.div
                        key={artwork.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`overflow-hidden cursor-pointer transition-all ${
                            selectedArtwork?.id === artwork.id
                              ? 'ring-2 ring-blue-500'
                              : 'hover:shadow-lg'
                          }`}
                          onClick={() => setSelectedArtwork(artwork)}
                        >
                          <div className="relative h-48 bg-gray-100">
                            {artwork.primary_image_url ? (
                              <Image
                                src={artwork.primary_image_url}
                                alt={artwork.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                이미지가 없습니다
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium line-clamp-1">{artwork.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {artwork.artist_display_name || '작가 미상'}
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reason */}
              {selectedArtwork && (
                <div>
                  <h4 className="font-medium mb-2">
                    왜 이 작품이 지금의 감정과 어울린다고 생각하시나요?
                  </h4>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="색감, 분위기, 주제 등 어떤 점이 마음에 와닿았는지 자유롭게 적어주세요"
                    className="min-h-[100px]"
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedEmotion || !selectedArtwork || !reason.trim() || submitting}
                className="w-full gap-2"
                size="lg"
              >
                <Send className="w-4 h-4" />
                {submitting ? '저장 중...' : '기록하기'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}