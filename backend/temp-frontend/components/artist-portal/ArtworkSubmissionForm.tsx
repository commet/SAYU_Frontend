'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Plus } from 'lucide-react';

interface ArtworkSubmissionFormProps {
  profileId: string;
  profileType: 'artist' | 'gallery';
  onSuccess?: (artwork: any) => void;
  onCancel?: () => void;
}

export function ArtworkSubmissionForm({ 
  profileId, 
  profileType, 
  onSuccess, 
  onCancel 
}: ArtworkSubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    artist_display_name: '',
    creation_date: '',
    medium: '',
    dimensions: '',
    description: '',
    technique: '',
    style: '',
    subject_matter: [] as string[],
    color_palette: [] as string[],
    primary_image_url: '',
    additional_images: [] as string[],
    price_range: '',
    availability_status: 'available',
    exhibition_history: '',
    provenance: '',
    condition_report: '',
    tags: [] as string[]
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newColor, setNewColor] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field: string, value: string, setter: (val: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field as keyof typeof formData] as string[];
      if (!currentArray.includes(value.trim())) {
        handleInputChange(field, [...currentArray, value.trim()]);
      }
      setter('');
    }
  };

  const handleArrayRemove = (field: string, index: number) => {
    const currentArray = formData[field as keyof typeof formData] as string[];
    handleInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (file: File, isPrimary = false) => {
    // In a real implementation, this would upload to your storage service
    // For now, we'll simulate with a placeholder URL
    setUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUrl = `https://example.com/images/${Date.now()}-${file.name}`;
      
      if (isPrimary) {
        handleInputChange('primary_image_url', mockUrl);
      } else {
        const newImages = [...formData.additional_images, mockUrl];
        handleInputChange('additional_images', newImages);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.primary_image_url) {
      alert('Title and primary image are required');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/artist-portal/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          profileId,
          profileType
        })
      });

      if (response.ok) {
        const artwork = await response.json();
        onSuccess?.(artwork);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit artwork');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit artwork');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Submit Artwork</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist Name
              </label>
              <input
                type="text"
                value={formData.artist_display_name}
                onChange={(e) => handleInputChange('artist_display_name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Creation Date
              </label>
              <input
                type="text"
                value={formData.creation_date}
                onChange={(e) => handleInputChange('creation_date', e.target.value)}
                placeholder="e.g., 2024 or circa 1950"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Medium
              </label>
              <input
                type="text"
                value={formData.medium}
                onChange={(e) => handleInputChange('medium', e.target.value)}
                placeholder="e.g., Oil on canvas"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => handleInputChange('dimensions', e.target.value)}
                placeholder="e.g., 24 x 36 inches"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Describe your artwork, its inspiration, and significance..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Images *
            </label>
            
            {/* Primary Image */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Primary Image</div>
              {formData.primary_image_url ? (
                <div className="relative w-32 h-32 bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={formData.primary_image_url} 
                    alt="Primary" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('primary_image_url', '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-400">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Additional Images */}
            <div>
              <div className="text-sm text-gray-400 mb-2">Additional Images (Optional)</div>
              <div className="flex flex-wrap gap-4">
                {formData.additional_images.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 bg-gray-800 rounded-lg overflow-hidden">
                    <img src={url} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = formData.additional_images.filter((_, i) => i !== index);
                        handleInputChange('additional_images', newImages);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ))}
                
                {formData.additional_images.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                    <Plus className="w-5 h-5 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], false)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Tags and Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('tags', newTag, setNewTag))}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleArrayAdd('tags', newTag, setNewTag)}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('tags', index)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Subject Matter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject Matter</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('subject_matter', newSubject, setNewSubject))}
                  placeholder="Add subject..."
                  className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleArrayAdd('subject_matter', newSubject, setNewSubject)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.subject_matter.map((subject, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('subject_matter', index)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color Palette</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('color_palette', newColor, setNewColor))}
                  placeholder="Add color..."
                  className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleArrayAdd('color_palette', newColor, setNewColor)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.color_palette.map((color, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('color_palette', index)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Range
              </label>
              <select
                value={formData.price_range}
                onChange={(e) => handleInputChange('price_range', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select range...</option>
                <option value="Under $500">Under $500</option>
                <option value="$500 - $1,000">$500 - $1,000</option>
                <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                <option value="$10,000+">$10,000+</option>
                <option value="Not for sale">Not for sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Availability
              </label>
              <select
                value={formData.availability_status}
                onChange={(e) => handleInputChange('availability_status', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="on_hold">On Hold</option>
                <option value="not_for_sale">Not for Sale</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || uploading || !formData.title || !formData.primary_image_url}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Artwork'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}