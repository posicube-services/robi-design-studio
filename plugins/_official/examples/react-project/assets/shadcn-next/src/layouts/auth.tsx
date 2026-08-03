import type { ReactNode } from 'react';
import { cn } from 'src/lib/cn';

/** Centred card for sign-in / sign-up screens. */
export function AuthLayout({
  brand,
  title,
  subtitle,
  footer,
  className,
  children,
}: {
  brand?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 py-12 text-fg">
      <div className={cn('w-full max-w-sm', className)}>
        {brand ? <div className="mb-8 text-center font-display text-xl">{brand}</div> : null}
        <h1 className="m-0 text-center font-display text-2xl leading-tight tracking-display">{title}</h1>
        {subtitle ? <p className="mt-2 mb-0 text-center text-sm text-fg-2">{subtitle}</p> : null}
        <div className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-flat">{children}</div>
        {footer ? <div className="mt-6 text-center text-sm text-fg-2">{footer}</div> : null}
      </div>
    </div>
  );
}
