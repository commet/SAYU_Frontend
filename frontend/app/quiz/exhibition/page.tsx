'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAchievements } from '@/hooks/useAchievements';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExhibitionQuizPage() {
  const router = useRouter();
  const { trackQuizCompleted } = useAchievements();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(14);

  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionType: 'exhibition' })
      });

      if (!res.ok) throw new Error('Failed to start quiz');

      const data = await res.json();
      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.currentQuestion);
      setTotalQuestions(data.totalQuestions);
    } catch (error) {
      toast.error('Failed to start quiz');
      router.push('/quiz');
    }
  };

  const submitAnswer = async (optionId: string) => {
    if (!sessionId || loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer: optionId,
          timeSpent: 5000 // Mock time spent
        })
      });

      if (!res.ok) throw new Error('Failed to submit answer');

      const data = await res.json();
      
      if (data.progress) {
        setProgress(data.progress * 100);
      }

      if (data.question) {
        setCurrentQuestion(data.question);
        setQuestionNumber(data.currentQuestion);
      } else if (data.complete) {
        // Quiz complete - track achievement
        trackQuizCompleted();
        
        if (data.profileGenerated) {
          toast.success('Profile generated!');
          router.push('/profile');
        } else {
          toast.success('Exhibition quiz complete! Now for artwork preferences.');
          router.push('/quiz/artwork');
        }
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Question Counter */}
      <div className="p-6 text-center">
        <p className="text-gray-400">
          Question {questionNumber} of {totalQuestions}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-purple-500/20">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4">
                {currentQuestion.options.map((option: any) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => submitAnswer(option.id)}
                    disabled={loading}
                    className="w-full p-6 text-left rounded-2xl bg-gray-800/50 hover:bg-purple-600/20 border-2 border-transparent hover:border-purple-500/50 transition-all disabled:opacity-50"
                  >
                    <p className="text-white text-lg">{option.text}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 flex justify-center">
        <Button
          variant="ghost"
          onClick={() => router.push('/quiz')}
          className="text-white hover:text-purple-400"
        >
          <ChevronLeft className="mr-2" />
          Back to Quiz Selection
        </Button>
      </div>
    </div>
  );
}