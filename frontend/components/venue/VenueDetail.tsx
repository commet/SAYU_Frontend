'use client';

import { useState, useEffect } from 'react';
import { venueApi } from '@/lib/api/venue';
import { Venue } from '@/types/venue';
import { useLanguage } from '@/hooks/useLanguage';
import { MapPin, Phone, Mail, Globe, Clock, DollarSign, Star, Tag, Calendar } from 'lucide-react';
import Image from 'next/image';

interface VenueDetailProps {
  venueId: string;
  onClose?: () => void;
}

export default function VenueDetail({ venueId, onClose }: VenueDetailProps) {
  const { language } = useLanguage();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVenueDetail();
  }, [venueId, language]);

  const loadVenueDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await venueApi.getVenue(venueId, language);
      setVenue(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <VenueDetailSkeleton />;
  }

  if (error || !venue) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error || '미술관 정보를 찾을 수 없습니다'}</p>
          <button 
            onClick={loadVenueDetail}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 헤더 섹션 */}
      <VenueHeader venue={venue} language={language} onClose={onClose} />
      
      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <VenueDescription venue={venue} language={language} />
          <VenueImages venue={venue} />
          <VenueInfo venue={venue} language={language} />
        </div>
        
        {/* 사이드바 */}
        <div className="space-y-6">
          <VenueContact venue={venue} />
          <VenueLocation venue={venue} language={language} />
          <VenueAdmission venue={venue} language={language} />
        </div>
      </div>
    </div>
  );
}

// 헤더 컴포넌트
function VenueHeader({ 
  venue, 
  language, 
  onClose 
}: { 
  venue: Venue; 
  language: 'ko' | 'en';
  onClose?: () => void;
}) {
  const getLocalizedName = () => {
    if (language === 'ko') {
      return venue.name_ko || venue.name;
    }
    return venue.name_en || venue.name;
  };

  const getLocalizedCity = () => {
    if (language === 'ko') {
      return venue.city_ko || venue.city;
    }
    return venue.city_en || venue.city;
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

  return (
    <div className="relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full"
        >
          ✕
        </button>
      )}
      
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {typeLabels[language][venue.venue_type]}
          </span>
          {venue.tier && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Tier {venue.tier}
            </span>
          )}
          {venue.venue_category && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {venue.venue_category}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {getLocalizedName()}
        </h1>
        
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{getLocalizedCity()}, {venue.country}</span>
          </div>
          
          {venue.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{venue.rating.toFixed(1)}</span>
              {venue.review_count && (
                <span className="text-sm text-gray-500">
                  ({venue.review_count} reviews)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 설명 컴포넌트
function VenueDescription({ venue, language }: { venue: Venue; language: 'ko' | 'en' }) {
  const getDescription = () => {
    if (language === 'ko') {
      return venue.description_ko || venue.description;
    }
    return venue.description || venue.description_ko;
  };

  const description = getDescription();
  
  if (!description) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">
        {language === 'ko' ? '소개' : 'About'}
      </h2>
      <p className="text-gray-700 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// 이미지 갤러리 컴포넌트
function VenueImages({ venue }: { venue: Venue }) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!venue.images || venue.images.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Images</h2>
      
      <div className="space-y-4">
        {/* 메인 이미지 */}
        <div className="aspect-video rounded-lg overflow-hidden relative">
          <Image
            src={venue.images[selectedImage]}
            alt={venue.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
        </div>
        
        {/* 썸네일 */}
        {venue.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {venue.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 relative ${
                  selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <Image
                  src={image}
                  alt={`${venue.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 기본 정보 컴포넌트
function VenueInfo({ venue, language }: { venue: Venue; language: 'ko' | 'en' }) {
  const formatOpeningHours = () => {
    if (!venue.opening_hours) return null;
    
    return Object.entries(venue.opening_hours).map(([day, hours]) => (
      <div key={day} className="flex justify-between">
        <span className="capitalize">{day}</span>
        <span>{hours}</span>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">
        {language === 'ko' ? '기본 정보' : 'Information'}
      </h2>
      
      <div className="space-y-4">
        {venue.opening_hours && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {language === 'ko' ? '운영시간' : 'Opening Hours'}
              </span>
            </div>
            <div className="ml-6 space-y-1 text-sm text-gray-600">
              {formatOpeningHours()}
            </div>
          </div>
        )}
        
        {venue.features && venue.features.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {language === 'ko' ? '특징' : 'Features'}
              </span>
            </div>
            <div className="ml-6 flex flex-wrap gap-2">
              {venue.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 연락처 컴포넌트
function VenueContact({ venue }: { venue: Venue }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Contact</h3>
      
      <div className="space-y-3">
        {venue.phone && (
          <a
            href={`tel:${venue.phone}`}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
          >
            <Phone className="w-4 h-4" />
            <span>{venue.phone}</span>
          </a>
        )}
        
        {venue.email && (
          <a
            href={`mailto:${venue.email}`}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
          >
            <Mail className="w-4 h-4" />
            <span>{venue.email}</span>
          </a>
        )}
        
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
          >
            <Globe className="w-4 h-4" />
            <span>Website</span>
          </a>
        )}
        
        {venue.social_media && (
          <div className="pt-2 space-y-2">
            {venue.social_media.instagram && (
              <a
                href={venue.social_media.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-pink-600 hover:underline text-sm"
              >
                Instagram
              </a>
            )}
            {venue.social_media.facebook && (
              <a
                href={venue.social_media.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline text-sm"
              >
                Facebook
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 위치 컴포넌트
function VenueLocation({ venue, language }: { venue: Venue; language: 'ko' | 'en' }) {
  const getLocalizedAddress = () => {
    if (language === 'ko' && venue.address_ko) {
      return venue.address_ko;
    }
    return venue.address;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'ko' ? '위치' : 'Location'}
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 mt-1 text-gray-500" />
          <div>
            <p className="text-gray-700">{getLocalizedAddress()}</p>
            {venue.district && (
              <p className="text-sm text-gray-500">{venue.district}</p>
            )}
          </div>
        </div>
        
        {venue.google_maps_uri && (
          <a
            href={venue.google_maps_uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full mt-3 px-4 py-2 bg-blue-500 text-white text-center rounded hover:bg-blue-600"
          >
            {language === 'ko' ? '지도에서 보기' : 'View on Map'}
          </a>
        )}
      </div>
    </div>
  );
}

// 입장료 컴포넌트
function VenueAdmission({ venue, language }: { venue: Venue; language: 'ko' | 'en' }) {
  const getAdmissionInfo = () => {
    if (language === 'ko' && venue.admission_info_ko) {
      return venue.admission_info_ko;
    }
    return venue.admission_info;
  };

  const admissionInfo = getAdmissionInfo();
  
  if (!admissionInfo && !venue.admission_fee) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'ko' ? '입장료' : 'Admission'}
      </h3>
      
      <div className="space-y-3">
        {venue.admission_fee && (
          <div className="space-y-2">
            {venue.admission_fee.adult && (
              <div className="flex justify-between">
                <span>{language === 'ko' ? '성인' : 'Adult'}</span>
                <span>{venue.admission_fee.adult.toLocaleString()}원</span>
              </div>
            )}
            {venue.admission_fee.child && (
              <div className="flex justify-between">
                <span>{language === 'ko' ? '어린이' : 'Child'}</span>
                <span>{venue.admission_fee.child.toLocaleString()}원</span>
              </div>
            )}
            {venue.admission_fee.senior && (
              <div className="flex justify-between">
                <span>{language === 'ko' ? '노인' : 'Senior'}</span>
                <span>{venue.admission_fee.senior.toLocaleString()}원</span>
              </div>
            )}
          </div>
        )}
        
        {admissionInfo && (
          <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
            {admissionInfo}
          </p>
        )}
      </div>
    </div>
  );
}

// 스켈레톤 로딩
function VenueDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-96 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}