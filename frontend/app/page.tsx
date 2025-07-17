'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Palette, 
  Eye,
  Zap,
  BookOpen,
  Play,
  Users,
  Bookmark,
  Camera,
  User,
  ChevronRight,
  Star,
  Quote,
  CheckCircle,
  Footprints
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // 미니 퀴즈 데이터
  const quizQuestions = [
    {
      id: 1,
      question: language === 'ko' ? '미술관에서 가장 먼저 향하는 곳은?' : 'Where do you head first in a museum?',
      options: [
        { 
          id: 'A', 
          text: language === 'ko' ? '고요한 단색화 전시실' : 'Quiet monochrome gallery',
          icon: '🎭'
        },
        { 
          id: 'B', 
          text: language === 'ko' ? '화려한 팝아트 코너' : 'Vibrant pop art corner',
          icon: '🎨'
        },
        { 
          id: 'C', 
          text: language === 'ko' ? '역사적인 고전 회화' : 'Historical classical paintings',
          icon: '🏛️'
        },
        { 
          id: 'D', 
          text: language === 'ko' ? '실험적인 현대 설치' : 'Experimental contemporary installations',
          icon: '⚡'
        }
      ]
    }
  ];

  // LAEF 예시 결과
  const exampleResult = {
    type: 'LAEF',
    name: language === 'ko' ? '마음의 건축가' : 'Architect of Hearts',
    character: '🦊',
    description: language === 'ko' 
      ? '논리적이고 절제된 미술 취향을 가진 당신은 구조와 질서에서 아름다움을 발견합니다.'
      : 'With logical and restrained artistic taste, you find beauty in structure and order.',
    recommendations: {
      exhibition: language === 'ko' ? '단색화의 우주 - 국립현대미술관' : 'Universe of Monochrome - MMCA',
      artist: language === 'ko' ? '이우환, 박서보' : 'Lee Ufan, Park Seobo',
      artwork: language === 'ko' ? '조응 No.1 - 이우환' : 'Correspondence No.1 - Lee Ufan'
    }
  };

  // 추가 기능들
  const additionalFeatures = [
    {
      icon: User,
      name: language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile',
      description: language === 'ko' ? '성격을 반영한 개인 아바타 생성' : 'Generate personal avatar reflecting your personality',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      name: language === 'ko' ? '취향 커뮤니티' : 'Taste Community',
      description: language === 'ko' ? '같은 유형끼리 작품 공유하고 대화' : 'Share and discuss artworks with similar types',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Bookmark,
      name: language === 'ko' ? '나만의 갤러리' : 'Personal Gallery',
      description: language === 'ko' ? '마음에 든 작품들로 컬렉션 구성' : 'Build collection with favorite artworks',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Footprints,
      name: language === 'ko' ? '사유의 산책' : 'Contemplative Walk',
      description: language === 'ko' ? '한 작품과 깊은 대화 나누기' : 'Deep conversation with each artwork',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Camera,
      name: language === 'ko' ? '전시 일기' : 'Exhibition Diary',
      description: language === 'ko' ? '관람 경험을 감성적으로 기록' : 'Record viewing experiences emotionally',
      color: 'from-teal-500 to-blue-500'
    },
    {
      icon: Zap,
      name: language === 'ko' ? '아트페어 모드' : 'Art Fair Mode',
      description: language === 'ko' ? '전시장에서 빠른 작품 북마킹' : 'Quick artwork bookmarking at exhibitions',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  // 퀴즈 답변 처리
  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    setTimeout(() => {
      setShowResult(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  SAYU
                </h1>
                <p className="text-sm text-gray-500">Art Life Platform</p>
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-6">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="block text-gray-900">당신이 몰랐던</span>
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  예술 취향의 비밀
                </span>
                <span className="block text-gray-900">3분 만에 발견하기</span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 max-w-lg leading-relaxed"
              >
                {language === 'ko' 
                  ? '3분 시나리오 테스트로 16가지 예술 성격 중 당신의 유형을 찾고, AI가 큐레이션한 맞춤 추천을 받아보세요.'
                  : 'Discover your art personality from 16 types through a 3-minute scenario test, and receive AI-curated personalized recommendations.'}
              </motion.p>
            </div>

            {/* Curiosity Hooks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>당신이 끌리는 전시 스타일은?</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>미술관에서 어떤 그림 앞에 가장 오래 머물까요?</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>같은 그림을 봐도 다르게 느끼는 이유가 있어요</span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                onClick={() => router.push('/home')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                {language === 'ko' ? '3분 테스트 시작하기' : 'Start 3-Min Test'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/philosophy')}
                className="px-8 py-6 text-lg border-2 hover:bg-gray-50"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                {language === 'ko' ? '더 알아보기' : 'Learn More'}
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive Quiz Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <Card className="p-8 shadow-2xl border-0 bg-white/70 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {!showResult ? (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                        <Quote className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        {language === 'ko' ? '미리 체험해보기' : 'Try a Preview'}
                      </h3>
                      <p className="text-sm text-gray-500">1/7</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-center">
                        {quizQuestions[0].question}
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {quizQuestions[0].options.map((option, index) => (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswerSelect(option.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                              selectedAnswer === option.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{option.icon}</span>
                              <span className="font-medium">{option.text}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="space-y-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="text-6xl"
                      >
                        {exampleResult.character}
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-purple-600">
                          {exampleResult.type}
                        </h3>
                        <p className="text-lg font-medium text-gray-700">
                          {exampleResult.name}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {exampleResult.description}
                      </p>
                    </div>

                    <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900">
                        {language === 'ko' ? '맞춤 추천:' : 'Personalized Recommendations:'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span><strong>전시:</strong> {exampleResult.recommendations.exhibition}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-blue-500" />
                          <span><strong>작가:</strong> {exampleResult.recommendations.artist}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span><strong>작품:</strong> {exampleResult.recommendations.artwork}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/home')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      {language === 'ko' ? '전체 테스트 하러가기' : 'Take Full Test'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'ko' ? '취향 발견 후 즐길 수 있는 기능들' : 'Features to Enjoy After Discovering Your Taste'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'ko' 
                ? '당신만의 예술 정체성을 발견한 후, 더 깊이 있는 예술 경험을 위한 다양한 도구들을 제공합니다.'
                : 'After discovering your artistic identity, we provide various tools for deeper art experiences.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="p-6 h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                {language === 'ko' ? '나만의 예술 여정을 시작하세요' : 'Start Your Personal Art Journey'}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {language === 'ko' 
                  ? '수많은 예술 작품 중에서 정말 나와 맞는 것들을 찾는 일은 쉽지 않습니다. SAYU와 함께라면 당신만의 예술 세계를 쉽고 재미있게 발견할 수 있어요.'
                  : "Finding artworks that truly match you among countless pieces isn't easy. With SAYU, you can discover your own art world easily and enjoyably."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/home')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {language === 'ko' ? '지금 바로 시작하기' : 'Start Right Now'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/philosophy')}
                className="px-8 py-6 text-lg border-2 hover:bg-gray-50"
              >
                {language === 'ko' ? 'SAYU 철학 알아보기' : 'Learn SAYU Philosophy'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}