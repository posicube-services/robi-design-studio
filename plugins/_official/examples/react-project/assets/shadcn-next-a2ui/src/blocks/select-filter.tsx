'use client';

import type { BlockProps } from 'src/genui/schema';
import { ChevronDown } from 'lucide-react';

import { useFilterBinding } from 'src/genui/filter-context';

type Option = { value?: string; label?: string };

/** Dropdown filter bound to a DataTable through `bind` + `field`. */
export function SelectFilterBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { label?: string; options?: Option[]; bind?: string; field?: string };
  const options = Array.isArray(props.options) ? props.options : [];
  const field = props.field ?? '';
  const { filters, setFilter } = useFilterBinding(props.bind);

  return (
    <label className="flex w-fit min-w-40 flex-col gap-1">
      {props.label ? <span className="text-xs text-meta">{props.label}</span> : null}
      <span className="relative flex items-center">
        <select
          value={filters[field] ?? 'all'}
          onChange={(e) => setFilter(field, e.target.value)}
          className="w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 pr-8 text-sm text-fg outline-none focus-visible:shadow-focus-ring"
        >
          {options.map((option, i) => (
            <option key={i} value={option.value ?? 'all'}>
              {option.label ?? option.value ?? ''}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 size-4 text-meta" />
      </span>
    </label>
  );
}
