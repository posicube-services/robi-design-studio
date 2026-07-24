'use client';

import type { BlockProps } from 'src/genui/schema';

import { useState, Children } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

/**
 * @od-component TabsBlock
 * @mui components=Tabs,Tab
 * @notes Tab switcher primitive: n-th child renders in the n-th panel. If the
 *   spec provides fewer labels than children, extra children get numeric
 *   labels instead of disappearing (fail loud, not silent).
 * @posicube-minimal version=0.1.0
 */
export function TabsBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { labels?: string[] };
  const [active, setActive] = useState(0);

  const panels = Children.toArray(children);
  const labels = panels.map((_, index) => props.labels?.[index] ?? `탭 ${index + 1}`);

  return (
    <Box>
      <Tabs value={active} onChange={(_, next: number) => setActive(next)} sx={{ mb: 3 }}>
        {labels.map((label, index) => (
          <Tab key={index} label={label} />
        ))}
      </Tabs>
      {panels.map((panel, index) => (
        <Box key={index} role="tabpanel" hidden={index !== active}>
          {index === active && panel}
        </Box>
      ))}
    </Box>
  );
}
