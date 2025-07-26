'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Coins, 
  TrendingUp, 
  Award, 
  Users, 
  Target, 
  Gift,
  ArrowRightLeft,
  Crown,
  Unlock,
  Star,
  Clock,
  BarChart3,
  Zap,
  Heart,
  Brain,
  Palette,
  Globe
} from 'lucide-react';

interface UserContribution {
  contribution_type: string;
  avg_quality: number;
  avg_impact: number;
  total_points: number;
  contribution_count: number;
}

interface UserImpactMetrics {
  people_influenced: number;
  avg_learning_depth: number;
  knowledge_adoptions: number;
}

interface UserLearningConnections {
  learning_sources: number;
  avg_learning_received: number;
  learning_types: string[];
}

interface ValueCirculationData {
  contribution: UserContribution[];
  impact: UserImpactMetrics;
  learningConnections: UserLearningConnections;
  valueCirculationScore: number;
}

interface PremiumFeature {
  feature_type: string;
  unlocked_at: string;
  expires_at: string;
  is_active: boolean;
}

interface PointTransaction {
  contribution_type: string;
  accumulated_points: number;
  recorded_at: string;
  transaction_type: 'earned' | 'spent';
}

const ValueCirculationSystem: React.FC = () => {
  const [valueData, setValueData] = useState<ValueCirculationData | null>(null);
  const [pointBalance, setPointBalance] = useState(0);
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeature[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  useEffect(() => {
    fetchValueCirculationData();
    fetchPointBalance();
    fetchPremiumFeatures();
    fetchTransactionHistory();
  }, [selectedTimeframe]);

  const fetchValueCirculationData = async () => {
    try {
      const response = await fetch(`/api/dual-value/value-circulation/contribution?timeframe=${selectedTimeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setValueData(data.data);
      }
    } catch (error) {
      console.error('가치 순환 데이터 조회 실패:', error);
    }
  };

  const fetchPointBalance = async () => {
    try {
      const response = await fetch('/api/dual-value/value-exchange/point-balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPointBalance(data.data.total_points || 0);
      }
    } catch (error) {
      console.error('포인트 잔액 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPremiumFeatures = async () => {
    try {
      const response = await fetch('/api/dual-value/value-exchange/premium-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPremiumFeatures(data.data || []);
      }
    } catch (error) {
      console.error('프리미엄 상태 조회 실패:', error);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch('/api/dual-value/value-exchange/transaction-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactionHistory(data.data || []);
      }
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
    }
  };

  const unlockPremiumFeature = async (featureType: string, pointCost: number) => {
    try {
      const response = await fetch('/api/dual-value/value-exchange/unlock-premium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featureType, pointCost })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchPointBalance();
        fetchPremiumFeatures();
      }
    } catch (error) {
      console.error('프리미엄 기능 잠금 해제 실패:', error);
    }
  };

  const getContributionIcon = (type: string) => {
    switch (type) {
      case 'interpretation': return <Brain className="w-5 h-5" />;
      case 'feedback': return <Heart className="w-5 h-5" />;
      case 'curation': return <Palette className="w-5 h-5" />;
      case 'teaching': return <Users className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getContributionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'interpretation': '작품 해석',
      'feedback': '피드백 제공',
      'curation': '큐레이션',
      'teaching': '교육 활동',
      'learning': '학습 활동',
      'knowledge_synthesis': '지식 종합',
      'point_usage': '포인트 사용',
      'premium_unlock': '프리미엄 잠금해제'
    };
    return labels[type] || type;
  };

  const ContributionCard: React.FC<{ contribution: UserContribution }> = ({ contribution }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {getContributionIcon(contribution.contribution_type)}
          </div>
          <h3 className="font-semibold text-gray-800">
            {getContributionTypeLabel(contribution.contribution_type)}
          </h3>
        </div>
        <span className="text-2xl font-bold text-blue-600">
          {contribution.total_points}P
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">품질 점수</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${contribution.avg_quality * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">{(contribution.avg_quality * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">영향력 점수</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${contribution.avg_impact * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">{(contribution.avg_impact * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">기여 횟수</span>
          <span className="font-medium">{contribution.contribution_count}회</span>
        </div>
      </div>
    </motion.div>
  );

  const PremiumFeatureCard: React.FC<{ 
    title: string;
    description: string;
    pointCost: number;
    featureType: string;
    isUnlocked: boolean;
    expiresAt?: string;
  }> = ({ title, description, pointCost, featureType, isUnlocked, expiresAt }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-6 border ${
        isUnlocked
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isUnlocked ? (
            <Crown className="w-6 h-6 text-yellow-600" />
          ) : (
            <Unlock className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <h3 className={`font-semibold ${isUnlocked ? 'text-yellow-800' : 'text-gray-800'}`}>
              {title}
            </h3>
            {isUnlocked && expiresAt && (
              <div className="flex items-center space-x-1 text-sm text-yellow-600">
                <Clock className="w-4 h-4" />
                <span>만료: {new Date(expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`text-right ${isUnlocked ? 'text-yellow-600' : 'text-gray-600'}`}>
          <div className="text-lg font-bold">{pointCost}P</div>
          <div className="text-sm">
            {isUnlocked ? '잠금해제됨' : '30일'}
          </div>
        </div>
      </div>

      <p className={`text-sm mb-4 ${isUnlocked ? 'text-yellow-700' : 'text-gray-600'}`}>
        {description}
      </p>

      {!isUnlocked && (
        <button
          onClick={() => unlockPremiumFeature(featureType, pointCost)}
          disabled={pointBalance < pointCost}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            pointBalance >= pointCost
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {pointBalance >= pointCost ? '잠금 해제' : '포인트 부족'}
        </button>
      )}
    </motion.div>
  );

  const TransactionItem: React.FC<{ transaction: PointTransaction }> = ({ transaction }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          transaction.transaction_type === 'earned' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {transaction.transaction_type === 'earned' ? 
            <TrendingUp className="w-4 h-4" /> : 
            <ArrowRightLeft className="w-4 h-4" />
          }
        </div>
        <div>
          <div className="font-medium text-gray-800">
            {getContributionTypeLabel(transaction.contribution_type)}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(transaction.recorded_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className={`text-lg font-bold ${
        transaction.transaction_type === 'earned' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.transaction_type === 'earned' ? '+' : ''}{transaction.accumulated_points}P
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">가치 순환 시스템</h1>
        <p className="text-emerald-100 mb-6">
          당신의 기여가 만들어내는 가치의 순환을 확인하세요
        </p>
        
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-3xl font-bold flex items-center justify-center space-x-2">
              <Coins className="w-8 h-8 text-yellow-300" />
              <span>{pointBalance}</span>
            </div>
            <div className="text-sm text-emerald-100">보유 포인트</div>
          </div>
          
          {valueData && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold">{(valueData.valueCirculationScore * 100).toFixed(0)}%</div>
                <div className="text-sm text-emerald-100">가치 순환 점수</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{valueData.impact.people_influenced || 0}</div>
                <div className="text-sm text-emerald-100">영향 받은 사람들</div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* 시간 범위 선택 */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 font-medium">조회 기간:</span>
        {['7', '30', '90', '365'].map((days) => (
          <button
            key={days}
            onClick={() => setSelectedTimeframe(days)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTimeframe === days
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {days === '365' ? '1년' : `${days}일`}
          </button>
        ))}
      </div>

      {/* 기여 활동 요약 */}
      {valueData && valueData.contribution.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">기여 활동 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueData.contribution.map((contribution, index) => (
              <ContributionCard key={index} contribution={contribution} />
            ))}
          </div>
        </div>
      )}

      {/* 영향력 및 학습 네트워크 */}
      {valueData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100"
          >
            <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center space-x-2">
              <Globe className="w-6 h-6" />
              <span>나의 영향력</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-700">영향 받은 사람들</span>
                <span className="text-2xl font-bold text-purple-800">
                  {valueData.impact.people_influenced || 0}명
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700">평균 학습 깊이</span>
                <span className="text-lg font-bold text-purple-800">
                  {((valueData.impact.avg_learning_depth || 0) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700">지식 파생</span>
                <span className="text-lg font-bold text-purple-800">
                  {valueData.impact.knowledge_adoptions || 0}회
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100"
          >
            <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span>학습 네트워크</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">학습 소스</span>
                <span className="text-2xl font-bold text-blue-800">
                  {valueData.learningConnections.learning_sources || 0}명
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">학습 품질</span>
                <span className="text-lg font-bold text-blue-800">
                  {((valueData.learningConnections.avg_learning_received || 0) * 100).toFixed(0)}%
                </span>
              </div>
              {valueData.learningConnections.learning_types && (
                <div>
                  <span className="text-blue-700 text-sm">학습 유형</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {valueData.learningConnections.learning_types.slice(0, 3).map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 프리미엄 기능 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">프리미엄 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PremiumFeatureCard
            title="무제한 작품 감상"
            description="일일 제한 없이 모든 작품을 자유롭게 감상할 수 있습니다."
            pointCost={20}
            featureType="unlimited_access"
            isUnlocked={premiumFeatures.some(f => f.feature_type === 'unlimited_access' && f.is_active)}
            expiresAt={premiumFeatures.find(f => f.feature_type === 'unlimited_access')?.expires_at}
          />
          
          <PremiumFeatureCard
            title="AI 개인 맞춤 추천"
            description="AI가 분석한 개인 맞춤형 작품 및 전시 추천을 받아보세요."
            pointCost={15}
            featureType="ai_recommendations"
            isUnlocked={premiumFeatures.some(f => f.feature_type === 'ai_recommendations' && f.is_active)}
            expiresAt={premiumFeatures.find(f => f.feature_type === 'ai_recommendations')?.expires_at}
          />
          
          <PremiumFeatureCard
            title="전문가 해석 접근"
            description="큐레이터와 예술 전문가들의 심화 해석을 확인할 수 있습니다."
            pointCost={25}
            featureType="expert_interpretations"
            isUnlocked={premiumFeatures.some(f => f.feature_type === 'expert_interpretations' && f.is_active)}
            expiresAt={premiumFeatures.find(f => f.feature_type === 'expert_interpretations')?.expires_at}
          />
          
          <PremiumFeatureCard
            title="고급 분석 도구"
            description="작품 분석을 위한 고급 도구와 비교 기능을 사용할 수 있습니다."
            pointCost={30}
            featureType="advanced_tools"
            isUnlocked={premiumFeatures.some(f => f.feature_type === 'advanced_tools' && f.is_active)}
            expiresAt={premiumFeatures.find(f => f.feature_type === 'advanced_tools')?.expires_at}
          />
          
          <PremiumFeatureCard
            title="우선 피드백"
            description="당신의 해석에 대해 전문가들의 우선 피드백을 받아보세요."
            pointCost={18}
            featureType="priority_feedback"
            isUnlocked={premiumFeatures.some(f => f.feature_type === 'priority_feedback' && f.is_active)}
            expiresAt={premiumFeatures.find(f => f.feature_type === 'priority_feedback')?.expires_at}
          />
          
          <PremiumFeatureCard
            title="특별 전시 초대"
            description="독점 온라인 전시와 아티스트 대화에 초대받을 수 있습니다."
            pointCost={40}
            featureType="exclusive_events"
            isUnlocked={premiumFeatures.some(f => f.feature_type === 'exclusive_events' && f.is_active)}
            expiresAt={premiumFeatures.find(f => f.feature_type === 'exclusive_events')?.expires_at}
          />
        </div>
      </div>

      {/* 거래 내역 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">포인트 거래 내역</h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          {transactionHistory.length > 0 ? (
            <div className="space-y-2">
              {transactionHistory.slice(0, 10).map((transaction, index) => (
                <TransactionItem key={index} transaction={transaction} />
              ))}
              {transactionHistory.length > 10 && (
                <div className="text-center pt-4">
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                    더보기 ({transactionHistory.length - 10}개 더)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 거래 내역이 없습니다.
            </div>
          )}
        </motion.div>
      </div>

      {/* 포인트 획득 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
      >
        <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6" />
          <span>포인트 획득 방법</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-green-800">작품 해석</h4>
            </div>
            <p className="text-sm text-green-600">5-30 포인트</p>
            <p className="text-xs text-green-500">품질에 따라 차등 지급</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-green-800">피드백 제공</h4>
            </div>
            <p className="text-sm text-green-600">1-5 포인트</p>
            <p className="text-xs text-green-500">피드백 품질에 따라</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-green-800">큐레이션</h4>
            </div>
            <p className="text-sm text-green-600">7-15 포인트</p>
            <p className="text-xs text-green-500">경로 생성 시</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">상호 학습</h4>
            </div>
            <p className="text-sm text-green-600">2-8 포인트</p>
            <p className="text-xs text-green-500">교육 활동 참여 시</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ValueCirculationSystem;