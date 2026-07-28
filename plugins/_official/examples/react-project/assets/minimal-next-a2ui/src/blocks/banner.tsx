'use client';

import type { BlockProps } from 'src/genui/schema';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

/**
 * @od-component BannerBlock
 * @mui components=Card,Typography,Button
 * @notes Rich callout / welcome banner (환영, 프로모션, 업그레이드 안내). Richer
 *   than Alert: tone-colored surface, title + description + optional action
 *   (internal navigation) + optional icon. Use at most one per screen, near
 *   the top.
 * @posicube-minimal version=0.1.0
 */
type Tone = 'primary' | 'info' | 'success' | 'warning' | 'error';

export function BannerBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string;
    description?: string;
    tone?: Tone;
    action?: string;
    href?: string;
    icon?: string;
  };

  const tone: Tone = props.tone ?? 'primary';
  const router = useRouter();

  return (
    <Card
      sx={{
        p: 3,
        bgcolor: `${tone}.lighter`,
        color: `${tone}.darker`,
        boxShadow: 'none',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {props.icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              display: 'flex',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${tone}.main`,
              color: `${tone}.contrastText`,
            }}
          >
            {/* icon is an arbitrary spec string; Iconify loads unregistered names online */}
            <Iconify icon={props.icon as never} width={24} />
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{props.title}</Typography>
          {props.description && (
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
              {props.description}
            </Typography>
          )}
        </Box>
        {props.action && (
          <Button
            variant="contained"
            color={tone}
            onClick={() => {
              if (props.href?.startsWith('/')) router.push(props.href);
            }}
          >
            {props.action}
          </Button>
        )}
      </Stack>
    </Card>
  );
}
