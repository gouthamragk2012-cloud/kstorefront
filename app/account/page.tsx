'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api';

import AddressAutocomplete from '@/components/AddressAutocomplete';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    first_name: '', last_name: '', email: '', phone: '', gender: '', date_of_birth: '', is_verified: false
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressForm, setAddressForm] = useState({
    address_id: null as number | null,
    address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: '', is_default: false
  });

  const loadProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response: any = await apiClient.get('/users/profile', token);
      const data = response.data || response;
      setProfileData({
        first_name: data.first_name || '', last_name: data.last_name || '', email: data.email || '',
        phone: data.phone || '', gender: data.gender || '', date_of_birth: data.date_of_birth || '',
        is_verified: data.is_verified || false
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadAddresses = useCallback(async () => {
    if (!token) return;
    
    try {
      const response: any = await apiClient.get('/users/addresses', token);
      const addressList = Array.isArray(response.data || response) ? (response.data || response) : [];
      console.log('Loaded addresses:', addressList);
      setAddresses(addressList);
      
      // Pre-populate address form with default address if exists
      const defaultAddr = addressList.find((addr: any) => addr.is_default);
      console.log('Default address:', defaultAddr);
      if (defaultAddr) {
        setAddressForm({
          address_id: defaultAddr.address_id,
          address_line1: defaultAddr.address_line1 || '',
          address_line2: defaultAddr.address_line2 || '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          postal_code: defaultAddr.postal_code || '',
          country: defaultAddr.country || '',
          is_default: true
        });
      }
    } catch (err: any) {
      console.debug('No addresses loaded:', err);
    }
  }, [token]);

  useEffect(() => { setMounted(true); }, []);
  
  useEffect(() => { 
    if (mounted && !isAuthenticated) {
      router.push('/login'); 
    }
  }, [mounted, isAuthenticated, router]);
  
  useEffect(() => { 
    // Only load data when we have both authentication AND a valid token
    console.log('Account page effect:', { mounted, isAuthenticated, hasToken: !!token });
    if (mounted && isAuthenticated && token) { 
      console.log('Loading profile and addresses...');
      loadProfile(); 
      loadAddresses(); 
    }
  }, [mounted, isAuthenticated, token, loadProfile, loadAddresses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setError(''); setSuccess(''); setSaving(true);
    try {
      // Save profile
      await apiClient.put('/users/profile', {
        first_name: profileData.first_name, last_name: profileData.last_name, phone: profileData.phone,
        gender: profileData.gender || null, date_of_birth: profileData.date_of_birth || null
      }, token);
      
      // Save address if provided
      if (addressForm.address_line1 && addressForm.city && addressForm.state && addressForm.postal_code && addressForm.country) {
        console.log('Saving address:', addressForm);
        
        let addressResponse;
        if (addressForm.address_id) {
          console.log('Updating existing address:', addressForm.address_id);
          addressResponse = await apiClient.put(`/users/addresses/${addressForm.address_id}`, {
            address_line1: addressForm.address_line1,
            address_line2: addressForm.address_line2,
            city: addressForm.city,
            state: addressForm.state,
            postal_code: addressForm.postal_code,
            country: addressForm.country,
            is_default: true
          }, token);
        } else {
          console.log('Creating new address');
          addressResponse = await apiClient.post('/users/addresses', {
            ...addressForm,
            is_default: true
          }, token);
        }
        console.log('Address save response:', addressResponse);
        
        // Reload addresses to get updated data
        await loadAddresses();
      }
      
      setSuccess('Profile saved successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };



  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>;
  
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center"><div className="text-lg">Redirecting to login...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">My Account</h1>
          <p className="text-gray-600 text-lg">Manage your profile and personal information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">{success}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <div className="text-lg text-gray-600">Loading your profile...</div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Summary Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-24"></div>
                <div className="px-6 pb-6 -mt-12">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                        {profileData.first_name.charAt(0)}{profileData.last_name.charAt(0)}
                      </div>
                      {profileData.is_verified && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-1 text-gray-800">{profileData.first_name} {profileData.last_name}</h2>
                    <p className="text-sm text-gray-500 mb-6">{profileData.email}</p>
                    
                    <div className="space-y-3 text-sm">
                      {profileData.phone && (
                        <div className="flex items-center justify-center gap-2 text-gray-700 bg-gray-50 py-2 px-4 rounded-lg">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          <span className="font-medium">{profileData.phone}</span>
                        </div>
                      )}
                      {profileData.is_verified ? (
                        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 px-4 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="font-medium">Verified Account</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-yellow-600 bg-yellow-50 py-2 px-4 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <span className="font-medium">Not Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Profile Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your personal details and address</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Profile
                  </button>
                )}
              </div>

                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">First Name</p>
                        <p className="text-lg font-semibold text-gray-800">{profileData.first_name}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Name</p>
                        <p className="text-lg font-semibold text-gray-800">{profileData.last_name}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                      <p className="text-lg font-semibold text-gray-800">{profileData.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-800">{profileData.phone || 'Not provided'}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                        <p className="text-lg font-semibold text-gray-800 capitalize">{profileData.gender || 'Not specified'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date of Birth</p>
                        <p className="text-lg font-semibold text-gray-800">{profileData.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
                      </div>
                    </div>
                    {addresses.length > 0 && addresses.find((addr: any) => addr.is_default) && (
                      <div className="pt-6 border-t-2 border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Delivery Address</p>
                        </div>
                        {(() => {
                          const defaultAddr = addresses.find((addr: any) => addr.is_default);
                          return defaultAddr ? (
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-100">
                              <p className="font-semibold text-gray-800 text-lg mb-1">{defaultAddr.address_line1}</p>
                              {defaultAddr.address_line2 && <p className="text-gray-600 mb-1">{defaultAddr.address_line2}</p>}
                              <p className="text-gray-600">{defaultAddr.city}, {defaultAddr.state} {defaultAddr.postal_code}</p>
                              <p className="text-gray-600 font-medium mt-1">{defaultAddr.country}</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                      <input type="text" value={profileData.first_name} onChange={(e) => setProfileData({...profileData, first_name: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                      <input type="text" value={profileData.last_name} onChange={(e) => setProfileData({...profileData, last_name: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input type="email" value={profileData.email} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed" disabled />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      Email cannot be changed
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" required />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender (Optional)</label>
                      <select value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                      <input type="date" value={profileData.date_of_birth} onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" required max={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="pt-6 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <h4 className="text-lg font-bold text-gray-800">Delivery Address</h4>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                        <AddressAutocomplete value={addressForm.address_line1} onChange={(v) => setAddressForm({...addressForm, address_line1: v})} onPlaceSelected={(p) => setAddressForm({...addressForm, address_line1: p.address, city: p.city, state: p.state, postal_code: p.postalCode, country: p.country})} placeholder="Start typing your address..." required />
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                          Start typing and select from suggestions
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Apartment, Suite, etc. (Optional)</label>
                        <input type="text" placeholder="Apartment, suite, unit, building, floor, etc." value={addressForm.address_line2} onChange={(e) => setAddressForm({...addressForm, address_line2: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                          <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">State / Province *</label>
                          <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" required />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Postal / ZIP Code *</label>
                          <input type="text" value={addressForm.postal_code} onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                          <input type="text" value={addressForm.country} onChange={(e) => setAddressForm({...addressForm, country: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" required />
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
                      <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2">
                        {saving ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Save All Changes
                          </>
                        )}
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-gray-700">Cancel</button>
                    </div>
                  </form>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
