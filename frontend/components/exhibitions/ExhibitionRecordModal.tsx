'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Users, Camera, Edit3, Save } from 'lucide-react';

interface ExhibitionRecordModalProps {
  exhibition: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: any) => void;
}

export default function ExhibitionRecordModal({ exhibition, isOpen, onClose, onSave }: ExhibitionRecordModalProps) {
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(0);
  const [companions, setCompanions] = useState('');
  const [notes, setNotes] = useState('');
  const [artworks, setArtworks] = useState<Array<{ title: string; artist: string; notes: string }>>([]);
  const [newArtwork, setNewArtwork] = useState({ title: '', artist: '', notes: '' });

  const handleSave = () => {
    const record = {
      exhibitionId: exhibition.id,
      exhibitionTitle: exhibition.title_local || exhibition.title,
      exhibitionVenue: exhibition.venue,
      visitDate,
      rating,
      companions,
      notes,
      artworks,
      createdAt: new Date().toISOString()
    };
    
    onSave(record);
    onClose();
    
    // Reset form
    setRating(0);
    setCompanions('');
    setNotes('');
    setArtworks([]);
    setNewArtwork({ title: '', artist: '', notes: '' });
  };

  const addArtwork = () => {
    if (newArtwork.title && newArtwork.artist) {
      setArtworks([...artworks, newArtwork]);
      setNewArtwork({ title: '', artist: '', notes: '' });
    }
  };

  const removeArtwork = (index: number) => {
    setArtworks(artworks.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">전시 기록하기</h2>
            
            <div className="space-y-6">
              {/* Exhibition Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {exhibition.title_local || exhibition.title}
                </h3>
                <p className="text-gray-400 text-sm">{exhibition.venue}</p>
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  방문 날짜
                </label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Star className="w-4 h-4 inline mr-2" />
                  평점
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className="p-2 transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          value <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Companions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  함께한 사람
                </label>
                <input
                  type="text"
                  value={companions}
                  onChange={(e) => setCompanions(e.target.value)}
                  placeholder="가족, 친구, 혼자 등"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Artworks */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Camera className="w-4 h-4 inline mr-2" />
                  인상 깊었던 작품
                </label>
                <div className="space-y-2 mb-3">
                  {artworks.map((artwork, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                      <div>
                        <p className="text-white font-medium">{artwork.title}</p>
                        <p className="text-gray-400 text-sm">{artwork.artist}</p>
                        {artwork.notes && (
                          <p className="text-gray-500 text-xs mt-1">{artwork.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeArtwork(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newArtwork.title}
                    onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                    placeholder="작품명"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={newArtwork.artist}
                    onChange={(e) => setNewArtwork({ ...newArtwork, artist: e.target.value })}
                    placeholder="작가명"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={addArtwork}
                    className="w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
                  >
                    작품 추가
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Edit3 className="w-4 h-4 inline mr-2" />
                  감상 노트
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="전시에 대한 감상을 자유롭게 적어주세요"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  저장하기
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}