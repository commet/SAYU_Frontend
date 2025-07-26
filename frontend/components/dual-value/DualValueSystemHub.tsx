'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Brain, 
  Heart, 
  Palette,
  Target,
  Award,
  BarChart3,
  ArrowRight,
  Star,
  Lightbulb,
  Globe,
  BookOpen
} from 'lucide-react';
import PersonalGrowthDashboard from './PersonalGrowthDashboard';
import CollectiveIntelligencePlatform from './CollectiveIntelligencePlatform';
import ValueCirculationSystem from './ValueCirculationSystem';

interface SystemStats {
  personalGrowth: {
    total_growing_users: number;
    avg_growth_trajectory: number;
    avg_emotional_growth: number;
    avg_philosophical_growth: number;
  };
  collectiveIntelligence: {
    total_interpretations: number;
    artworks_with_interpretations: number;
    active_interpreters: number;
    avg_interpretation_quality: number;
  };
  valueCirculation: {
    active_contributors: number;
    total_value_created: number;
    avg_contribution_quality: number;
    total_contributions: number;
  };
  learningNetwork: {
    total_learning_connections: number;
    active_learners: number;
    active_teachers: number;
    avg_learning_depth: number;
  };
}

const DualValueSystemHub: React.FC = () => {
  const [activeView, setActiveView] = useState<'hub' | 'growth' | 'collective' | 'circulation'>('hub');
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeView === 'hub') {
      fetchSystemStats();
    }
  }, [activeView]);

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/dual-value/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSystemStats(data.data);
      }
    } catch (error) {
      console.error('시스템 통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    gradient: string;
    trend?: number;
  }> = ({ title, value, subtitle, icon, gradient, trend }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${gradient} rounded-2xl p-6 text-white relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            {icon}
          </div>
          {trend !== undefined && (
            <div className="flex items-center space-x-1 text-sm">
              <TrendingUp className={`w-4 h-4 ${trend >= 0 ? '' : 'rotate-180'}`} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <p className="text-white text-opacity-80 text-sm">{subtitle}</p>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16" />
    </motion.div>
  );

  const FeatureCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    comingSoon?: boolean;
  }> = ({ title, description, icon, onClick, comingSoon = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-lg ${
        comingSoon ? 'opacity-60' : ''
      }`}
      onClick={!comingSoon ? onClick : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          {icon}
        </div>
        {comingSoon && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {!comingSoon && (
        <div className="flex items-center text-indigo-600 font-medium">
          <span>시작하기</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </motion.div>
  );

  const BenefitCard: React.FC<{
    type: 'personal' | 'community';
    title: string;
    benefits: string[];
    icon: React.ReactNode;
  }> = ({ type, title, benefits, icon }) => (
    <motion.div
      initial={{ opacity: 0, x: type === 'personal' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-2xl p-6 ${
        type === 'personal' 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200' 
          : 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200'
      } border`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg ${
          type === 'personal' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
        }`}>
          {icon}
        </div>
        <h3 className={`text-xl font-semibold ${
          type === 'personal' ? 'text-blue-800' : 'text-purple-800'
        }`}>
          {title}
        </h3>
      </div>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className={`flex items-start space-x-2 ${
            type === 'personal' ? 'text-blue-700' : 'text-purple-700'
          }`}>
            <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{benefit}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );

  if (activeView !== 'hub') {
    const components = {
      growth: PersonalGrowthDashboard,
      collective: CollectiveIntelligencePlatform,
      circulation: ValueCirculationSystem
    };
    const Component = components[activeView];
    return (
      <div>
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <button
            onClick={() => setActiveView('hub')}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>듀얼 가치 시스템으로 돌아가기</span>
          </button>
        </div>
        <Component />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 메인 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white"
      >
        <h1 className="text-4xl font-bold mb-4">SAYU 듀얼 가치 창출 시스템</h1>
        <p className="text-xl text-indigo-100 mb-6 max-w-3xl mx-auto">
          예술을 통한 개인 성장과 집단 지성의 혁신적 융합
        </p>
        <div className="text-lg text-indigo-100">
          "당신의 예술 감성이 성장할수록, 전체 커뮤니티의 지혜도 함께 발전합니다"
        </div>
      </motion.div>

      {/* 듀얼 가치 개념 설명 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200"
      >
        <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">
          듀오링고를 넘어서는 듀얼 가치 모델
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BenefitCard
            type="personal"
            title="개인 가치 창출"
            icon={<Brain className="w-6 h-6" />}
            benefits={[
              "감정 어휘력과 표현 능력 향상",
              "철학적 사고와 비판적 분석 능력 발전",
              "다양한 예술 장르에 대한 이해도 확장",
              "문화적 감수성과 공감 능력 증진",
              "개인 맞춤형 성장 궤적 추적"
            ]}
          />
          <BenefitCard
            type="community"
            title="커뮤니티 가치 창출"
            icon={<Users className="w-6 h-6" />}
            benefits={[
              "작품별 다층적 해석 아카이브 구축",
              "문화 간 이해와 관점 교류 촉진",
              "집단 지성을 통한 예술 감정 데이터베이스",
              "사용자 큐레이션으로 만드는 의미 있는 전시",
              "지식의 재생산과 발전 순환 시스템"
            ]}
          />
        </div>
      </motion.div>

      {/* 시스템 통계 */}
      {systemStats && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center">실시간 시스템 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="성장하는 사용자"
              value={systemStats.personalGrowth.total_growing_users || 0}
              subtitle="지난 30일간 성장 기록"
              icon={<TrendingUp className="w-6 h-6" />}
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              trend={12}
            />
            <StatCard
              title="집단 해석"
              value={systemStats.collectiveIntelligence.total_interpretations || 0}
              subtitle="누적 작품 해석 수"
              icon={<Brain className="w-6 h-6" />}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
              trend={8}
            />
            <StatCard
              title="활성 기여자"
              value={systemStats.valueCirculation.active_contributors || 0}
              subtitle="이달의 기여 참여자"
              icon={<Users className="w-6 h-6" />}
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              trend={15}
            />
            <StatCard
              title="학습 연결"
              value={systemStats.learningNetwork.total_learning_connections || 0}
              subtitle="상호 학습 네트워크"
              icon={<Globe className="w-6 h-6" />}
              gradient="bg-gradient-to-br from-orange-500 to-red-600"
              trend={22}
            />
          </div>
        </motion.div>
      )}

      {/* 핵심 기능 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">시스템 구성 요소</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="개인 성장 대시보드"
            description="예술을 통한 감성과 사유 능력의 발전을 실시간으로 추적하고 분석합니다."
            icon={<BarChart3 className="w-8 h-8 text-blue-600" />}
            onClick={() => setActiveView('growth')}
          />
          <FeatureCard
            title="집단 지성 플랫폼"
            description="다양한 관점의 작품 해석이 모여 만드는 예술 이해의 아카이브입니다."
            icon={<Lightbulb className="w-8 h-8 text-purple-600" />}
            onClick={() => setActiveView('collective')}
          />
          <FeatureCard
            title="가치 순환 시스템"
            description="개인의 기여가 커뮤니티 가치로 순환되는 혁신적인 포인트 시스템입니다."
            icon={<Coins className="w-8 h-8 text-green-600" />}
            onClick={() => setActiveView('circulation')}
          />
        </div>
      </div>

      {/* 추가 기능 (개발 예정) */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">향후 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="AI 감정 코치"
            description="개인의 감정 패턴을 분석하여 맞춤형 예술 치료를 제공합니다."
            icon={<Heart className="w-8 h-8 text-pink-600" />}
            onClick={() => {}}
            comingSoon
          />
          <FeatureCard
            title="가상 미술관"
            description="VR/AR 기술을 활용한 몰입형 예술 감상 경험을 제공합니다."
            icon={<Palette className="w-8 h-8 text-indigo-600" />}
            onClick={() => {}}
            comingSoon
          />
          <FeatureCard
            title="글로벌 문화 교류"
            description="전 세계 사용자들과의 문화적 관점 교류와 학습 네트워크를 구축합니다."
            icon={<Globe className="w-8 h-8 text-cyan-600" />}
            onClick={() => {}}
            comingSoon
          />
        </div>
      </div>

      {/* 시작하기 CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center"
      >
        <h2 className="text-2xl font-bold mb-4">지금 바로 시작하세요</h2>
        <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
          당신의 첫 번째 작품 해석부터 시작하여, 개인의 성장과 커뮤니티의 발전을 동시에 경험해보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setActiveView('growth')}
            className="px-8 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            개인 성장 시작하기
          </button>
          <button
            onClick={() => setActiveView('collective')}
            className="px-8 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-400 transition-colors border border-purple-400"
          >
            커뮤니티 참여하기
          </button>
        </div>
      </motion.div>

      {/* 성과 지표 */}
      {systemStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">시스템 성과</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {((systemStats.personalGrowth.avg_growth_trajectory || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">평균 성장률</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {((systemStats.collectiveIntelligence.avg_interpretation_quality || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">해석 품질</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {((systemStats.valueCirculation.avg_contribution_quality || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">기여 품질</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {((systemStats.learningNetwork.avg_learning_depth || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">학습 깊이</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DualValueSystemHub;