import type { BlockProps } from 'src/genui/schema';

import { Children } from 'react';
import Grid from '@mui/material/Grid';

/**
 * @od-component GridBlock
 * @mui components=Grid
 * @notes Responsive 12-column layout primitive. `itemSpans` gives each child
 *   its md column span (defaults to an equal split); everything stacks to 12
 *   on mobile. Spans are clamped to 1–12 so a hallucinated span can't break
 *   the grid.
 * @posicube-minimal version=0.1.0
 */
export function GridBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as {
    spacing?: number;
    itemSpans?: number[];
  };

  const items = Children.toArray(children);
  const equalSpan = items.length > 0 ? Math.max(1, Math.floor(12 / items.length)) : 12;

  const spanFor = (index: number): number => {
    const raw = props.itemSpans?.[index];
    if (typeof raw !== 'number' || Number.isNaN(raw)) return equalSpan;
    return Math.min(12, Math.max(1, Math.round(raw)));
  };

  return (
    <Grid container spacing={props.spacing ?? 3}>
      {items.map((child, index) => (
        <Grid key={index} size={{ xs: 12, md: spanFor(index) }}>
          {child}
        </Grid>
      ))}
    </Grid>
  );
}
