export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  image_url?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
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
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}
