import { apiClient } from '../client';
import type { Product } from '@/lib/types';

export interface ProductFilters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  is_featured?: boolean;
}

export const productService = {
  getAll: (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<any>(`/products${query}`);
  },

  getById: (id: number) =>
    apiClient.get<Product>(`/products/${id}`),

  create: (data: Partial<Product>, token: string) =>
    apiClient.post<Product>('/products', data, token),

  update: (id: number, data: Partial<Product>, token: string) =>
    apiClient.put<Product>(`/products/${id}`, data, token),

  delete: (id: number, token: string) =>
    apiClient.delete(`/products/${id}`, token),
};
