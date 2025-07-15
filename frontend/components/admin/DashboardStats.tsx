'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';

interface DashboardStatsProps {
  data: {
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
  } | null;
  onRefresh: () => void;
}

export function DashboardStats({ data, onRefresh }: DashboardStatsProps) {
  if (!data) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: '대기 중인 제출',
      value: data.submissions.pending,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      description: '검토 대기 중'
    },
    {
      title: '승인된 제출',
      value: data.submissions.approved,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: '승인 완료'
    },
    {
      title: '활성 전시',
      value: data.exhibitions.ongoing,
      icon: Eye,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: '현재 진행 중'
    },
    {
      title: '전체 전시',
      value: data.exhibitions.total,
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: '총 등록 수'
    }
  ];

  const approvalRate = data.submissions.total > 0 
    ? Math.round((data.submissions.approved / data.submissions.total) * 100)
    : 0;

  const rejectionRate = data.submissions.total > 0 
    ? Math.round((data.submissions.rejected / data.submissions.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">관리자 대시보드</h2>
            <p className="text-gray-400">SAYU 전시 시스템 현황을 한눈에 확인하세요</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{data.submissions.pending}</div>
            <div className="text-sm text-gray-400">검토 대기 중</div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </div>
              </div>
              <div className="text-white font-medium mb-1">{stat.title}</div>
              <div className="text-gray-400 text-sm">{stat.description}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Analysis */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">제출 분석</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">승인률</span>
              <span className="text-green-400 font-bold">{approvalRate}%</span>
            </div>
            
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${approvalRate}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">거부율</span>
              <span className="text-red-400 font-bold">{rejectionRate}%</span>
            </div>
            
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${rejectionRate}%` }}
              ></div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {data.submissions.approved}
                  </div>
                  <div className="text-xs text-gray-400">승인</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">
                    {data.submissions.pending}
                  </div>
                  <div className="text-xs text-gray-400">대기</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">
                    {data.submissions.rejected}
                  </div>
                  <div className="text-xs text-gray-400">거부</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exhibition Status */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">전시 현황</h3>
          
          <div className="space-y-4">
            {[
              { label: '진행 중', value: data.exhibitions.ongoing, color: 'text-green-400' },
              { label: '예정', value: data.exhibitions.upcoming, color: 'text-blue-400' },
              { label: '종료', value: data.exhibitions.ended, color: 'text-gray-400' },
              { label: '임시저장', value: data.exhibitions.draft, color: 'text-yellow-400' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-gray-400">{item.label}</span>
                <span className={`font-bold ${item.color}`}>
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {data.exhibitions.total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">전체 전시 수</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">최근 활동</h3>
        
        {data.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {data.recentActivity.slice(0, 10).map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'approved' ? 'bg-green-500/20' :
                    activity.status === 'rejected' ? 'bg-red-500/20' :
                    'bg-yellow-500/20'
                  }`}>
                    {activity.status === 'approved' ? 
                      <CheckCircle className="w-4 h-4 text-green-400" /> :
                      activity.status === 'rejected' ?
                      <XCircle className="w-4 h-4 text-red-400" /> :
                      <Clock className="w-4 h-4 text-yellow-400" />
                    }
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {activity.exhibitions?.title || 'Unknown Exhibition'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {activity.submitter_name} • {activity.exhibitions?.venue_name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    activity.status === 'approved' ? 'text-green-400' :
                    activity.status === 'rejected' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {activity.status === 'approved' ? '승인' :
                     activity.status === 'rejected' ? '거부' : '대기'}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(activity.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">최근 활동이 없습니다</div>
            <p className="text-gray-500 text-sm">새로운 제출이 있으면 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}