import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from 'src/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-on hover:bg-accent-hover active:bg-accent-active',
  secondary: 'bg-surface text-fg border border-border hover:bg-surface-warm',
  ghost: 'bg-transparent text-fg hover:bg-surface-warm',
  danger: 'bg-danger text-white hover:brightness-95',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Rendered before the label — pass a lucide icon. */
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors duration-fast ease-standard',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/** Square button for a bare icon. `label` is required — it becomes the a11y name. */
export function IconButton({
  label,
  size = 'md',
  variant = 'ghost',
  className,
  children,
  ...rest
}: Omit<ButtonProps, 'icon' | 'fullWidth'> & { label: string }) {
  return (
    <Button
      aria-label={label}
      variant={variant}
      size={size}
      className={cn('aspect-square px-0', size === 'sm' ? 'w-8' : size === 'lg' ? 'w-12' : 'w-10', className)}
      {...rest}
    >
      {children}
    </Button>
  );
}
