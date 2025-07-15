'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Calendar,
  MapPin,
  User,
  Mail,
  Building,
  ChevronRight
} from 'lucide-react';

interface Submission {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitter_name: string;
  submitter_email: string;
  organization?: string;
  created_at: string;
  exhibitions: {
    id: string;
    title: string;
    venue_name: string;
    venue_city: string;
    start_date: string;
    end_date: string;
    description?: string;
  };
}

interface SubmissionsListProps {
  onUpdate: () => void;
}

export function SubmissionsList({ onUpdate }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, filterStatus, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: filterStatus,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exhibitions/submissions?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (submissionId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      setProcessing(submissionId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exhibitions/submissions/${submissionId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reviewNotes: notes })
        }
      );

      if (response.ok) {
        await fetchSubmissions();
        onUpdate();
        setSelectedSubmission(null);
      } else {
        alert('처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Status change error:', error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return '승인';
      case 'rejected': return '거부';
      case 'pending': return '대기';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">제출 검토</h2>
            <p className="text-gray-400">전시 제출을 검토하고 승인/거부를 처리하세요</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-400">검토 대기</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="제출자, 전시명, 장소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기 중</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거부됨</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
          <div className="text-gray-400 text-lg mb-2">검토할 제출이 없습니다</div>
          <p className="text-gray-500">현재 필터 조건에 맞는 제출이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="space-y-4">
            {submissions.map((submission) => {
              const StatusIcon = getStatusIcon(submission.status);
              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-full ${getStatusColor(submission.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {submission.exhibitions.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {submission.exhibitions.venue_name}, {submission.exhibitions.venue_city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(submission.exhibitions.start_date).toLocaleDateString('ko-KR')} - 
                              {new Date(submission.exhibitions.end_date).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {submission.submitter_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {submission.submitter_email}
                        </span>
                        {submission.organization && (
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {submission.organization}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                          {getStatusLabel(submission.status)}
                        </span>
                        <span className="text-gray-400 text-sm">
                          제출일: {new Date(submission.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        상세보기
                      </button>
                      
                      {submission.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(submission.id, 'approve')}
                            disabled={processing === submission.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            승인
                          </button>
                          <button
                            onClick={() => handleStatusChange(submission.id, 'reject', '검토 후 거부')}
                            disabled={processing === submission.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            거부
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  이전
                </button>
                <span className="px-4 py-2 text-white">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">제출 상세 정보</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Exhibition Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">전시 정보</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">전시명</label>
                    <p className="text-white font-medium">{selectedSubmission.exhibitions.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">장소</label>
                      <p className="text-white">{selectedSubmission.exhibitions.venue_name}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">도시</label>
                      <p className="text-white">{selectedSubmission.exhibitions.venue_city}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">시작일</label>
                      <p className="text-white">
                        {new Date(selectedSubmission.exhibitions.start_date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">종료일</label>
                      <p className="text-white">
                        {new Date(selectedSubmission.exhibitions.end_date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  {selectedSubmission.exhibitions.description && (
                    <div>
                      <label className="text-gray-400 text-sm">설명</label>
                      <p className="text-white">{selectedSubmission.exhibitions.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submitter Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">제출자 정보</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">이름</label>
                    <p className="text-white">{selectedSubmission.submitter_name}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">이메일</label>
                    <p className="text-white">{selectedSubmission.submitter_email}</p>
                  </div>
                  {selectedSubmission.organization && (
                    <div>
                      <label className="text-gray-400 text-sm">소속</label>
                      <p className="text-white">{selectedSubmission.organization}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-gray-400 text-sm">제출일</label>
                    <p className="text-white">
                      {new Date(selectedSubmission.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleStatusChange(selectedSubmission.id, 'approve')}
                    disabled={processing === selectedSubmission.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    승인
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedSubmission.id, 'reject', '검토 후 거부')}
                    disabled={processing === selectedSubmission.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    거부
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}