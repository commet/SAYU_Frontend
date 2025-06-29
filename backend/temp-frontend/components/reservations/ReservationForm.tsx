'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, CreditCard, MapPin, Phone, Mail, X } from 'lucide-react';

interface ReservationFormProps {
  exhibition: {
    id: string;
    title: string;
    museum_name: string;
    start_date: string;
    end_date: string;
    primary_image_url?: string;
  };
  reservationInfo: {
    reservation_type: string;
    pricing_info: any;
    time_slots: any[];
    requirements: any;
    advance_booking_required: boolean;
    booking_url?: string;
    special_instructions?: string;
  };
  onSuccess?: (reservation: any) => void;
  onCancel?: () => void;
}

export function ReservationForm({ 
  exhibition, 
  reservationInfo, 
  onSuccess, 
  onCancel 
}: ReservationFormProps) {
  const [formData, setFormData] = useState({
    visit_date: '',
    visit_time: '',
    party_size: 1,
    ticket_type: 'general',
    contact_email: '',
    contact_phone: '',
    special_requests: ''
  });

  const [loading, setLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [totalCost, setTotalCost] = useState(0);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculate cost when relevant fields change
    if (field === 'party_size' || field === 'ticket_type') {
      calculateCost({ ...formData, [field]: value });
    }
  };

  const calculateCost = (data: typeof formData) => {
    const pricing = reservationInfo.pricing_info;
    const basePrice = pricing?.[data.ticket_type] || pricing?.general || 0;
    const cost = basePrice * data.party_size;
    setTotalCost(cost);
  };

  const handleTimeSlotSelect = (timeSlot: any) => {
    setSelectedTimeSlot(timeSlot);
    handleInputChange('visit_time', timeSlot.time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.visit_date || !formData.contact_email) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          exhibition_id: exhibition.id,
          ...formData,
          total_cost: totalCost,
          currency: 'USD'
        })
      });

      if (response.ok) {
        const reservation = await response.json();
        onSuccess?.(reservation);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create reservation');
      }
    } catch (error) {
      console.error('Reservation failed:', error);
      alert('Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const isDateAvailable = (date: string) => {
    const selectedDate = new Date(date);
    const startDate = new Date(exhibition.start_date);
    const endDate = new Date(exhibition.end_date);
    const today = new Date();
    
    return selectedDate >= today && selectedDate >= startDate && selectedDate <= endDate;
  };

  const getAvailableTimeSlots = () => {
    if (!formData.visit_date || !reservationInfo.time_slots) return [];
    
    // Filter time slots for selected date
    return reservationInfo.time_slots.filter((slot: any) => {
      if (slot.date && slot.date !== formData.visit_date) return false;
      return slot.available_spots > 0;
    });
  };

  const ticketTypes = reservationInfo.pricing_info ? Object.keys(reservationInfo.pricing_info) : ['general'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Reserve Your Visit</h2>
              <h3 className="text-lg text-purple-400 mb-1">{exhibition.title}</h3>
              <p className="text-gray-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {exhibition.museum_name}
              </p>
            </div>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Exhibition Image */}
          {exhibition.primary_image_url && (
            <div className="mb-6">
              <img
                src={exhibition.primary_image_url}
                alt={exhibition.title}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Special Instructions */}
          {reservationInfo.special_instructions && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">{reservationInfo.special_instructions}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visit Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Visit Date *
              </label>
              <input
                type="date"
                value={formData.visit_date}
                onChange={(e) => handleInputChange('visit_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={exhibition.end_date}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Time Slots */}
            {formData.visit_date && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time Slot
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getAvailableTimeSlots().map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        selectedTimeSlot === slot
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium">{slot.time || 'Any Time'}</div>
                      {slot.available_spots && (
                        <div className="text-xs opacity-75">{slot.available_spots} spots</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Party Size */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Party Size
              </label>
              <select
                value={formData.party_size}
                onChange={(e) => handleInputChange('party_size', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            </div>

            {/* Ticket Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Ticket Type
              </label>
              <select
                value={formData.ticket_type}
                onChange={(e) => handleInputChange('ticket_type', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {ticketTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} 
                    {reservationInfo.pricing_info?.[type] && 
                      ` - $${reservationInfo.pricing_info[type]}`
                    }
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Special Requests
              </label>
              <textarea
                value={formData.special_requests}
                onChange={(e) => handleInputChange('special_requests', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Accessibility needs, group information, etc."
              />
            </div>

            {/* Cost Summary */}
            {totalCost > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-300">Total Cost:</span>
                  <span className="text-white font-semibold">${totalCost.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {formData.party_size} × ${(totalCost / formData.party_size).toFixed(2)} ({formData.ticket_type})
                </div>
              </div>
            )}

            {/* Requirements Warning */}
            {reservationInfo.requirements && Object.keys(reservationInfo.requirements).length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="text-yellow-400 font-medium mb-2">Requirements & Restrictions:</h4>
                <ul className="text-yellow-300 text-sm space-y-1">
                  {Object.entries(reservationInfo.requirements).map(([key, value]) => (
                    <li key={key}>• {key.replace('_', ' ')}: {String(value)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading || !formData.visit_date || !formData.contact_email}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Creating Reservation...' : 
                 totalCost > 0 ? `Reserve for $${totalCost.toFixed(2)}` : 'Create Reservation'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}