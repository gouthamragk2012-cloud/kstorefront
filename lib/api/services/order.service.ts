import { apiClient } from '../client';
import type { Order } from '@/lib/types';

export interface CreateOrderData {
  shipping_address: string;
  payment_method: string;
}

export const orderService = {
  getAll: (token: string) =>
    apiClient.get<Order[]>('/orders', token),

  getById: (id: number, token: string) =>
    apiClient.get<Order>(`/orders/${id}`, token),

  create: (data: CreateOrderData, token: string) =>
    apiClient.post<Order>('/orders', data, token),

  cancel: (id: number, token: string) =>
    apiClient.put<Order>(`/orders/${id}/cancel`, {}, token),
};
