# KStore Frontend Deployment Guide

## Environment Configuration

The frontend uses environment variables to switch between local and production backends.

### Local Development

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Production

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://kstoreback.onrender.com/api
```

## Quick Switch

To switch between environments, simply comment/uncomment the appropriate line in `.env.local`:

```bash
# Local development:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Production:
NEXT_PUBLIC_API_URL=https://kstoreback.onrender.com/api
```

**Important:** After changing the environment variable, restart your Next.js dev server:
```bash
npm run dev
```

## Backend URLs

- **Local:** http://localhost:5000/api
- **Production:** https://kstoreback.onrender.com/api

## Testing

To verify which backend you're connected to, check the browser console or network tab. All API requests should go to the configured URL.
