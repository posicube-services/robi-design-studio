'use client';

import type { UseMutationResult } from '@tanstack/react-query';

import { useCreateCustomer } from 'src/lib/react-query/hooks/use-create-customer';
import { useDeleteCustomer } from 'src/lib/react-query/hooks/use-delete-customer';

/**
 * @od-component genui/mutation-registry
 * @notes The write-path mirror of hook-registry. A spec's Form (`mutation`) or
 *   DataTable row action (`type: "mutation"`) references a mutation by NAME;
 *   blocks resolve it here to a real React Query mutation hook. The LLM never
 *   generates fetch logic — it can only point at mutations we registered,
 *   keeping the API surface whitelisted (the research security model).
 *
 *   Every entry MUST be an unconditionally callable hook returning a
 *   UseMutationResult whose variables are the submitted values / row record.
 *   Keep in sync with src/authoring/catalog.ts (mutations manifest).
 * @posicube-minimal version=0.2.0
 */
export type DataMutation = () => UseMutationResult<unknown, Error, Record<string, unknown>>;

export const mutationRegistry: Record<string, DataMutation> = {
  createCustomer: useCreateCustomer as unknown as DataMutation,
  deleteCustomer: useDeleteCustomer as unknown as DataMutation,
};

/**
 * Resolve EVERY registered mutation to its mutate function, once, at a block's
 * top level. Iterating a module-level constant registry means a fixed number
 * of hook calls in stable order across renders (hooks-rules safe) — so a table
 * can dispatch row actions by name without calling hooks per row.
 */
export function useMutationHandlers(): Record<string, (vars: Record<string, unknown>) => void> {
  const entries = Object.entries(mutationRegistry).map(([name, useMutationHook]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mutation = useMutationHook();
    return [name, (vars: Record<string, unknown>) => mutation.mutate(vars)] as const;
  });
  return Object.fromEntries(entries);
}
