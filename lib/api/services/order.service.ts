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
    apiClient.get('/orders', token),
  
  getById: (id: number, token: string) => 
    apiClient.get(`/orders/${id}`, token),
  
  create: (data: any, token: string) => 
    apiClient.post('/orders', data, token),
  
  // Admin endpoints
  getAllAdmin: (token: string, params?: { page?: number; per_page?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get(`/orders/admin/all${query}`, token);
  },
  
  getByIdAdmin: (id: number, token: string) => 
    apiClient.get(`/orders/admin/${id}`, token),
  
  updateStatus: (id: number, status: string, notes: string, token: string) => 
    apiClient.put(`/orders/admin/${id}/status`, { status, notes }, token),
  
  updateTracking: (id: number, tracking_number: string, token: string) => 
    apiClient.put(`/orders/admin/${id}/tracking`, { tracking_number }, token),
};
