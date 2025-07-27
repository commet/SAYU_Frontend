import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axios 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // 토큰 만료 처리
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 로그인 페이지로 리다이렉트
        window.location.href = '/auth/login';
      }
    }

    // 네트워크 에러 처리
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network connection failed'));
    }

    // API 에러 응답 처리
    const apiError = {
      status: error.response.status,
      message: error.response.data?.message || error.response.data?.error || 'An error occurred',
      data: error.response.data,
    };

    console.error('API Error:', apiError);
    return Promise.reject(apiError);
  }
);

// 파일 업로드용 API 클라이언트
export const createUploadClient = (onProgress?: (progress: number) => void): AxiosInstance => {
  const uploadClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 60000, // 파일 업로드는 60초 타임아웃
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 업로드 진행률 추적
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  // 토큰 추가
  uploadClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return uploadClient;
};

// 유틸리티 함수들
export const apiUtils = {
  // 에러 메시지 추출
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.data?.message) return error.data.message;
    if (error?.data?.error) return error.data.error;
    return 'An unexpected error occurred';
  },

  // 성공 응답 확인
  isSuccessResponse: (response: any): boolean => {
    return response?.status >= 200 && response?.status < 300;
  },

  // FormData 생성 헬퍼
  createFormData: (data: Record<string, any>): FormData => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          if (value.every(item => item instanceof File)) {
            // 파일 배열
            value.forEach(file => formData.append(key, file));
          } else {
            // 일반 배열
            formData.append(key, JSON.stringify(value));
          }
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  },

  // URL 쿼리 파라미터 생성
  createQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return searchParams.toString();
  }
};

// 사용자 인증 상태 확인
export const authUtils = {
  // 토큰 존재 여부 확인
  hasToken: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  // 사용자 정보 가져오기
  getUser: (): any => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 로그아웃
  logout: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 로그인 상태 확인
  isLoggedIn: (): boolean => {
    return authUtils.hasToken() && !!authUtils.getUser();
  }
};