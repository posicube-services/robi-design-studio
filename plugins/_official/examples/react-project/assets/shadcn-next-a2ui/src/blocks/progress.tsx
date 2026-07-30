import type { BlockProps } from 'src/genui/schema';

import { paletteVar } from 'src/lib/tokens';

/** Determinate progress bar (catalog type `LinearProgress`). */
export function LinearProgressBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { value?: number; color?: string; label?: string };
  const pct = Math.max(0, Math.min(100, Number(props.value ?? 0)));

  return (
    <div className="flex flex-col gap-2">
      {props.label ? (
        <span className="flex items-baseline justify-between text-sm text-fg-2">
          <span>{props.label}</span>
          <span className="text-xs text-meta tabular-nums">{pct}%</span>
        </span>
      ) : null}
      <span
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="block h-1.5 w-full overflow-hidden rounded-pill bg-border-soft"
      >
        <span
          className="block h-full rounded-pill transition-[width] duration-base ease-standard"
          style={{ width: `${pct}%`, background: paletteVar(props.color) }}
        />
      </span>
    </div>
  );
}
