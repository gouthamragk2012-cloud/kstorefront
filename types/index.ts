/**
 * Common types for the application
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: string;
};

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
