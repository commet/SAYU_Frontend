// Common types used across the application

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TimestampFields {
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BaseEntity extends TimestampFields {
  id: string;
}