'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Map,
  HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernCard } from '@/components/ui/modern-card';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  text: { ko: string; en: string };
  choices: Array<{
    id: string;
    text: { ko: string; en: string };
    value: string;
  }>;
  category: string;
  phase: number;
  background?: string;
}

interface QuizPhase {
  id: number;
  name: { ko: string; en: string };
  description: { ko: string; en: string };
  icon: React.ReactNode;
  color: string;
}

const quizPhases: QuizPhase[] = [
  {
    id: 1,
    name: { ko: '입구 홀', en: 'Entrance Hall' },
    description: { ko: '예술 여정의 시작', en: 'Beginning of your art journey' },
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-sayu-lavender to-sayu-powder-blue'
  },
  {
    id: 2,
    name: { ko: '메인 갤러리', en: 'Main Gallery' },
    description: { ko: '당신의 취향 탐구', en: 'Exploring your preferences' },
    icon: <Map className="w-5 h-5" />,
    color: 'from-sayu-sage to-sayu-lavender'
  },
  {
    id: 3,
    name: { ko: '뮤지엄 샵', en: 'Museum Shop' },
    description: { ko: '개인적 선호도', en: 'Personal preferences' },
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'from-sayu-blush to-sayu-lavender'
  },
  {
    id: 4,
    name: { ko: '일상 속에서', en: 'In Daily Life' },
    description: { ko: '예술과 삶의 연결', en: 'Connecting art with life' },
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-sayu-powder-blue to-sayu-sage'
  }
];

export default function ModernQuizInterface({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showPhaseIntro, setShowPhaseIntro] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(1);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const phase = quizPhases.find(p => p.id === question.phase) || quizPhases[0];

  useEffect(() => {
    // Check if entering new phase
    if (currentQuestion > 0 && questions[currentQuestion - 1].phase !== question.phase) {
      setCurrentPhase(question.phase);
      setShowPhaseIntro(true);
    }
  }, [currentQuestion, question.phase, questions]);

  const handleAnswer = (answerId: string) => {
    setAnswers({ ...answers, [question.id]: answerId });
    
    // Show encouragement at milestones
    if ((currentQuestion + 1) % 5 === 0 && currentQuestion < questions.length - 1) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E6E0F5', '#D4E4DC', '#E0EAF5', '#F5E0E6']
      });
    }

    // Move to next question or complete
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Quiz complete
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    // Celebration animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Navigate to results with answers
    setTimeout(() => {
      router.push(`/quiz/results?answers=${JSON.stringify(answers)}`);
    }, 1500);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sayu-bg-primary to-sayu-bg-secondary overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl bg-gradient-to-br ${phase.color}`}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl bg-gradient-to-br ${phase.color}`}
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Phase Introduction */}
      <AnimatePresence>
        {showPhaseIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPhaseIntro(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-12 max-w-md text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${phase.color} mb-6`}>
                {phase.icon}
              </div>
              <h2 className="sayu-display text-3xl font-bold text-sayu-text-primary mb-4">
                {phase.name[language]}
              </h2>
              <p className="text-sayu-text-secondary mb-8">
                {phase.description[language]}
              </p>
              <ModernButton
                onClick={() => setShowPhaseIntro(false)}
                size="lg"
                className="w-full"
              >
                {language === 'ko' ? '계속하기' : 'Continue'}
              </ModernButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <ModernButton
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </ModernButton>

          {/* Progress Bar */}
          <div className="flex-1 mx-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-sayu-bg-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sayu-lavender to-sayu-sage"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
              <span className="text-sm text-sayu-text-muted">
                {currentQuestion + 1} / {questions.length}
              </span>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            <ModernButton
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-full"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </ModernButton>
            <ModernButton
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </ModernButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Question */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-block mb-6"
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${phase.color} text-sayu-charcoal text-sm font-medium`}>
                    {phase.icon}
                    <span>{phase.name[language]}</span>
                  </div>
                </motion.div>

                <h2 className="sayu-display text-3xl md:text-4xl font-bold text-sayu-text-primary mb-4">
                  {question.text[language]}
                </h2>
              </div>

              {/* Choices */}
              <div className="grid gap-4 max-w-2xl mx-auto">
                {question.choices.map((choice, index) => (
                  <motion.div
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ModernCard
                      hover
                      onClick={() => handleAnswer(choice.value)}
                      className={`
                        p-6 cursor-pointer border-2 transition-all
                        ${answers[question.id] === choice.value 
                          ? 'border-sayu-mocha bg-sayu-lavender/20' 
                          : 'border-transparent hover:border-sayu-warm-gray/30'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg text-sayu-text-primary">
                          {choice.text[language]}
                        </span>
                        <motion.div
                          initial={false}
                          animate={{ scale: answers[question.id] === choice.value ? 1 : 0 }}
                          className="w-6 h-6 rounded-full bg-sayu-mocha flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4 text-sayu-cream" />
                        </motion.div>
                      </div>
                    </ModernCard>
                  </motion.div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center max-w-2xl mx-auto pt-8">
                <ModernButton
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  iconLeft={<ChevronLeft className="w-4 h-4" />}
                >
                  {language === 'ko' ? '이전' : 'Previous'}
                </ModernButton>

                {currentQuestion > 0 && !answers[question.id] && (
                  <button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="text-sm text-sayu-text-muted hover:text-sayu-text-secondary transition-colors"
                  >
                    {language === 'ko' ? '건너뛰기' : 'Skip'}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Audio Guide Device */}
      <motion.div
        className="fixed bottom-6 right-6 md:bottom-12 md:right-12"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-sayu-mocha shadow-xl flex items-center justify-center">
            <div className="relative">
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 -m-2"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-sayu-mocha/30" />
                </motion.div>
              )}
              <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-sayu-cream" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}