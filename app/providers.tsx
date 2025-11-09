'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(
  () => import('@/components/ChatWidget'),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
