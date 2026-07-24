import NProgress from 'nprogress';
import { useMemo, useCallback } from 'react';
import { isEqualPath } from 'minimal-shared/utils';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

/**
 * react-router-dom adapter that exposes the subset of the next/navigation
 * router API the minimal template relies on, with NProgress integration.
 */
export function useRouter() {
  const navigate = useNavigate();

  const push = useCallback(
    (href: string) => {
      if (
        typeof window !== 'undefined' &&
        !isEqualPath(href, window.location.href, { deep: false })
      ) {
        NProgress.start();
      }
      navigate(href);
    },
    [navigate]
  );

  const replace = useCallback(
    (href: string) => {
      if (
        typeof window !== 'undefined' &&
        !isEqualPath(href, window.location.href, { deep: false })
      ) {
        NProgress.start();
      }
      navigate(href, { replace: true });
    },
    [navigate]
  );

  const back = useCallback(() => navigate(-1), [navigate]);
  const forward = useCallback(() => navigate(1), [navigate]);
  const refresh = useCallback(() => navigate(0), [navigate]);
  const prefetch = useCallback(() => {}, []);

  const router = useMemo(
    () => ({ push, replace, back, forward, refresh, prefetch }),
    [push, replace, back, forward, refresh, prefetch]
  );

  return router;
}
