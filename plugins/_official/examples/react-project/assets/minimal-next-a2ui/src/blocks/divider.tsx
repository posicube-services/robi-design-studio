import type { BlockProps } from 'src/genui/schema';

import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

/**
 * @od-component DividerBlock
 * @mui components=Divider
 * @notes Section separator primitive, optional centered label.
 * @posicube-minimal version=0.1.0
 */
export function DividerBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { label?: string };

  return (
    <Divider>
      {props.label && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {props.label}
        </Typography>
      )}
    </Divider>
  );
}
