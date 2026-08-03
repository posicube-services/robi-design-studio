import type { ReactNode } from 'react';
import { cn, SEMANTIC_SOFT } from 'src/lib/cn';

export type Tone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'grey';

/** Status pill. Tones resolve to brand tokens, never to a local palette. */
export function Badge({
  tone = 'grey',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        SEMANTIC_SOFT[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
