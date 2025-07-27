'use client';

import { useState, useCallback } from 'react';

interface UploadedImage {
  url: string;
  publicId: string;
  sizes: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  };
  metadata: {
    width: number;
    height: number;
    format: string;
    bytes: number;
    folder: string;
  };
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseImageUploadOptions {
  category: 'artist_profiles' | 'artist_artworks' | 'gallery_profiles' | 'gallery_exhibitions';
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (image: UploadedImage) => void;
  onError?: (error: string) => void;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
}

export function useImageUpload(options: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    category,
    onProgress,
    onSuccess,
    onError,
    maxFileSize = 5 * 1024 * 1024, // 5MB
    acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  const validateFile = useCallback((file: File): string | null => {
    // 파일 크기 검증
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // 파일 타입 검증
    if (!acceptedTypes.includes(file.type)) {
      return `File type must be one of: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }

    return null;
  }, [maxFileSize, acceptedTypes]);

  const uploadImage = useCallback(async (file: File, description?: string): Promise<UploadedImage | null> => {
    setError(null);
    setUploadProgress(null);

    // 파일 검증
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return null;
    }

    setIsUploading(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      if (description) {
        formData.append('description', description);
      }

      // 토큰 가져오기
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // XMLHttpRequest로 업로드 진행률 추적
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        // 업로드 진행률 이벤트
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            setUploadProgress(progress);
            onProgress?.(progress);
          }
        });

        // 완료 이벤트
        xhr.addEventListener('load', () => {
          setIsUploading(false);
          setUploadProgress(null);

          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                const uploadedImage = response.image;
                onSuccess?.(uploadedImage);
                resolve(uploadedImage);
              } else {
                const errorMessage = response.error || 'Upload failed';
                setError(errorMessage);
                onError?.(errorMessage);
                reject(new Error(errorMessage));
              }
            } catch (parseError) {
              const errorMessage = 'Invalid response from server';
              setError(errorMessage);
              onError?.(errorMessage);
              reject(new Error(errorMessage));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              const errorMessage = errorResponse.error || `Upload failed (${xhr.status})`;
              setError(errorMessage);
              onError?.(errorMessage);
              reject(new Error(errorMessage));
            } catch {
              const errorMessage = `Upload failed (${xhr.status})`;
              setError(errorMessage);
              onError?.(errorMessage);
              reject(new Error(errorMessage));
            }
          }
        });

        // 에러 이벤트
        xhr.addEventListener('error', () => {
          setIsUploading(false);
          setUploadProgress(null);
          const errorMessage = 'Network error during upload';
          setError(errorMessage);
          onError?.(errorMessage);
          reject(new Error(errorMessage));
        });

        // 요청 시작
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        xhr.open('POST', `${apiUrl}/api/artist-portal/upload/image`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(null);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    }
  }, [category, validateFile, onProgress, onSuccess, onError]);

  const uploadMultipleImages = useCallback(async (
    files: File[], 
    descriptions?: string[]
  ): Promise<UploadedImage[]> => {
    setError(null);
    setUploadProgress(null);

    // 각 파일 검증
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        onError?.(`${file.name}: ${validationError}`);
        return [];
      }
    }

    setIsUploading(true);

    try {
      // FormData 생성
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
      });
      formData.append('category', category);
      if (descriptions) {
        formData.append('descriptions', JSON.stringify(descriptions));
      }

      // 토큰 가져오기
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artist-portal/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Batch upload failed');
      }

      if (result.success) {
        const uploadedImages = result.results.successful;
        
        // 실패한 업로드가 있으면 경고
        if (result.results.failed.length > 0) {
          const failedCount = result.results.failed.length;
          console.warn(`${failedCount} images failed to upload:`, result.results.failed);
        }

        onSuccess?.(uploadedImages);
        return uploadedImages;
      } else {
        throw new Error(result.error || 'Batch upload failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [category, validateFile, onSuccess, onError]);

  const deleteImage = useCallback(async (publicId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const encodedPublicId = encodeURIComponent(publicId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artist-portal/upload/image/${encodedPublicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }

      return result.success;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    }
  }, [onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    isUploading,
    uploadProgress,
    error,
    clearError
  };
}

// 이미지 미리보기 생성 훅
export function useImagePreview() {
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const createPreview = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [file.name]: url }));
    return url;
  }, []);

  const removePreview = useCallback((fileName: string) => {
    setPreviews(prev => {
      const newPreviews = { ...prev };
      if (newPreviews[fileName]) {
        URL.revokeObjectURL(newPreviews[fileName]);
        delete newPreviews[fileName];
      }
      return newPreviews;
    });
  }, []);

  const clearAllPreviews = useCallback(() => {
    Object.values(previews).forEach(url => URL.revokeObjectURL(url));
    setPreviews({});
  }, [previews]);

  return {
    previews,
    createPreview,
    removePreview,
    clearAllPreviews
  };
}