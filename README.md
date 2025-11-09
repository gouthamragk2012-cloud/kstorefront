# KStore Frontend

Modern, scalable ecommerce application built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## Architecture

### Project Structure

```
KstoreFront/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── providers/        # Context providers
├── lib/                   # Core utilities
│   ├── api/              # API layer
│   │   ├── client.ts     # HTTP client
│   │   └── services/     # API services
│   ├── hooks/            # Custom React hooks
│   ├── types.ts          # TypeScript types
│   └── config.ts         # App configuration
└── middleware.ts          # Route protection
```

### Key Features

- **Type-Safe API Layer**: Centralized API client with error handling
- **State Management**: Zustand for global state (auth, cart)
- **Component Library**: Reusable UI components (Button, Input, Card)
- **Route Protection**: Middleware for authenticated routes
- **Responsive Design**: Mobile-first with Tailwind CSS

### Design Patterns

1. **Service Layer Pattern**: API calls abstracted into services
2. **Custom Hooks**: Business logic separated from UI
3. **Component Composition**: Flexible, reusable components
4. **Error Boundaries**: Graceful error handling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:5000

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP Client**: Fetch API

## API Integration

The frontend connects to the Flask backend with these endpoints:

- `/api/auth` - Authentication
- `/api/products` - Product catalog
- `/api/cart` - Shopping cart
- `/api/orders` - Order management
- `/api/categories` - Product categories
- `/api/wishlist` - User wishlist

## Future Enhancements

- [ ] Server-side rendering for products
- [ ] Image optimization
- [ ] Payment integration
- [ ] Order tracking
- [ ] Product reviews
- [ ] Search and filters
- [ ] Admin dashboard
