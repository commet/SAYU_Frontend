'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, CheckCircle, AlertCircle, X, ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';

interface ImageUploadDemoProps {
  category?: 'artist_profiles' | 'artist_artworks' | 'gallery_profiles' | 'gallery_exhibitions';
  onUploadSuccess?: (imageUrl: string) => void;
}

export function ImageUploadDemo({ 
  category = 'artist_artworks',
  onUploadSuccess 
}: ImageUploadDemoProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const {
    uploadImage,
    isUploading,
    uploadProgress,
    error: uploadError,
    clearError
  } = useImageUpload({
    category,
    onSuccess: (image) => {
      setUploadedImages(prev => [...prev, image.url]);
      onUploadSuccess?.(image.url);
      console.log('Upload successful:', image);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    }
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadImage(file, `Demo upload - ${file.name}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Image Upload Demo</h3>
        <p className="text-sm text-gray-300">
          Category: <span className="text-purple-400 font-mono">{category}</span>
        </p>
      </div>

      {/* Upload Error Display */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 mb-4"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Upload Error</p>
            <p className="text-red-300 text-sm">{uploadError}</p>
          </div>
          <button
            onClick={clearError}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-purple-400 font-medium">Uploading to Cloudinary...</span>
            <span className="text-purple-300 text-sm ml-auto">{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
          <div className="text-xs text-purple-300 mt-1">
            {Math.round(uploadProgress.loaded / 1024)} KB / {Math.round(uploadProgress.total / 1024)} KB
          </div>
        </motion.div>
      )}

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-purple-400 font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Drop files here or click to upload</p>
              <p className="text-gray-400 text-sm">Supports: JPG, PNG, GIF, WebP (max 5MB)</p>
            </div>
            <label className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors">
              Choose Files
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Uploaded Images ({uploadedImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((url, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiAxNmMxLjEgMCAyLS45IDItMnMtLjktMi0yLTItMiAuOS0yIDIgLjkgMiAyIDJ6bTAtNGMxLjEgMCAyLS45IDItMnMtLjktMi0yLTItMiAuOS0yIDIgLjkgMiAyIDJ6bTAgNGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6IiBmaWxsPSIjNkI3Mjc5Ii8+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="truncate">Image {index + 1}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Test Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h4 className="text-white font-medium mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setUploadedImages([])}
            disabled={uploadedImages.length === 0}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm rounded transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              const urls = uploadedImages.join('\n');
              navigator.clipboard.writeText(urls);
              alert('URLs copied to clipboard!');
            }}
            disabled={uploadedImages.length === 0}
            className="px-3 py-1 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm rounded transition-colors"
          >
            Copy URLs
          </button>
          <div className="text-sm text-gray-400 flex items-center">
            Status: {isUploading ? 'Uploading...' : 'Ready'}
          </div>
        </div>
      </div>
    </div>
  );
}