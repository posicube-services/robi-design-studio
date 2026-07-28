'use client';

import type { ReactNode } from 'react';

import { useMemo, useState, useContext, useCallback, createContext } from 'react';

/**
 * @od-component genui/filter-context
 * @notes Spec-level interaction bus. SearchField / FilterChips PUBLISH values
 *   under a `bind` key; DataTable SUBSCRIBES to the same key and filters its
 *   rows client-side. The spec only declares the wiring (`"bind": "customers"`)
 *   — the behavior lives entirely in blocks, so the LLM composes interactions
 *   without generating logic. Scoped per SpecRenderer instance.
 * @posicube-minimal version=0.1.0
 */
type BindingState = {
  search?: string;
  /** field name → selected value ('all' clears the field filter) */
  filters: Record<string, string>;
};

type FilterContextValue = {
  bindings: Record<string, BindingState>;
  setSearch: (bind: string, term: string) => void;
  setFilter: (bind: string, field: string, value: string) => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [bindings, setBindings] = useState<Record<string, BindingState>>({});

  const setSearch = useCallback((bind: string, term: string) => {
    setBindings((prev) => {
      const current = prev[bind] ?? { filters: {} };
      return { ...prev, [bind]: { ...current, search: term } };
    });
  }, []);

  const setFilter = useCallback((bind: string, field: string, value: string) => {
    setBindings((prev) => {
      const current = prev[bind] ?? { filters: {} };
      return { ...prev, [bind]: { ...current, filters: { ...current.filters, [field]: value } } };
    });
  }, []);

  const value = useMemo(() => ({ bindings, setSearch, setFilter }), [bindings, setSearch, setFilter]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

const EMPTY_BINDING: BindingState = { filters: {} };

/** Publisher/subscriber hook — safe to call without a provider (no-ops). */
export function useFilterBinding(bind?: string) {
  const context = useContext(FilterContext);
  const key = bind ?? '';
  const state = (key && context?.bindings[key]) || EMPTY_BINDING;

  const setSearch = useCallback(
    (term: string) => {
      if (key && context) context.setSearch(key, term);
    },
    [context, key]
  );

  const setFilter = useCallback(
    (field: string, value: string) => {
      if (key && context) context.setFilter(key, field, value);
    },
    [context, key]
  );

  return { search: state.search ?? '', filters: state.filters, setSearch, setFilter };
}

/** Row filtering shared by data-bound blocks. */
export function applyBinding(
  rows: Record<string, unknown>[],
  binding: { search: string; filters: Record<string, string> },
  searchFields?: string[]
): Record<string, unknown>[] {
  let result = rows;

  const term = binding.search.trim().toLowerCase();
  if (term) {
    result = result.filter((row) => {
      const fields = searchFields?.length ? searchFields : Object.keys(row);
      return fields.some((field) => String(row[field] ?? '').toLowerCase().includes(term));
    });
  }

  for (const [field, value] of Object.entries(binding.filters)) {
    if (value && value !== 'all') {
      result = result.filter((row) => String(row[field] ?? '') === value);
    }
  }

  return result;
}
