import 'src/global.css';
import 'src/styles/tokens.css';

import type { Metadata, Viewport } from 'next';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { themeConfig, primary as primaryColor } from 'src/theme';
import { defaultSettings } from 'src/components/settings';

import { Providers } from './providers';

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primaryColor.main,
};

export const metadata: Metadata = {
  title: 'Minimal UI - Next.js',
  description: 'A curated Minimal seed running on Next.js + React + MUI.',
};

// ----------------------------------------------------------------------

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" dir={defaultSettings.direction} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          modeStorageKey={themeConfig.modeStorageKey}
          attribute={themeConfig.cssVariables.colorSchemeSelector}
          defaultMode={themeConfig.defaultMode}
        />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
