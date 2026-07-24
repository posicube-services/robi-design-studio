import { useSearchParams as useRouterSearchParams } from 'react-router-dom';

// ----------------------------------------------------------------------

export function useSearchParams(): URLSearchParams {
  const [searchParams] = useRouterSearchParams();
  return searchParams;
}
