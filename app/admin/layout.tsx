import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | KStore',
  description: 'KStore Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
