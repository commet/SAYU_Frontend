'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Globe, Clock, ExternalLink, Star, Info } from 'lucide-react';
import { venueApi } from '@/lib/api/venue';
import { Venue } from '@/types/venue';
import { useLanguage } from '@/hooks/useLanguage';
import VenueMap from '@/components/maps/VenueMap';

interface VenueInfoCardProps {
  venueName: string;
  venueCity: string;
  venueWebsite?: string;
  compact?: boolean;
  showMap?: boolean;
}

export default function VenueInfoCard({ 
  venueName, 
  venueCity, 
  venueWebsite,
  compact = false,
  showMap = true
}: VenueInfoCardProps) {
  const { language } = useLanguage();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (showDetails && !venue) {
      loadVenueDetails();
    }
  }, [showDetails, venueName, venueCity]);

  const loadVenueDetails = async () => {
    try {
      setLoading(true);
      
      // Search for venue by name and city
      const response = await venueApi.getVenues({
        search: venueName,
        city: venueCity,
        limit: 1,
        lang: language
      });
      
      if (response.data.length > 0) {
        setVenue(response.data[0]);
      } else {
        // Fallback: Create a basic venue object
        setVenue({
          id: 'fallback-' + Date.now(),
          name: venueName,
          name_ko: language === 'ko' ? venueName : null,
          name_en: language === 'en' ? venueName : null,
          city: venueCity,
          city_ko: language === 'ko' ? venueCity : null,
          city_en: language === 'en' ? venueCity : null,
          country: 'Unknown',
          venue_type: 'museum',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any);
      }
    } catch (error) {
      console.error('Failed to load venue details:', error);
      // Create fallback venue on error too
      setVenue({
        id: 'error-fallback-' + Date.now(),
        name: venueName,
        name_ko: language === 'ko' ? venueName : null,
        name_en: language === 'en' ? venueName : null,
        city: venueCity,
        city_ko: language === 'ko' ? venueCity : null,
        city_en: language === 'en' ? venueCity : null,
        country: 'Unknown',
        venue_type: 'museum',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedVenueName = () => {
    if (!venue) return venueName;
    
    if (language === 'ko') {
      return venue.name_ko || venue.name || venueName;
    }
    return venue.name_en || venue.name || venueName;
  };

  const getLocalizedCity = () => {
    if (!venue) return venueCity;
    
    if (language === 'ko') {
      return venue.city_ko || venue.city || venueCity;
    }
    return venue.city_en || venue.city || venueCity;
  };

  const getLocalizedDescription = () => {
    if (!venue) return null;
    
    if (language === 'ko') {
      return venue.description_ko || venue.description;
    }
    return venue.description || venue.description_ko;
  };

  const getLocalizedAddress = () => {
    if (!venue) return null;
    
    if (language === 'ko') {
      return venue.address_ko || venue.address;
    }
    return venue.address_en || venue.address;
  };

  const typeLabels = {
    ko: {
      museum: '박물관',
      gallery: '갤러리',
      art_center: '아트센터',
      cultural_center: '문화센터'
    },
    en: {
      museum: 'Museum',
      gallery: 'Gallery',
      art_center: 'Art Center',
      cultural_center: 'Cultural Center'
    }
  };

  if (compact) {
    return (
      <div className="bg-white/10 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-white/60 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium">{getLocalizedVenueName()}</h4>
              <p className="text-white/60 text-sm">{getLocalizedCity()}</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-white/60 hover:text-white p-1"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {showDetails && (
          <VenueDetailsExpanded 
            venue={venue}
            venueName={venueName}
            venueCity={venueCity}
            venueWebsite={venueWebsite}
            loading={loading}
            language={language}
            showMap={showMap}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {language === 'ko' ? '전시 장소' : 'Venue'}
        </h3>
        {!showDetails && (
          <button
            onClick={() => setShowDetails(true)}
            className="text-white/60 hover:text-white text-sm"
          >
            {language === 'ko' ? '상세 보기' : 'Show Details'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-white/60" />
          <div>
            <h4 className="text-white font-medium">{getLocalizedVenueName()}</h4>
            <p className="text-white/60">{getLocalizedCity()}</p>
          </div>
        </div>

        {venue && venue.venue_type && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-white/20 text-white rounded text-xs">
              {typeLabels[language][venue.venue_type]}
            </span>
            {venue.tier && (
              <span className="px-2 py-1 bg-purple-500/30 text-white rounded text-xs">
                Tier {venue.tier}
              </span>
            )}
          </div>
        )}

        {venue && venue.rating && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm">{venue.rating.toFixed(1)}</span>
            {venue.review_count && (
              <span className="text-white/60 text-sm">({venue.review_count})</span>
            )}
          </div>
        )}

        {showDetails && (
          <VenueDetailsExpanded 
            venue={venue}
            venueName={venueName}
            venueCity={venueCity}
            venueWebsite={venueWebsite}
            loading={loading}
            language={language}
            showMap={showMap}
          />
        )}
        
        {/* Map Integration when details are shown */}
        {showDetails && venue && venue.latitude && venue.longitude && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <VenueMap
              venueName={getLocalizedVenueName()}
              address={getLocalizedAddress() || undefined}
              latitude={venue.latitude}
              longitude={venue.longitude}
              googleMapsUri={venue.google_maps_uri}
              compact={true}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          {venueWebsite && (
            <a
              href={venueWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-white/60 hover:text-white text-sm"
            >
              <Globe className="w-4 h-4" />
              {language === 'ko' ? '웹사이트' : 'Website'}
            </a>
          )}
          
          {venue && venue.google_maps_uri && showMap && (
            <a
              href={venue.google_maps_uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-white/60 hover:text-white text-sm"
            >
              <MapPin className="w-4 h-4" />
              {language === 'ko' ? '지도' : 'Map'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// 확장된 상세 정보 컴포넌트
function VenueDetailsExpanded({ 
  venue, 
  venueName, 
  venueCity, 
  venueWebsite, 
  loading, 
  language,
  showMap 
}: {
  venue: Venue | null;
  venueName: string;
  venueCity: string;
  venueWebsite?: string;
  loading: boolean;
  language: 'ko' | 'en';
  showMap: boolean;
}) {
  const getLocalizedDescription = () => {
    if (!venue) return null;
    
    if (language === 'ko') {
      return venue.description_ko || venue.description;
    }
    return venue.description || venue.description_ko;
  };

  const getLocalizedAddress = () => {
    if (!venue) return null;
    
    if (language === 'ko') {
      return venue.address_ko || venue.address;
    }
    return venue.address_en || venue.address;
  };

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-white/20 rounded w-full"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white/60 text-sm">
          {language === 'ko' 
            ? '상세 정보를 불러올 수 없습니다' 
            : 'Detailed information not available'}
        </p>
      </div>
    );
  }

  const description = getLocalizedDescription();
  const address = getLocalizedAddress();

  return (
    <div className="mt-4 pt-4 border-t border-white/20 space-y-4">
      {description && (
        <div>
          <h5 className="text-white font-medium mb-2">
            {language === 'ko' ? '소개' : 'About'}
          </h5>
          <p className="text-white/80 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      )}

      {address && (
        <div>
          <h5 className="text-white font-medium mb-2">
            {language === 'ko' ? '주소' : 'Address'}
          </h5>
          <p className="text-white/80 text-sm">{address}</p>
        </div>
      )}

      {venue.opening_hours && (
        <div>
          <h5 className="text-white font-medium mb-2">
            {language === 'ko' ? '운영시간' : 'Opening Hours'}
          </h5>
          <div className="space-y-1">
            {Object.entries(venue.opening_hours).map(([day, hours]) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="text-white/60 capitalize">{day}</span>
                <span className="text-white/80">{hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="flex flex-wrap gap-3">
        {venue.phone && (
          <a
            href={`tel:${venue.phone}`}
            className="flex items-center gap-1 text-white/60 hover:text-white text-sm"
          >
            <Phone className="w-4 h-4" />
            {venue.phone}
          </a>
        )}
        
        {venue.email && (
          <a
            href={`mailto:${venue.email}`}
            className="flex items-center gap-1 text-white/60 hover:text-white text-sm"
          >
            <Mail className="w-4 h-4" />
            {language === 'ko' ? '이메일' : 'Email'}
          </a>
        )}
        
        {venue.website && venue.website !== venueWebsite && (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white/60 hover:text-white text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            {language === 'ko' ? '공식 웹사이트' : 'Official Website'}
          </a>
        )}
      </div>

      {showMap && venue.google_maps_uri && (
        <a
          href={venue.google_maps_uri}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 w-full justify-center py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
        >
          <MapPin className="w-4 h-4" />
          {language === 'ko' ? '지도에서 보기' : 'View on Map'}
        </a>
      )}
    </div>
  );
}