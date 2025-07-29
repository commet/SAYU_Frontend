'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Download
} from 'lucide-react';

import { SubmissionsList } from './SubmissionsList';
import { DashboardStats } from './DashboardStats';
import { ReportsList } from './ReportsList';
import { ExhibitionManager } from './ExhibitionManager';

interface DashboardData {
  submissions: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  exhibitions: {
    draft: number;
    upcoming: number;
    ongoing: number;
    ended: number;
    total: number;
  };
  recentActivity: any[];
  monthlyStats: any;
}

type ActiveTab = 'overview' | 'submissions' | 'exhibitions' | 'reports' | 'settings';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: '대시보드', icon: BarChart3 },
    { id: 'submissions', label: '제출 검토', icon: FileText },
    { id: 'exhibitions', label: '전시 관리', icon: Eye },
    { id: 'reports', label: '신고 처리', icon: AlertTriangle },
    { id: 'settings', label: '설정', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">대시보드 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SAYU 관리자 대시보드</h1>
              <p className="text-gray-400 text-sm">전시 시스템 관리 및 모니터링</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                새로고침
              </button>
              
              <div className="text-right">
                <div className="text-white text-sm font-medium">관리자</div>
                <div className="text-gray-400 text-xs">
                  마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      
                      {/* 알림 배지 */}
                      {tab.id === 'submissions' && dashboardData?.submissions?.pending && dashboardData.submissions.pending > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {dashboardData.submissions.pending}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Quick Stats */}
            {dashboardData && (
              <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-4">빠른 통계</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">대기 중인 제출</span>
                    <span className="text-yellow-400 font-bold">
                      {dashboardData.submissions.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">활성 전시</span>
                    <span className="text-green-400 font-bold">
                      {dashboardData.exhibitions.ongoing}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">전체 전시</span>
                    <span className="text-blue-400 font-bold">
                      {dashboardData.exhibitions.total}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <DashboardStats data={dashboardData} onRefresh={fetchDashboardData} />
              )}
              
              {activeTab === 'submissions' && (
                <SubmissionsList onUpdate={fetchDashboardData} />
              )}
              
              {activeTab === 'exhibitions' && (
                <ExhibitionManager onUpdate={fetchDashboardData} />
              )}
              
              {activeTab === 'reports' && (
                <ReportsList onUpdate={fetchDashboardData} />
              )}
              
              {activeTab === 'settings' && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6">시스템 설정</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">캐시 관리</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        시스템 캐시를 관리하고 성능을 최적화합니다.
                      </p>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        캐시 초기화
                      </button>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">데이터 백업</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        전시 데이터를 백업하고 복원합니다.
                      </p>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        백업 생성
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}