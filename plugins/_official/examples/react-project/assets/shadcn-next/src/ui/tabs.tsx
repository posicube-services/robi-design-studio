'use client';

import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import { cn } from 'src/lib/cn';

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

/**
 * Uncontrolled tabs with the ARIA wiring in place — roles, `aria-selected`,
 * `aria-controls`, and arrow-key movement. Hand-assembled tabs usually ship
 * without the keyboard part, which is what makes them unusable without a mouse.
 */
export function Tabs({
  items,
  defaultValue,
  className,
}: {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}) {
  const base = useId();
  const [active, setActive] = useState(defaultValue ?? items[0]?.value ?? '');

  const move = (delta: number) => {
    const i = items.findIndex((item) => item.value === active);
    const next = items[(i + delta + items.length) % items.length];
    if (next) setActive(next.value);
  };

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {items.map((item) => {
          const selected = item.value === active;
          return (
            <button
              key={item.value}
              role="tab"
              type="button"
              id={`${base}-${item.value}-tab`}
              aria-selected={selected}
              aria-controls={`${base}-${item.value}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') move(1);
                if (e.key === 'ArrowLeft') move(-1);
              }}
              className={cn(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-fast ease-standard',
                selected
                  ? 'border-accent text-accent'
                  : 'border-transparent text-fg-2 hover:text-fg',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${base}-${item.value}-panel`}
          aria-labelledby={`${base}-${item.value}-tab`}
          hidden={item.value !== active}
          className="pt-5"
        >
          {item.value === active ? item.content : null}
        </div>
      ))}
    </div>
  );
}
