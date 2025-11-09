import { apiClient } from '../client';
import type { CartItem } from '@/lib/types';

export interface AddToCartData {
  product_id: number;
  quantity: number;
}

export const cartService = {
  get: (token: string) =>
    apiClient.get<CartItem[]>('/cart', token),

  add: (data: AddToCartData, token: string) =>
    apiClient.post<CartItem>('/cart', data, token),

  update: (itemId: number, quantity: number, token: string) =>
    apiClient.put<CartItem>(`/cart/${itemId}`, { quantity }, token),

  remove: (itemId: number, token: string) =>
    apiClient.delete(`/cart/${itemId}`, token),

  clear: (token: string) =>
    apiClient.delete('/cart', token),
};
