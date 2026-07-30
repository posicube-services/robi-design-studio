'use client';

import type { ReactNode, ComponentType } from 'react';

import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { makeQueryClient } from './query-client';

/**
 * @od-component QueryProvider
 * @notes Copied verbatim from posicube-admin-starter. Lazy client via
 *   `useState(() => …)` so server + client passes get independent instances.
 *   Devtools dynamic-imported in dev only.
 * @posicube-minimal version=0.1.0
 */
type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <DevtoolsLazy />}
    </QueryClientProvider>
  );
}

function DevtoolsLazy() {
  const [Devtools, setDevtools] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('@tanstack/react-query-devtools')
      .then((mod) => {
        if (!cancelled) setDevtools(() => mod.ReactQueryDevtools);
      })
      .catch(() => {
        // Devtools is best-effort; ignore failures (e.g. offline dev).
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return Devtools === null ? null : <Devtools />;
}
