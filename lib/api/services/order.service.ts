import { apiClient } from '../client';

export interface Order {
  order_id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  tracking_number?: string;
  created_at: string;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  shipping_address?: {
    full_name: string;
    city: string;
    state: string;
    country: string;
    phone: string;
  };
}

export interface OrderDetail extends Order {
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  payment_method?: string;
  shipping_method?: string;
  customer: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  shipping_address?: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  items: OrderItem[];
  status_history?: StatusHistory[];
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface StatusHistory {
  status: string;
  notes: string;
  created_at: string;
  created_by: number;
}

export const orderService = {
  // User endpoints
  getAll: (token: string) => 
    apiClient.get('/orders', { headers: { Authorization: `Bearer ${token}` } }),
  
  getById: (id: number, token: string) => 
    apiClient.get(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  
  create: (data: any, token: string) => 
    apiClient.post('/orders', data, { headers: { Authorization: `Bearer ${token}` } }),
  
  // Admin endpoints
  getAllAdmin: (token: string, params?: { page?: number; per_page?: number; status?: string }) => 
    apiClient.get('/orders/admin/all', { 
      headers: { Authorization: `Bearer ${token}` },
      params 
    }),
  
  getByIdAdmin: (id: number, token: string) => 
    apiClient.get(`/orders/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  
  updateStatus: (id: number, status: string, notes: string, token: string) => 
    apiClient.put(`/orders/admin/${id}/status`, { status, notes }, { 
      headers: { Authorization: `Bearer ${token}` } 
    }),
  
  updateTracking: (id: number, tracking_number: string, token: string) => 
    apiClient.put(`/orders/admin/${id}/tracking`, { tracking_number }, { 
      headers: { Authorization: `Bearer ${token}` } 
    }),
};
