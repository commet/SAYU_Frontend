'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  narrativeQuestions, 
  getPersonalizedTransition,
  getPersonalizedTransition_ko,
  encouragingFeedback,
  encouragingFeedback_ko,
  type NarrativeQuestion
} from '@/data/narrative-quiz-questions';
import { 
  getBackgroundForQuestion, 
  getPhaseByQuestion, 
  fallbackGradients 
} from '@/data/quiz-backgrounds';
import { GlassCard, GlassButton, GlassIconButton } from '@/components/ui/glass';
import { EmotionalButton, EmotionalToast } from '@/components/emotional/EmotionalCard';
import { 
  ChevronRight, ChevronLeft, Home, Play, Pause, 
  SkipBack, SkipForward, Volume2, Map, Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import '@/styles/audio-guide.css';

interface QuizResponse {
  questionId: number;
  choice: string;
  weight: Record<string, number>;
  emotional: string;
}

export const AudioGuideQuiz: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [personalityScores, setPersonalityScores] = useState({
    L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showGalleryMap, setShowGalleryMap] = useState(false);

  const question = narrativeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / narrativeQuestions.length) * 100;
  const audioGuideNumber = String(currentQuestion + 1).padStart(3, '0');

  // Gallery room based on question phase and number
  const getGalleryRoom = () => {
    if (currentQuestion >= 10 && currentQuestion <= 11) {
      return language === 'ko' ? '아트샵' : 'Museum Shop';
    } else if (currentQuestion >= 12 && currentQuestion <= 14) {
      return language === 'ko' ? '일상 속에서' : 'In Daily Life';
    } else {
      return {
        'curiosity': language === 'ko' ? '입구 홀' : 'Entrance Hall',
        'exploration': language === 'ko' ? '메인 갤러리' : 'Main Gallery',
        'revelation': language === 'ko' ? '성찰의 방' : 'Reflection Room'
      }[question.act];
    }
  };
  const galleryRoom = getGalleryRoom();

  const handleGoBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.push('/quiz');
    }
  };

  const handleExitQuiz = () => {
    setShowExitConfirm(true);
  };

  const handleChoice = async (optionId: string) => {
    const selectedOption = question.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    // Save response
    const newResponse: QuizResponse = {
      questionId: question.id,
      choice: optionId,
      weight: selectedOption.weight,
      emotional: selectedOption.emotional
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Update personality scores
    const newScores = { ...personalityScores };
    Object.entries(selectedOption.weight).forEach(([key, value]) => {
      newScores[key as keyof typeof newScores] += value;
    });
    setPersonalityScores(newScores);

    // Show encouraging feedback
    if (currentQuestion % 3 === 2) {
      const feedbackArray = language === 'ko' ? encouragingFeedback_ko : encouragingFeedback;
      const message = feedbackArray[Math.floor(Math.random() * feedbackArray.length)];
      setEncouragementMessage(message);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }

    // Transition to next question or complete
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (currentQuestion < narrativeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      } else {
        completeQuiz(updatedResponses, newScores);
      }
    }, 800);
  };

  const completeQuiz = (allResponses: QuizResponse[], finalScores: typeof personalityScores) => {
    // Calculate personality type
    const type = [
      finalScores.L > finalScores.S ? 'L' : 'S',
      finalScores.A > finalScores.R ? 'A' : 'R',
      finalScores.E > finalScores.M ? 'E' : 'M',
      finalScores.F > finalScores.C ? 'F' : 'C'
    ].join('');

    // Store results
    localStorage.setItem('quizResults', JSON.stringify({
      personalityType: type,
      scores: finalScores,
      responses: allResponses,
      completedAt: new Date().toISOString()
    }));

    // Navigate to results
    router.push(`/results?type=${type}`);
  };

  const getTransitionText = () => {
    if (currentQuestion === 0) {
      return language === 'ko' && question.narrative.setup_ko 
        ? question.narrative.setup_ko 
        : question.narrative.setup;
    }
    
    const previousResponse = responses[responses.length - 1];
    if (previousResponse) {
      return language === 'ko' 
        ? getPersonalizedTransition_ko(
            currentQuestion,
            currentQuestion + 1,
            previousResponse.choice
          )
        : getPersonalizedTransition(
            currentQuestion,
            currentQuestion + 1,
            previousResponse.choice
          );
    }
    
    return language === 'ko' && question.narrative.transition_ko 
      ? question.narrative.transition_ko 
      : question.narrative.transition || '';
  };
  
  const phase = getPhaseByQuestion(currentQuestion + 1);
  const backgroundData = getBackgroundForQuestion(currentQuestion + 1);
  
  return (
    <div className="audio-guide-quiz-container">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle variant="glass" />
      </div>
      
      {/* Audio Guide Device - Improved Compact Version */}
      <motion.div 
        className="fixed top-4 left-4 z-40 max-w-xs"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="audio-guide-device-improved">
          {/* Header with Guide Number and Play Control */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Headphones className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-white">{audioGuideNumber}</span>
            </div>
            <button
              onClick={() => setAudioPlaying(!audioPlaying)}
              className="w-8 h-8 rounded-full bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center transition-colors"
              aria-label={audioPlaying ? "Pause" : "Play"}
            >
              {audioPlaying ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-amber-500" />}
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-700 relative rounded-full mb-3">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.8 }}
            />
          </div>
          
          <p className="text-sm font-medium text-gray-300 mb-3">{galleryRoom}</p>
          
          {/* Audio Visualizer - Improved */}
          <div className="h-8 flex items-center justify-center gap-1 mb-3">
            {audioPlaying ? (
              [...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-amber-600 to-amber-400 rounded-full"
                  animate={{
                    height: [6, 20, 6],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))
            ) : (
              <div className="text-gray-400 text-sm font-medium">
                {language === 'ko' ? '오디오 가이드' : 'Audio Guide'}
              </div>
            )}
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleGoBack}
              disabled={currentQuestion === 0}
              className="text-sm text-gray-300 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors px-2 py-1 rounded hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              {language === 'ko' ? '이전' : 'Back'}
            </button>
            
            <button
              onClick={() => setShowGalleryMap(true)}
              className="text-sm text-gray-300 hover:text-amber-400 flex items-center gap-1 font-medium transition-colors px-2 py-1 rounded hover:bg-gray-800"
            >
              <Map className="w-4 h-4" />
              {language === 'ko' ? '지도' : 'Map'}
            </button>
            
            <button
              onClick={handleExitQuiz}
              className="text-sm text-gray-300 hover:text-red-400 flex items-center gap-1 font-medium transition-colors px-2 py-1 rounded hover:bg-gray-800"
            >
              <Home className="w-4 h-4" />
              {language === 'ko' ? '나가기' : 'Exit'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Gallery Room Experience */}
      <div className={cn(
        "gallery-room-experience",
        `phase-${phase}`
      )}
      style={{
        backgroundImage: backgroundData.backgrounds && backgroundData.backgrounds.length > 0
          ? `url(${backgroundData.backgrounds[currentQuestion % backgroundData.backgrounds.length]})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Gradient Overlay */}
        <div className={cn(
          "gallery-overlay",
          backgroundData.overlay.color
        )} style={{ opacity: backgroundData.overlay.opacity }} />

        {/* Main Content */}
        <div className="gallery-content">
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="question-artwork-frame"
              >
                {/* Gallery Room Title - 우측 상단으로 이동 */}
                <motion.div 
                  className="room-plaque-new"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-white">{galleryRoom}</h3>
                  <p className="text-sm opacity-70 text-white">Stop {currentQuestion + 1} of {narrativeQuestions.length}</p>
                </motion.div>

                {/* Main Question Card - Fixed Styling */}
                <div className="question-card-fixed max-w-4xl mx-auto mb-8">
                  {/* Narrative Setup */}
                  {(question.narrative.setup || question.narrative.transition) && (
                    <motion.p
                      className="text-lg text-gray-800 mb-6 leading-relaxed font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {getTransitionText()}
                    </motion.p>
                  )}

                  {/* Question */}
                  <motion.h2
                    className="text-3xl md:text-4xl font-bold text-center mb-8 leading-tight text-gray-900"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {(language === 'ko' && question.question_ko ? question.question_ko : question.question)
                      .split('\n')
                      .map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < (language === 'ko' && question.question_ko ? question.question_ko : question.question).split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                  </motion.h2>
                </div>

                {/* Choice Cards */}
                <motion.div 
                  className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {question.options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="choice-card-fixed cursor-pointer group h-full relative overflow-hidden"
                        onClick={() => handleChoice(option.id)}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, #8b7355 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                          }} />
                        </div>

                        <div className="relative z-10 flex flex-col justify-center min-h-[160px] py-6">
                          <div className="flex justify-between items-start mb-4">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-white font-bold text-lg">
                              {index === 0 ? 'A' : 'B'}
                            </span>
                            <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-gray-800 group-hover:translate-x-1 transition-all" />
                          </div>
                          
                          <h4 className="text-xl font-semibold mb-3 text-gray-900 leading-tight">
                            {language === 'ko' && option.text_ko ? option.text_ko : option.text}
                          </h4>
                          
                          {option.subtext && (
                            <p className="text-gray-700 text-sm leading-relaxed italic">
                              {language === 'ko' && option.subtext_ko ? option.subtext_ko : option.subtext}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Atmosphere indicator */}
                {question.narrative.atmosphere && (
                  <motion.div
                    className="atmosphere-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.9 }}
                  >
                    <p>
                      {language === 'ko' ? '갤러리 분위기: ' : 'Gallery atmosphere: '}
                      {language === 'ko' ? 
                        {
                          'anticipation': '기대감',
                          'wonder': '경이로움',
                          'threshold': '문턱',
                          'immersion': '몰입',
                          'discovery': '발견',
                          'connection': '연결',
                          'depth': '깊이',
                          'transformation': '변화',
                          'reflection': '성찰',
                          'curiosity': '호기심',
                          'decision': '결정',
                          'memory': '기억',
                          'integration': '통합'
                        }[question.narrative.atmosphere] || question.narrative.atmosphere
                        : question.narrative.atmosphere
                      }
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gallery Map Modal */}
      <AnimatePresence>
        {showGalleryMap && (
          <motion.div
            className="gallery-map-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGalleryMap(false)}
          >
            <motion.div
              className="map-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{language === 'ko' ? '갤러리 여정 지도' : 'Gallery Journey Map'}</h3>
              <div className="map-rooms">
                <div className={`map-room ${currentQuestion >= 0 && currentQuestion <= 4 ? 'active' : ''}`}>
                  <span className="room-number">1-5</span>
                  <span className="room-name">{language === 'ko' ? '입구 홀' : 'Entrance Hall'}</span>
                </div>
                <div className={`map-room ${currentQuestion >= 5 && currentQuestion <= 9 ? 'active' : ''}`}>
                  <span className="room-number">6-10</span>
                  <span className="room-name">{language === 'ko' ? '메인 갤러리' : 'Main Gallery'}</span>
                </div>
                <div className={`map-room ${currentQuestion >= 10 && currentQuestion <= 11 ? 'active' : ''}`}>
                  <span className="room-number">11-12</span>
                  <span className="room-name">{language === 'ko' ? '아트샵' : 'Museum Shop'}</span>
                </div>
                <div className={`map-room ${currentQuestion >= 12 && currentQuestion <= 14 ? 'active' : ''}`}>
                  <span className="room-number">13-15</span>
                  <span className="room-name">{language === 'ko' ? '일상 속에서' : 'In Daily Life'}</span>
                </div>
              </div>
              <p className="current-location">You are here: Stop {currentQuestion + 1}</p>
              <button 
                className="close-map"
                onClick={() => setShowGalleryMap(false)}
              >
                Close Map
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encouragement Toast */}
      <EmotionalToast
        message={encouragementMessage}
        emoji="✨"
        isVisible={showEncouragement}
      />
      
      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExitConfirm(false)}
          >
            <GlassCard
              className="max-w-md w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'ko' ? '갤러리 투어를 종료하시겠습니까?' : 'End Gallery Tour?'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'ko' ? '진행 상황이 사라집니다. 정말 나가시겠습니까?' : 'Your progress will be lost. Are you sure you want to exit?'}
                </p>
                <div className="flex gap-3">
                  <GlassButton
                    variant="secondary"
                    className="flex-1"
                    onClick={() => router.push('/')}
                  >
                    {language === 'ko' ? '나가기' : 'Exit tour'}
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    className="flex-1"
                    onClick={() => setShowExitConfirm(false)}
                  >
                    {language === 'ko' ? '계속하기' : 'Continue'}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};