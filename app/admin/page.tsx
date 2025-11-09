'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('Admin page mounted');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
  }, []);

  useEffect(() => {
    console.log('Auth state changed:', { mounted, isAuthenticated, user });
  }, [mounted, isAuthenticated, user]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    } else if (mounted && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [mounted, isAuthenticated, user, router]);

  // Don't render anything until mounted (client-side)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated yet
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'Categories',
      description: 'Manage categories',
      href: '/admin/categories',
      icon: '�️',
      stats: 'Organize',
      color: 'purple',
    },
    {
      title: 'Orders',
      description: 'Manage orders',
      href: '/admin/orders',
      icon: '🛒',
      stats: 'Track orders',
      color: 'indigo',
    },
    {
      title: 'Users',
      description: 'Manage users',
      href: '/admin/users',
      icon: '👥',
      stats: 'User accounts',
      color: 'pink',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with View Store Button */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.first_name}! Manage your store from here.
              </p>
            </div>
            <Link href="/">
              <button className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition shadow-lg flex items-center gap-2">
                <span className="text-xl">🏪</span>
                <span>View Store</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Products Card with Action Buttons */}
        <div className="mb-8">
          <Card className="border-l-4 border-blue-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-4xl">📦</div>
                <div>
                  <h3 className="text-2xl font-bold">Products Management</h3>
                  <p className="text-gray-600">Manage your product catalog</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/products">
                  <button className="w-full flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition border-2 border-blue-200 hover:border-blue-400">
                    <span className="text-3xl">👁️</span>
                    <span className="font-semibold text-blue-900">View All</span>
                    <span className="text-xs text-blue-600">Browse products</span>
                  </button>
                </Link>
                <Link href="/admin/products/new">
                  <button className="w-full flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition border-2 border-green-200 hover:border-green-400">
                    <span className="text-3xl">➕</span>
                    <span className="font-semibold text-green-900">Create</span>
                    <span className="text-xs text-green-600">Add new product</span>
                  </button>
                </Link>
                <Link href="/admin/products">
                  <button className="w-full flex flex-col items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition border-2 border-yellow-200 hover:border-yellow-400">
                    <span className="text-3xl">✏️</span>
                    <span className="font-semibold text-yellow-900">Edit</span>
                    <span className="text-xs text-yellow-600">Update details</span>
                  </button>
                </Link>
                <Link href="/admin/products">
                  <button className="w-full flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition border-2 border-red-200 hover:border-red-400">
                    <span className="text-3xl">🗑️</span>
                    <span className="font-semibold text-red-900">Delete</span>
                    <span className="text-xs text-red-600">Remove items</span>
                  </button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Sections Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {adminSections.map((section) => {
            const borderColor = 
              section.color === 'blue' ? 'border-blue-500' :
              section.color === 'green' ? 'border-green-500' :
              section.color === 'yellow' ? 'border-yellow-500' :
              section.color === 'red' ? 'border-red-500' :
              section.color === 'purple' ? 'border-purple-500' :
              section.color === 'indigo' ? 'border-indigo-500' :
              section.color === 'pink' ? 'border-pink-500' :
              'border-gray-500';
            
            const textColor = 
              section.color === 'blue' ? 'text-blue-600' :
              section.color === 'green' ? 'text-green-600' :
              section.color === 'yellow' ? 'text-yellow-600' :
              section.color === 'red' ? 'text-red-600' :
              section.color === 'purple' ? 'text-purple-600' :
              section.color === 'indigo' ? 'text-indigo-600' :
              section.color === 'pink' ? 'text-pink-600' :
              'text-gray-600';
            
            return (
              <Link key={section.title} href={section.href}>
                <Card className={`hover:shadow-lg transition cursor-pointer h-full border-l-4 ${borderColor}`}>
                  <CardHeader>
                    <div className="text-4xl mb-2">{section.icon}</div>
                    <h3 className="text-xl font-bold">{section.title}</h3>
                  </CardHeader>
                  <CardBody>
                    <p className="text-gray-600 mb-2">{section.description}</p>
                    <p className={`text-sm ${textColor} font-medium`}>{section.stats}</p>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">🚀 Quick Actions</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition border-l-4 border-gray-500"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏪</span>
                    <div>
                      <div className="font-semibold text-gray-900">View Store</div>
                      <div className="text-sm text-gray-600">See customer-facing store</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/admin/products/new"
                  className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition border-l-4 border-blue-500"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">➕</span>
                    <div>
                      <div className="font-semibold text-blue-900">Add New Product</div>
                      <div className="text-sm text-blue-600">Create a new product listing</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/admin/products"
                  className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition border-l-4 border-green-500"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <div>
                      <div className="font-semibold text-green-900">Manage Products</div>
                      <div className="text-sm text-green-600">View and edit all products</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/admin/orders"
                  className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition border-l-4 border-purple-500"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <div className="font-semibold text-purple-900">View Orders</div>
                      <div className="text-sm text-purple-600">Check recent orders</div>
                    </div>
                  </div>
                </Link>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">📊 Store Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Products</span>
                  <span className="text-2xl font-bold text-blue-600">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Active Orders</span>
                  <span className="text-2xl font-bold text-green-600">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Users</span>
                  <span className="text-2xl font-bold text-purple-600">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Low Stock Items</span>
                  <span className="text-2xl font-bold text-orange-600">-</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Need Help?</h3>
                <p className="text-gray-600">
                  Start by adding products to your catalog. Click the "Add Product" button above or navigate to Products section.
                </p>
              </div>
              <Link href="/admin/products/new">
                <button className="bg-white px-6 py-2 rounded-lg font-semibold hover:shadow-md transition">
                  Get Started
                </button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
