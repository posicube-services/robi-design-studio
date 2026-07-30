import type { BlockProps } from 'src/genui/schema';

import { paletteVar } from 'src/lib/tokens';

/** Initial-or-image avatar. */
export function AvatarBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { name?: string; color?: string; src?: string };
  const name = props.name ?? '';
  const fill = paletteVar(props.color);

  if (props.src) {
    return (
      <img
        src={props.src}
        alt={name}
        className="size-10 shrink-0 rounded-pill object-cover"
      />
    );
  }

  return (
    <span
      aria-label={name}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill text-sm"
      style={{ background: `color-mix(in oklab, ${fill} 14%, transparent)`, color: fill }}
    >
      {name.slice(0, 1)}
    </span>
  );
}
