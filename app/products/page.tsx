'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';
import { cartService } from '@/lib/api';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    productService
      .getAll()
      .then((response) => {
        // Backend returns paginated response with data array
        const productsData = response.data || response;
        setProducts(Array.isArray(productsData) ? productsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated || !token) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const cartItem = await cartService.add(
        { product_id: product.product_id, quantity: 1 },
        token
      );
      addItem({ ...cartItem, product });
      alert('Added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.product_id} className="hover:shadow-lg transition">
            {product.primary_image ? (
              <img
                src={product.primary_image}
                alt={product.name}
                className="h-48 w-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="bg-gray-200 h-48 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
            <CardBody>
              <h3 className="font-semibold mb-2 text-lg">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.short_description || product.description}
              </p>
              {product.brand && (
                <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
              )}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </p>
                  {product.compare_at_price && (
                    <p className="text-sm text-gray-400 line-through">
                      ${product.compare_at_price.toFixed(2)}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock_quantity}
                </span>
              </div>
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
                disabled={product.stock_quantity === 0}
              >
                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No products available
        </div>
      )}
    </div>
  );
}
