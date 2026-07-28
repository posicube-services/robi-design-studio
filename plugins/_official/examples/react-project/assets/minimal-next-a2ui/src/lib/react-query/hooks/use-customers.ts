'use client';

import { useQuery } from '@tanstack/react-query';

import { listCustomers } from 'src/lib/mock-db/customers';

export type { Customer, CustomerStatus } from 'src/lib/mock-db/customers';

/**
 * @od-component useCustomers
 * @notes Data-layer hook over the mock customers store (src/lib/mock-db).
 *   Query + mutation share that store, so a createCustomer mutation followed
 *   by invalidation makes this hook return the new row — the read-after-write
 *   loop the GenUI Form demonstrates. Pattern (hook lives in
 *   src/lib/react-query/hooks/, callers reference it — never `useQuery`
 *   inline) matches the starter's `posicube-react-query` rule.
 * @posicube-minimal version=0.2.0
 */
export function useCustomers() {
  return useQuery({
    queryKey: ['customers', 'list'],
    queryFn: listCustomers,
  });
}
