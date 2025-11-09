import { apiClient } from '../client';

export interface WishlistItem {
  id: number;
  product_id: number;
  product?: any;
}

export const wishlistService = {
  get: (token: string) =>
    apiClient.get<WishlistItem[]>('/wishlist', token),

  add: (productId: number, token: string) =>
    apiClient.post<WishlistItem>('/wishlist', { product_id: productId }, token),

  remove: (itemId: number, token: string) =>
    apiClient.delete(`/wishlist/${itemId}`, token),
};
