import type { TypographyVariant } from '@mui/material/styles';
import type { BlockProps } from 'src/genui/schema';

import Typography from '@mui/material/Typography';

/**
 * @od-component TypographyBlock
 * @mui components=Typography
 * @notes Text primitive on the Minimal type scale. The variant/color domains
 *   are enforced by the gate (catalog enums extracted from the live theme), so
 *   only legal scale steps and color tokens reach this component.
 * @posicube-minimal version=0.1.0
 */
export function TypographyBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    text?: string;
    variant?: TypographyVariant;
    color?: string;
    align?: 'left' | 'center' | 'right';
  };

  return (
    <Typography
      variant={props.variant ?? 'body2'}
      sx={{ color: props.color ?? 'text.primary' }}
      align={props.align}
    >
      {props.text}
    </Typography>
  );
}
