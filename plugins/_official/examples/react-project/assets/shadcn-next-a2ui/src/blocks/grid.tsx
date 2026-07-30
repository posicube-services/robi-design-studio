import type { BlockProps } from 'src/genui/schema';
import { Children, isValidElement } from 'react';

import { spacingVar } from 'src/lib/tokens';

/**
 * 12-column grid. `itemSpans` gives each child its column span; children without
 * an entry share the remaining width evenly.
 *
 * The span classes are a static table rather than `md:col-span-${n}` on purpose:
 * Tailwind generates utilities by scanning source text, so an interpolated class
 * name produces no CSS at all and the grid silently collapses to one column.
 */
const SPAN: Record<number, string> = {
  1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
  5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
  9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
};

export function GridBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { spacing?: number | string; itemSpans?: number[] };
  const spans = Array.isArray(props.itemSpans) ? props.itemSpans : [];
  const items = Children.toArray(children).filter(isValidElement);
  const even = Math.max(1, Math.min(12, Math.floor(12 / Math.max(items.length, 1))));

  return (
    <div className="grid grid-cols-1 md:grid-cols-12" style={{ gap: spacingVar(props.spacing, '3') }}>
      {items.map((child, i) => (
        <div key={i} className={SPAN[Number(spans[i]) || even] ?? SPAN[12]}>
          {child}
        </div>
      ))}
    </div>
  );
}
