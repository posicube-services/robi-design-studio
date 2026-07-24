import type { ChipProps } from '@mui/material/Chip';
import type { BlockProps } from 'src/genui/schema';

import Chip from '@mui/material/Chip';

/**
 * @od-component ChipBlock
 * @mui components=Chip
 * @mui-minimal component=Chip path=src/theme/core/components/chip.tsx
 * @notes Status/tag primitive. Minimal convention: `soft` variant (light
 *   background + strong text) is the default for status labels.
 * @posicube-minimal version=0.1.0
 */
export function ChipBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    label?: string;
    variant?: ChipProps['variant'];
    color?: ChipProps['color'];
    size?: ChipProps['size'];
  };

  return (
    <Chip
      label={props.label}
      variant={props.variant ?? 'soft'}
      color={props.color ?? 'default'}
      size={props.size ?? 'small'}
    />
  );
}
