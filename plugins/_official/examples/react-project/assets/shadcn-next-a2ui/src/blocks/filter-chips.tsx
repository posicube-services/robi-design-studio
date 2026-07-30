'use client';

import type { BlockProps } from 'src/genui/schema';

import { useFilterBinding } from 'src/genui/filter-context';

type Option = { value?: string; label?: string };

/** Selectable chip row. Filters the DataTable sharing `bind` on `field`. */
export function FilterChipsBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { options?: Option[]; bind?: string; field?: string };
  const options = Array.isArray(props.options) ? props.options : [];
  const field = props.field ?? '';
  const { filters, setFilter } = useFilterBinding(props.bind);
  const current = filters[field] ?? 'all';

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, i) => {
        const value = option.value ?? 'all';
        const active = current === value;
        return (
          <button
            key={i}
            type="button"
            aria-pressed={active}
            onClick={() => setFilter(field, value)}
            className={`rounded-pill px-3 py-1 text-sm transition-colors duration-fast ease-standard ${
              active ? 'bg-accent text-accent-on' : 'bg-surface-warm text-fg-2 hover:text-fg'
            }`}
          >
            {option.label ?? value}
          </button>
        );
      })}
    </div>
  );
}
