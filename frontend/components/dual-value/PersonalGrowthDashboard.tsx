'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Heart, Palette, Users, Award, Target, Lightbulb } from 'lucide-react';

interface GrowthMetrics {
  emotional_vocabulary_richness: number;
  emotional_nuance_ability: number;
  emotional_self_awareness: number;
  philosophical_thinking_depth: number;
  abstract_reasoning_ability: number;
  critical_analysis_skill: number;
  genre_comprehension_breadth: number;
  cultural_context_understanding: number;
  technical_appreciation_level: number;
  empathy_quotient: number;
  cultural_sensitivity_score: number;
  perspective_taking_ability: number;
  community_contribution_score: number;
  teaching_effectiveness: number;
  knowledge_synthesis_ability: number;
  overall_growth_trajectory: number;
  growth_velocity: number;
  personal_mission_alignment: number;
}

interface GrowthInsight {
  type: 'strengths' | 'growth_opportunities' | 'acceleration';
  data?: Array<{ area: string; score: number }>;
  message?: string;
}

interface PersonalGrowthData {
  currentGrowth: GrowthMetrics;
  profileSummary: {
    nickname: string;
    type_code: string;
    overall_growth_trajectory: number;
    last_assessment: string;
  };
  growthTrend: Array<{
    month: string;
    avg_growth: number;
    avg_emotional: number;
    avg_philosophical: number;
    avg_empathy: number;
  }>;
  personalizedInsights: GrowthInsight[];
}

const PersonalGrowthDashboard: React.FC = () => {
  const [growthData, setGrowthData] = useState<PersonalGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>('overview');

  useEffect(() => {
    fetchGrowthData();
  }, []);

  const fetchGrowthData = async () => {
    try {
      const response = await fetch('/api/dual-value/personal-growth/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGrowthData(data.data);
      }
    } catch (error) {
      console.error('성장 대시보드 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthLevelText = (score: number): string => {
    if (score >= 0.8) return '탁월함';
    if (score >= 0.6) return '우수함';
    if (score >= 0.4) return '발전중';
    if (score >= 0.2) return '시작단계';
    return '초기';
  };

  const getGrowthLevelColor = (score: number): string => {
    if (score >= 0.8) return 'text-emerald-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-amber-600';
    if (score >= 0.2) return 'text-orange-600';
    return 'text-red-500';
  };

  const GrowthCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    score: number;
    description: string;
    trend?: number;
  }> = ({ title, icon, score, description, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">{Math.abs(trend * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${getGrowthLevelColor(score)}`}>
            {getGrowthLevelText(score)}
          </span>
          <span className="text-sm text-gray-500">{(score * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${score * 100}%` }}
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );

  const InsightCard: React.FC<{ insight: GrowthInsight }> = ({ insight }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
    >
      <div className="flex items-center space-x-2 mb-3">
        <Lightbulb className="w-5 h-5 text-indigo-600" />
        <h4 className="font-semibold text-indigo-800">
          {insight.type === 'strengths' && '나의 강점'}
          {insight.type === 'growth_opportunities' && '성장 기회'}
          {insight.type === 'acceleration' && '성장 가속화'}
        </h4>
      </div>
      
      {insight.message && (
        <p className="text-indigo-700 text-sm">{insight.message}</p>
      )}
      
      {insight.data && (
        <div className="space-y-2 mt-2">
          {insight.data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">{item.area}</span>
              <span className="text-sm font-medium text-indigo-800">
                {(item.score * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!growthData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">성장 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const { currentGrowth, profileSummary, personalizedInsights } = growthData;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 헤더 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">개인 성장 대시보드</h1>
        <p className="text-blue-100 mb-4">
          예술을 통한 나의 감성과 사유 능력의 발전을 추적해보세요
        </p>
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{(currentGrowth.overall_growth_trajectory * 100).toFixed(1)}%</div>
            <div className="text-sm text-blue-100">전체 성장 궤적</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${currentGrowth.growth_velocity >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {currentGrowth.growth_velocity >= 0 ? '+' : ''}{(currentGrowth.growth_velocity * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-100">성장 속도</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{(currentGrowth.personal_mission_alignment * 100).toFixed(1)}%</div>
            <div className="text-sm text-blue-100">미션 정렬도</div>
          </div>
        </div>
      </motion.div>

      {/* 인사이트 섹션 */}
      {personalizedInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">개인 맞춤 인사이트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalizedInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </motion.div>
      )}

      {/* 성장 영역별 상세 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">성장 영역별 분석</h2>
        
        {/* 감정 지능 영역 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span>감정 지능</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GrowthCard
              title="감정 어휘 풍부도"
              icon={<Heart className="w-6 h-6 text-red-500" />}
              score={currentGrowth.emotional_vocabulary_richness}
              description="복잡한 감정을 정확히 표현하는 능력"
            />
            <GrowthCard
              title="감정 뉘앙스 이해"
              icon={<Brain className="w-6 h-6 text-purple-500" />}
              score={currentGrowth.emotional_nuance_ability}
              description="미묘한 감정의 차이를 구분하는 능력"
            />
            <GrowthCard
              title="감정 자각력"
              icon={<Target className="w-6 h-6 text-blue-500" />}
              score={currentGrowth.emotional_self_awareness}
              description="자신의 감정 상태를 인식하는 능력"
            />
          </div>
        </div>

        {/* 사유 능력 영역 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <span>사유 능력</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GrowthCard
              title="철학적 사고 깊이"
              icon={<Brain className="w-6 h-6 text-purple-500" />}
              score={currentGrowth.philosophical_thinking_depth}
              description="근본적인 질문을 탐구하는 능력"
            />
            <GrowthCard
              title="추상적 추론 능력"
              icon={<Lightbulb className="w-6 h-6 text-yellow-500" />}
              score={currentGrowth.abstract_reasoning_ability}
              description="개념적이고 상징적인 사고 능력"
            />
            <GrowthCard
              title="비판적 분석 기술"
              icon={<Target className="w-6 h-6 text-indigo-500" />}
              score={currentGrowth.critical_analysis_skill}
              description="객관적이고 논리적인 분석 능력"
            />
          </div>
        </div>

        {/* 예술 이해 영역 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <Palette className="w-6 h-6 text-green-500" />
            <span>예술 이해</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GrowthCard
              title="장르 이해 폭"
              icon={<Palette className="w-6 h-6 text-green-500" />}
              score={currentGrowth.genre_comprehension_breadth}
              description="다양한 예술 장르에 대한 이해도"
            />
            <GrowthCard
              title="문화적 맥락 이해"
              icon={<Users className="w-6 h-6 text-teal-500" />}
              score={currentGrowth.cultural_context_understanding}
              description="예술의 문화적 배경 이해 능력"
            />
            <GrowthCard
              title="기술적 감상 수준"
              icon={<Award className="w-6 h-6 text-orange-500" />}
              score={currentGrowth.technical_appreciation_level}
              description="예술 기법과 스타일 이해 능력"
            />
          </div>
        </div>

        {/* 사회적 지능 영역 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>사회적 지능</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GrowthCard
              title="공감 지수"
              icon={<Heart className="w-6 h-6 text-pink-500" />}
              score={currentGrowth.empathy_quotient}
              description="타인의 감정을 이해하고 공감하는 능력"
            />
            <GrowthCard
              title="문화적 민감성"
              icon={<Users className="w-6 h-6 text-cyan-500" />}
              score={currentGrowth.cultural_sensitivity_score}
              description="다양한 문화에 대한 이해와 존중"
            />
            <GrowthCard
              title="관점 전환 능력"
              icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
              score={currentGrowth.perspective_taking_ability}
              description="다른 사람의 관점에서 생각하는 능력"
            />
          </div>
        </div>

        {/* 기여 및 영향력 영역 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>기여 및 영향력</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GrowthCard
              title="커뮤니티 기여도"
              icon={<Users className="w-6 h-6 text-blue-600" />}
              score={currentGrowth.community_contribution_score}
              description="커뮤니티에 대한 가치 있는 기여"
            />
            <GrowthCard
              title="교육 효과성"
              icon={<Lightbulb className="w-6 h-6 text-yellow-600" />}
              score={currentGrowth.teaching_effectiveness}
              description="다른 사용자들에게 미치는 교육적 영향"
            />
            <GrowthCard
              title="지식 종합 능력"
              icon={<Brain className="w-6 h-6 text-indigo-600" />}
              score={currentGrowth.knowledge_synthesis_ability}
              description="다양한 지식을 연결하고 종합하는 능력"
            />
          </div>
        </div>
      </div>

      {/* 다음 단계 추천 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
      >
        <h3 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
          <Target className="w-6 h-6" />
          <span>다음 성장 단계 추천</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <h4 className="font-medium text-emerald-800 mb-2">감정 표현 확장</h4>
            <p className="text-sm text-emerald-600">
              더 다양하고 정교한 감정 어휘를 사용하여 작품 해석을 깊이 있게 작성해보세요.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <h4 className="font-medium text-emerald-800 mb-2">타인과의 대화</h4>
            <p className="text-sm text-emerald-600">
              다른 사용자들의 해석에 건설적인 피드백을 제공하여 공감 능력을 발전시켜보세요.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <h4 className="font-medium text-emerald-800 mb-2">큐레이션 도전</h4>
            <p className="text-sm text-emerald-600">
              의미 있는 전시 경로를 큐레이션하여 지식 종합 능력을 키워보세요.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalGrowthDashboard;