'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteCustomer } from 'src/lib/mock-db/customers';

/**
 * @od-component useDeleteCustomer
 * @notes Row-action mutation over the mock customers store. On success it
 *   invalidates the customers query so the bound DataTable/StatCards refresh —
 *   the spec's row action references this by name only.
 * @posicube-minimal version=0.1.0
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}
