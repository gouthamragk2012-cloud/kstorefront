'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAdmin() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  return {
    isAdmin,
    user,
  };
}
