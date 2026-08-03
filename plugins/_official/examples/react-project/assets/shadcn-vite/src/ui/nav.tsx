import type { ReactNode } from 'react';
import { cn } from 'src/lib/cn';

export function Breadcrumbs({
  items,
  className,
}: {
  items: Array<{ label: ReactNode; href?: string }>;
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm text-fg-2">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <a href={item.href} className="hover:text-fg">
                  {item.label}
                </a>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={cn(last && 'text-fg')}>
                  {item.label}
                </span>
              )}
              {last ? null : <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: Array<{ label: ReactNode; href?: string }>;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-6', className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} className="mb-2" /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="m-0 font-display text-2xl leading-tight tracking-display text-fg">{title}</h1>
          {subtitle ? <p className="mt-1.5 mb-0 text-sm text-fg-2">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  const go = (next: number) => onChange(Math.max(1, Math.min(pageCount, next)));
  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-2 text-sm', className)}>
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-border px-3 py-1.5 text-fg disabled:opacity-40"
      >
        이전
      </button>
      <span className="text-fg-2">
        {page} / {pageCount}
      </span>
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        className="rounded-md border border-border px-3 py-1.5 text-fg disabled:opacity-40"
      >
        다음
      </button>
    </nav>
  );
}
