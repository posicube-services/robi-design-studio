import type { BlockProps } from 'src/genui/schema';

import { BUTTON_SIZE, paletteOn, paletteVar } from 'src/lib/tokens';

/** Action button. `href` renders an anchor so navigation stays a real link. */
export function ButtonBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    label?: string; variant?: string; color?: string; size?: string; fullWidth?: boolean; href?: string;
  };
  const variant = props.variant ?? 'contained';
  const color = props.color ?? 'primary';
  const fill = paletteVar(color);
  const on = paletteOn(color);

  const base =
    'inline-flex items-center justify-center gap-2 rounded-md transition-colors '
    + 'duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus-ring';
  const size = BUTTON_SIZE[props.size ?? 'medium'] ?? BUTTON_SIZE.medium;
  const width = props.fullWidth ? 'w-full' : 'w-fit';

  const style =
    variant === 'contained'
      ? { background: fill, color: on }
      : variant === 'soft'
        ? { background: `color-mix(in oklab, ${fill} 14%, transparent)`, color: fill }
        : variant === 'outlined'
          ? { color: fill, borderWidth: 1, borderStyle: 'solid' as const, borderColor: `color-mix(in oklab, ${fill} 50%, transparent)` }
          : { color: fill };

  const className = `${base} ${size} ${width}`;
  if (props.href) {
    return (
      <a href={props.href} className={className} style={style}>
        {props.label ?? ''}
      </a>
    );
  }
  return (
    <button type="button" className={className} style={style}>
      {props.label ?? ''}
    </button>
  );
}
