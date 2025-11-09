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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

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

  const handleDelete = async (productId: number, productName: string) => {
    if (!token) return;
    
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await productService.delete(productId, token);
      setProducts(products.filter((p) => p.product_id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category_name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category_name).filter(Boolean)));

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Products Management</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage your product catalog - {products.length} total products
              </p>
            </div>
            <Link href="/admin/products/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">➕ Add New Product</Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.stock_quantity > 10).length}
                </div>
                <div className="text-sm text-gray-600">In Stock</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length}
                </div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock_quantity === 0).length}
                </div>
                <div className="text-sm text-gray-600">Out of Stock</div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg font-semibold mb-2">Loading products...</div>
            <div className="text-gray-500">Please wait</div>
          </div>
        ) : (
          <Card>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Image</th>
                      <th className="text-left p-3 font-semibold">SKU</th>
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold">Price</th>
                      <th className="text-left p-3 font-semibold">Stock</th>
                      <th className="text-left p-3 font-semibold">Category</th>
                      <th className="text-center p-3 font-semibold">Status</th>
                      <th className="text-right p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.product_id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          {product.primary_image ? (
                            <img
                              src={`http://localhost:5000${product.primary_image}`}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                        </td>
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
                            className={`px-2 py-1 rounded text-sm font-medium ${
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
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {product.is_featured && (
                              <span className="text-yellow-500 text-lg" title="Featured">⭐</span>
                            )}
                            {product.is_active !== false ? (
                              <span className="text-green-500 text-sm" title="Active">✅</span>
                            ) : (
                              <span className="text-gray-400 text-sm" title="Inactive">⏸️</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/products/${product.product_id}`}>
                              <Button size="sm" variant="outline">
                                ✏️ Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(product.product_id, product.name)}
                            >
                              🗑️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm || filterCategory ? (
                    <>
                      <div className="text-lg font-semibold mb-2">No products found</div>
                      <div>Try adjusting your search or filter</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-semibold mb-2">No products yet</div>
                      <div className="mb-4">Start by adding your first product</div>
                      <Link href="/admin/products/new">
                        <Button>➕ Add Product</Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <Link href="/admin">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
