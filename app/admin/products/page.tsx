'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { productService } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Product } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { isAdmin } = useAdmin();
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    }
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      const response = await productService.getAll();
      const productsData = response.data || response;
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!token) return;
    
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.delete(productId, token);
      setProducts(products.filter((p) => p.product_id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products Management</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Link href="/admin/products/new">
            <Button>➕ Add Product</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <Card>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">SKU</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Price</th>
                      <th className="text-left p-3">Stock</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Featured</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.product_id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{product.sku}</td>
                        <td className="p-3">
                          <div className="font-semibold">{product.name}</div>
                          {product.brand && (
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">${product.price.toFixed(2)}</div>
                          {product.compare_at_price && (
                            <div className="text-sm text-gray-400 line-through">
                              ${product.compare_at_price.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              product.stock_quantity > 10
                                ? 'bg-green-100 text-green-800'
                                : product.stock_quantity > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="p-3 text-sm">{product.category_name || '-'}</td>
                        <td className="p-3">
                          {product.is_featured ? (
                            <span className="text-yellow-500">⭐</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/products/${product.product_id}`}>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(product.product_id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No products found. Add your first product!
                </div>
              )}
            </CardBody>
          </Card>
        )}

        <div className="mt-4">
          <Link href="/admin">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
