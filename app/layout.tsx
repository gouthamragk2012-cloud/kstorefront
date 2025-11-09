import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import PhoneNumberBanner from '@/components/PhoneNumberBanner';

export const metadata: Metadata = {
  title: {
    default: 'KStore - Your Online Shop',
    template: '%s | KStore',
  },
  description: 'Modern ecommerce store built with Next.js',
  keywords: ['ecommerce', 'shop', 'online store', 'nextjs'],
  authors: [{ name: 'KStore Team' }],
  creator: 'KStore',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'KStore - Your Online Shop',
    description: 'Modern ecommerce store built with Next.js',
    siteName: 'KStore',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KStore - Your Online Shop',
    description: 'Modern ecommerce store built with Next.js',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Navbar />
        <PhoneNumberBanner />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
