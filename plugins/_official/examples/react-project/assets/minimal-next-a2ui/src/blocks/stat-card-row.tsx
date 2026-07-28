import type { BlockProps } from 'src/genui/schema';

import Box from '@mui/material/Box';

/**
 * @od-component StatCardRowBlock
 * @mui components=Box
 * @notes Responsive row of StatCards (flex + wrap; cards flex:1 minWidth:180).
 * @posicube-minimal version=0.1.0
 */
export function StatCardRowBlock({ children }: BlockProps) {
  return <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>{children}</Box>;
}
