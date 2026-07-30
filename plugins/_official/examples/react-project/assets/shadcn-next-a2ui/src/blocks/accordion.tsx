'use client';

import type { BlockProps } from 'src/genui/schema';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Item = { title?: string; content?: string };

/** Disclosure list. Items are literal { title, content }. */
export function AccordionBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { items?: Item[] };
  const items = Array.isArray(props.items) ? props.items : [];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border-soft overflow-hidden rounded-lg border border-border bg-surface">
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm text-fg hover:bg-surface-warm"
            >
              <span>{item.title ?? ''}</span>
              <ChevronDown
                className={`size-4 shrink-0 text-meta transition-transform duration-fast ease-standard ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
            {expanded ? (
              <div className="px-5 pb-4 text-sm leading-body text-fg-2">{item.content ?? ''}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
