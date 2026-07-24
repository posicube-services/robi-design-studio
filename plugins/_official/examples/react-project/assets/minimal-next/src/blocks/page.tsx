import type { Breakpoint } from '@mui/material/styles';
import type { BlockProps } from 'src/genui/schema';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

/**
 * @od-component PageBlock
 * @mui components=Box,Container,Stack
 * @notes Page shell — centered container + vertical rhythm for its children.
 * @posicube-minimal version=0.1.0
 */
export function PageBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { maxWidth?: Breakpoint };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 5 } }}>
      <Container maxWidth={props.maxWidth ?? 'lg'}>
        <Stack spacing={3}>{children}</Stack>
      </Container>
    </Box>
  );
}
