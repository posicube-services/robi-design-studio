import type { BlockProps } from 'src/genui/schema';

import Avatar from '@mui/material/Avatar';

/**
 * @od-component AvatarBlock
 * @mui components=Avatar
 * @mui-minimal component=Avatar path=src/theme/core/components/avatar.tsx
 * @notes Avatar primitive — Minimal theme extends Avatar with palette `color`.
 *   Shows the first character of `name` unless `src` is given.
 * @posicube-minimal version=0.1.0
 */
export function AvatarBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    name?: string;
    color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
    src?: string;
  };

  const initial = props.name?.trim().charAt(0).toUpperCase();

  return (
    <Avatar src={props.src} alt={props.name} color={props.color ?? 'primary'}>
      {!props.src && initial}
    </Avatar>
  );
}
