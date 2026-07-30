import type { BlockProps } from 'src/genui/schema';

import { Card, CardHeader } from 'src/ui/primitives';
import { paletteVar } from 'src/lib/tokens';

type Entry = { title?: string; time?: string; color?: string };

/**
 * Activity feed. MUI needed six @mui/lab components for this; on Tailwind it is a
 * flex column with a dot and a connector, which is a fair illustration that some
 * of the catalog's "hard" blocks were only hard because MUI made them components.
 */
export function TimelineBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { title?: string; items?: Entry[] };
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <Card>
      <CardHeader title={props.title} />
      <ol className="m-0 list-none px-6 pb-6 pt-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex flex-col items-center">
              <span
                className="mt-1 size-2.5 shrink-0 rounded-pill"
                style={{ background: paletteVar(item.color, 'grey') }}
              />
              {i < items.length - 1 ? <span className="my-1 w-px flex-1 bg-border-soft" aria-hidden /> : null}
            </span>
            <span className="flex flex-col pb-6">
              <span className="text-sm text-fg">{item.title ?? ''}</span>
              {item.time ? <span className="mt-1 text-xs text-meta">{item.time}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
