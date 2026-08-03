import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useId } from 'react';
import { cn } from 'src/lib/cn';

const CONTROL = cn(
  'w-full rounded-md border border-border bg-surface px-3 text-sm text-fg',
  'placeholder:text-fg-2/60',
  'transition-colors duration-fast ease-standard',
  'focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/30',
  'disabled:opacity-50',
);

export function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-fg">
      {children}
      {required ? <span className="ml-0.5 text-danger">*</span> : null}
    </label>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 mb-0 text-xs text-danger">{children}</p>;
}

/**
 * Label + control + error, wired together.
 *
 * The generated id is threaded to both halves so clicking the label focuses the
 * control and screen readers announce the error — the part that is easy to skip
 * when each field is hand-assembled.
 */
export function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      {children({
        id,
        ...(error ? { 'aria-invalid': true } : {}),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      })}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 mb-0 text-xs text-fg-2">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 mb-0 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, 'h-10', className)} {...rest} />;
}

export function Textarea({ className, rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(CONTROL, 'py-2 leading-relaxed', className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, 'h-10 appearance-none pr-8', className)} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-fg">
      <input
        type="checkbox"
        className={cn('size-4 rounded border-border text-accent accent-[var(--accent)]', className)}
        {...rest}
      />
      {label}
    </label>
  );
}

export function Radio({
  label,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-fg">
      <input type="radio" className={cn('size-4 accent-[var(--accent)]', className)} {...rest} />
      {label}
    </label>
  );
}

/** Checkbox rendered as a track + knob. Stays a real checkbox for a11y and forms. */
export function Switch({
  label,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }) {
  return (
    <label className={cn('inline-flex items-center gap-3 text-sm text-fg', className)}>
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" {...rest} />
        <span
          aria-hidden
          className={cn(
            'block h-6 w-10 rounded-full bg-muted/40 transition-colors duration-fast ease-standard',
            'peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-0.5 left-0.5 block size-5 rounded-full bg-surface shadow-flat',
            'transition-transform duration-fast ease-standard peer-checked:translate-x-4',
          )}
        />
      </span>
      {label}
    </label>
  );
}
