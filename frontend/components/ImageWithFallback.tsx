'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  type?: 'backgrounds' | 'choices';
  name?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  type,
  name,
  priority = false,
  fill = true,
  sizes,
  style,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const finalSrc = error && type && name
    ? `/api/placeholder-image?type=${type}&name=${name}`
    : src;

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={finalSrc}
        alt={alt}
        fill={fill}
        sizes={sizes || '100vw'}
        priority={priority}
        quality={90}
        onError={() => {
          if (!error) {
            setError(true);
          }
        }}
        onLoad={() => setLoading(false)}
        style={{
          objectFit: 'cover',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          ...style,
        }}
      />
    </div>
  );
}