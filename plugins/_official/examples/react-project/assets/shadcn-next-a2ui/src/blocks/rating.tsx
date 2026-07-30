import type { BlockProps } from 'src/genui/schema';
import { Star } from 'lucide-react';

import { paletteVar } from 'src/lib/tokens';

/** Star rating with optional review count. */
export function RatingBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { label?: string; value?: number; count?: number; max?: number };
  const max = Math.max(1, Number(props.max ?? 5));
  const value = Math.max(0, Math.min(max, Number(props.value ?? 0)));
  const tint = paletteVar('warning');

  return (
    <div className="flex flex-col gap-1">
      {props.label ? <span className="text-xs text-meta">{props.label}</span> : null}
      <span className="flex items-center gap-2">
        <span className="flex items-center gap-0.5" role="img" aria-label={`${value} / ${max}`}>
          {Array.from({ length: max }, (_, i) => (
            <Star
              key={i}
              className="size-4"
              style={{ color: tint, fill: i < Math.round(value) ? tint : 'transparent' }}
            />
          ))}
        </span>
        <span className="text-sm text-fg tabular-nums">{value.toFixed(1)}</span>
        {props.count === undefined ? null : (
          <span className="text-xs text-meta">({props.count})</span>
        )}
      </span>
    </div>
  );
}
