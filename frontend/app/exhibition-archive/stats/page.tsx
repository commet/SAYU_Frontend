'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { exportAllExhibitionsToPDF } from '@/lib/exportPDF';

// Dynamic import for heavy chart component
const ExhibitionStats = lazy(() => import('@/components/exhibition/ExhibitionStats'));

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

export default function ExhibitionStatsPage() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportAllExhibitionsToPDF('ko');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('PDF 내보내기 실패. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  if (exhibitions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">아직 기록된 전시가 없습니다</h1>
          <Link
            href="/exhibition-archive"
            className="text-purple-300 hover:text-purple-200 underline"
          >
            전시 기록 시작하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              나의 전시 관람 통계 📊
            </h1>
            <p className="text-white/80">
              전시를 통해 쌓인 감정과 인사이트를 분석합니다
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/exhibition-archive"
              className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              돌아가기
            </Link>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? '내보내는 중...' : 'PDF로 내보내기'}
            </button>
          </div>
        </motion.div>

        {/* Statistics Component */}
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        }>
          <ExhibitionStats exhibitions={exhibitions} />
        </Suspense>
      </div>
    </div>
  );
}