import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authStorage = request.cookies.get('auth-storage');
  const isAuthenticated = authStorage?.value.includes('"isAuthenticated":true');

  const protectedPaths = ['/cart', '/orders', '/profile'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/orders/:path*', '/profile/:path*'],
};
