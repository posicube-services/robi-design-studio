import type { LinearProgressProps } from '@mui/material/LinearProgress';
import type { BlockProps } from 'src/genui/schema';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

/**
 * @od-component LinearProgressBlock
 * @mui components=LinearProgress,Typography
 * @notes Determinate progress primitive — value clamped to 0–100 so a bad
 *   spec value degrades instead of breaking the bar.
 * @posicube-minimal version=0.1.0
 */
export function LinearProgressBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    value?: number;
    color?: LinearProgressProps['color'];
    label?: string;
  };

  const value = Math.min(100, Math.max(0, props.value ?? 0));

  return (
    <Box sx={{ width: '100%' }}>
      {props.label && (
        <Stack direction="row" sx={{ mb: 0.5, justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {props.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {value}%
          </Typography>
        </Stack>
      )}
      <LinearProgress variant="determinate" value={value} color={props.color ?? 'primary'} />
    </Box>
  );
}
