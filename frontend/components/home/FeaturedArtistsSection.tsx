'use client';

import { FeaturedArtists } from './FeaturedArtists';

export function FeaturedArtistsSection() {
  return (
    <div className="w-full">
      <FeaturedArtists limit={4} />
    </div>
  );
}