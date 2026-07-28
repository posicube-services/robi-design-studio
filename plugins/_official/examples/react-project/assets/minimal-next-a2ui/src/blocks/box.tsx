import type { BlockProps } from 'src/genui/schema';

import Box from '@mui/material/Box';

/**
 * @od-component BoxBlock
 * @mui components=Box
 * @notes Plain container primitive — padding + text alignment only. No colors
 *   or shadows here on purpose: surfaces come from Card-based blocks so the
 *   elevation language stays with the theme.
 * @posicube-minimal version=0.1.0
 */
export function BoxBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as {
    p?: number;
    textAlign?: 'left' | 'center' | 'right';
  };

  return <Box sx={{ p: props.p, textAlign: props.textAlign }}>{children}</Box>;
}
