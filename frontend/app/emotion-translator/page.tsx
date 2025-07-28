'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmotionTranslator from '@/components/emotion/EmotionTranslator';
import { EmotionInput, ArtworkMatch } from '@sayu/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, RefreshCw, Heart, Info, Loader2 } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

// 번역 상태
type TranslationState = 'input' | 'processing' | 'result';

export default function EmotionTranslatorPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [state, setState] = useState<TranslationState>('input');
  const [emotionInput, setEmotionInput] = useState<EmotionInput | null>(null);
  const [artworkMatches, setArtworkMatches] = useState<ArtworkMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  
  // 감정 입력 완료 처리
  const handleTranslationComplete = async (input: EmotionInput) => {
    setEmotionInput(input);
    setState('processing');
    
    try {
      // 백엔드 API 호출
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emotion/translate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ emotionInput: input })
      });
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // API 응답을 프론트엔드 타입에 맞게 변환
        const matches: ArtworkMatch[] = result.data.matches.map((match: any) => ({
          artwork: match.artwork,
          matching: match.matching,
          emotionalJourney: match.emotionalJourney
        }));
        
        setArtworkMatches(matches);
      } else {
        throw new Error(result.message || 'Translation failed');
      }
      setState('result');
      
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(language === 'ko' 
        ? '감정 번역 중 오류가 발생했습니다' 
        : 'Error translating emotion');
      setState('input');
    }
  };
  
  // 다시 시작
  const handleRestart = () => {
    setState('input');
    setEmotionInput(null);
    setArtworkMatches([]);
    setSelectedMatch(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 헤더 */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  {language === 'ko' ? '감정의 번역가' : 'Emotion Translator'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' 
                    ? '당신의 감정을 예술로 번역해드립니다'
                    : 'Translating your emotions into art'}
                </p>
              </div>
            </div>
            
            {state === 'result' && (
              <Button
                variant="outline"
                onClick={handleRestart}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {language === 'ko' ? '다시 시작' : 'Start Over'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* 입력 단계 */}
          {state === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmotionTranslator onTranslationComplete={handleTranslationComplete} />
            </motion.div>
          )}
          
          {/* 처리 중 */}
          {state === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {language === 'ko' 
                      ? '감정을 번역하고 있습니다...'
                      : 'Translating your emotion...'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {language === 'ko'
                      ? 'AI가 당신의 감정을 분석하고 가장 공명하는 예술 작품을 찾고 있습니다'
                      : 'AI is analyzing your emotion and finding artworks that resonate with it'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 결과 */}
          {state === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* 번역 결과 헤더 */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                >
                  <Sparkles className="w-10 h-10 text-primary" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">
                    {language === 'ko' 
                      ? '감정 번역이 완료되었습니다'
                      : 'Emotion Translation Complete'}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'ko'
                      ? '당신의 감정과 공명하는 작품들을 찾았습니다'
                      : 'We found artworks that resonate with your emotion'}
                  </p>
                </div>
              </div>
              
              {/* 작품 매칭 결과 */}
              <div className="space-y-6">
                {artworkMatches.map((match, index) => (
                  <motion.div
                    key={match.artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card 
                      className={`p-6 cursor-pointer transition-all ${
                        selectedMatch === match.artwork.id 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedMatch(match.artwork.id)}
                    >
                      <div className="grid md:grid-cols-[300px_1fr] gap-6">
                        {/* 작품 이미지 */}
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-muted-foreground" />
                          </div>
                        </div>
                        
                        {/* 매칭 정보 */}
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{match.artwork.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {match.artwork.artist} • {match.artwork.year}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {match.artwork.style} • {match.artwork.medium}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {language === 'ko' ? '공명도' : 'Resonance'}
                                </span>
                                <span className="text-2xl font-bold text-primary">
                                  {Math.round(match.matching.score * 100)}%
                                </span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                match.matching.type === 'direct' 
                                  ? 'bg-green-100 text-green-700'
                                  : match.matching.type === 'metaphorical'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {match.matching.type === 'direct' && (language === 'ko' ? '직접적' : 'Direct')}
                                {match.matching.type === 'metaphorical' && (language === 'ko' ? '은유적' : 'Metaphorical')}
                                {match.matching.type === 'complementary' && (language === 'ko' ? '보완적' : 'Complementary')}
                              </span>
                            </div>
                          </div>
                          
                          {/* AI 설명 */}
                          <div className="space-y-3">
                            <p className="text-sm">{match.matching.reasoning}</p>
                            
                            {/* 연결점들 */}
                            <div className="space-y-2">
                              {match.matching.connections.map((connection, idx) => (
                                <div key={idx} className="flex gap-2 text-sm">
                                  <span className="font-medium text-primary">
                                    {connection.aspect}:
                                  </span>
                                  <span className="text-muted-foreground">
                                    {connection.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            {/* 감정 여정 */}
                            {match.emotionalJourney && (
                              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span>{match.emotionalJourney.from}</span>
                                  <span>→</span>
                                  <span>{match.emotionalJourney.through}</span>
                                  <span>→</span>
                                  <span className="text-foreground font-medium">
                                    {match.emotionalJourney.to}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* 액션 버튼 */}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Heart className="w-4 h-4" />
                              {language === 'ko' ? '저장' : 'Save'}
                            </Button>
                            <Button variant="outline" size="sm">
                              {language === 'ko' ? '작품 자세히 보기' : 'View Artwork'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              {/* 추가 정보 */}
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {language === 'ko'
                        ? '이 번역은 AI가 당신의 감정 표현을 분석하여 생성한 것입니다. 같은 감정도 시간과 상황에 따라 다르게 번역될 수 있습니다.'
                        : 'This translation is generated by AI analyzing your emotional expression. The same emotion can be translated differently depending on time and context.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}