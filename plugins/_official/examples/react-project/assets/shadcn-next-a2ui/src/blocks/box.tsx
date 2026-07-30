import type { BlockProps } from 'src/genui/schema';

import { spacingVar, TEXT_ALIGN } from 'src/lib/tokens';

/** Padding + text-alignment wrapper. */
export function BoxBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { p?: number | string; textAlign?: string };

  return (
    <div
      className={TEXT_ALIGN[props.textAlign ?? ''] ?? ''}
      style={props.p === undefined ? undefined : { padding: spacingVar(props.p, '0') }}
    >
      {children}
    </div>
  );
}
