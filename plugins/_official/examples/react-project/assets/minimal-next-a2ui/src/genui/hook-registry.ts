import type { UseQueryResult } from '@tanstack/react-query';

import { useUsers } from 'src/lib/react-query/hooks/use-users';
import { useOrders } from 'src/lib/react-query/hooks/use-orders';
import { useProducts } from 'src/lib/react-query/hooks/use-products';
import { useCustomers } from 'src/lib/react-query/hooks/use-customers';
import { useMonthlyRevenue } from 'src/lib/react-query/hooks/use-monthly-revenue';

/**
 * @od-component genui/hook-registry
 * @notes The data-binding bridge. A spec node references a hook by NAME
 *   (e.g. `"hook": "useCustomers"`); the renderer resolves the name here to a
 *   real React Query hook. This keeps data access on the starter's enforced
 *   path (all `useQuery` lives in src/lib/react-query/hooks/) while letting a
 *   declarative spec choose which data a block binds to.
 *
 *   Every hook MUST be unconditionally callable and return a React Query
 *   result so blocks get a uniform { data, isLoading, isError } contract.
 *
 *   Keep in sync with src/authoring/catalog.ts (HOOK_NAMES) — the catalog is
 *   what the authoring LLM and the validation gate see.
 * @posicube-minimal version=0.1.0
 */
export type DataHook = () => UseQueryResult<unknown[]>;

export const hookRegistry: Record<string, DataHook> = {
  useCustomers: useCustomers as unknown as DataHook,
  useUsers: useUsers as unknown as DataHook,
  useOrders: useOrders as unknown as DataHook,
  useProducts: useProducts as unknown as DataHook,
  useMonthlyRevenue: useMonthlyRevenue as unknown as DataHook,
};
