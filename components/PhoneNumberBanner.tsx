'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api';

export default function PhoneNumberBanner() {
  const { user, isAuthenticated, token } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Show banner if user is logged in, is a customer, and has no phone number
    if (isAuthenticated && user?.role === 'customer' && !user?.phone) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.put('/users/profile', { phone }, token);
      setShowBanner(false);
      // Refresh page to update user data
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store in localStorage to not show again for this session
    localStorage.setItem('phoneNumberBannerDismissed', 'true');
  };

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = localStorage.getItem('phoneNumberBannerDismissed');
    if (dismissed === 'true') {
      setShowBanner(false);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">📱</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Complete Your Profile</p>
              <p className="text-xs text-blue-100">Add your phone number for order updates and support</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2 rounded-lg text-gray-900 text-sm w-48 focus:ring-2 focus:ring-white focus:outline-none"
              required
              pattern="[0-9+\-\s()]+"
              title="Please enter a valid phone number"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-white hover:text-blue-100 px-2"
              title="Dismiss"
            >
              ✕
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
