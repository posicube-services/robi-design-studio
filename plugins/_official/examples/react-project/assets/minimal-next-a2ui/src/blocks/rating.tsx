import type { BlockProps } from 'src/genui/schema';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

/**
 * @od-component RatingBlock
 * @mui components=Card,Rating,Typography
 * @mui-minimal component=Rating path=src/theme/core/components/rating.tsx
 * @notes Read-only rating display (제품 평점, 만족도). Big value + stars +
 *   optional review count. Half-star precision.
 * @posicube-minimal version=0.1.0
 */
export function RatingBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    label?: string;
    value?: number;
    count?: number;
    max?: number;
  };

  const value = Math.max(0, Math.min(props.max ?? 5, Number(props.value) || 0));

  return (
    <Card sx={{ p: 3 }}>
      {props.label && (
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          {props.label}
        </Typography>
      )}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Typography variant="h3">{value.toFixed(1)}</Typography>
        <Box>
          <Rating value={value} precision={0.5} max={props.max ?? 5} readOnly />
          {props.count !== undefined && (
            <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled' }}>
              {props.count.toLocaleString()}개 리뷰
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
