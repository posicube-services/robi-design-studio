import type { ReactNode } from 'react';
import { cn } from 'src/lib/cn';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('bg-surface border border-border rounded-lg shadow-flat', className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  if (!title && !subtitle && !action) return null;
  return (
    <div className={cn('flex items-start justify-between gap-3 px-6 pt-5 pb-3', className)}>
      <div className="min-w-0">
        {title ? (
          <h3 className="m-0 font-display text-lg leading-tight text-fg">{title}</h3>
        ) : null}
        {subtitle ? <p className="mt-1 mb-0 text-sm text-fg-2">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex items-center gap-2 border-t border-border-soft px-6 py-4', className)}>
      {children}
    </div>
  );
}
