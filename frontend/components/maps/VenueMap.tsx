'use client';

import { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface VenueMapProps {
  venueName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUri?: string;
  compact?: boolean;
}

export default function VenueMap({
  venueName,
  address,
  latitude,
  longitude,
  googleMapsUri,
  compact = false
}: VenueMapProps) {
  const { language } = useLanguage();
  const [mapMode, setMapMode] = useState<'embed' | 'link'>('link');
  const [showDirections, setShowDirections] = useState(false);

  // Google Maps Embed URL 생성
  const getEmbedUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found');
      return null;
    }
    
    if (latitude && longitude) {
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=16&maptype=roadmap`;
    } else if (address) {
      const query = encodeURIComponent(`${venueName}, ${address}`);
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=16&maptype=roadmap`;
    }
    return null;
  };

  // Google Maps 링크 생성
  const getMapLink = () => {
    if (googleMapsUri) {
      return googleMapsUri;
    } else if (latitude && longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else if (address) {
      const query = encodeURIComponent(`${venueName}, ${address}`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    return null;
  };

  // 길찾기 URL 생성
  const getDirectionsUrl = () => {
    if (latitude && longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    } else if (address) {
      const query = encodeURIComponent(`${venueName}, ${address}`);
      return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();
  const mapLink = getMapLink();
  const directionsUrl = getDirectionsUrl();

  if (compact) {
    return (
      <div className="bg-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {language === 'ko' ? '위치' : 'Location'}
          </h4>
        </div>

        {address && (
          <p className="text-white/80 text-sm mb-3">{address}</p>
        )}

        <div className="flex gap-2">
          {mapLink && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {language === 'ko' ? '지도 보기' : 'View Map'}
            </a>
          )}
          
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-colors"
            >
              <Navigation className="w-4 h-4" />
              {language === 'ko' ? '길찾기' : 'Directions'}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {language === 'ko' ? '위치 및 지도' : 'Location & Map'}
        </h3>
        
        {embedUrl && (
          <div className="flex gap-2">
            <button
              onClick={() => setMapMode('link')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                mapMode === 'link' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {language === 'ko' ? '링크' : 'Link'}
            </button>
            <button
              onClick={() => setMapMode('embed')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                mapMode === 'embed' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {language === 'ko' ? '지도' : 'Map'}
            </button>
          </div>
        )}
      </div>

      {address && (
        <div className="mb-4">
          <p className="text-white/80">{address}</p>
        </div>
      )}

      {/* 지도 표시 */}
      {mapMode === 'embed' && embedUrl ? (
        <div className="mb-4">
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="w-full h-64 bg-white/5 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">
                {language === 'ko' 
                  ? '지도를 보려면 위의 "지도" 버튼을 클릭하세요' 
                  : 'Click "Map" button above to view map'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex flex-wrap gap-3">
        {mapLink && (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {language === 'ko' ? 'Google Maps에서 보기' : 'View in Google Maps'}
          </a>
        )}
        
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
          >
            <Navigation className="w-4 h-4" />
            {language === 'ko' ? '길찾기' : 'Get Directions'}
          </a>
        )}
      </div>

      {/* 추가 정보 */}
      {(latitude && longitude) && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-white/60 text-sm">
            {language === 'ko' ? '좌표' : 'Coordinates'}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}

// 간단한 지도 미리보기 컴포넌트
export function MapPreview({ 
  latitude, 
  longitude, 
  venueName,
  onClick 
}: { 
  latitude: number; 
  longitude: number; 
  venueName: string;
  onClick?: () => void;
}) {
  const { language } = useLanguage();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const staticMapUrl = apiKey 
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`
    : null;

  return (
    <div 
      className="relative rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {staticMapUrl ? (
        <img
          src={staticMapUrl}
          alt={`${venueName} location`}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="w-full h-32 bg-gray-300 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-gray-500" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          <p className="text-white text-xs font-medium">
            {language === 'ko' ? '지도에서 보기' : 'View on Map'}
          </p>
        </div>
      </div>
    </div>
  );
}