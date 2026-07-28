import type { BlockProps } from 'src/genui/schema';

import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

/**
 * @od-component AccordionBlock
 * @mui components=Accordion,AccordionSummary,AccordionDetails
 * @mui-minimal component=Accordion path=src/theme/core/components/accordion.tsx
 * @notes Expandable sections primitive (FAQ/detail). Items are literal data —
 *   malformed entries render nothing rather than crashing.
 * @posicube-minimal version=0.1.0
 */
type AccordionItem = { title?: string; content?: string };

export function AccordionBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { items?: AccordionItem[] };
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <div>
      {items.map((item, index) => (
        <Accordion key={index}>
          <AccordionSummary>
            <Typography variant="subtitle2">{item.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.content}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
