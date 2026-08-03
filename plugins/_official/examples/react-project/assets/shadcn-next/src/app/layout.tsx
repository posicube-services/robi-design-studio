import type { ReactNode } from 'react';

import './globals.css';

import { Providers } from './providers';

export const metadata = {
  title: 'robi Design Studio — Next.js',
  description: 'Next.js on shadcn + Tailwind, styled by the active design system.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
