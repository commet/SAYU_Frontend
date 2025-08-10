'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Star,
  Bug,
  Lightbulb,
  FileText,
  Filter,
  Search,
  Calendar,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Download
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  user_id?: string;
  type: 'rating' | 'suggestion' | 'bug' | 'general';
  rating?: number;
  message: string;
  email?: string;
  context: any;
  user_agent: string;
  url: string;
  client_ip: string;
  status: 'new' | 'in_review' | 'resolved' | 'dismissed';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    username?: string;
    email?: string;
  };
  reviewer?: {
    username?: string;
    email?: string;
  };
}

interface FeedbackStats {
  total: number;
  new: number;
  in_review: number;
  resolved: number;
  dismissed: number;
  rating: {
    average: number;
    distribution: Record<number, number>;
  };
}

export function FeedbackManager() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...filters
      });

      const response = await fetch(`/api/admin/feedback?${params}`);
      const result = await response.json();

      if (result.success) {
        setFeedback(result.data);
        setPagination(result.pagination);
        
        // Calculate stats
        const newStats = calculateStats(result.data);
        setStats(newStats);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy, sortOrder]);

  const calculateStats = (data: FeedbackItem[]): FeedbackStats => {
    const stats = {
      total: data.length,
      new: 0,
      in_review: 0,
      resolved: 0,
      dismissed: 0,
      rating: {
        average: 0,
        distribution: {} as Record<number, number>
      }
    };

    let ratingSum = 0;
    let ratingCount = 0;

    data.forEach(item => {
      stats[item.status]++;
      
      if (item.rating) {
        ratingSum += item.rating;
        ratingCount++;
        stats.rating.distribution[item.rating] = (stats.rating.distribution[item.rating] || 0) + 1;
      }
    });

    if (ratingCount > 0) {
      stats.rating.average = ratingSum / ratingCount;
    }

    return stats;
  };

  const updateFeedbackStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status, adminNotes }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchFeedback(); // Refresh data
        setShowDetailModal(false);
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Failed to update feedback:', error);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rating': return <Star className="w-4 h-4" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4" />;
      case 'bug': return <Bug className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="w-3 h-3" />;
      case 'in_review': return <Clock className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'dismissed': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-white">피드백 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">전체 피드백</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">처리 대기</p>
                <p className="text-2xl font-bold text-white">{stats.new + stats.in_review}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">해결됨</p>
                <p className="text-2xl font-bold text-white">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">평균 평점</p>
                <p className="text-2xl font-bold text-white">
                  {stats.rating.average ? stats.rating.average.toFixed(1) : 'N/A'}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">유형</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="rating">평점</option>
              <option value="suggestion">제안</option>
              <option value="bug">버그</option>
              <option value="general">일반</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">상태</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="new">신규</option>
              <option value="in_review">검토 중</option>
              <option value="resolved">해결됨</option>
              <option value="dismissed">기각됨</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="메시지 또는 이메일 검색"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">시작 날짜</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">종료 날짜</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">피드백 목록</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              내보내기
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  메시지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {feedback.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">
                        {getTypeIcon(item.type)}
                      </span>
                      <span className="text-sm text-gray-300 capitalize">
                        {item.type}
                      </span>
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-300">{item.rating}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white truncate max-w-xs">
                      {item.message}
                    </p>
                    {item.email && (
                      <p className="text-xs text-gray-400 mt-1">{item.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {item.user?.username || '익명'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedFeedback(item);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              {pagination.total}개 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded transition-colors"
              >
                이전
              </button>
              <span className="px-3 py-1 text-sm text-gray-300">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      피드백 상세 정보
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedFeedback.status)}`}>
                        {getStatusIcon(selectedFeedback.status)}
                        {selectedFeedback.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(selectedFeedback.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">유형</label>
                      <div className="flex items-center gap-2 text-white">
                        {getTypeIcon(selectedFeedback.type)}
                        <span className="capitalize">{selectedFeedback.type}</span>
                      </div>
                    </div>
                    {selectedFeedback.rating && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">평점</label>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < selectedFeedback.rating!
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-white">{selectedFeedback.rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">메시지</label>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white whitespace-pre-wrap">{selectedFeedback.message}</p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">사용자</label>
                      <p className="text-white">{selectedFeedback.user?.username || '익명 사용자'}</p>
                    </div>
                    {selectedFeedback.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
                        <p className="text-white">{selectedFeedback.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Context */}
                  {selectedFeedback.context && Object.keys(selectedFeedback.context).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">컨텍스트</label>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <pre className="text-sm text-gray-300">
                          {JSON.stringify(selectedFeedback.context, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Technical Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                      <p className="text-sm text-gray-400 break-all">{selectedFeedback.url}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">User Agent</label>
                      <p className="text-sm text-gray-400 break-all">{selectedFeedback.user_agent}</p>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">관리자 노트</label>
                    <textarea
                      placeholder="관리자 노트를 입력하세요..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      defaultValue={selectedFeedback.admin_notes || ''}
                      id="admin-notes"
                    />
                  </div>

                  {/* Status Actions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">상태 변경</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                          updateFeedbackStatus(selectedFeedback.id, 'in_review', notes);
                        }}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                      >
                        검토 중으로 변경
                      </button>
                      <button
                        onClick={() => {
                          const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                          updateFeedbackStatus(selectedFeedback.id, 'resolved', notes);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        해결됨으로 변경
                      </button>
                      <button
                        onClick={() => {
                          const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                          updateFeedbackStatus(selectedFeedback.id, 'dismissed', notes);
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        기각
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}