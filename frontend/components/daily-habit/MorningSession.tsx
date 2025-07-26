'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sun, Palette, Send } from 'lucide-react';
import { dailyHabitApi } from '@/lib/api/daily-habit';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface MorningSessionProps {
  onClose: () => void;
  onComplete: () => void;
}

const colors = [
  { name: '활기찬 주황', value: '#FF6B35', emotion: 'energetic' },
  { name: '평온한 파랑', value: '#4ECDC4', emotion: 'calm' },
  { name: '희망찬 노랑', value: '#FFD93D', emotion: 'hopeful' },
  { name: '신비로운 보라', value: '#9B59B6', emotion: 'mysterious' },
  { name: '생동감 있는 초록', value: '#2ECC71', emotion: 'vibrant' },
  { name: '따뜻한 분홍', value: '#FF6B9D', emotion: 'warm' },
  { name: '차분한 회색', value: '#95A5A6', emotion: 'neutral' },
  { name: '강렬한 빨강', value: '#E74C3C', emotion: 'passionate' }
];

export default function MorningSession({ onClose, onComplete }: MorningSessionProps) {
  const [loading, setLoading] = useState(true);
  const [artwork, setArtwork] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, []);

  const loadRecommendation = async () => {
    try {
      setLoading(true);
      const data = await dailyHabitApi.getRecommendation('morning');
      setArtwork(data.artwork);
      setQuestion(data.question);
    } catch (error) {
      console.error('Failed to load recommendation:', error);
      toast.error('작품을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedColor || !response.trim()) {
      toast.error('색상을 선택하고 답변을 작성해주세요');
      return;
    }

    try {
      setSubmitting(true);
      await dailyHabitApi.recordMorning({
        artworkId: artwork.id,
        question,
        response,
        color: selectedColor
      });
      onComplete();
    } catch (error) {
      console.error('Failed to record morning activity:', error);
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
              <div className="p-2 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">출근길 3분</h2>
                <p className="text-gray-600">하루를 시작하는 예술</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
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

              {/* Question */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-orange-500" />
                  오늘의 질문
                </h3>
                <p className="text-gray-700">{question}</p>
              </Card>

              {/* Color Selection */}
              <div>
                <h4 className="font-medium mb-3">오늘 하루를 시작하는 색을 선택해주세요</h4>
                <div className="grid grid-cols-4 gap-3">
                  {colors.map((color) => (
                    <motion.button
                      key={color.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedColor(color.value)}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        selectedColor === color.value
                          ? 'border-gray-800 shadow-lg'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div
                        className="w-full h-16 rounded-md mb-2"
                        style={{ backgroundColor: color.value }}
                      />
                      <p className="text-sm font-medium">{color.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Response */}
              <div>
                <h4 className="font-medium mb-2">작품을 보며 떠오른 생각을 자유롭게 적어주세요</h4>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="이 작품이 나의 하루를 어떻게 물들일까요?"
                  className="min-h-[120px]"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedColor || !response.trim() || submitting}
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