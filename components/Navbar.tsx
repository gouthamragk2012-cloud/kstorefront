'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';

export default function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuth();
  const { getTotalItems } = useCart();

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            KStore
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-gray-900">
              Products
            </Link>
            
            <Link href="/cart" className="text-gray-700 hover:text-gray-900 relative">
              Cart
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/orders" className="text-gray-700 hover:text-gray-900">
                  Orders
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user?.first_name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
