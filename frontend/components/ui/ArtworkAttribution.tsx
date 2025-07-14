'use client';

import { ExternalLink } from 'lucide-react';

interface ArtworkAttributionProps {
  className?: string;
}

export default function ArtworkAttribution({ className = '' }: ArtworkAttributionProps) {
  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <p className="mb-1">
        Artworks sourced from public domain collections via{' '}
        <a 
          href="https://artvee.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
        >
          Artvee.com
          <ExternalLink className="w-3 h-3" />
        </a>
      </p>
      <p>
        All artworks are in the public domain. Individual artist copyrights may apply.
      </p>
    </div>
  );
}