import { cn } from 'src/lib/cn';

const SIZE = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-12 text-base' } as const;

/** Falls back to initials when `src` is absent, so a missing image is never a broken box. */
export function Avatar({
  src,
  name = '',
  size = 'md',
  className,
}: {
  src?: string;
  name?: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover', SIZE[size], className)}
    />
  ) : (
    <span
      aria-label={name || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-accent/12 font-medium text-accent',
        SIZE[size],
        className,
      )}
    >
      {initials || '?'}
    </span>
  );
}
