import type { ButtonProps } from '@mui/material/Button';
import type { BlockProps } from 'src/genui/schema';

import Button from '@mui/material/Button';

/**
 * @od-component ButtonBlock
 * @mui components=Button
 * @mui-minimal component=Button path=src/theme/core/components/button.tsx
 * @notes Action primitive. Includes Minimal's custom `soft` variant. `href`
 *   navigates (anchor semantics); real mutations arrive with the mutation
 *   registry — until then a Button without href is visual affordance.
 * @posicube-minimal version=0.1.0
 */
export function ButtonBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    label?: string;
    variant?: ButtonProps['variant'];
    color?: ButtonProps['color'];
    size?: ButtonProps['size'];
    fullWidth?: boolean;
    href?: string;
  };

  return (
    <Button
      variant={props.variant ?? 'contained'}
      color={props.color ?? 'primary'}
      size={props.size ?? 'medium'}
      fullWidth={props.fullWidth}
      href={props.href}
    >
      {props.label}
    </Button>
  );
}
