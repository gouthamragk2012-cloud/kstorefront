'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { productService, categoryService } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Category } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (isAdmin) {
      loadCategories();
    }
  }, [isAdmin]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      const cats = response.data || response;
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
      meta_title: name,
    });
  };

  const generateRandomProduct = () => {
    const productNames = [
      'Wireless Bluetooth Headphones',
      'Smart Watch Pro',
      'USB-C Fast Charger',
      'Portable Power Bank 20000mAh',
      'Laptop Stand Aluminum',
      'Mechanical Gaming Keyboard',
      'Wireless Mouse Ergonomic',
      'Phone Case Premium Leather',
      'Screen Protector Tempered Glass',
      'Car Phone Mount Magnetic',
      'LED Desk Lamp',
      'Webcam HD 1080p',
      'External SSD 1TB',
      'Bluetooth Speaker Waterproof',
      'Fitness Tracker Band',
    ];

    const brands = ['TechPro', 'SmartGear', 'ProMax', 'EliteWare', 'PremiumTech', 'UltraGadget'];
    const adjectives = ['Premium', 'Professional', 'Advanced', 'Ultra', 'Pro', 'Elite'];
    
    const randomName = productNames[Math.floor(Math.random() * productNames.length)];
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const randomPrice = (Math.random() * 200 + 10).toFixed(2);
    const randomComparePrice = (parseFloat(randomPrice) * 1.3).toFixed(2);
    const randomCostPrice = (parseFloat(randomPrice) * 0.6).toFixed(2);
    const randomStock = Math.floor(Math.random() * 200) + 10;
    const randomSKU = `${randomBrand.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
    const randomWeight = (Math.random() * 2 + 0.1).toFixed(2);
    
    const shortDesc = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${randomName.split(' ')[0]} with advanced features and premium quality.`;
    const fullDesc = `Experience the best ${randomName.toLowerCase()} on the market. Built with premium materials and cutting-edge technology. Features include: wireless connectivity, long battery life, ergonomic design, and durable construction. Perfect for both professional and personal use. Backed by manufacturer warranty.`;
    
    const randomCategory = categories.length > 0 
      ? categories[Math.floor(Math.random() * categories.length)].category_id.toString()
      : '';

    setFormData({
      sku: randomSKU,
      name: randomName,
      slug: generateSlug(randomName),
      short_description: shortDesc,
      description: fullDesc,
      price: randomPrice,
      compare_at_price: randomComparePrice,
      cost_price: randomCostPrice,
      stock_quantity: randomStock.toString(),
      low_stock_threshold: '10',
      category_id: randomCategory,
      brand: randomBrand,
      weight: randomWeight,
      dimensions: {
        length: (Math.random() * 20 + 5).toFixed(1),
        width: (Math.random() * 15 + 5).toFixed(1),
        height: (Math.random() * 10 + 2).toFixed(1),
        unit: 'cm',
      },
      is_featured: Math.random() > 0.7,
      is_active: true,
      meta_title: `${randomName} - ${randomBrand}`,
      meta_description: shortDesc,
      image_url: '',
    });

    alert('Random product data generated! Review and submit.');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Validate file
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

      // Add dimensions if provided
      if (
        formData.dimensions.length ||
        formData.dimensions.width ||
        formData.dimensions.height
      ) {
        productData.dimensions = formData.dimensions;
      }

      console.log('Sending product data:', productData);
      await productService.create(productData, token);

      alert('Product created successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
            <p className="text-gray-600">Create a new product with complete information</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={generateRandomProduct}
            className="flex items-center gap-2"
          >
            <span>🎲</span>
            <span>Random</span>
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
                  placeholder="PROD-001"
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
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Wireless Phone Charger"
                required
              />

              <Input
                label="URL Slug *"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="wireless-phone-charger"
                required
              />

              <Input
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="TechBrand"
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
                  placeholder="Brief product description (max 500 characters)"
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
                  placeholder="Detailed product description with features and specifications"
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
                  placeholder="29.99"
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
                  placeholder="39.99"
                />

                <Input
                  label="Cost Price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_price: e.target.value })
                  }
                  placeholder="15.00"
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
                  placeholder="100"
                  required
                />

                <Input
                  label="Low Stock Threshold"
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={(e) =>
                    setFormData({ ...formData, low_stock_threshold: e.target.value })
                  }
                  placeholder="10"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
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

              {formData.image_url && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img
                    src={`http://localhost:5000${formData.image_url}`}
                    alt="Product preview"
                    className="w-48 h-48 object-cover rounded-lg border"
                  />
                </div>
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
                placeholder="0.5"
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
                placeholder="Product name for search engines"
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
                  placeholder="Description for search engines (max 160 characters)"
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
              Create Product
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
