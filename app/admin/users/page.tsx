'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/Card';
import Link from 'next/link';

interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (mounted && isAuthenticated && user?.role === 'admin' && token) {
      loadUsers();
    }
  }, [mounted, isAuthenticated, user, token]);

  const loadUsers = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response: any = await apiClient.get('/users', token);
      const usersData = response.data || response;
      // Filter to show only customers, not admins
      const customers = Array.isArray(usersData) 
        ? usersData.filter((u: User) => u.role === 'customer') 
        : [];
      setUsers(customers);
      setFilteredUsers(customers);
      setDisplayedUsers(customers.slice(0, 5));
    } catch (error: any) {
      console.error('Error loading users:', error);
      alert(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      setDisplayedUsers(users.slice(0, displayCount));
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(u => 
      u.first_name.toLowerCase().includes(query) ||
      u.last_name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.user_id.toString().includes(query)
    );
    setFilteredUsers(filtered);
    setDisplayedUsers(filtered.slice(0, displayCount));
  }, [searchQuery, users, displayCount]);

  const loadMore = () => {
    const newCount = displayCount + 5;
    setDisplayCount(newCount);
    setDisplayedUsers(filteredUsers.slice(0, newCount));
  };

  if (!mounted || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
              <p className="text-gray-600">View and manage customer accounts</p>
            </div>
            <Link href="/admin">
              <button className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
                ← Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Found {filteredUsers.length} customer{filteredUsers.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading customers...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">No Customers Found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'No customers match your search' : 'No customers registered yet'}
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody className="p-0">
              {/* Fixed height container with scroll */}
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Verified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedUsers.map((u) => (
                      <tr key={u.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {u.first_name.charAt(0)}{u.last_name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {u.first_name} {u.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {u.user_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {u.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Load More Button inside the card */}
              {filteredUsers.length > displayedUsers.length && (
                <div className="border-t bg-gray-50 px-6 py-4">
                  <button
                    onClick={loadMore}
                    className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Load More ({filteredUsers.length - displayedUsers.length} remaining)
                  </button>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Summary Stats - Customers Only */}
        {!loading && users.length > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {users.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Customers</div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {users.filter(u => u.is_active).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Active Customers</div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {users.filter(u => u.is_verified).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Verified</div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {users.filter(u => !u.is_verified).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Unverified</div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
