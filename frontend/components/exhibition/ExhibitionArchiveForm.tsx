'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, Camera, Clock, Calendar, MapPin, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  liked: boolean;
}

interface ExhibitionArchiveData {
  exhibitionTitle: string;
  museum: string;
  visitDate: string;
  duration: number; // in minutes
  rating: number;
  notes: string;
  artworks: Artwork[];
  photos: number; // for now, just count
}

interface ExhibitionArchiveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExhibitionArchiveData) => void;
  initialData?: Partial<ExhibitionArchiveData>;
}

export default function ExhibitionArchiveForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: ExhibitionArchiveFormProps) {
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState<ExhibitionArchiveData>({
    exhibitionTitle: initialData?.exhibitionTitle || '',
    museum: initialData?.museum || '',
    visitDate: initialData?.visitDate || new Date().toISOString().split('T')[0],
    duration: initialData?.duration || 60,
    rating: initialData?.rating || 5,
    notes: initialData?.notes || '',
    artworks: initialData?.artworks || [],
    photos: initialData?.photos || 0
  });

  const [newArtwork, setNewArtwork] = useState({ title: '', artist: '' });

  const handleSave = () => {
    if (!formData.exhibitionTitle || !formData.museum) {
      alert(language === 'ko' ? '전시명과 미술관명을 입력해주세요.' : 'Please fill in exhibition title and museum.');
      return;
    }
    onSave(formData);
    onClose();
  };

  const addArtwork = () => {
    if (newArtwork.title && newArtwork.artist) {
      const artwork: Artwork = {
        id: Date.now().toString(),
        title: newArtwork.title,
        artist: newArtwork.artist,
        liked: false
      };
      setFormData(prev => ({
        ...prev,
        artworks: [...prev.artworks, artwork]
      }));
      setNewArtwork({ title: '', artist: '' });
    }
  };

  const removeArtwork = (id: string) => {
    setFormData(prev => ({
      ...prev,
      artworks: prev.artworks.filter(a => a.id !== id)
    }));
  };

  const toggleArtworkLike = (id: string) => {
    setFormData(prev => ({
      ...prev,
      artworks: prev.artworks.map(a => 
        a.id === id ? { ...a, liked: !a.liked } : a
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md rounded-t-2xl p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white">
                {language === 'ko' ? '전시 기록 작성' : 'Create Exhibition Record'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {language === 'ko' 
                ? '곧 AI를 통해 전시 정보 자동 완성, 작품 인식, 감정 분석 등의 기능을 제공할 예정입니다.'
                : 'AI-powered features including auto-completion, artwork recognition, and emotion analysis coming soon.'
              }
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {language === 'ko' ? '전시명' : 'Exhibition Title'} *
                </label>
                <input
                  type="text"
                  value={formData.exhibitionTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, exhibitionTitle: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder={language === 'ko' ? '전시명을 입력하세요' : 'Enter exhibition title'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {language === 'ko' ? '미술관/갤러리' : 'Museum/Gallery'} *
                </label>
                <input
                  type="text"
                  value={formData.museum}
                  onChange={(e) => setFormData(prev => ({ ...prev, museum: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  placeholder={language === 'ko' ? '미술관명을 입력하세요' : 'Enter museum name'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {language === 'ko' ? '관람일' : 'Visit Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {language === 'ko' ? '관람시간 (분)' : 'Duration (minutes)'}
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                {language === 'ko' ? '별점' : 'Rating'}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Artworks */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                <Heart className="w-4 h-4 inline mr-1" />
                {language === 'ko' ? '인상 깊은 작품들' : 'Memorable Artworks'}
              </label>
              
              {/* Add new artwork */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder={language === 'ko' ? '작품명' : 'Artwork title'}
                    value={newArtwork.title}
                    onChange={(e) => setNewArtwork(prev => ({ ...prev, title: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder={language === 'ko' ? '작가명' : 'Artist name'}
                    value={newArtwork.artist}
                    onChange={(e) => setNewArtwork(prev => ({ ...prev, artist: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={addArtwork}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'ko' ? '추가' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Artwork list */}
              {formData.artworks.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.artworks.map((artwork) => (
                    <div 
                      key={artwork.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        artwork.liked 
                          ? 'bg-pink-500/20 border-pink-500/30' 
                          : 'bg-gray-800/50 border-gray-600'
                      }`}
                    >
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          artwork.liked 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {artwork.title[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{artwork.title}</div>
                        <div className="text-gray-400 text-xs">{artwork.artist}</div>
                      </div>
                      <button
                        onClick={() => toggleArtworkLike(artwork.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          artwork.liked ? 'text-pink-400 hover:bg-pink-500/20' : 'text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${artwork.liked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => removeArtwork(artwork.id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {language === 'ko' ? '관람 소감' : 'Visit Notes'}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none text-sm sm:text-base"
                placeholder={language === 'ko' 
                  ? '이번 전시에서 느낀 점이나 인상 깊었던 순간을 적어보세요...' 
                  : 'Write about your thoughts and memorable moments from this exhibition...'
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-md rounded-b-2xl p-6 border-t border-gray-700">
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
              >
                {language === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all shadow-lg"
              >
                {language === 'ko' ? '저장하기' : 'Save Record'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}