'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

export function SafeImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  fill = false,
  sizes,
  width = 400,
  height = 300 
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback to a working Renoir image
  const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg/400px-Pierre-Auguste_Renoir%2C_Le_Moulin_de_la_Galette.jpg';

  if (!src) {
    return (
      <div className={`${fill ? 'absolute inset-0' : ''} bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center ${className}`}
           style={!fill ? { width, height } : undefined}>
        <div className="text-center p-4">
          <Palette className="w-12 h-12 text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-gray-400 line-clamp-1">{alt}</p>
        </div>
      </div>
    );
  }

  // Debug log
  console.log(`🖼️ SafeImage rendering: ${alt}`, { src, error });

  // Use regular img tag for better compatibility
  return (
    <>
      {loading && (
        <div className={`${fill ? 'absolute inset-0' : ''} bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse ${className}`}
             style={!fill ? { width, height } : undefined} />
      )}
      <img
        src={src}  // Always use original src, no fallback
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onError={(e) => {
          console.error(`❌ Image failed to load: ${alt}`, src);
          // Don't use fallback, just log error
        }}
        onLoad={() => {
          console.log(`✅ Image loaded successfully: ${alt}`);
          setLoading(false);
        }}
        style={fill ? { 
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        } : {
          width,
          height,
          objectFit: 'cover'
        }}
      />
    </>
  );
}