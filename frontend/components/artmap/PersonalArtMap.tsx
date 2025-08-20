'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, Star, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Museum {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  visitCount: number;
  lastVisit?: string;
  favorite?: boolean;
  type: 'visited' | 'wishlist' | 'nearby';
}

interface ArtMapProps {
  museums: Museum[];
  userLocation?: { lat: number; lng: number };
  onMuseumClick?: (museum: Museum) => void;
}

export default function PersonalArtMap({ museums, userLocation, onMuseumClick }: ArtMapProps) {
  const { language } = useLanguage();
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);
  const [mapView, setMapView] = useState<'2d' | '3d'>('2d');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLayers, setShowLayers] = useState({
    visited: true,
    wishlist: true,
    nearby: true,
  });

  // Simplified map visualization (in real app, would use actual map library)
  const mapCenter = userLocation || { lat: 37.5665, lng: 126.9780 }; // Seoul default

  const getMuseumColor = (museum: Museum) => {
    if (museum.type === 'visited') return '#10b981'; // green
    if (museum.type === 'wishlist') return '#f59e0b'; // amber
    return '#6b7280'; // gray for nearby
  };

  const getMuseumSize = (museum: Museum) => {
    const baseSize = 20;
    return baseSize + (museum.visitCount * 4);
  };

  return (
    <div className="relative w-full h-[600px] sayu-liquid-glass rounded-2xl overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <motion.button
          onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
          className="sayu-button p-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
          className="sayu-button p-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          onClick={() => setMapView(mapView === '2d' ? '3d' : '2d')}
          className="sayu-button p-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Layers className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-20 sayu-liquid-glass rounded-xl p-3">
        <h3 className="text-sm font-medium mb-2 text-white">
          {language === 'ko' ? '레이어' : 'Layers'}
        </h3>
        <div className="space-y-2">
          {Object.entries(showLayers).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setShowLayers({ ...showLayers, [key]: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs text-gray-200">
                {key === 'visited' && (language === 'ko' ? '방문한 곳' : 'Visited')}
                {key === 'wishlist' && (language === 'ko' ? '가고 싶은 곳' : 'Wishlist')}
                {key === 'nearby' && (language === 'ko' ? '주변 미술관' : 'Nearby')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Map Visualization */}
      <div 
        className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Simple grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* User Location */}
        {userLocation && (
          <motion.div
            className="absolute w-4 h-4 bg-blue-500 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping" />
          </motion.div>
        )}

        {/* Museums */}
        {museums.map((museum) => {
          if (!showLayers[museum.type]) return null;
          
          // Simple positioning (in real app, would convert lat/lng to pixels)
          const x = 50 + (museum.location.lng - mapCenter.lng) * 100;
          const y = 50 - (museum.location.lat - mapCenter.lat) * 100;
          
          return (
            <motion.div
              key={museum.id}
              className="absolute cursor-pointer"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              onClick={() => {
                setSelectedMuseum(museum);
                onMuseumClick?.(museum);
              }}
            >
              <div
                className="relative rounded-full flex items-center justify-center"
                style={{
                  width: getMuseumSize(museum),
                  height: getMuseumSize(museum),
                  backgroundColor: getMuseumColor(museum),
                }}
              >
                {museum.favorite && (
                  <Star className="w-3 h-3 text-white fill-white" />
                )}
                {museum.visitCount > 0 && !museum.favorite && (
                  <span className="text-white text-xs font-bold">
                    {museum.visitCount}
                  </span>
                )}
              </div>
              
              {/* Museum name tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                {museum.name}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Museum Info */}
      <AnimatePresence>
        {selectedMuseum && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 sayu-liquid-glass rounded-xl p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{selectedMuseum.name}</h3>
                <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {selectedMuseum.type === 'visited' && 
                    `${language === 'ko' ? '방문 횟수' : 'Visits'}: ${selectedMuseum.visitCount}`
                  }
                  {selectedMuseum.type === 'wishlist' && 
                    (language === 'ko' ? '가고 싶은 곳' : 'On wishlist')
                  }
                  {selectedMuseum.type === 'nearby' && 
                    (language === 'ko' ? '주변 미술관' : 'Nearby museum')
                  }
                </p>
                {selectedMuseum.lastVisit && (
                  <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {language === 'ko' ? '마지막 방문' : 'Last visit'}: {selectedMuseum.lastVisit}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => setSelectedMuseum(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                className="sayu-button sayu-button-primary py-2 px-4 text-sm flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="w-4 h-4 inline mr-1" />
                {language === 'ko' ? '길찾기' : 'Directions'}
              </motion.button>
              
              {selectedMuseum.type !== 'visited' && (
                <motion.button
                  className="sayu-button py-2 px-4 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {language === 'ko' ? '방문 기록' : 'Check-in'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 sayu-liquid-glass rounded-lg p-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>{language === 'ko' ? '방문함' : 'Visited'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>{language === 'ko' ? '가고 싶음' : 'Wishlist'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>{language === 'ko' ? '주변' : 'Nearby'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}