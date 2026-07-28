import type { BlockProps } from 'src/genui/schema';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

/**
 * @od-component PageHeaderBlock
 * @mui components=Stack,Box,Typography,Breadcrumbs,Button
 * @mui-minimal component=CustomBreadcrumbs path=vendor/next-ts/src/components/custom-breadcrumbs
 * @notes Title + optional breadcrumbs trail + optional subtitle + optional
 *   primary action, in the minimals.cc page-header shape (h4, dot-separated
 *   trail under the title, action right-aligned).
 * @posicube-minimal version=0.2.0
 */
export function PageHeaderBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string;
    subtitle?: string;
    action?: string;
    breadcrumbs?: string[];
  };

  const crumbs = Array.isArray(props.breadcrumbs) ? props.breadcrumbs : [];

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 2 }}
    >
      <Box>
        <Typography variant="h4">{props.title}</Typography>
        {crumbs.length > 0 && (
          <Breadcrumbs
            separator="•"
            sx={{ mt: 1, '& .MuiBreadcrumbs-separator': { color: 'text.disabled' } }}
          >
            {crumbs.map((crumb, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ color: index === crumbs.length - 1 ? 'text.disabled' : 'text.primary' }}
              >
                {crumb}
              </Typography>
            ))}
          </Breadcrumbs>
        )}
        {props.subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: crumbs.length ? 0.5 : 1 }}>
            {props.subtitle}
          </Typography>
        )}
      </Box>
      {props.action && (
        <Button variant="contained" color="primary">
          {props.action}
        </Button>
      )}
    </Stack>
  );
}
