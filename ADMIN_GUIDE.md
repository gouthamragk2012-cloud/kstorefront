# Admin Dashboard Guide

## Overview
The KStore Admin Dashboard provides a comprehensive interface for managing your ecommerce store. It's built with future-proof architecture and integrates seamlessly with your backend APIs.

## Features

### ✅ Current Features
- **Product Management**: Create, Read, Update, Delete products
- **Role-Based Access**: Only admin users can access admin panel
- **Category Integration**: Link products to categories
- **Featured Products**: Mark products to show on homepage
- **Stock Management**: Track inventory levels
- **Pricing**: Regular and sale pricing support
- **Brand Management**: Organize products by brand

### 🚀 Future-Ready Architecture
- Modular design for easy expansion
- API-driven (works with any backend)
- Type-safe with TypeScript
- Reusable components
- Scalable routing structure

## Getting Started

### 1. Make a User Admin

Run this command in your backend directory:

```bash
cd KstoreBack
python make_admin.py user@example.com
```

Or list all admins:
```bash
python make_admin.py --list
```

### 2. Access Admin Dashboard

1. Login with your admin account
2. Click "Admin" in the navigation bar
3. You'll see the admin dashboard at `/admin`

## Admin Sections

### 📦 Products Management (`/admin/products`)

**Features:**
- View all products in a table
- See SKU, name, price, stock, category
- Visual stock indicators (green/yellow/red)
- Featured product markers (⭐)
- Quick edit and delete actions

**Actions:**
- **Add Product**: Click "➕ Add Product" button
- **Edit Product**: Click "Edit" button on any product
- **Delete Product**: Click "Delete" button (with confirmation)

### ➕ Add New Product (`/admin/products/new`)

**Required Fields:**
- SKU (unique identifier)
- Product Name
- URL Slug (auto-generated from name)
- Price
- Stock Quantity

**Optional Fields:**
- Category
- Brand
- Short Description
- Full Description
- Compare at Price (for showing discounts)
- Featured (checkbox to show on homepage)

**Features:**
- Auto-slug generation from product name
- Category dropdown (loaded from database)
- Price validation
- Stock quantity tracking
- Featured product toggle

### ✏️ Edit Product (`/admin/products/[id]`)

- Same form as "Add Product"
- Pre-filled with existing data
- Update any field
- Changes saved to database via API

## Architecture

### Frontend Structure
```
app/admin/
├── page.tsx                    # Dashboard home
├── layout.tsx                  # Admin layout
├── products/
│   ├── page.tsx               # Products list
│   ├── new/
│   │   └── page.tsx          # Add product
│   └── [id]/
│       └── page.tsx          # Edit product
├── categories/                # Future: Category management
├── orders/                    # Future: Order management
└── users/                     # Future: User management
```

### Key Components

**useAdmin Hook** (`lib/hooks/useAdmin.ts`)
- Checks if user is admin
- Redirects non-admin users
- Provides admin state

**Product Service** (`lib/api/services/product.service.ts`)
- `getAll()` - Fetch all products
- `getById(id)` - Fetch single product
- `create(data, token)` - Create product
- `update(id, data, token)` - Update product
- `delete(id, token)` - Delete product

### Security

- **Route Protection**: `useAdmin` hook checks role
- **JWT Authentication**: All API calls require valid token
- **Backend Validation**: API validates admin role
- **CORS Protection**: Backend configured for security

## API Integration

All admin operations use your existing backend APIs:

```typescript
// Get products
GET /api/products

// Get single product
GET /api/products/{id}

// Create product (admin only)
POST /api/products
Headers: Authorization: Bearer {token}

// Update product (admin only)
PUT /api/products/{id}
Headers: Authorization: Bearer {token}

// Delete product (admin only)
DELETE /api/products/{id}
Headers: Authorization: Bearer {token}
```

## Database Tables Supported

### Current
- ✅ `products` - Full CRUD operations
- ✅ `categories` - Read operations (dropdown)
- ✅ `users` - Role-based access

### Future Expansion Ready
- `orders` - Order management
- `product_images` - Image management
- `product_variants` - Variant management
- `reviews` - Review moderation
- `coupons` - Discount management

## Extending the Admin Panel

### Adding a New Section

1. **Create Route**
```typescript
// app/admin/orders/page.tsx
'use client';
import { useAdmin } from '@/lib/hooks/useAdmin';

export default function AdminOrdersPage() {
  const { isAdmin } = useAdmin();
  if (!isAdmin) return null;
  
  return <div>Orders Management</div>;
}
```

2. **Add to Dashboard**
```typescript
// app/admin/page.tsx
const adminSections = [
  // ... existing sections
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: '📦',
  }
];
```

3. **Create API Service**
```typescript
// lib/api/services/order.service.ts
export const orderService = {
  getAll: (token: string) => apiClient.get('/orders', token),
  // ... more methods
};
```

## Best Practices

### When Adding Products
1. Use descriptive SKUs (e.g., `PHONE-CASE-001`)
2. Write clear, SEO-friendly descriptions
3. Set realistic stock quantities
4. Use compare_at_price for sales
5. Mark bestsellers as featured

### Data Management
- Regular backups of database
- Test changes in development first
- Use seed script for bulk imports
- Monitor stock levels regularly

### Performance
- Products are paginated on backend
- Images should be optimized
- Use featured products sparingly
- Cache category data

## Troubleshooting

### "Access Denied"
- Ensure user has admin role in database
- Run: `python make_admin.py your@email.com`
- Logout and login again

### "Failed to create product"
- Check all required fields are filled
- Ensure SKU is unique
- Verify price is a valid number
- Check backend logs for errors

### Products not showing
- Verify product is_active = TRUE
- Check stock_quantity > 0
- Ensure category exists
- Clear browser cache

## Future Enhancements

### Planned Features
- [ ] Category CRUD operations
- [ ] Order management and fulfillment
- [ ] User management
- [ ] Product image upload
- [ ] Bulk product import/export
- [ ] Analytics dashboard
- [ ] Inventory alerts
- [ ] Discount/coupon management
- [ ] Review moderation
- [ ] SEO management

### Extensibility
The admin panel is designed to grow with your business:
- Modular architecture
- API-driven design
- Reusable components
- Type-safe operations
- Scalable routing

## Support

For issues or questions:
1. Check backend logs: `KstoreBack/` directory
2. Check browser console for errors
3. Verify API endpoints are working
4. Ensure database is running
5. Check user has admin role

## Quick Reference

**Make user admin:**
```bash
python make_admin.py user@email.com
```

**Access admin:**
```
http://localhost:3001/admin
```

**Add product:**
```
http://localhost:3001/admin/products/new
```

**Backend API:**
```
http://localhost:5000/api
```
