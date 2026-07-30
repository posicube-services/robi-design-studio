import type { BlockProps } from 'src/genui/schema';

import { spacingVar } from 'src/lib/tokens';

/** Flex row/column with a token-scaled gap. */
export function StackBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { direction?: string; spacing?: number | string };
  const column = (props.direction ?? 'column') === 'column';

  return (
    <div
      className={`flex ${column ? 'flex-col' : 'flex-row items-center'}`}
      style={{ gap: spacingVar(props.spacing) }}
    >
      {children}
    </div>
  );
}
