'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeArtworkImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: "blur" | "empty";
  fallbackSrc?: string;
}

export default function SafeArtworkImage({
  src,
  alt,
  width = 400,
  height = 500,
  className = "",
  priority = false,
  quality = 90,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder = "empty",
  fallbackSrc = "/api/placeholder-image?type=backgrounds&name=gallery-space"
}: SafeArtworkImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  // If original src is already a placeholder URL or empty, use fallback
  const safeSrc = (!src || src.includes('placeholder.com') || src.includes('via.placeholder')) 
    ? fallbackSrc 
    : imageSrc;

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={quality}
      sizes={sizes}
      placeholder={placeholder}
      onError={handleError}
      style={{
        objectFit: 'cover',
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
}