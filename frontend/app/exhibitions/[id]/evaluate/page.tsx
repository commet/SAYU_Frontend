'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEarnPoints } from '@/hooks/useGamification';
import { CompanionEvaluationForm } from '@/components/evaluation/CompanionEvaluationForm';
import { calculateExhibitionPointsWithEvaluation, calculateEvaluatorPoints } from '@/lib/evaluation-points-calculator';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function ExhibitionEvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { earnPoints, isEarning } = useEarnPoints();
  const [evaluationSubmitted, setEvaluationSubmitted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Mock data - in real implementation, this would come from the exhibition visit record
  const exhibitionData = {
    id: params?.id as string,
    name: language === 'ko' ? '모네의 정원: 빛과 색의 향연' : "Monet's Garden: Symphony of Light and Color",
    visitDate: new Date(),
    companionId: 'companion123',
    companionType: 'SRMC' // Example personality type
  };

  const handleEvaluationSubmit = async (evaluation: any) => {
    try {
      // Calculate points based on evaluation
      const baseExhibitionPoints = 30;
      const evaluationResult = calculateExhibitionPointsWithEvaluation(
        baseExhibitionPoints,
        evaluation,
        true, // Assuming mutual evaluation
        5 // Example evaluation count
      );

      // Points for the evaluator
      const evaluatorPoints = calculateEvaluatorPoints(evaluation);
      
      // Total points earned
      const totalPoints = evaluationResult.finalPoints + evaluatorPoints;
      setPointsEarned(totalPoints);

      // Submit evaluation to API (mock)
      // const response = await fetch('/api/evaluations', { ... });

      // Add points to user account
      await earnPoints({
        activity: 'exhibition_review',
        metadata: {
          exhibitionId: exhibitionData.id,
          evaluationQuality: evaluation,
          pointsBreakdown: evaluationResult.breakdown
        }
      });

      setEvaluationSubmitted(true);
      
      toast.success(language === 'ko' 
        ? `평가 완료! +${totalPoints} 포인트 획득!` 
        : `Evaluation complete! +${totalPoints} points earned!`
      );
    } catch (error) {
      toast.error(language === 'ko' 
        ? '평가 제출 중 오류가 발생했습니다' 
        : 'Error submitting evaluation'
      );
    }
  };

  if (evaluationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {language === 'ko' ? '평가 완료!' : 'Evaluation Complete!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {language === 'ko' 
              ? '소중한 피드백 감사합니다. 더 나은 전시 경험을 만드는데 도움이 됩니다.' 
              : 'Thank you for your valuable feedback. It helps create better exhibition experiences.'
            }
          </p>
          
          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-3xl font-bold text-amber-600 mb-1">
              +{pointsEarned}
            </p>
            <p className="text-sm text-gray-600">
              {language === 'ko' ? '포인트 획득' : 'Points Earned'}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/profile/gamification')}
              className="w-full"
            >
              {language === 'ko' ? '내 포인트 확인' : 'View My Points'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/exhibitions')}
              className="w-full"
            >
              {language === 'ko' ? '다른 전시 보기' : 'Browse Exhibitions'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              {language === 'ko' ? '뒤로' : 'Back'}
            </button>
            <LanguageToggle variant="glass" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {language === 'ko' ? '전시 동반자 평가' : 'Exhibition Companion Evaluation'}
          </h1>
          <p className="text-gray-600">
            {language === 'ko' 
              ? '함께 전시를 관람한 경험을 평가해주세요' 
              : 'Please evaluate your exhibition experience together'
            }
          </p>
        </div>

        <CompanionEvaluationForm
          exhibitionVisitId={exhibitionData.id}
          exhibitionName={exhibitionData.name}
          companionId={exhibitionData.companionId}
          companionType={exhibitionData.companionType}
          onSubmit={handleEvaluationSubmit}
          onCancel={() => router.back()}
        />

        {/* Points Preview */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <h3 className="font-medium text-gray-700 mb-3">
              {language === 'ko' ? '평가 완료 시 획득 포인트' : 'Points for Completing Evaluation'}
            </h3>
            <div className="flex justify-center gap-8">
              <div>
                <p className="text-2xl font-bold text-amber-600">10-20</p>
                <p className="text-sm text-gray-600">
                  {language === 'ko' ? '기본 평가' : 'Basic Evaluation'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">+5-15</p>
                <p className="text-sm text-gray-600">
                  {language === 'ko' ? '상세 피드백' : 'Detailed Feedback'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">×0.5-2.0</p>
                <p className="text-sm text-gray-600">
                  {language === 'ko' ? '평가 배율' : 'Rating Multiplier'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}