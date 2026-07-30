// shadcn-shaped primitives, hand-written. shadcn distributes components as
// copy-in source rather than a package, so writing the handful this prototype
// needs is the same act as `shadcn add` minus the CLI/network. Every visual
// value resolves to a brand token via a Tailwind utility — there is no local
// palette, which is the whole point of the exercise.
import type { ReactNode } from 'react';
import { cn, SEMANTIC_SOFT } from 'src/lib/cn';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg shadow-flat overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title?: string; action?: ReactNode }) {
  if (!title && !action) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-5">
      {title ? (
        <h3 className="font-display text-lg leading-tight text-fg m-0">{title}</h3>
      ) : (
        <span />
      )}
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = 'solid',
  disabled,
  onClick,
  className,
}: {
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md '
    + 'transition-colors duration-fast ease-standard disabled:opacity-40 '
    + 'disabled:pointer-events-none focus-visible:outline-none focus-visible:shadow-focus-ring';
  const tone = {
    solid: 'bg-accent text-accent-on hover:bg-accent-hover active:bg-accent-active',
    outline: 'border border-border text-fg hover:bg-surface-warm',
    ghost: 'text-fg-2 hover:bg-surface-warm',
  }[variant];
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={cn(base, tone, className)}>
      {children}
    </button>
  );
}

export function Badge({ tone = 'grey', children }: { tone?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs rounded-pill whitespace-nowrap',
        SEMANTIC_SOFT[tone] ?? SEMANTIC_SOFT.grey,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ label }: { label: string }) {
  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-accent/12 text-accent text-xs">
      {label.slice(0, 1)}
    </span>
  );
}

export function Progress({ value, suffix }: { value: number; suffix?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2 min-w-32">
      <div className="h-1 flex-1 rounded-pill bg-border-soft overflow-hidden">
        <div className="h-full rounded-pill bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-meta whitespace-nowrap">
        {value}
        {suffix ? ` ${suffix}` : ''}
      </span>
    </div>
  );
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(indeterminate) && !checked;
      }}
      onChange={(e) => onChange(e.target.checked)}
      className="size-4 accent-accent align-middle"
    />
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="px-6 py-12 text-center text-sm text-meta">{children}</div>;
}
