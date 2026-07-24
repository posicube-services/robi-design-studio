import { QueryClient } from '@tanstack/react-query';

/**
 * @od-component makeQueryClient
 * @posicube-minimal version=0.1.0
 *
 * Copied verbatim from posicube-admin-starter. Factory returning a fresh
 * QueryClient with Posicube admin defaults. Do NOT export a module-level
 * singleton — Next App Router renders the same module twice (server pass +
 * client hydration); a shared client leaks cache between requests. Pair with
 * the lazy `useState(() => makeQueryClient())` pattern in QueryProvider.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
