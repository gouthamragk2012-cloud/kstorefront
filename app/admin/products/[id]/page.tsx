'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { productService, categoryService } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Category } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin } = useAdmin();
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    slug: '',
    short_description: '',
    description: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    category_id: '',
    brand: '',
    weight: '',
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    is_featured: false,
    is_active: true,
    meta_title: '',
    meta_description: '',
    image_url: '',
  });

  useEffect(() => {
    if (isAdmin && params.id) {
      loadProduct();
      loadCategories();
    }
  }, [isAdmin, params.id]);

  const loadProduct = async () => {
    try {
      const product = await productService.getById(Number(params.id));
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        slug: product.slug || '',
        short_description: product.short_description || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        compare_at_price: product.compare_at_price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        low_stock_threshold: product.low_stock_threshold?.toString() || '10',
        category_id: product.category_id?.toString() || '',
        brand: product.brand || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || { length: '', width: '', height: '', unit: 'cm' },
        is_featured: product.is_featured || false,
        is_active: product.is_active !== false,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        image_url: product.primary_image || '',
      });
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Failed to load product');
    } finally {
      setLoadingProduct(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      const cats = response.data || response;
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ ...formData, image_url: data.image_url });
        alert('Image uploaded successfully!');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const productData: any = {
        sku: formData.sku,
        name: formData.name,
        slug: formData.slug,
        short_description: formData.short_description || undefined,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price
          ? parseFloat(formData.compare_at_price)
          : undefined,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        stock_quantity: parseInt(formData.stock_quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        brand: formData.brand || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
      };

      if (
        formData.dimensions.length ||
        formData.dimensions.width ||
        formData.dimensions.height
      ) {
        productData.dimensions = formData.dimensions;
      }

      await productService.update(Number(params.id), productData, token);
      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await productService.delete(Number(params.id), token);
      alert('Product deleted successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.message || 'Failed to delete product');
    }
  };

  if (!isAdmin) return null;

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading product...</div>
          <div className="text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Edit Product</h1>
            <p className="text-gray-600 text-sm sm:text-base">Update product information</p>
          </div>
          <Button variant="danger" onClick={handleDelete} className="w-full sm:w-auto">
            🗑️ Delete Product
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Basic Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="SKU *"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Product Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="URL Slug *"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />

              <Input
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={6}
                />
              </div>
            </CardBody>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Pricing & Inventory</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Price *"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />

                <Input
                  label="Compare at Price"
                  type="number"
                  step="0.01"
                  value={formData.compare_at_price}
                  onChange={(e) =>
                    setFormData({ ...formData, compare_at_price: e.target.value })
                  }
                />

                <Input
                  label="Cost Price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_price: e.target.value })
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Stock Quantity *"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                  required
                />

                <Input
                  label="Low Stock Threshold"
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={(e) =>
                    setFormData({ ...formData, low_stock_threshold: e.target.value })
                  }
                />
              </div>
            </CardBody>
          </Card>

          {/* Product Image */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Product Image</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {formData.image_url && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                  <img
                    src={`http://localhost:5000${formData.image_url}`}
                    alt="Product"
                    className="w-48 h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  disabled={uploadingImage}
                />
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>

              {uploadingImage && (
                <div className="text-sm text-blue-600">Uploading image...</div>
              )}
            </CardBody>
          </Card>

          {/* Shipping & Dimensions */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Shipping & Dimensions</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Length"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.length}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, length: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="Width"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, width: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="Height"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, height: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* SEO & Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">SEO & Settings</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Meta Title"
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData({ ...formData, meta_title: e.target.value })
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  maxLength={160}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, is_featured: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium">
                    ⭐ Featured Product (Show on homepage)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    ✅ Active (Visible to customers)
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" isLoading={loading} className="flex-1">
              💾 Update Product
            </Button>
            <Link href="/admin/products" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
