'use client';

import { useParams } from 'next/navigation';
import VenueDetail from '@/components/venue/VenueDetail';

export default function VenueDetailPage() {
  const params = useParams();
  const venueId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <VenueDetail venueId={venueId} />
    </div>
  );
}