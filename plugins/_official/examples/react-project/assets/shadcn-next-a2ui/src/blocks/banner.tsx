import type { BlockProps } from 'src/genui/schema';

import { paletteOn, paletteVar } from 'src/lib/tokens';

/** Full-width call-to-action strip. */
export function BannerBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string; description?: string; tone?: string; action?: string; href?: string; icon?: string;
  };
  const tone = props.tone ?? 'primary';
  const fill = paletteVar(tone);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-lg px-6 py-5"
      style={{ background: `color-mix(in oklab, ${fill} 12%, transparent)` }}
    >
      <span className="flex flex-col gap-1">
        <strong className="font-display text-lg leading-tight" style={{ color: fill }}>
          {props.title ?? ''}
        </strong>
        {props.description ? <span className="text-sm text-fg-2">{props.description}</span> : null}
      </span>
      {props.action ? (
        <a
          href={props.href ?? '#'}
          className="w-fit rounded-md px-4 py-2 text-sm transition-opacity duration-fast ease-standard hover:opacity-90"
          style={{ background: fill, color: paletteOn(tone) }}
        >
          {props.action}
        </a>
      ) : null}
    </div>
  );
}
