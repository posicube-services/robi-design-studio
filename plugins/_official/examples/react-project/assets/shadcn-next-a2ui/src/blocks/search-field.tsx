'use client';

import type { BlockProps } from 'src/genui/schema';
import { Search } from 'lucide-react';

import { useFilterBinding } from 'src/genui/filter-context';

/** Live search input. Shares `bind` with a DataTable to filter it as you type. */
export function SearchFieldBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { placeholder?: string; bind?: string };
  const { search, setSearch } = useFilterBinding(props.bind);

  return (
    <label className="flex w-full max-w-sm items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 focus-within:shadow-focus-ring">
      <Search className="size-4 shrink-0 text-meta" />
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={props.placeholder ?? '검색'}
        className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-meta"
      />
    </label>
  );
}
