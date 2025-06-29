'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  MessageSquare,
  Share2
} from 'lucide-react';
import { ShareButton } from '@/components/social/ShareButton';

interface Reservation {
  id: string;
  exhibition_title: string;
  museum_name: string;
  museum_location: any;
  visit_date: string;
  visit_time: string;
  party_size: number;
  ticket_type: string;
  total_cost: number;
  currency: string;
  reservation_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmation_code: string;
  primary_image_url?: string;
  created_at: string;
  feedback_collected: boolean;
}

interface MyReservationsProps {
  className?: string;
}

export function MyReservations({ className = '' }: MyReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations/my-reservations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: 'User cancellation' })
      });

      if (response.ok) {
        await fetchReservations(); // Refresh the list
      } else {
        alert('Failed to cancel reservation');
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert('Failed to cancel reservation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['pending', 'confirmed'].includes(reservation.reservation_status);
    if (filter === 'past') return ['completed', 'cancelled'].includes(reservation.reservation_status);
    return reservation.reservation_status === filter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Any time';
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Reservations' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
          { key: 'pending', label: 'Pending' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation, index) => (
          <motion.div
            key={reservation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 overflow-hidden hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Exhibition Image */}
                {reservation.primary_image_url && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={reservation.primary_image_url}
                      alt={reservation.exhibition_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                        {reservation.exhibition_title}
                      </h3>
                      <p className="text-gray-400 flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4" />
                        {reservation.museum_name}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${getStatusColor(reservation.reservation_status)}`}>
                      {getStatusIcon(reservation.reservation_status)}
                      <span className="capitalize">{reservation.reservation_status}</span>
                    </div>
                  </div>

                  {/* Visit Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-medium">{formatDate(reservation.visit_date)}</div>
                        {reservation.visit_time && (
                          <div className="text-gray-500">{formatTime(reservation.visit_time)}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-medium">{reservation.party_size} {reservation.party_size === 1 ? 'person' : 'people'}</div>
                        <div className="text-gray-500 capitalize">{reservation.ticket_type}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-4 h-4 text-green-400">$</div>
                      <div>
                        <div className="font-medium">${reservation.total_cost?.toFixed(2) || '0.00'}</div>
                        <div className="text-gray-500">{reservation.currency || 'USD'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-4 h-4 text-yellow-400">#</div>
                      <div>
                        <div className="font-medium">{reservation.confirmation_code}</div>
                        <div className="text-gray-500">Confirmation</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                    {reservation.reservation_status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="px-4 py-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Cancel Reservation
                      </button>
                    )}

                    {reservation.reservation_status === 'completed' && !reservation.feedback_collected && (
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowFeedbackForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        Leave Feedback
                      </button>
                    )}

                    <ShareButton
                      contentType="exhibition"
                      contentId={reservation.id}
                      additionalData={{ userReflection: `Had a wonderful experience at ${reservation.exhibition_title}` }}
                      variant="text"
                      className="text-purple-400 hover:text-purple-300"
                    />

                    <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Reservations Found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You haven't made any reservations yet." 
                : `No ${filter} reservations found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}