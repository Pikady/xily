// API 相关类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 通用类型
export interface IdEntity {
  id: number;
}

export interface TimestampEntity {
  created_at: string;
  updated_at: string;
}

export interface SoftDeleteEntity {
  is_deleted: boolean;
  deleted_at?: string;
}