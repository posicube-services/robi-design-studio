import { useLocation } from 'react-router-dom';

// ----------------------------------------------------------------------

export function usePathname(): string {
  const { pathname } = useLocation();
  return pathname;
}
