'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { productService, categoryService } from '@/lib/api';
import type { Product, Category } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getAll({ is_featured: true }),
      categoryService.getAll()
    ])
      .then(([productsRes, categoriesRes]) => {
        const products = productsRes.data || productsRes;
        const cats = categoriesRes.data || categoriesRes;
        setFeaturedProducts(Array.isArray(products) ? products.slice(0, 4) : []);
        setCategories(Array.isArray(cats) ? cats : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to KStore</h1>
          <p className="text-xl mb-8">Your modern ecommerce solution</p>
          <Link 
            href="/products" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.category_id}
                href={`/products?category=${category.category_id}`}
                className="p-6 border rounded-lg hover:shadow-lg transition text-center"
              >
                <h3 className="font-semibold text-lg">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured Products Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center text-gray-500">Loading products...</div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
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
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.short_description}
                    </p>
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
                    </div>
                    <Link href="/products">
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              No featured products available
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Shop With Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">From electronics to fashion, find everything you need</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure Checkout</h3>
            <p className="text-gray-600">Safe and secure payment processing</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick shipping to your doorstep</p>
          </div>
        </div>
      </div>
    </main>
  );
}
