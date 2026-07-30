'use client';

import type { BlockProps } from 'src/genui/schema';
import { Children, isValidElement, useState } from 'react';

/** N labels + N children: the n-th child shows under the n-th tab. */
export function TabsBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { labels?: string[] };
  const labels = Array.isArray(props.labels) ? props.labels : [];
  const panels = Children.toArray(children).filter(isValidElement);
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border-soft">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm transition-colors duration-fast ease-standard ${
              i === active ? 'border-accent text-fg' : 'border-transparent text-meta hover:text-fg'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="pt-5">{panels[active] ?? null}</div>
    </div>
  );
}
