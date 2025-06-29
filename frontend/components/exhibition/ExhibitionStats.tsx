'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

interface ExhibitionStatsProps {
  exhibitions: Exhibition[];
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

export default function ExhibitionStats({ exhibitions }: ExhibitionStatsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '3months' | '6months' | 'year'>('all');

  // Filter exhibitions by period
  const filteredExhibitions = exhibitions.filter(exhibition => {
    if (selectedPeriod === 'all') return true;
    
    const now = new Date();
    const exhibitionDate = new Date(exhibition.date);
    const monthsAgo = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
    const cutoffDate = new Date(now.setMonth(now.getMonth() - monthsAgo));
    
    return exhibitionDate >= cutoffDate;
  });

  // Calculate statistics
  const totalInsights = filteredExhibitions.reduce((sum, ex) => sum + ex.insights.length, 0);
  const avgInsightsPerExhibition = filteredExhibitions.length > 0 
    ? (totalInsights / filteredExhibitions.length).toFixed(1) 
    : '0';

  // Emotion distribution data
  const getEmotionDistribution = () => {
    const emotionCounts: Record<string, number> = {};
    
    filteredExhibitions.forEach(exhibition => {
      exhibition.insights.forEach(insight => {
        emotionCounts[insight.emotion] = (emotionCounts[insight.emotion] || 0) + 1;
      });
    });

    const labels = emotions.map(e => e.name);
    const data = emotions.map(e => emotionCounts[e.id] || 0);
    const backgroundColors = emotions.map(e => e.color);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderWidth: 0
      }]
    };
  };

  // Time distribution data
  const getTimeDistribution = () => {
    const hourCounts = new Array(24).fill(0);
    
    filteredExhibitions.forEach(exhibition => {
      exhibition.insights.forEach(insight => {
        const hour = new Date(insight.timestamp).getHours();
        hourCounts[hour]++;
      });
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}시`),
      datasets: [{
        label: '인사이트 작성 시간',
        data: hourCounts,
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2
      }]
    };
  };

  // Monthly trend data
  const getMonthlyTrend = () => {
    const monthlyData: Record<string, number> = {};
    
    filteredExhibitions.forEach(exhibition => {
      const monthKey = new Date(exhibition.date).toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exhibition.insights.length;
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedMonths,
      datasets: [{
        label: '월별 인사이트',
        data: sortedMonths.map(month => monthlyData[month]),
        fill: true,
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 1)',
        tension: 0.4
      }]
    };
  };

  // Most emotional exhibitions
  const getMostEmotionalExhibitions = () => {
    return filteredExhibitions
      .map(ex => ({
        name: ex.name,
        insightCount: ex.insights.length,
        venue: ex.venue,
        date: ex.date
      }))
      .sort((a, b) => b.insightCount - a.insightCount)
      .slice(0, 5);
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex justify-center gap-4">
        {(['all', '3months', '6months', 'year'] as const).map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedPeriod === period
                ? 'bg-white text-purple-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {period === 'all' ? '전체' : 
             period === '3months' ? '3개월' :
             period === '6months' ? '6개월' : '1년'}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {filteredExhibitions.length}
          </div>
          <div className="text-white/80">전시 관람</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {totalInsights}
          </div>
          <div className="text-white/80">총 인사이트</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {avgInsightsPerExhibition}
          </div>
          <div className="text-white/80">평균 인사이트</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {(() => {
              const uniqueVenues = new Set(filteredExhibitions.map(ex => ex.venue));
              return uniqueVenues.size;
            })()}
          </div>
          <div className="text-white/80">방문 장소</div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emotion Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">감정 분포</h3>
          <div className="h-80">
            <Doughnut 
              data={getEmotionDistribution()} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      color: 'white',
                      padding: 20,
                      font: {
                        size: 12
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Time Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">시간대별 활동</h3>
          <div className="h-80">
            <Bar 
              data={getTimeDistribution()} 
              options={{
                ...chartOptions,
                scales: {
                  x: {
                    ticks: {
                      color: 'white',
                      maxRotation: 45,
                      minRotation: 45
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  y: {
                    ticks: {
                      color: 'white'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-xl font-bold text-white mb-4">월별 추이</h3>
          <div className="h-80">
            <Line 
              data={getMonthlyTrend()} 
              options={{
                ...chartOptions,
                scales: {
                  x: {
                    ticks: {
                      color: 'white'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  y: {
                    ticks: {
                      color: 'white'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }} 
            />
          </div>
        </motion.div>
      </div>

      {/* Top Exhibitions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">가장 많은 감동을 준 전시</h3>
        <div className="space-y-3">
          {getMostEmotionalExhibitions().map((exhibition, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white/5 rounded-lg p-4"
            >
              <div>
                <div className="font-semibold text-white">{exhibition.name}</div>
                <div className="text-sm text-white/60">
                  {exhibition.venue} • {new Date(exhibition.date).toLocaleDateString('ko-KR')}
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {exhibition.insightCount}
                <span className="text-sm font-normal text-white/60 ml-1">인사이트</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}