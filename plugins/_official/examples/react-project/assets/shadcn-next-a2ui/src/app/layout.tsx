import type { ReactNode } from 'react';

import './globals.css';

import { Providers } from './providers';

export const metadata = {
  title: 'A2UI — Open Design',
  description: 'Spec-driven screens on shadcn + Tailwind, styled by the active design system.',
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
