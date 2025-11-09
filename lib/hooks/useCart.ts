'use client';

import { create } from 'zustand';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  
  setItems: (items) => set({ items }),
  
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.product_id === item.product_id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  
  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    })),
  
  clearCart: () => set({ items: [] }),
  
  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );
  },
}));
