import type { BlockProps } from 'src/genui/schema';

import { paletteVar, TEXT_ALIGN, TYPOGRAPHY } from 'src/lib/tokens';

const TAG: Record<string, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
  subtitle1: 'p', subtitle2: 'p', body1: 'p', body2: 'p',
  caption: 'span', overline: 'span', button: 'span', inherit: 'span',
};

/**
 * Text. `variant` picks a step on the brand's type scale (see TYPOGRAPHY) and the
 * element tag, so a spec asking for h2 stays semantically a heading.
 */
export function TypographyBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { text?: string; variant?: string; color?: string; align?: string };
  const variant = props.variant ?? 'body1';
  const Tag = TAG[variant] ?? 'p';

  return (
    <Tag
      className={`m-0 ${TYPOGRAPHY[variant] ?? TYPOGRAPHY.body1} ${TEXT_ALIGN[props.align ?? ''] ?? ''}`}
      style={{ color: props.color ? paletteVar(props.color) : 'var(--fg)' }}
    >
      {props.text ?? ''}
    </Tag>
  );
}
