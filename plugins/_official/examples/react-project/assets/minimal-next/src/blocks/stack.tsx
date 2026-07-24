import type { SxProps, Theme } from '@mui/material/styles';
import type { BlockProps } from 'src/genui/schema';

import Stack from '@mui/material/Stack';

/**
 * @od-component StackBlock
 * @mui components=Stack
 * @notes Generic layout container. `useFlexGap` so row layouts can wrap while
 *   preserving spacing (e.g. a search + filter toolbar on narrow screens).
 * @posicube-minimal version=0.1.0
 */
export function StackBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as {
    direction?: 'row' | 'column';
    spacing?: number;
    sx?: SxProps<Theme>;
  };

  return (
    <Stack
      useFlexGap
      direction={props.direction ?? 'column'}
      spacing={props.spacing ?? 2}
      sx={props.sx}
    >
      {children}
    </Stack>
  );
}
