'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { orderService, type OrderDetail } from '@/lib/api';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.id as string);
  const { user, isAuthenticated, token } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Edit states
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [editingTracking, setEditingTracking] = useState(false);
  const [newTracking, setNewTracking] = useState('');
  const [updating, setUpdating] = useState(false);

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
      loadOrder();
    }
  }, [mounted, isAuthenticated, user, token, orderId]);

  const loadOrder = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response: any = await orderService.getByIdAdmin(orderId, token);
      const orderData = response.data || response;
      setOrder(orderData);
      setNewStatus(orderData.status);
      setNewTracking(orderData.tracking_number || '');
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!token || !newStatus) return;
    
    try {
      setUpdating(true);
      await orderService.updateStatus(orderId, newStatus, statusNotes, token);
      alert('Order status updated successfully!');
      setEditingStatus(false);
      setStatusNotes('');
      loadOrder();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!token || !newTracking) return;
    
    try {
      setUpdating(true);
      await orderService.updateTracking(orderId, newTracking, token);
      alert('Tracking number updated successfully!');
      setEditingTracking(false);
      loadOrder();
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Failed to update tracking number');
    } finally {
      setUpdating(false);
    }
  };

  if (!mounted || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Link href="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Details</h1>
              <p className="text-gray-600 text-sm sm:text-base">Order #{order.order_number}</p>
            </div>
            <Link href="/admin/orders" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
                ← Back to Orders
              </button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Order Status</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Status</label>
                      <div className="mt-1">
                        <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    {!editingStatus && (
                      <Button onClick={() => setEditingStatus(true)}>
                        Update Status
                      </Button>
                    )}
                  </div>

                  {editingStatus && (
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Status
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full border rounded-lg px-4 py-2"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                          className="w-full border rounded-lg px-4 py-2"
                          rows={3}
                          placeholder="Add notes about this status change..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateStatus} disabled={updating}>
                          {updating ? 'Updating...' : 'Save Status'}
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setEditingStatus(false);
                            setNewStatus(order.status);
                            setStatusNotes('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Tracking Number */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Tracking Information</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                      <div className="mt-1 text-lg font-mono">
                        {order.tracking_number || 'Not assigned'}
                      </div>
                    </div>
                    {!editingTracking && (
                      <Button onClick={() => setEditingTracking(true)}>
                        {order.tracking_number ? 'Update' : 'Add'} Tracking
                      </Button>
                    )}
                  </div>

                  {editingTracking && (
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={newTracking}
                          onChange={(e) => setNewTracking(e.target.value)}
                          className="w-full border rounded-lg px-4 py-2"
                          placeholder="Enter tracking number..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateTracking} disabled={updating || !newTracking}>
                          {updating ? 'Updating...' : 'Save Tracking'}
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            setEditingTracking(false);
                            setNewTracking(order.tracking_number || '');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Order Items</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-4 last:border-b-0">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${item.total_price.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">${item.unit_price.toFixed(2)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Status History */}
            {order.status_history && order.status_history.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">Status History</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {order.status_history.map((history, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(history.status)}`}>
                            {history.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(history.created_at).toLocaleString()}
                          </span>
                        </div>
                        {history.notes && (
                          <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Column - Customer & Summary */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Customer Information</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <div className="font-semibold">
                      {order.customer.first_name} {order.customer.last_name}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div>{order.customer.email}</div>
                  </div>
                  {order.customer.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <div>{order.customer.phone}</div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Shipping Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-1">
                    <div className="font-semibold">{order.shipping_address.full_name}</div>
                    <div>{order.shipping_address.address_line1}</div>
                    {order.shipping_address.address_line2 && (
                      <div>{order.shipping_address.address_line2}</div>
                    )}
                    <div>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </div>
                    <div>{order.shipping_address.country}</div>
                    {order.shipping_address.phone && (
                      <div className="mt-2 text-sm text-gray-600">
                        Phone: {order.shipping_address.phone}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Order Summary</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>${order.shipping_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${order.tax_amount.toFixed(2)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{order.payment_method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                  {order.shipping_method && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping Method</span>
                      <span className="font-medium">{order.shipping_method}</span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Order Date */}
            <Card>
              <CardBody>
                <div className="text-sm text-gray-600">
                  Order placed on {new Date(order.created_at).toLocaleString()}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
