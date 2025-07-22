'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Exhibition {
  title: string;
  venue: string;
  period: string;
  area?: string;
  url?: string;
  imgUrl?: string;
  price?: string;
  source: 'culture_api' | 'seoul_api' | 'crawl';
  collectedAt: string;
}

interface ExhibitionsResponse {
  success: boolean;
  exhibitions: Exhibition[];
  meta: {
    cultureAPI: number;
    seoulAPI: number;
    crawled: number;
    total: number;
    unique: number;
    collectedAt: string;
  };
  message?: string;
}

export default function LiveExhibitionsWidget() {
  const { language } = useLanguage();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ExhibitionsResponse['meta'] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchExhibitions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/exhibitions/live');
      const data: ExhibitionsResponse = await response.json();

      if (data.success) {
        setExhibitions(data.exhibitions.slice(0, 12)); // 최대 12개만 표시
        setMeta(data.meta);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.message || '전시 정보를 가져올 수 없습니다.');
      }
    } catch (err) {
      console.error('전시 정보 로딩 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const getSourceBadge = (source: Exhibition['source']) => {
    const badges = {
      culture_api: { text: '문화데이터', color: 'bg-blue-500' },
      seoul_api: { text: '서울시', color: 'bg-green-500' },
      crawl: { text: '직접수집', color: 'bg-purple-500' }
    };
    
    const badge = badges[source] || badges.crawl;
    return (
      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatPeriod = (period: string) => {
    // 날짜 형식 정리
    return period.replace(/(\d{4})(\d{2})(\d{2})/g, '$1.$2.$3')
                 .replace(/~/g, ' ~ ');
  };

  if (error && !exhibitions.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <p className="text-red-700 font-medium">
            {language === 'ko' ? '전시 정보 로딩 실패' : 'Failed to load exhibitions'}
          </p>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button
          onClick={fetchExhibitions}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
        >
          {language === 'ko' ? '다시 시도' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-enhanced rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-2xl font-bold">
            {language === 'ko' ? '실시간 전시 정보' : 'Live Exhibitions'}
          </h2>
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        
        <button
          onClick={fetchExhibitions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {language === 'ko' ? '새로고침' : 'Refresh'}
          </span>
        </button>
      </div>

      {/* Stats */}
      {meta && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: '문화데이터광장', value: meta.cultureAPI },
            { label: '서울시 API', value: meta.seoulAPI },
            { label: '직접 수집', value: meta.crawled },
            { label: '총 전시', value: meta.unique },
          ].map((stat, i) => (
            <div key={i} className="text-center p-3 bg-white/20 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">
              {language === 'ko' ? '전시 정보를 가져오는 중...' : 'Loading exhibitions...'}
            </p>
          </div>
        </div>
      )}

      {/* Exhibitions Grid */}
      <AnimatePresence>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exhibitions.map((exhibition, index) => (
            <motion.div
              key={`${exhibition.title}-${exhibition.venue}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/40 backdrop-blur-sm rounded-xl p-4 hover:bg-white/60 transition-all duration-300 hover:shadow-lg"
            >
              {/* Source Badge */}
              <div className="flex justify-between items-start mb-3">
                {getSourceBadge(exhibition.source)}
                {exhibition.url && (
                  <a
                    href={exhibition.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
                {exhibition.title}
              </h3>

              {/* Venue */}
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">{exhibition.venue}</span>
              </div>

              {/* Period */}
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">
                  {formatPeriod(exhibition.period)}
                </span>
              </div>

              {/* Price */}
              {exhibition.price && (
                <div className="text-xs text-purple-600 font-medium">
                  {exhibition.price}
                </div>
              )}

              {/* Area */}
              {exhibition.area && (
                <div className="text-xs text-gray-500 mt-1">
                  📍 {exhibition.area}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200/50">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {language === 'ko' ? '마지막 업데이트' : 'Last updated'}: {' '}
            {lastUpdated.toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US')}
          </span>
        </div>
      )}

      {/* Empty State */}
      {!loading && exhibitions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎨</div>
          <p className="text-gray-600">
            {language === 'ko' 
              ? '현재 표시할 전시 정보가 없습니다.' 
              : 'No exhibitions available at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
}