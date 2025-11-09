'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { cartService } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import Link from 'next/link';

export default function CartPage() {
  const { isAuthenticated, token } = useAuth();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart();

  const handleRemove = async (itemId: number) => {
    if (!token) return;
    try {
      await cartService.remove(itemId, token);
      removeItem(itemId);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (!token || quantity < 1) return;
    try {
      await cartService.update(itemId, quantity, token);
      updateQuantity(itemId, quantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-600 mb-8">Please login to view your cart</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-600 mb-8">Your cart is empty</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardBody>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.product?.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      ${item.product?.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                      className="mt-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full">Proceed to Checkout</Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
