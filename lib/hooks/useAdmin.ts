'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAdmin() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    // Give time for auth state to load from storage
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isAdmin, router]);

  return {
    isAdmin,
    user,
    isLoading,
  };
}
