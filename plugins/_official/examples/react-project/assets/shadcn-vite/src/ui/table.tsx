import type { ReactNode } from 'react';
import { cn } from 'src/lib/cn';

/**
 * Table primitives. Deliberately unopinionated about data: pair them with
 * `@tanstack/react-table` (already a dependency) when you need sorting,
 * filtering or pagination, and use them directly when you do not.
 */
export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-border">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <tr className={cn('border-b border-border-soft last:border-0 hover:bg-surface-warm/60', className)}>
      {children}
    </tr>
  );
}

export function TH({
  align = 'left',
  className,
  children,
}: {
  align?: 'left' | 'right' | 'center';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 font-medium text-fg-2 whitespace-nowrap',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  align = 'left',
  className,
  children,
}: {
  align?: 'left' | 'right' | 'center';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-fg',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
    >
      {children}
    </td>
  );
}
