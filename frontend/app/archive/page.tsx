'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  MapPin, 
  Plus, 
  Search, 
  Clock, 
  Heart, 
  Star, 
  Edit3, 
  Save,
  X,
  FileText,
  Calendar,
  Tag,
  Image as ImageIcon,
  Download,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ExhibitionEntry {
  id: string;
  exhibition_name: string;
  venue: string;
  visit_date: string;
  artworks: ArtworkEntry[];
  overall_impression: string;
  mood_tags: string[];
  created_at: string;
}

interface ArtworkEntry {
  id: string;
  title: string;
  artist: string;
  year?: string;
  medium?: string;
  impression: string;
  emotion_rating: number; // 1-5
  technical_rating: number; // 1-5
  image_url?: string;
  created_at: string;
}

export default function ArchivePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { trackExplorationDay, trackExhibitionArchived, trackArtworkDocumented } = useAchievements();
  
  const [currentExhibition, setCurrentExhibition] = useState<ExhibitionEntry | null>(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [savedExhibitions, setSavedExhibitions] = useState<ExhibitionEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'archive'>('current');

  // New exhibition form
  const [exhibitionForm, setExhibitionForm] = useState({
    exhibition_name: '',
    venue: '',
    visit_date: new Date().toISOString().split('T')[0]
  });

  // New artwork form
  const [artworkForm, setArtworkForm] = useState({
    title: '',
    artist: '',
    year: '',
    medium: '',
    impression: '',
    emotion_rating: 3,
    technical_rating: 3
  });

  const [showArtworkForm, setShowArtworkForm] = useState(false);
  const [artworkSuggestions, setArtworkSuggestions] = useState<any[]>([]);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadSavedExhibitions();
      trackExplorationDay();
    }
  }, [user, loading, router, trackExplorationDay]);

  const loadSavedExhibitions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/archive/exhibitions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedExhibitions(data.exhibitions || []);
      }
    } catch (error) {
      console.error('Failed to load exhibitions:', error);
    }
  };

  const startNewExhibition = () => {
    if (currentExhibition) {
      toast.error('Please finish your current exhibition first');
      return;
    }
    setIsCreatingEntry(true);
  };

  const createExhibition = () => {
    if (!exhibitionForm.exhibition_name || !exhibitionForm.venue) {
      toast.error('Please fill in exhibition name and venue');
      return;
    }

    const newExhibition: ExhibitionEntry = {
      id: Date.now().toString(),
      exhibition_name: exhibitionForm.exhibition_name,
      venue: exhibitionForm.venue,
      visit_date: exhibitionForm.visit_date,
      artworks: [],
      overall_impression: '',
      mood_tags: [],
      created_at: new Date().toISOString()
    };

    setCurrentExhibition(newExhibition);
    setIsCreatingEntry(false);
    setExhibitionForm({ exhibition_name: '', venue: '', visit_date: new Date().toISOString().split('T')[0] });
    toast.success('Exhibition started! Start adding artworks.');
  };

  const searchArtworkSuggestions = async (query: string) => {
    if (query.length < 3) {
      setArtworkSuggestions([]);
      return;
    }

    try {
      // Search Met Museum API for artwork suggestions
      const searchResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true`
      );
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const objectIDs = searchData.objectIDs?.slice(0, 5) || [];
        
        const suggestions = [];
        for (const id of objectIDs) {
          try {
            const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            const artwork = await response.json();
            
            if (artwork.title && artwork.artistDisplayName && artwork.isPublicDomain) {
              suggestions.push({
                title: artwork.title,
                artist: artwork.artistDisplayName,
                year: artwork.objectDate,
                medium: artwork.medium,
                imageUrl: artwork.primaryImageSmall
              });
            }
          } catch (e) {
            continue;
          }
          
          if (suggestions.length >= 3) break;
        }
        
        setArtworkSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Failed to search artworks:', error);
    }
  };

  const addArtworkToExhibition = () => {
    if (!artworkForm.title || !artworkForm.artist || !artworkForm.impression) {
      toast.error('Please fill in title, artist, and your impression');
      return;
    }

    if (!currentExhibition) return;

    const newArtwork: ArtworkEntry = {
      id: Date.now().toString(),
      title: artworkForm.title,
      artist: artworkForm.artist,
      year: artworkForm.year,
      medium: artworkForm.medium,
      impression: artworkForm.impression,
      emotion_rating: artworkForm.emotion_rating,
      technical_rating: artworkForm.technical_rating,
      created_at: new Date().toISOString()
    };

    setCurrentExhibition({
      ...currentExhibition,
      artworks: [...currentExhibition.artworks, newArtwork]
    });

    setArtworkForm({
      title: '',
      artist: '',
      year: '',
      medium: '',
      impression: '',
      emotion_rating: 3,
      technical_rating: 3
    });
    
    setShowArtworkForm(false);
    setArtworkSuggestions([]);
    toast.success('Artwork added to your exhibition!');
  };

  const finishExhibition = async () => {
    if (!currentExhibition) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/archive/exhibitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentExhibition)
      });

      if (response.ok) {
        setSavedExhibitions([currentExhibition, ...savedExhibitions]);
        
        // Track achievements
        trackExhibitionArchived();
        if (currentExhibition.artworks.length > 0) {
          trackArtworkDocumented(currentExhibition.artworks.length);
        }
        
        setCurrentExhibition(null);
        toast.success('Exhibition archived successfully!');
        setActiveTab('archive');
      } else {
        toast.error('Failed to save exhibition');
      }
    } catch (error) {
      console.error('Failed to save exhibition:', error);
      toast.error('Failed to save exhibition');
    }
  };

  const generateReport = async (exhibitionId: string) => {
    setGeneratingReport(exhibitionId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/exhibition/${exhibitionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Exhibition report generated successfully!');
        
        // Navigate to the report page or show report inline
        router.push(`/reports/${data.report.id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      {/* Header */}
      <header className="p-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Exhibition Archive</h1>
              <p className="text-gray-400">Capture your museum experiences in real-time</p>
            </div>
            <Button onClick={() => router.push('/journey')} variant="ghost" className="text-gray-400">
              Back to Journey
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'current'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Camera className="w-4 h-4 inline mr-2" />
            Current Visit
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex-1 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'archive'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Archive ({savedExhibitions.length})
          </button>
        </div>

        {/* Current Visit Tab */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            {!currentExhibition && !isCreatingEntry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Start Your Exhibition Visit</h2>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Capture your thoughts and impressions as you explore artworks. 
                  Build a personal archive of your museum experiences.
                </p>
                <Button onClick={startNewExhibition} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Visit
                </Button>
              </motion.div>
            )}

            {/* Create Exhibition Form */}
            {isCreatingEntry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4">Exhibition Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Exhibition Name *
                    </label>
                    <input
                      type="text"
                      value={exhibitionForm.exhibition_name}
                      onChange={(e) => setExhibitionForm({...exhibitionForm, exhibition_name: e.target.value})}
                      placeholder="e.g., Van Gogh: The Immersive Experience"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Venue *
                    </label>
                    <input
                      type="text"
                      value={exhibitionForm.venue}
                      onChange={(e) => setExhibitionForm({...exhibitionForm, venue: e.target.value})}
                      placeholder="e.g., Metropolitan Museum of Art"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Visit Date
                    </label>
                    <input
                      type="date"
                      value={exhibitionForm.visit_date}
                      onChange={(e) => setExhibitionForm({...exhibitionForm, visit_date: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={createExhibition} className="bg-purple-600 hover:bg-purple-700">
                      Start Visit
                    </Button>
                    <Button onClick={() => setIsCreatingEntry(false)} variant="outline" className="border-gray-600 text-gray-400">
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Current Exhibition */}
            {currentExhibition && (
              <div className="space-y-6">
                {/* Exhibition Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{currentExhibition.exhibition_name}</h2>
                      <div className="flex items-center gap-4 text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {currentExhibition.venue}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {currentExhibition.visit_date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">{currentExhibition.artworks.length}</div>
                      <div className="text-sm text-gray-400">artworks</div>
                    </div>
                  </div>
                </motion.div>

                {/* Add Artwork Button */}
                {!showArtworkForm && (
                  <Button 
                    onClick={() => setShowArtworkForm(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 py-4"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Artwork Impression
                  </Button>
                )}

                {/* Artwork Form */}
                {showArtworkForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Add Artwork</h3>
                      <Button 
                        onClick={() => {
                          setShowArtworkForm(false);
                          setArtworkSuggestions([]);
                        }}
                        variant="ghost" 
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Artwork Title *
                        </label>
                        <input
                          type="text"
                          value={artworkForm.title}
                          onChange={(e) => {
                            setArtworkForm({...artworkForm, title: e.target.value});
                            searchArtworkSuggestions(e.target.value);
                          }}
                          placeholder="Start typing artwork title..."
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                        
                        {/* Artwork Suggestions */}
                        {artworkSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {artworkSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setArtworkForm({
                                    ...artworkForm,
                                    title: suggestion.title,
                                    artist: suggestion.artist,
                                    year: suggestion.year || '',
                                    medium: suggestion.medium || ''
                                  });
                                  setArtworkSuggestions([]);
                                }}
                                className="w-full p-3 text-left hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  {suggestion.imageUrl && (
                                    <div className="w-12 h-12 relative rounded overflow-hidden">
                                      <Image
                                        src={suggestion.imageUrl}
                                        alt={suggestion.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-white font-medium">{suggestion.title}</div>
                                    <div className="text-gray-400 text-sm">{suggestion.artist}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Artist *
                        </label>
                        <input
                          type="text"
                          value={artworkForm.artist}
                          onChange={(e) => setArtworkForm({...artworkForm, artist: e.target.value})}
                          placeholder="Artist name"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Year
                          </label>
                          <input
                            type="text"
                            value={artworkForm.year}
                            onChange={(e) => setArtworkForm({...artworkForm, year: e.target.value})}
                            placeholder="e.g., 1889"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Medium
                          </label>
                          <input
                            type="text"
                            value={artworkForm.medium}
                            onChange={(e) => setArtworkForm({...artworkForm, medium: e.target.value})}
                            placeholder="e.g., Oil on canvas"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Your Impression *
                        </label>
                        <textarea
                          value={artworkForm.impression}
                          onChange={(e) => setArtworkForm({...artworkForm, impression: e.target.value})}
                          placeholder="What did you think of this artwork? How did it make you feel?"
                          rows={4}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Emotional Impact (1-5)
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setArtworkForm({...artworkForm, emotion_rating: rating})}
                                className={`w-8 h-8 rounded ${
                                  rating <= artworkForm.emotion_rating 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-gray-700 text-gray-400'
                                } hover:bg-red-400 transition-colors`}
                              >
                                <Heart className="w-4 h-4 mx-auto" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Technical Skill (1-5)
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setArtworkForm({...artworkForm, technical_rating: rating})}
                                className={`w-8 h-8 rounded ${
                                  rating <= artworkForm.technical_rating 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-gray-700 text-gray-400'
                                } hover:bg-yellow-400 transition-colors`}
                              >
                                <Star className="w-4 h-4 mx-auto" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button onClick={addArtworkToExhibition} className="w-full bg-purple-600 hover:bg-purple-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Artwork
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Artworks List */}
                {currentExhibition.artworks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Your Artworks ({currentExhibition.artworks.length})</h3>
                    {currentExhibition.artworks.map((artwork, index) => (
                      <motion.div
                        key={artwork.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{artwork.title}</h4>
                            <p className="text-gray-400 text-sm">{artwork.artist} {artwork.year && `(${artwork.year})`}</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-gray-400">{artwork.emotion_rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm text-gray-400">{artwork.technical_rating}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{artwork.impression}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Finish Exhibition */}
                {currentExhibition.artworks.length > 0 && (
                  <Button 
                    onClick={finishExhibition}
                    className="w-full bg-green-600 hover:bg-green-700 py-4"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Finish Visit & Generate Report
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Archive Tab */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            {savedExhibitions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">No Archives Yet</h2>
                <p className="text-gray-400 mb-6">Start visiting exhibitions to build your personal archive</p>
                <Button onClick={() => setActiveTab('current')} className="bg-purple-600 hover:bg-purple-700">
                  Start Your First Visit
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {savedExhibitions.map((exhibition, index) => (
                  <motion.div
                    key={exhibition.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{exhibition.exhibition_name}</h3>
                        <div className="flex items-center gap-4 text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {exhibition.venue}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {exhibition.visit_date}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        {exhibition.artworks.length > 0 && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateReport(exhibition.id);
                            }}
                            disabled={generatingReport === exhibition.id}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-4 py-2"
                          >
                            {generatingReport === exhibition.id ? (
                              <>
                                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Generate Report
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-semibold text-white">{exhibition.artworks.length}</div>
                        <div className="text-sm text-gray-400">artworks</div>
                      </div>
                    </div>
                    
                    {exhibition.artworks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300">Recent artworks:</h4>
                        <div className="space-y-1">
                          {exhibition.artworks.slice(0, 3).map((artwork) => (
                            <div key={artwork.id} className="text-sm text-gray-400">
                              <span className="text-white">{artwork.title}</span> by {artwork.artist}
                            </div>
                          ))}
                          {exhibition.artworks.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{exhibition.artworks.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}