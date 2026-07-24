import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { LocalizationProvider } from 'src/locales';
import { I18nProvider } from 'src/locales/i18n-provider';
import { themeConfig, ThemeProvider } from 'src/theme';
import { defaultSettings, SettingsProvider, SettingsDrawer } from 'src/components/settings';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';

import { App } from './App';

import './global.css';
import './styles/tokens.css';

// ----------------------------------------------------------------------

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <SettingsProvider defaultSettings={defaultSettings}>
          <LocalizationProvider>
            <ThemeProvider
              noSsr
              defaultMode={themeConfig.defaultMode}
              modeStorageKey={themeConfig.modeStorageKey}
            >
              <MotionLazy>
                <Snackbar />
                <ProgressBar />
                <SettingsDrawer defaultSettings={defaultSettings} />
                <Suspense fallback={null}>
                  <App />
                </Suspense>
              </MotionLazy>
            </ThemeProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>
);
