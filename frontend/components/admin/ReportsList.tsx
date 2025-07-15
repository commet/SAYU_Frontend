'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Calendar,
  MapPin,
  User,
  Flag,
  MessageSquare
} from 'lucide-react';

interface Report {
  id: string;
  reason: string;
  description: string;
  reporter_name?: string;
  reporter_email?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  handled_at?: string;
  handled_by?: string;
  admin_notes?: string;
  exhibitions: {
    id: string;
    title: string;
    venue_name: string;
    venue_city: string;
  };
}

interface ReportsListProps {
  onUpdate: () => void;
}

export function ReportsList({ onUpdate }: ReportsListProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [currentPage, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolved' | 'dismissed', notes?: string) => {
    try {
      setProcessing(reportId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/${reportId}/handle`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action, notes })
        }
      );

      if (response.ok) {
        await fetchReports();
        onUpdate();
        setSelectedReport(null);
        alert(`신고가 ${action === 'resolved' ? '해결' : '무시'} 처리되었습니다.`);
      } else {
        alert('처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Report action error:', error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'dismissed': return 'text-gray-400 bg-gray-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return CheckCircle;
      case 'dismissed': return XCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return '해결됨';
      case 'dismissed': return '무시됨';
      case 'pending': return '대기 중';
      default: return '알 수 없음';
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'inappropriate_content': return '부적절한 내용';
      case 'false_information': return '잘못된 정보';
      case 'copyright_violation': return '저작권 침해';
      case 'spam': return '스팸';
      case 'other': return '기타';
      default: return reason;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">신고 처리</h2>
            <p className="text-gray-400">사용자 신고를 검토하고 처리하세요</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-400">처리 대기</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기 중</option>
            <option value="resolved">해결됨</option>
            <option value="dismissed">무시됨</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
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
      ) : reports.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 text-lg mb-2">신고가 없습니다</div>
          <p className="text-gray-500">현재 필터 조건에 맞는 신고가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="space-y-4">
            {reports.map((report) => {
              const StatusIcon = getStatusIcon(report.status);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-full ${getStatusColor(report.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-medium">
                              {getReasonLabel(report.reason)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">
                            {report.exhibitions.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {report.exhibitions.venue_name}, {report.exhibitions.venue_city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(report.created_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-300 text-sm mb-2">신고 내용:</p>
                        <p className="text-white bg-white/5 rounded-lg p-3 text-sm">
                          {report.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                        {report.reporter_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.reporter_name}
                          </span>
                        )}
                        {report.reporter_email && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {report.reporter_email}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                        
                        {report.handled_at && (
                          <span className="text-gray-400 text-sm">
                            처리일: {new Date(report.handled_at).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>

                      {report.admin_notes && (
                        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-blue-300 text-sm font-medium mb-1">관리자 메모:</p>
                          <p className="text-blue-100 text-sm">{report.admin_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        상세보기
                      </button>
                      
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReportAction(report.id, 'resolved', '신고가 해결되었습니다.')}
                            disabled={processing === report.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            해결
                          </button>
                          <button
                            onClick={() => handleReportAction(report.id, 'dismissed', '검토 결과 문제 없음')}
                            disabled={processing === report.id}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            무시
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

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onAction={handleReportAction}
          processing={processing === selectedReport.id}
        />
      )}
    </div>
  );
}

// Report Detail Modal Component
function ReportDetailModal({ 
  report, 
  onClose, 
  onAction, 
  processing 
}: { 
  report: Report; 
  onClose: () => void; 
  onAction: (id: string, action: 'resolved' | 'dismissed', notes?: string) => void;
  processing: boolean;
}) {
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [actionType, setActionType] = useState<'resolved' | 'dismissed' | null>(null);

  const handleAction = () => {
    if (actionType) {
      onAction(report.id, actionType, notes || undefined);
      setShowNotesInput(false);
      setActionType(null);
      setNotes('');
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'inappropriate_content': return '부적절한 내용';
      case 'false_information': return '잘못된 정보';
      case 'copyright_violation': return '저작권 침해';
      case 'spam': return '스팸';
      case 'other': return '기타';
      default: return reason;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'dismissed': return 'text-gray-400 bg-gray-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return '해결됨';
      case 'dismissed': return '무시됨';
      case 'pending': return '대기 중';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">신고 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
              {getStatusLabel(report.status)}
            </span>
            <span className="text-red-400 font-medium">
              {getReasonLabel(report.reason)}
            </span>
          </div>

          {/* Exhibition Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">신고된 전시</h3>
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-gray-400 text-sm">전시명</label>
                <p className="text-white font-medium">{report.exhibitions.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">장소</label>
                  <p className="text-white">{report.exhibitions.venue_name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">도시</label>
                  <p className="text-white">{report.exhibitions.venue_city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">신고 내용</h3>
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-gray-400 text-sm">신고 사유</label>
                <p className="text-white font-medium">{getReasonLabel(report.reason)}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">상세 설명</label>
                <p className="text-white bg-white/5 rounded-lg p-3">{report.description}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">신고일</label>
                <p className="text-white">{new Date(report.created_at).toLocaleString('ko-KR')}</p>
              </div>
            </div>
          </div>

          {/* Reporter Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">신고자 정보</h3>
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-gray-400 text-sm">이름</label>
                <p className="text-white">{report.reporter_name || '익명'}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">이메일</label>
                <p className="text-white">{report.reporter_email || '제공되지 않음'}</p>
              </div>
            </div>
          </div>

          {/* Processing History */}
          {report.handled_at && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">처리 내역</h3>
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-gray-400 text-sm">처리일</label>
                  <p className="text-white">{new Date(report.handled_at).toLocaleString('ko-KR')}</p>
                </div>
                {report.admin_notes && (
                  <div>
                    <label className="text-gray-400 text-sm">관리자 메모</label>
                    <p className="text-white bg-white/5 rounded-lg p-3">{report.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {report.status === 'pending' && (
            <div className="space-y-4">
              {showNotesInput && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    처리 메모 (선택사항)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="처리 사유나 메모를 입력하세요..."
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex gap-4">
                {!showNotesInput ? (
                  <>
                    <button
                      onClick={() => {
                        setActionType('resolved');
                        setShowNotesInput(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      해결로 처리
                    </button>
                    <button
                      onClick={() => {
                        setActionType('dismissed');
                        setShowNotesInput(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      무시로 처리
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowNotesInput(false);
                        setActionType(null);
                        setNotes('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleAction}
                      disabled={processing}
                      className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors ${
                        actionType === 'resolved' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      {processing ? '처리 중...' : 
                       actionType === 'resolved' ? '해결 완료' : '무시 처리'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}