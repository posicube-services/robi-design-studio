import type { ReactNode } from 'react';
import { cn } from 'src/lib/cn';
import { Card } from './card';

/** Headline metric with an optional signed delta. */
export function StatCard({
  label,
  value,
  delta,
  icon,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  /** Percentage change; positive reads as success, negative as danger. */
  delta?: number;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm text-fg-2">{label}</p>
          <p className="mt-1.5 mb-0 font-display text-2xl leading-tight text-fg">{value}</p>
        </div>
        {icon ? <div className="text-accent">{icon}</div> : null}
      </div>
      {typeof delta === 'number' ? (
        <p className={cn('mt-3 mb-0 text-xs font-medium', delta >= 0 ? 'text-success' : 'text-danger')}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
        </p>
      ) : null}
    </Card>
  );
}
