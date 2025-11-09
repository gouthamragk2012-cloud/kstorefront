'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'Products',
      description: 'Manage product catalog',
      href: '/admin/products',
      icon: '📦',
      stats: 'View, Add, Edit, Delete',
    },
    {
      title: 'Categories',
      description: 'Manage product categories',
      href: '/admin/categories',
      icon: '📁',
      stats: 'Organize products',
    },
    {
      title: 'Orders',
      description: 'View and manage orders',
      href: '/admin/orders',
      icon: '🛒',
      stats: 'Track orders',
    },
    {
      title: 'Users',
      description: 'Manage user accounts',
      href: '/admin/users',
      icon: '👥',
      stats: 'User management',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.first_name}! Manage your store from here.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="hover:shadow-lg transition cursor-pointer h-full">
                <CardHeader>
                  <div className="text-4xl mb-2">{section.icon}</div>
                  <h3 className="text-xl font-bold">{section.title}</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 mb-2">{section.description}</p>
                  <p className="text-sm text-blue-600">{section.stats}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <Link
                href="/admin/products/new"
                className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                ➕ Add New Product
              </Link>
              <Link
                href="/admin/categories/new"
                className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                ➕ Add New Category
              </Link>
              <Link
                href="/admin/orders"
                className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
              >
                📋 View Recent Orders
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
