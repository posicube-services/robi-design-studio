import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCustomer } from 'src/lib/mock-db/customers';

/**
 * @od-component useCreateCustomer
 * @notes Mutation hook over the mock customers store. On success it
 *   invalidates the customers query so every bound block (DataTable, StatCard,
 *   KeyValue) refetches — the spec never orchestrates this; the data layer
 *   owns consistency.
 * @posicube-minimal version=0.1.0
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}
