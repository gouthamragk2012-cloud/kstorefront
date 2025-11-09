import { apiClient } from '../client';
import type { Category } from '@/lib/types';

export const categoryService = {
  getAll: () =>
    apiClient.get<Category[]>('/categories'),

  getById: (id: number) =>
    apiClient.get<Category>(`/categories/${id}`),
};
