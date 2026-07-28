'use client';

import { Suspense } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

import { LocalizationProvider } from 'src/locales';
import { I18nProvider } from 'src/locales/i18n-provider';
import { themeConfig, ThemeProvider } from 'src/theme';
import { defaultSettings, SettingsProvider, SettingsDrawer } from 'src/components/settings';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';

// ----------------------------------------------------------------------

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <SettingsProvider defaultSettings={defaultSettings}>
        <LocalizationProvider>
          <AppRouterCacheProvider options={{ key: 'css' }}>
            <ThemeProvider
              modeStorageKey={themeConfig.modeStorageKey}
              defaultMode={themeConfig.defaultMode}
            >
              <MotionLazy>
                <Snackbar />
                <ProgressBar />
                <SettingsDrawer defaultSettings={defaultSettings} />
                <Suspense fallback={null}>{children}</Suspense>
              </MotionLazy>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </LocalizationProvider>
      </SettingsProvider>
    </I18nProvider>
  );
}
