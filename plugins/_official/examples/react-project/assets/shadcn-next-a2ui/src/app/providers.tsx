'use client';

import type { ReactNode } from 'react';

import { QueryProvider } from 'src/lib/react-query/query-provider';

/**
 * The whole client shell. The MUI seed needed a theme provider, a settings
 * provider + drawer, an i18n provider, a snackbar host, a progress bar and a
 * motion wrapper here; on Tailwind the theme is CSS custom properties, so the
 * only thing left that genuinely needs a provider is the data layer.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
