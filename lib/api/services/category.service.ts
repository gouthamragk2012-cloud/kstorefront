import { apiClient } from '../client';
import type { Category } from '@/lib/types';

export const categoryService = {
  getAll: () =>
    apiClient.get<any>('/categories'),

  getById: (id: number) =>
    apiClient.get<Category>(`/categories/${id}`),
};
