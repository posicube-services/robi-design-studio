import type { BlockProps } from 'src/genui/schema';

import { CHIP_SIZE, paletteOn, paletteVar } from 'src/lib/tokens';

/** Compact label. `soft` is the Minimal convention and stays the default. */
export function ChipBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { label?: string; variant?: string; color?: string; size?: string };
  const variant = props.variant ?? 'soft';
  const color = props.color ?? 'default';
  const fill = paletteVar(color, 'default');

  const style =
    variant === 'filled'
      ? { background: fill, color: paletteOn(color, 'default') }
      : variant === 'outlined'
        ? { color: fill, borderWidth: 1, borderStyle: 'solid' as const, borderColor: `color-mix(in oklab, ${fill} 45%, transparent)` }
        : { background: `color-mix(in oklab, ${fill} 15%, transparent)`, color: fill };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-pill whitespace-nowrap ${CHIP_SIZE[props.size ?? 'medium'] ?? CHIP_SIZE.medium}`}
      style={style}
    >
      {props.label ?? ''}
    </span>
  );
}
