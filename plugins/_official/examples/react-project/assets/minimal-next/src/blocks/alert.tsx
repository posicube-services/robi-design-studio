import type { AlertProps } from '@mui/material/Alert';
import type { BlockProps } from 'src/genui/schema';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

/**
 * @od-component AlertBlock
 * @mui components=Alert,AlertTitle
 * @notes Semantic callout primitive.
 * @posicube-minimal version=0.1.0
 */
export function AlertBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    severity?: AlertProps['severity'];
    title?: string;
    text?: string;
    variant?: AlertProps['variant'];
  };

  return (
    <Alert severity={props.severity ?? 'info'} variant={props.variant ?? 'standard'}>
      {props.title && <AlertTitle>{props.title}</AlertTitle>}
      {props.text}
    </Alert>
  );
}
