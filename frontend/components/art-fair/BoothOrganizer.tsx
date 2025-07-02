'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Plus, Search, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Booth {
  id: string;
  name: string;
  gallery: string;
  location: string;
  savedArtworks: number;
  visited: boolean;
}

interface BoothOrganizerProps {
  fairName: string;
  onBack: () => void;
  savedCount: number;
}

export default function BoothOrganizer({ fairName, onBack, savedCount }: BoothOrganizerProps) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [booths, setBooths] = useState<Booth[]>([
    {
      id: '1',
      name: 'A01',
      gallery: 'Pace Gallery',
      location: 'Hall A',
      savedArtworks: 5,
      visited: true
    },
    {
      id: '2',
      name: 'B12',
      gallery: 'Gagosian',
      location: 'Hall B',
      savedArtworks: 3,
      visited: true
    },
    {
      id: '3',
      name: 'C05',
      gallery: 'Perrotin',
      location: 'Hall C',
      savedArtworks: 0,
      visited: false
    }
  ]);

  const filteredBooths = booths.filter(booth =>
    booth.gallery.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booth.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBooth = () => {
    const newBooth: Booth = {
      id: Date.now().toString(),
      name: `New${booths.length + 1}`,
      gallery: 'New Gallery',
      location: 'Hall',
      savedArtworks: 0,
      visited: false
    };
    setBooths([...booths, newBooth]);
  };

  return (
    <div className="booth-organizer">
      <header className="booth-header">
        <div className="header-top">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="back-button"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h2>{language === 'ko' ? '부스 정리' : 'Booth Organizer'}</h2>
          
          <Button
            size="sm"
            onClick={handleAddBooth}
            className="add-booth-button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="search-container">
          <Search className="search-icon" />
          <Input
            type="text"
            placeholder={language === 'ko' ? '갤러리 또는 부스 검색...' : 'Search gallery or booth...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="booth-search"
          />
        </div>
      </header>

      <div className="booth-grid">
        {filteredBooths.map((booth) => (
          <motion.div
            key={booth.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className={`booth-card ${booth.visited ? 'visited' : ''}`}>
              <div className="booth-number">{booth.name}</div>
              <h3 className="gallery-name">{booth.gallery}</h3>
              <p className="booth-location">{booth.location}</p>
              
              <div className="booth-stats">
                <span className="artwork-count">
                  {booth.savedArtworks} {language === 'ko' ? '작품' : 'artworks'}
                </span>
                {booth.visited && (
                  <span className="visited-badge">
                    {language === 'ko' ? '방문함' : 'Visited'}
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="booth-summary">
        <div className="summary-item">
          <Grid3x3 className="w-5 h-5" />
          <span>
            {booths.length} {language === 'ko' ? '부스' : 'booths'}
          </span>
        </div>
        <div className="summary-item">
          <span className="visited-count">
            {booths.filter(b => b.visited).length} {language === 'ko' ? '방문' : 'visited'}
          </span>
        </div>
        <div className="summary-item">
          <span className="total-saved">
            {savedCount} {language === 'ko' ? '작품 저장됨' : 'artworks saved'}
          </span>
        </div>
      </div>
    </div>
  );
}