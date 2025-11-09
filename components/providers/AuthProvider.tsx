'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { cartService } from '@/lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const { setItems } = useCart();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Load cart when user is authenticated
      cartService
        .get(token)
        .then((items) => setItems(items))
        .catch((error) => console.error('Failed to load cart:', error));
    } else {
      setItems([]);
    }
  }, [isAuthenticated, token, setItems]);

  return <>{children}</>;
}
