import type { BlockProps } from 'src/genui/schema';

import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

/**
 * @od-component ListBlock
 * @mui components=List,ListItem,ListItemText
 * @notes Simple text-row list primitive (activity feeds, notes). Card-wrapped
 *   so it sits on the Minimal surface language.
 * @posicube-minimal version=0.1.0
 */
type ListEntry = { primary?: string; secondary?: string };

export function ListBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { items?: ListEntry[] };
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <Card>
      <List disablePadding sx={{ py: 1 }}>
        {items.map((item, index) => (
          <ListItem key={index} divider={index < items.length - 1}>
            <ListItemText primary={item.primary} secondary={item.secondary} />
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
