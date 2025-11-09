'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const SupportChat = dynamic(
  () => import('@/components/SupportChat').then((mod) => mod.default),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SupportChat />
    </>
  );
}
