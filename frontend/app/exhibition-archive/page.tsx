'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Insight {
  id: string;
  artwork: string;
  emotion: string;
  note: string;
  timestamp: Date;
  colorPalette: string[];
}

interface Exhibition {
  id: string;
  name: string;
  venue: string;
  date: Date;
  insights: Insight[];
}

const emotions = [
  { id: 'joy', emoji: '😊', name: '기쁨', color: '#FFD93D' },
  { id: 'awe', emoji: '😮', name: '경외', color: '#6B5B95' },
  { id: 'peace', emoji: '😌', name: '평온', color: '#88D8B0' },
  { id: 'curiosity', emoji: '🤔', name: '호기심', color: '#FF6F61' },
  { id: 'nostalgia', emoji: '🥺', name: '그리움', color: '#955251' },
  { id: 'inspiration', emoji: '✨', name: '영감', color: '#F7CAC9' },
  { id: 'melancholy', emoji: '😔', name: '우울', color: '#92A8D1' },
  { id: 'confusion', emoji: '😵', name: '혼란', color: '#B565A7' }
];

const colorPalettes = [
  ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
  ['#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6'],
  ['#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFD54F'],
  ['#FF8A65', '#FFAB91', '#FFCC80', '#FFE082', '#FFF59D'],
  ['#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9', '#FAFAFA']
];

export default function ExhibitionArchivePage() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [currentExhibition, setCurrentExhibition] = useState<Exhibition | null>(null);
  const [showNewExhibition, setShowNewExhibition] = useState(false);
  const [showInsightForm, setShowInsightForm] = useState(false);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  
  // Form states
  const [exhibitionName, setExhibitionName] = useState('');
  const [exhibitionVenue, setExhibitionVenue] = useState('');
  const [artworkName, setArtworkName] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [insightNote, setInsightNote] = useState('');
  const [selectedPalette, setSelectedPalette] = useState<string[]>([]);

  useEffect(() => {
    loadExhibitions();
  }, []);

  const loadExhibitions = () => {
    const saved = localStorage.getItem('exhibitions');
    if (saved) {
      const parsedExhibitions = JSON.parse(saved);
      setExhibitions(parsedExhibitions.map((ex: any) => ({
        ...ex,
        date: new Date(ex.date),
        insights: ex.insights.map((ins: any) => ({
          ...ins,
          timestamp: new Date(ins.timestamp)
        }))
      })));
    }
  };

  const saveExhibitions = (updatedExhibitions: Exhibition[]) => {
    localStorage.setItem('exhibitions', JSON.stringify(updatedExhibitions));
    setExhibitions(updatedExhibitions);
  };

  const startNewExhibition = () => {
    if (!exhibitionName || !exhibitionVenue) return;
    
    const newExhibition: Exhibition = {
      id: Date.now().toString(),
      name: exhibitionName,
      venue: exhibitionVenue,
      date: new Date(),
      insights: []
    };
    
    setCurrentExhibition(newExhibition);
    setExhibitionName('');
    setExhibitionVenue('');
    setShowNewExhibition(false);
  };

  const addInsight = () => {
    if (!currentExhibition || !artworkName || !selectedEmotion || !insightNote) return;
    
    const newInsight: Insight = {
      id: Date.now().toString(),
      artwork: artworkName,
      emotion: selectedEmotion,
      note: insightNote,
      timestamp: new Date(),
      colorPalette: selectedPalette.length > 0 ? selectedPalette : colorPalettes[0]
    };
    
    const updatedExhibition = {
      ...currentExhibition,
      insights: [...currentExhibition.insights, newInsight]
    };
    
    setCurrentExhibition(updatedExhibition);
    
    // Reset form
    setArtworkName('');
    setSelectedEmotion('');
    setInsightNote('');
    setSelectedPalette([]);
    setShowInsightForm(false);
  };

  const finishExhibition = () => {
    if (!currentExhibition) return;
    
    const updatedExhibitions = [...exhibitions, currentExhibition];
    saveExhibitions(updatedExhibitions);
    setCurrentExhibition(null);
  };

  const deleteExhibition = (id: string) => {
    const updatedExhibitions = exhibitions.filter(ex => ex.id !== id);
    saveExhibitions(updatedExhibitions);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            전시 아카이브 📚
          </h1>
          <p className="text-xl text-white/80">
            전시 관람 중 느낀 감정과 생각을 기록하세요
          </p>
        </motion.div>

        {/* Current Exhibition Recording */}
        {currentExhibition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentExhibition.name}
                </h2>
                <p className="text-white/80">{currentExhibition.venue}</p>
                <p className="text-white/60 text-sm">{formatDate(currentExhibition.date)}</p>
              </div>
              <button
                onClick={finishExhibition}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                관람 종료
              </button>
            </div>

            {/* Insights List */}
            <div className="space-y-4 mb-6">
              {currentExhibition.insights.map((insight) => {
                const emotion = emotions.find(e => e.id === insight.emotion);
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{emotion?.emoji}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{insight.artwork}</h4>
                        <p className="text-white/80 text-sm mb-2">{insight.note}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                            {insight.colorPalette.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-white/60 text-xs">
                            {new Date(insight.timestamp).toLocaleTimeString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Add Insight Button */}
            <button
              onClick={() => setShowInsightForm(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors"
            >
              + 새로운 인사이트 추가
            </button>
          </motion.div>
        )}

        {/* View Mode Toggle */}
        {!currentExhibition && exhibitions.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-2 rounded-full transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              목록 보기
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-6 py-2 rounded-full transition-all ${
                viewMode === 'stats'
                  ? 'bg-white text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              통계 보기
            </button>
          </div>
        )}

        {/* Past Exhibitions */}
        {!currentExhibition && viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Exhibition Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewExhibition(true)}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-48 flex flex-col items-center justify-center gap-4 hover:bg-white/20 transition-colors"
            >
              <div className="text-5xl">➕</div>
              <p className="text-white font-semibold">새 전시 기록 시작</p>
            </motion.button>

            {/* Exhibition Cards */}
            {exhibitions.map((exhibition) => (
              <motion.div
                key={exhibition.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 cursor-pointer"
                onClick={() => setSelectedExhibition(exhibition)}
              >
                <h3 className="text-xl font-bold text-white mb-2">{exhibition.name}</h3>
                <p className="text-white/80 mb-1">{exhibition.venue}</p>
                <p className="text-white/60 text-sm mb-4">{formatDate(exhibition.date)}</p>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">
                    {exhibition.insights.length}개의 인사이트
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteExhibition(exhibition.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Statistics View */}
        {!currentExhibition && viewMode === 'stats' && exhibitions.length > 0 && (
          <Link href="/exhibition-archive/stats" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 cursor-pointer"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                나의 전시 관람 통계 📊
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{exhibitions.length}</div>
                  <div className="text-white/80">방문한 전시</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    {exhibitions.reduce((sum, ex) => sum + ex.insights.length, 0)}
                  </div>
                  <div className="text-white/80">총 인사이트</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    {(() => {
                      const emotionCounts = exhibitions
                        .flatMap(ex => ex.insights)
                        .reduce((acc, ins) => {
                          acc[ins.emotion] = (acc[ins.emotion] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                      const topEmotion = Object.entries(emotionCounts)
                        .sort(([, a], [, b]) => b - a)[0]?.[0];
                      return emotions.find(e => e.id === topEmotion)?.emoji || '✨';
                    })()}
                  </div>
                  <div className="text-white/80">주요 감정</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    {exhibitions.filter(ex => ex.insights.length >= 5).length}
                  </div>
                  <div className="text-white/80">깊은 관람</div>
                </div>
              </div>
              <p className="text-center text-white/60 mt-6">클릭하여 상세 통계 보기</p>
            </motion.div>
          </Link>
        )}

        {/* Empty State */}
        {!currentExhibition && exhibitions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🖼️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              아직 기록된 전시가 없습니다
            </h2>
            <p className="text-white/80 mb-8">
              전시를 관람하며 느낀 감정과 생각을 기록해보세요
            </p>
            <button
              onClick={() => setShowNewExhibition(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full transition-colors"
            >
              첫 전시 기록 시작하기
            </button>
          </motion.div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {/* New Exhibition Modal */}
          {showNewExhibition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowNewExhibition(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">새 전시 기록</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전시명
                    </label>
                    <input
                      type="text"
                      value={exhibitionName}
                      onChange={(e) => setExhibitionName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="예: 모네와 빛의 정원"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      장소
                    </label>
                    <input
                      type="text"
                      value={exhibitionVenue}
                      onChange={(e) => setExhibitionVenue(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="예: 국립현대미술관"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowNewExhibition(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={startNewExhibition}
                      disabled={!exhibitionName || !exhibitionVenue}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      시작하기
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Add Insight Modal */}
          {showInsightForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowInsightForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">새로운 인사이트</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      작품명
                    </label>
                    <input
                      type="text"
                      value={artworkName}
                      onChange={(e) => setArtworkName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="감상한 작품의 이름을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      느낀 감정
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {emotions.map((emotion) => (
                        <button
                          key={emotion.id}
                          onClick={() => setSelectedEmotion(emotion.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedEmotion === emotion.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{emotion.emoji}</div>
                          <div className="text-sm">{emotion.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      생각과 느낌
                    </label>
                    <textarea
                      value={insightNote}
                      onChange={(e) => setInsightNote(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="이 작품을 보며 떠오른 생각이나 느낌을 자유롭게 적어주세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      색상 팔레트 (선택)
                    </label>
                    <div className="space-y-2">
                      {colorPalettes.map((palette, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPalette(palette)}
                          className={`w-full p-3 rounded-lg border-2 transition-all ${
                            JSON.stringify(selectedPalette) === JSON.stringify(palette)
                              ? 'border-purple-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex gap-2 justify-center">
                            {palette.map((color, colorIdx) => (
                              <div
                                key={colorIdx}
                                className="w-12 h-12 rounded-lg shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowInsightForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={addInsight}
                      disabled={!artworkName || !selectedEmotion || !insightNote}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      저장하기
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Exhibition Detail Modal */}
          {selectedExhibition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedExhibition(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedExhibition.name}
                    </h3>
                    <p className="text-gray-600">{selectedExhibition.venue}</p>
                    <p className="text-gray-500 text-sm">{formatDate(selectedExhibition.date)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedExhibition(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedExhibition.insights.map((insight) => {
                    const emotion = emotions.find(e => e.id === insight.emotion);
                    return (
                      <div
                        key={insight.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{emotion?.emoji}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">{insight.artwork}</h4>
                            <p className="text-gray-600 mb-2">{insight.note}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex gap-1">
                                {insight.colorPalette.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-500 text-xs">
                                {new Date(insight.timestamp).toLocaleString('ko-KR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}