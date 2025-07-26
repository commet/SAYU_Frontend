'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Eye, 
  Heart, 
  Star, 
  Users, 
  Lightbulb, 
  TrendingUp, 
  Globe,
  Filter,
  Search,
  Plus,
  ThumbsUp,
  Share2,
  BookOpen
} from 'lucide-react';

interface ArtworkInterpretation {
  id: string;
  artwork_id: string;
  user_id: string;
  nickname: string;
  interpretation_text: string;
  emotional_tags: string[];
  cultural_perspective: string;
  personality_type: string;
  interpretation_quality_score: number;
  novelty_score: number;
  depth_score: number;
  accessibility_score: number;
  feedback_count: number;
  created_at: string;
}

interface CollectiveIntelligenceData {
  summary: {
    interpretation_count: number;
    avg_quality: number;
    avg_novelty: number;
    avg_depth: number;
    cultural_perspectives: string[];
    personality_types_represented: string[];
    community_engagement_count: number;
  };
  interpretations: ArtworkInterpretation[];
  emotionMapping: Array<{
    emotion_category: string;
    intensity_distribution: any;
    sample_size: number;
  }>;
  insights: Array<{
    type: string;
    message: string;
  }>;
}

interface CuratedPath {
  id: string;
  curator_name: string;
  path_title: string;
  path_description: string;
  theme: string;
  emotional_journey: string[];
  difficulty_level: number;
  estimated_duration: number;
  community_rating: number;
  usage_count: number;
  created_at: string;
}

const CollectiveIntelligencePlatform: React.FC = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<string>('');
  const [collectiveData, setCollectiveData] = useState<CollectiveIntelligenceData | null>(null);
  const [curatedPaths, setCuratedPaths] = useState<CuratedPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'interpretations' | 'paths' | 'insights'>('interpretations');
  const [showNewInterpretation, setShowNewInterpretation] = useState(false);
  const [filters, setFilters] = useState({
    culturalPerspective: '',
    personalityType: '',
    qualityThreshold: 0
  });

  // 새 해석 작성 상태
  const [newInterpretation, setNewInterpretation] = useState({
    interpretationText: '',
    emotionalTags: [] as string[],
    culturalPerspective: 'general',
    generationCohort: '90s'
  });

  useEffect(() => {
    if (selectedArtwork) {
      fetchCollectiveData(selectedArtwork);
    }
    fetchCuratedPaths();
  }, [selectedArtwork]);

  const fetchCollectiveData = async (artworkId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dual-value/collective-intelligence/artwork/${artworkId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCollectiveData(data.data);
      }
    } catch (error) {
      console.error('집단 지성 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCuratedPaths = async () => {
    try {
      const response = await fetch('/api/dual-value/collective-intelligence/curated-paths', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCuratedPaths(data.data.paths);
      }
    } catch (error) {
      console.error('큐레이션 경로 조회 실패:', error);
    }
  };

  const submitNewInterpretation = async () => {
    if (!selectedArtwork || !newInterpretation.interpretationText.trim()) return;

    try {
      const response = await fetch('/api/dual-value/collective-intelligence/interpretation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artworkId: selectedArtwork,
          interpretationText: newInterpretation.interpretationText,
          emotionalTags: newInterpretation.emotionalTags,
          culturalPerspective: newInterpretation.culturalPerspective,
          generationCohort: newInterpretation.generationCohort
        })
      });

      if (response.ok) {
        const result = await response.json();
        setShowNewInterpretation(false);
        setNewInterpretation({
          interpretationText: '',
          emotionalTags: [],
          culturalPerspective: 'general',
          generationCohort: '90s'
        });
        
        // 데이터 새로고침
        fetchCollectiveData(selectedArtwork);
        
        // 성공 메시지 표시
        alert(`해석이 성공적으로 기여되었습니다! (품질 점수: ${result.data.qualityScore.toFixed(2)})`);
      }
    } catch (error) {
      console.error('해석 기여 실패:', error);
    }
  };

  const provideFeedback = async (interpretationId: string, feedbackData: any) => {
    try {
      const response = await fetch('/api/dual-value/collective-intelligence/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interpretationId,
          ...feedbackData
        })
      });

      if (response.ok) {
        // 피드백 성공 - UI 업데이트
        fetchCollectiveData(selectedArtwork);
      }
    } catch (error) {
      console.error('피드백 제공 실패:', error);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600 bg-emerald-50';
    if (score >= 0.6) return 'text-blue-600 bg-blue-50';
    if (score >= 0.4) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const InterpretationCard: React.FC<{ interpretation: ArtworkInterpretation }> = ({ interpretation }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {interpretation.nickname[0]}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{interpretation.nickname}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{interpretation.personality_type}</span>
              <span>•</span>
              <span>{interpretation.cultural_perspective}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(interpretation.interpretation_quality_score)}`}>
            품질 {(interpretation.interpretation_quality_score * 100).toFixed(0)}%
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(interpretation.novelty_score)}`}>
            독창성 {(interpretation.novelty_score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{interpretation.interpretation_text}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {interpretation.emotional_tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{interpretation.feedback_count} 피드백</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>깊이 {(interpretation.depth_score * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const feedbackData = {
                feedbackType: 'insightful',
                resonanceScore: 5,
                learningValue: 5,
                perspectiveExpansion: 5,
                comment: '통찰력 있는 해석입니다!'
              };
              provideFeedback(interpretation.id, feedbackData);
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>공감</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>공유</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  const CuratedPathCard: React.FC<{ path: CuratedPath }> = ({ path }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{path.path_title}</h3>
          <p className="text-sm text-gray-600 mb-2">{path.path_description}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>큐레이터: {path.curator_name}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 mb-1">
            {getDifficultyStars(path.difficulty_level)}
          </div>
          <div className="text-sm text-gray-500">{path.estimated_duration}분</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
            {path.theme}
          </span>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{path.usage_count} 사용</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{path.community_rating.toFixed(1)}</span>
        </div>
      </div>

      {path.emotional_journey && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">감정 여정:</div>
          <div className="flex flex-wrap gap-1">
            {path.emotional_journey.slice(0, 4).map((emotion, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs"
              >
                {emotion}
              </span>
            ))}
            {path.emotional_journey.length > 4 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                +{path.emotional_journey.length - 4}개
              </span>
            )}
          </div>
        </div>
      )}

      <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors font-medium">
        경로 체험하기
      </button>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">집단 지성 플랫폼</h1>
        <p className="text-purple-100 mb-6">
          다양한 관점이 만나 만들어내는 예술 해석의 아카이브
        </p>
        
        {/* 작품 검색 */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="작품을 검색하세요..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 placeholder-gray-500"
            value={selectedArtwork}
            onChange={(e) => setSelectedArtwork(e.target.value)}
          />
        </div>
      </motion.div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-4 mb-6">
        {[
          { id: 'interpretations', label: '해석 아카이브', icon: MessageCircle },
          { id: 'paths', label: '큐레이션 경로', icon: BookOpen },
          { id: 'insights', label: '집단 인사이트', icon: Lightbulb }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* 해석 아카이브 탭 */}
      {activeTab === 'interpretations' && (
        <div className="space-y-6">
          {/* 필터 및 새 해석 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filters.culturalPerspective}
                onChange={(e) => setFilters(prev => ({ ...prev, culturalPerspective: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">모든 문화적 관점</option>
                <option value="korean">한국적</option>
                <option value="western">서구적</option>
                <option value="eastern">동양적</option>
                <option value="global">글로벌</option>
              </select>
              <select
                value={filters.personalityType}
                onChange={(e) => setFilters(prev => ({ ...prev, personalityType: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">모든 성격 유형</option>
                <option value="INTJ">INTJ</option>
                <option value="INFP">INFP</option>
                <option value="ENTP">ENTP</option>
                <option value="ISFJ">ISFJ</option>
              </select>
            </div>
            <button
              onClick={() => setShowNewInterpretation(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>새 해석 작성</span>
            </button>
          </div>

          {/* 집단 지성 요약 */}
          {collectiveData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-4">집단 지성 요약</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{collectiveData.summary.interpretation_count}</div>
                  <div className="text-sm text-blue-600">총 해석 수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{(collectiveData.summary.avg_quality * 100).toFixed(0)}%</div>
                  <div className="text-sm text-blue-600">평균 품질</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{collectiveData.summary.cultural_perspectives.length}</div>
                  <div className="text-sm text-blue-600">문화적 관점</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{collectiveData.summary.community_engagement_count}</div>
                  <div className="text-sm text-blue-600">커뮤니티 참여</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 해석 목록 */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : collectiveData?.interpretations ? (
            <div className="space-y-4">
              {collectiveData.interpretations.map((interpretation) => (
                <InterpretationCard key={interpretation.id} interpretation={interpretation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              작품을 선택하여 해석을 확인해보세요
            </div>
          )}
        </div>
      )}

      {/* 큐레이션 경로 탭 */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curatedPaths.map((path) => (
              <CuratedPathCard key={path.id} path={path} />
            ))}
          </div>
        </div>
      )}

      {/* 집단 인사이트 탭 */}
      {activeTab === 'insights' && collectiveData && (
        <div className="space-y-6">
          {collectiveData.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Lightbulb className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-800">{insight.type}</h3>
              </div>
              <p className="text-purple-700">{insight.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* 새 해석 작성 모달 */}
      {showNewInterpretation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">새로운 해석 작성</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">해석 내용</label>
                <textarea
                  value={newInterpretation.interpretationText}
                  onChange={(e) => setNewInterpretation(prev => ({ ...prev, interpretationText: e.target.value }))}
                  placeholder="이 작품에 대한 당신만의 해석을 작성해주세요..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">감정 태그</label>
                <input
                  type="text"
                  placeholder="감정을 쉼표로 구분하여 입력하세요 (예: 경이로움, 평온함, 그리움)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    setNewInterpretation(prev => ({ ...prev, emotionalTags: tags }));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">문화적 관점</label>
                  <select
                    value={newInterpretation.culturalPerspective}
                    onChange={(e) => setNewInterpretation(prev => ({ ...prev, culturalPerspective: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="general">일반적</option>
                    <option value="korean">한국적</option>
                    <option value="western">서구적</option>
                    <option value="eastern">동양적</option>
                    <option value="global">글로벌</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">세대 구분</label>
                  <select
                    value={newInterpretation.generationCohort}
                    onChange={(e) => setNewInterpretation(prev => ({ ...prev, generationCohort: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="90s">90년대</option>
                    <option value="00s">2000년대</option>
                    <option value="10s">2010년대</option>
                    <option value="20s">2020년대</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowNewInterpretation(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={submitNewInterpretation}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-colors font-medium"
              >
                해석 기여하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CollectiveIntelligencePlatform;