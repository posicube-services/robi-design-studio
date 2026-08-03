import type { ReactNode } from 'react';
import { cn, SEMANTIC_SOFT } from 'src/lib/cn';
import type { Tone } from './badge';

export function Alert({
  tone = 'info',
  title,
  className,
  children,
}: {
  tone?: Tone;
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div role="alert" className={cn('rounded-md px-4 py-3 text-sm', SEMANTIC_SOFT[tone], className)}>
      {title ? <p className="m-0 font-medium">{title}</p> : null}
      {children ? <div className={cn(title && 'mt-1')}>{children}</div> : null}
    </div>
  );
}

export function Progress({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted/25', className)}
    >
      <div className="h-full rounded-full bg-accent transition-[width] duration-slow ease-standard" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Loading placeholder. Give it a size through `className`. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-muted/20', className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-14 text-center', className)}>
      {icon ? <div className="text-fg-2/60">{icon}</div> : null}
      <p className="m-0 font-display text-base text-fg">{title}</p>
      {description ? <p className="m-0 max-w-prose text-sm text-fg-2">{description}</p> : null}
      {action}
    </div>
  );
}
