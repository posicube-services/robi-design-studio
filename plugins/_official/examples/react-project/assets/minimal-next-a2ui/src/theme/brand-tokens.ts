/**
 * @od-component theme/brand-tokens
 * @notes The active Open Design design system's tokens, as values.
 *
 *   The daemon REWRITES this file at scaffold time from the picked design
 *   system's `tokens.css` — the same moment the shadcn seed gets its
 *   `src/app/brand-tokens.css`. One injection point, two substrates.
 *
 *   Values rather than `var(--accent)` references on purpose: the MUI theme
 *   does alpha math on these (`createPaletteChannel`, `varAlpha`), and that
 *   math cannot run on an unresolved CSS custom property.
 *
 *   The defaults below are the `mui-minimal` design system, so an un-injected
 *   seed still builds and looks exactly like stock Minimal.
 * @posicube-minimal version=0.1.0
 */

import type { BrandTokens } from './brand-tokens-type';

export const brandTokens: BrandTokens = {
  accent: '#00a76f',
  accentOn: '#ffffff',
  accentHover: '#007867',
  accentActive: '#004b50',
  success: '#22c55e',
  warn: '#ffab00',
  danger: '#ff5630',
  bg: '#ffffff',
  surface: '#ffffff',
  surfaceWarm: '#f4f6f8',
  fg: '#1c252e',
  fg2: '#454f5b',
  fontBody: 'Public Sans Variable',
  fontDisplay: 'Barlow',
  radiusMd: '12px',
};
