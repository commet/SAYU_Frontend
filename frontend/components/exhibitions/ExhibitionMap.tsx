'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';

// Fix Leaflet icon issue with CDN URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Exhibition {
  id: string;
  title: string;
  title_en: string;
  venue_name: string;
  venue_name_en: string;
  lat: number;
  lng: number;
  district: string;
  venue_type: string;
  start_date: string;
  end_date: string;
  recommended_apt: string[];
  tags: string[];
  status: string;
  days_remaining: number;
}

interface ExhibitionMapProps {
  userAPT?: string;
  onExhibitionSelect?: (exhibition: Exhibition) => void;
  selectedExhibition?: Exhibition | null;
}

export default function ExhibitionMap({ 
  userAPT = 'LRMC', 
  onExhibitionSelect,
  selectedExhibition 
}: ExhibitionMapProps) {
  const { language } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  // APT compatibility colors
  const getAPTCompatibilityColor = (exhibitionAPTs: string[]) => {
    if (!userAPT) return '#6B7280'; // gray for no user APT
    
    // Check if user's APT is in recommended list
    if (exhibitionAPTs.includes(userAPT)) {
      return '#10B981'; // green - perfect match
    }
    
    // Check for partial match (share some letters)
    const userLetters = userAPT.split('');
    const matchCount = userLetters.filter((letter, index) => 
      exhibitionAPTs.some(apt => apt[index] === letter)
    ).length;
    
    if (matchCount >= 3) return '#F59E0B'; // amber - good match
    if (matchCount >= 2) return '#3B82F6'; // blue - decent match
    return '#6B7280'; // gray - low match
  };

  // Create custom icon based on APT compatibility
  const createCustomIcon = (exhibition: Exhibition) => {
    const color = getAPTCompatibilityColor(exhibition.recommended_apt);
    const isSelected = selectedExhibition?.id === exhibition.id;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container ${isSelected ? 'selected' : ''}" style="
          width: ${isSelected ? '48px' : '40px'};
          height: ${isSelected ? '48px' : '40px'};
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 3px solid ${isSelected ? '#FBBF24' : '#ffffff'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          cursor: pointer;
        ">
          <div style="
            transform: rotate(45deg);
            font-size: ${isSelected ? '20px' : '16px'};
          ">
            ${exhibition.venue_type === 'museum' ? '🏛️' : '🎨'}
          </div>
        </div>
        ${exhibition.status === 'ongoing' ? `
          <div class="pulse-ring" style="
            position: absolute;
            width: ${isSelected ? '48px' : '40px'};
            height: ${isSelected ? '48px' : '40px'};
            background: ${color};
            border-radius: 50%;
            opacity: 0.5;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
      `,
      iconSize: isSelected ? [48, 48] : [40, 40],
      iconAnchor: isSelected ? [24, 48] : [20, 40],
      popupAnchor: [0, -40]
    });
  };

  // Fetch exhibition data
  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await fetch('/api/exhibitions/map');
        const data = await response.json();
        if (data.success) {
          setExhibitions(data.exhibitions);
        }
      } catch (error) {
        console.error('Failed to fetch exhibitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const mapElement = document.getElementById('exhibition-map');
      if (!mapElement || mapRef.current) return;

      // Create map
      const map = L.map('exhibition-map', {
        center: [37.5665, 126.9780], // Seoul center
        zoom: 12,
        zoomControl: false
      });

      // Add zoom control to top right
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      // Add dark theme tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapRef.current = map;

      // Add custom CSS for animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.3; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .custom-marker {
          position: relative;
        }
        .marker-container:hover {
          transform: rotate(-45deg) scale(1.1) !important;
        }
        .marker-container.selected {
          z-index: 1000 !important;
        }
      `;
      document.head.appendChild(style);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add markers for exhibitions
  useEffect(() => {
    if (!mapRef.current || exhibitions.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers
    exhibitions.forEach(exhibition => {
      const marker = L.marker([exhibition.lat, exhibition.lng], {
        icon: createCustomIcon(exhibition)
      });

      // Create popup content
      const popupContent = `
        <div class="exhibition-popup" style="min-width: 250px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">
            ${language === 'ko' ? exhibition.title : exhibition.title_en}
          </h3>
          <div style="color: #6b7280; font-size: 14px; space-y: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span>📍</span>
              <span>${language === 'ko' ? exhibition.venue_name : exhibition.venue_name_en}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span>📅</span>
              <span>${new Date(exhibition.start_date).toLocaleDateString()} - ${new Date(exhibition.end_date).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span>🎯</span>
              <span>APT: ${exhibition.recommended_apt.join(', ')}</span>
            </div>
            ${exhibition.status === 'ongoing' ? `
              <div style="
                background: #10b981;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                display: inline-block;
                font-size: 12px;
                font-weight: 600;
                margin-top: 8px;
              ">
                ${language === 'ko' ? '진행중' : 'Ongoing'} (${exhibition.days_remaining}일 남음)
              </div>
            ` : exhibition.status === 'upcoming' ? `
              <div style="
                background: #3b82f6;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                display: inline-block;
                font-size: 12px;
                font-weight: 600;
                margin-top: 8px;
              ">
                ${language === 'ko' ? '예정' : 'Upcoming'}
              </div>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 300
      });

      marker.on('click', () => {
        if (onExhibitionSelect) {
          onExhibitionSelect(exhibition);
        }
      });

      marker.addTo(mapRef.current!);
      markersRef.current.set(exhibition.id, marker);
    });
  }, [exhibitions, language, onExhibitionSelect, userAPT]);

  // Update selected marker
  useEffect(() => {
    if (!selectedExhibition || !mapRef.current) return;

    const marker = markersRef.current.get(selectedExhibition.id);
    if (marker) {
      // Update all markers' icons
      exhibitions.forEach(ex => {
        const m = markersRef.current.get(ex.id);
        if (m) {
          m.setIcon(createCustomIcon(ex));
        }
      });

      // Pan to selected marker
      mapRef.current.panTo([selectedExhibition.lat, selectedExhibition.lng]);
      
      // Open popup
      marker.openPopup();
    }
  }, [selectedExhibition, exhibitions]);

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white">지도를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div id="exhibition-map" className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-xs font-semibold mb-2 text-gray-900 dark:text-white">
          {language === 'ko' ? 'APT 매칭도' : 'APT Match'}
        </h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-300">
              {language === 'ko' ? '완벽한 매칭' : 'Perfect Match'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-700 dark:text-gray-300">
              {language === 'ko' ? '좋은 매칭' : 'Good Match'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">
              {language === 'ko' ? '보통 매칭' : 'Fair Match'}
            </span>
          </div>
        </div>
      </div>

      {/* User APT indicator */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {language === 'ko' ? '나의 APT' : 'My APT'}
        </div>
        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
          {userAPT}
        </div>
      </div>
    </div>
  );
}