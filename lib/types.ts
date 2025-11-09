export interface Product {
  product_id: number;
  id?: number; // Alias for compatibility
  sku: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  category_id?: number;
  category_name?: string;
  brand?: string;
  is_featured?: boolean;
  primary_image?: string;
  image_url?: string;
}

export interface Category {
  category_id: number;
  id?: number; // Alias for compatibility
  slug: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface User {
  user_id: number;
  id?: number; // Alias
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin';
  phone?: string;
  is_verified?: boolean;
}
