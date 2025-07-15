'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MapPin,
  Globe,
  DollarSign,
  Image,
  Tag,
  Plus,
  RefreshCw
} from 'lucide-react';

interface Exhibition {
  id: string;
  title: string;
  description?: string;
  venue_name: string;
  venue_city: string;
  venue_address?: string;
  start_date: string;
  end_date: string;
  admission_fee?: number;
  website_url?: string;
  image_url?: string;
  tags?: string[];
  status: 'draft' | 'upcoming' | 'ongoing' | 'ended';
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

interface ExhibitionManagerProps {
  onUpdate: () => void;
}

export function ExhibitionManager({ onUpdate }: ExhibitionManagerProps) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'upcoming' | 'ongoing' | 'ended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchExhibitions();
  }, [currentPage, filterStatus, searchTerm]);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exhibitions?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExhibitions(data.data);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch exhibitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExhibition = async (exhibitionId: string, updateData: Partial<Exhibition>) => {
    try {
      setProcessing(exhibitionId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exhibitions/${exhibitionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );

      if (response.ok) {
        await fetchExhibitions();
        onUpdate();
        setEditingExhibition(null);
        alert('전시가 성공적으로 업데이트되었습니다.');
      } else {
        alert('업데이트 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('업데이트 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteExhibition = async (exhibitionId: string) => {
    if (!confirm('정말로 이 전시를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setProcessing(exhibitionId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exhibitions/${exhibitionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        await fetchExhibitions();
        onUpdate();
        alert('전시가 성공적으로 삭제되었습니다.');
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'text-green-400 bg-green-500/20';
      case 'upcoming': return 'text-blue-400 bg-blue-500/20';
      case 'ended': return 'text-gray-400 bg-gray-500/20';
      case 'draft': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ongoing': return '진행 중';
      case 'upcoming': return '예정';
      case 'ended': return '종료';
      case 'draft': return '임시저장';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">전시 관리</h2>
            <p className="text-gray-400">등록된 전시를 관리하고 수정하세요</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchExhibitions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{exhibitions.length}</div>
              <div className="text-sm text-gray-400">전시 수</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="전시명, 장소, 도시로 검색..."
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
            <option value="ongoing">진행 중</option>
            <option value="upcoming">예정</option>
            <option value="ended">종료</option>
            <option value="draft">임시저장</option>
          </select>
        </div>
      </div>

      {/* Exhibitions List */}
      {loading ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ) : exhibitions.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
          <div className="text-gray-400 text-lg mb-2">전시가 없습니다</div>
          <p className="text-gray-500">현재 필터 조건에 맞는 전시가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="space-y-4">
            {exhibitions.map((exhibition) => (
              <motion.div
                key={exhibition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {exhibition.image_url && (
                        <img
                          src={exhibition.image_url}
                          alt={exhibition.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {exhibition.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {exhibition.venue_name}, {exhibition.venue_city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(exhibition.start_date).toLocaleDateString('ko-KR')} - 
                            {new Date(exhibition.end_date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        조회 {exhibition.view_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">❤</span>
                        좋아요 {exhibition.like_count.toLocaleString()}
                      </span>
                      {exhibition.admission_fee !== undefined && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {exhibition.admission_fee === 0 ? '무료' : `${exhibition.admission_fee.toLocaleString()}원`}
                        </span>
                      )}
                      {exhibition.website_url && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          웹사이트
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exhibition.status)}`}>
                        {getStatusLabel(exhibition.status)}
                      </span>
                      {exhibition.tags && exhibition.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <div className="flex gap-1">
                            {exhibition.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                {tag}
                              </span>
                            ))}
                            {exhibition.tags.length > 3 && (
                              <span className="text-xs text-gray-400">+{exhibition.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedExhibition(exhibition)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </button>
                    <button
                      onClick={() => setEditingExhibition(exhibition)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteExhibition(exhibition.id)}
                      disabled={processing === exhibition.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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

      {/* Exhibition Detail Modal */}
      {selectedExhibition && (
        <ExhibitionDetailModal
          exhibition={selectedExhibition}
          onClose={() => setSelectedExhibition(null)}
        />
      )}

      {/* Exhibition Edit Modal */}
      {editingExhibition && (
        <ExhibitionEditModal
          exhibition={editingExhibition}
          onClose={() => setEditingExhibition(null)}
          onSave={handleUpdateExhibition}
          processing={processing === editingExhibition.id}
        />
      )}
    </div>
  );
}

// Exhibition Detail Modal Component
function ExhibitionDetailModal({ exhibition, onClose }: { exhibition: Exhibition; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">전시 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {exhibition.image_url && (
            <div>
              <img
                src={exhibition.image_url}
                alt={exhibition.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">기본 정보</h3>
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-gray-400 text-sm">전시명</label>
                  <p className="text-white font-medium">{exhibition.title}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">장소</label>
                  <p className="text-white">{exhibition.venue_name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">주소</label>
                  <p className="text-white">{exhibition.venue_address || '정보 없음'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">도시</label>
                  <p className="text-white">{exhibition.venue_city}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">일정 및 요금</h3>
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-gray-400 text-sm">시작일</label>
                  <p className="text-white">{new Date(exhibition.start_date).toLocaleDateString('ko-KR')}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">종료일</label>
                  <p className="text-white">{new Date(exhibition.end_date).toLocaleDateString('ko-KR')}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">입장료</label>
                  <p className="text-white">
                    {exhibition.admission_fee === 0 ? '무료' : 
                     exhibition.admission_fee ? `${exhibition.admission_fee.toLocaleString()}원` : '정보 없음'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">상태</label>
                  <p className="text-white">{getStatusLabel(exhibition.status)}</p>
                </div>
              </div>
            </div>
          </div>

          {exhibition.description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">설명</h3>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white">{exhibition.description}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">통계</h3>
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">조회수</span>
                  <span className="text-white font-medium">{exhibition.view_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">좋아요</span>
                  <span className="text-white font-medium">{exhibition.like_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">등록일</span>
                  <span className="text-white font-medium">
                    {new Date(exhibition.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">수정일</span>
                  <span className="text-white font-medium">
                    {new Date(exhibition.updated_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">링크</h3>
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                {exhibition.website_url ? (
                  <div>
                    <label className="text-gray-400 text-sm">웹사이트</label>
                    <a 
                      href={exhibition.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {exhibition.website_url}
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-400">웹사이트 정보 없음</p>
                )}
              </div>
            </div>
          </div>

          {exhibition.tags && exhibition.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">태그</h3>
              <div className="flex flex-wrap gap-2">
                {exhibition.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Exhibition Edit Modal Component
function ExhibitionEditModal({ 
  exhibition, 
  onClose, 
  onSave, 
  processing 
}: { 
  exhibition: Exhibition; 
  onClose: () => void; 
  onSave: (id: string, data: Partial<Exhibition>) => void;
  processing: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Exhibition>>({
    title: exhibition.title,
    description: exhibition.description || '',
    venue_name: exhibition.venue_name,
    venue_address: exhibition.venue_address || '',
    venue_city: exhibition.venue_city,
    start_date: exhibition.start_date.split('T')[0],
    end_date: exhibition.end_date.split('T')[0],
    admission_fee: exhibition.admission_fee || 0,
    website_url: exhibition.website_url || '',
    image_url: exhibition.image_url || '',
    status: exhibition.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(exhibition.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">전시 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">전시명</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">장소명</label>
              <input
                type="text"
                value={formData.venue_name}
                onChange={(e) => setFormData({...formData, venue_name: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">도시</label>
              <input
                type="text"
                value={formData.venue_city}
                onChange={(e) => setFormData({...formData, venue_city: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">주소</label>
            <input
              type="text"
              value={formData.venue_address}
              onChange={(e) => setFormData({...formData, venue_address: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">시작일</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">종료일</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">입장료 (원)</label>
              <input
                type="number"
                min="0"
                value={formData.admission_fee}
                onChange={(e) => setFormData({...formData, admission_fee: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">상태</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="draft">임시저장</option>
                <option value="upcoming">예정</option>
                <option value="ongoing">진행 중</option>
                <option value="ended">종료</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">웹사이트 URL</label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({...formData, website_url: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">이미지 URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {processing ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'ongoing': return '진행 중';
    case 'upcoming': return '예정';
    case 'ended': return '종료';
    case 'draft': return '임시저장';
    default: return '알 수 없음';
  }
}